# backend/app/ai/fitness_advisor.py

import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from app.ai.data_prep import serialize_for_recommender
from app.schemas.ai import OverloadSuggestion
from app.core.config import settings  # optional: handles default increment configs

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# --- CONFIG DEFAULTS ---
DEFAULT_UPPER_INC_KG = 2.5
DEFAULT_LOWER_INC_KG = 5.0
DEFAULT_PERCENT_INC = 0.05  # 5%

SYSTEM_PROMPT = """You are an expert strength and conditioning coach.
Given structured training history, identify progressive overload opportunities, fatigue risks,
and personalized next-session adjustments.

Always output valid JSON in the following schema:
{
  "recommendations": [
    {
      "exercise": "string",
      "current_weight": "float",
      "suggestion": {"type": "increase_weight|increase_reps|maintain|recovery", "value": "float|null"},
      "confidence": "float",
      "rationale": "string"
    }
  ],
  "summary": "string"
}
"""

# =========================================================
# =============== RULE-BASED ADVISOR LAYER ================
# =========================================================

def _tm(trend_metrics: Dict[str, float], key: str, default: float = 0.0) -> float:
    """
    Safe accessor with alias mapping between old and new metric names.
    New schema from data_prep.compute_trend_metrics():
      - volume_slope
      - weight_slope
      - rpe_trend
      - consistency
    Legacy (kept for backward compatibility):
      - slope_volume -> volume_slope
      - slope_top_set_weight -> weight_slope
      - avg_rpe (may be missing)
    """
    aliases = {
        "slope_volume": "volume_slope",
        "slope_top_set_weight": "weight_slope",
    }
    if key in trend_metrics:
        return float(trend_metrics[key])
    alt = aliases.get(key)
    if alt and alt in trend_metrics:
        return float(trend_metrics[alt])
    return float(trend_metrics.get(aliases.get(key, ""), default)) if aliases.get(key, "") in trend_metrics else float(trend_metrics.get(key, default))


def _avg_rpe(trend_metrics: Dict[str, float]) -> Optional[float]:
    """
    avg_rpe might be absent in your current pipeline (often None).
    Default to 7.0 (moderate) when missing; return None if you prefer to skip RPE-based gates.
    """
    if "avg_rpe" in trend_metrics and trend_metrics["avg_rpe"] is not None:
        try:
            return float(trend_metrics["avg_rpe"])
        except Exception:
            return 7.0
    # Fallback heuristic: if rpe_trend strongly negative, assume avg_rpe is on the lower side.
    rpe_t = _tm(trend_metrics, "rpe_trend", 0.0)
    if rpe_t < -0.2:
        return 6.0
    return 7.0  # neutral default


def should_increase_weight(trend_metrics: Dict[str, float]) -> bool:
    """
    Suggest increasing load if:
    - weight_slope > ~0 (positive progress)
    - avg_rpe <= 7 (moderate effort)
    - volume_slope >= ~0 (not declining)
    """
    slope_weight = _tm(trend_metrics, "weight_slope", 0.0)
    slope_vol = _tm(trend_metrics, "volume_slope", 0.0)
    avg_rpe = _avg_rpe(trend_metrics) or 7.0

    decision = (slope_weight > 0.01) and (avg_rpe <= 7.0) and (slope_vol >= 0.0)
    logger.debug(f"Weight increase check: weight_slope={slope_weight}, avg_rpe={avg_rpe}, volume_slope={slope_vol} => {decision}")
    return decision


def should_increase_reps(trend_metrics: Dict[str, float]) -> bool:
    """
    Suggest increasing reps if:
    - weight_slope ~ flat
    - avg_rpe <= 7
    - rpe_trend <= 0 (effort stable/decreasing)
    """
    slope_weight = _tm(trend_metrics, "weight_slope", 0.0)
    rpe_trend = _tm(trend_metrics, "rpe_trend", 0.0)
    avg_rpe = _avg_rpe(trend_metrics) or 7.0

    decision = (abs(slope_weight) <= 0.005) and (avg_rpe <= 7.0) and (rpe_trend <= 0.0)
    logger.debug(f"Reps increase check: weight_slope={slope_weight}, avg_rpe={avg_rpe}, rpe_trend={rpe_trend} => {decision}")
    return decision


def should_increase_sets(trend_metrics: Dict[str, float]) -> bool:
    """
    Suggest adding a set if:
    - volume_slope ≈ 0 (plateau)
    - avg_rpe <= 6.5
    - consistency high (>= 0.8); note: your current metric is inverse-std, so higher = steadier
    """
    slope_volume = _tm(trend_metrics, "volume_slope", 0.0)
    avg_rpe = _avg_rpe(trend_metrics) or 7.0
    consistency = float(trend_metrics.get("consistency", 0.9))

    decision = (abs(slope_volume) < 0.005) and (avg_rpe <= 6.5) and (consistency >= 0.8)
    logger.debug(f"Sets increase check: volume_slope={slope_volume}, avg_rpe={avg_rpe}, consistency={consistency} => {decision}")
    return decision


def recovery_adjustment(trend_metrics: Dict[str, float]) -> str:
    """
    Detect fatigue or under-recovery.
    Uses rpe_trend and (optional) avg_rpe; also reacts to strongly negative volume_slope.
    """
    avg_rpe = _avg_rpe(trend_metrics)
    rpe_trend = _tm(trend_metrics, "rpe_trend", 0.0)
    volume_slope = _tm(trend_metrics, "volume_slope", 0.0)

    logger.debug(f"Recovery adjustment check: avg_rpe={avg_rpe}, rpe_trend={rpe_trend}, volume_slope={volume_slope}")

    # Strong decline in volume and no weight progress → likely need recovery/maintenance
    strong_decline = volume_slope < -0.5  # heuristic since units are raw slope per session index

    if avg_rpe is not None:
        if avg_rpe >= 9 or (rpe_trend > 0.2 and avg_rpe >= 8.5):
            return "deload"
        elif avg_rpe >= 8 or (strong_decline and rpe_trend >= 0):
            return "add-rest-day"
        elif avg_rpe <= 5 and rpe_trend < -0.1:
            return "reduce-intensity"
    else:
        # No avg_rpe: rely on trends only
        if strong_decline and rpe_trend >= 0:
            return "add-rest-day"

    return "maintain"


def _infer_is_lower_body(exercise_name: str) -> bool:
    name = (exercise_name or "").lower()
    lower_markers = ["squat", "deadlift", "leg", "lunge", "calf", "hip thrust", "glute", "hamstring", "quad","bicep curl"]
    return any(m in name for m in lower_markers)


async def build_suggestion_payload(
    exercise_name: str,
    trend_metrics: Dict[str, float],
    is_lower_body: Optional[bool] = None
) -> OverloadSuggestion:
    """
    Combine rule-based checks into a unified structured suggestion.
    Accepts trend_metrics with keys:
      - volume_slope, weight_slope, rpe_trend, consistency, (optional) avg_rpe
    """
    if is_lower_body is None:
        is_lower_body = _infer_is_lower_body(exercise_name)

    base_inc = DEFAULT_LOWER_INC_KG if is_lower_body else DEFAULT_UPPER_INC_KG
    percent_inc = DEFAULT_PERCENT_INC  # reserved for future use

    suggestion_type = "maintain"
    value = None
    rationale = ""

    if should_increase_weight(trend_metrics):
        suggestion_type = "increase_weight"
        value = round(base_inc, 2)
        rationale = "Consistent performance with moderate RPE and non-declining volume — apply a small load increase."
    elif should_increase_reps(trend_metrics):
        suggestion_type = "increase_reps"
        value = 1
        rationale = "Stable effort and flat load trend — add 1 rep per set."
    elif should_increase_sets(trend_metrics):
        suggestion_type = "increase_sets"
        value = 1
        rationale = "Volume plateau with good consistency — add one extra set."
    else:
        fatigue_status = recovery_adjustment(trend_metrics)
        if fatigue_status != "maintain":
            suggestion_type = "recovery"
            value = None
            rationale = f"Recent trends indicate fatigue/under-recovery — suggest {fatigue_status.replace('-', ' ')}."
        else:
            # If volume is clearly declining, prefer maintain with caution
            vol_slope = _tm(trend_metrics, "volume_slope", 0.0)
            if vol_slope < -0.1:
                rationale = "Volume trending down — maintain load and focus on technique/sleep/nutrition."
            else:
                rationale = "No clear overload signal — maintain and reassess next session."

    confidence = 0.9 if suggestion_type.startswith("increase") else (0.8 if suggestion_type == "recovery" else 0.7)

    suggestion = OverloadSuggestion(
        exercise=exercise_name,
        suggestion_type=suggestion_type,
        value=value,
        confidence_score=confidence,
        rationale=rationale,
    )
    logger.info(f"Suggestion for {exercise_name}: {suggestion_type} ({value}), conf={confidence}")
    return suggestion.model_dump()


# =========================================================
# ============ EXISTING LLM-BASED ADVISOR ================
# =========================================================

def summarize_recent_data(df: pd.DataFrame) -> str:
    """Generate a compact text summary of last 2-4 weeks for the LLM."""
    last_28 = df.sort_values("date").tail(28)
    summary_parts = []
    for ex, sub in last_28.groupby("exercise"):
        vol_change = (sub["total_volume"].iloc[-1] - sub["total_volume"].iloc[0]) / (sub["total_volume"].iloc[0] + 1e-6)
        trend = "upward" if vol_change > 0.1 else "stable" if abs(vol_change) < 0.05 else "downward"
        summary_parts.append(f"{ex}: {trend} volume trend ({vol_change:.1%})")
    return "; ".join(summary_parts)


async def generate_ai_recommendations() -> Dict[str, Any]:
    """
    Unified AI workflow:
    - Load and preprocess data
    - Summarize into LLM-readable context
    - Query LLM for intelligent recommendations
    """
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    df = serialize_for_recommender()
    if df.empty:
        return {"error": "No workout data found."}

    text_summary = summarize_recent_data(df)
    latest_df = df.sort_values("date").groupby("exercise").tail(1)
    stats_json = latest_df.to_dict(orient="records")

    user_prompt = f"""
User workout summary for analysis:
{text_summary}

Detailed recent data (JSON):
{json.dumps(stats_json, indent=2)}

Generate recommendations in JSON format as per schema.
"""

    response = await client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=800
    )

    raw_output = response.choices[0].message.content
    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError:
        data = {"error": "Failed to parse AI output", "raw": raw_output}

    return data


# =========================================================
# ============== HYBRID ENTRYPOINT (RULE + LLM) ===========
# =========================================================

async def hybrid_recommendation_pipeline(user_id: str) -> Dict[str, Any]:
    """
    Step 1: Generate deterministic rule-based suggestions.
    Step 2: Optionally enhance with LLM reasoning.
    """
    df = serialize_for_recommender()
    if df.empty:
        return {"error": "No workout data available."}

    # Compute simple trend metrics (kept for compatibility with legacy path)
    results = []
    for ex, sub in df.groupby("exercise"):
        sub = sub.sort_values("date")
        slope_vol = np.polyfit(range(len(sub)), sub["total_volume"], 1)[0] / (sub["total_volume"].mean() + 1e-6)
        slope_weight = np.polyfit(range(len(sub)), sub["weight"], 1)[0] / (sub["weight"].mean() + 1e-6)
        avg_rpe = sub.get("avg_rpe", pd.Series([7]*len(sub))).tail(4).mean() if "avg_rpe" in sub else 7.0
        trend_metrics = {
            "volume_slope": slope_vol,
            "weight_slope": slope_weight,
            "avg_rpe": float(avg_rpe),
            "rpe_trend": 0.0,
            "consistency": 0.9,
        }
        suggestion = await build_suggestion_payload(ex, trend_metrics)
        results.append(suggestion.dict())

    return {"recommendations": results, "summary": "Rule-based overload analysis complete."}


if __name__ == "__main__":
    import asyncio, json
    # Example: the direct call you mentioned
    example_tm = {"volume_slope": -45.0, "weight_slope": 0.0, "rpe_trend": 0.0, "consistency": 0.024}
    sug = asyncio.run(build_suggestion_payload("Bicep Curl", example_tm))
    print(json.dumps(sug.dict(), indent=2))
