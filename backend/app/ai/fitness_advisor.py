# backend/app/ai/fitness_advisor.py

import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from app.ai.data_prep import load_user_data
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

def should_increase_weight(trend_metrics: Dict[str, float]) -> bool:
    """
    Suggest increasing load if:
    - top_set_weight trend slope > 0 (positive progress)
    - avg_rpe <= 7 over last 3–4 sessions
    - volume trend not declining (slope >= 0)
    """
    slope_weight = trend_metrics.get("slope_top_set_weight", 0)
    avg_rpe = trend_metrics.get("avg_rpe", 0)
    slope_vol = trend_metrics.get("slope_volume", 0)

    decision = slope_weight > 0.01 and avg_rpe <= 7.0 and slope_vol >= 0
    logger.debug(f"Weight increase check: slope={slope_weight}, avg_rpe={avg_rpe}, slope_vol={slope_vol} => {decision}")
    return decision


def should_increase_reps(trend_metrics: Dict[str, float]) -> bool:
    """
    Suggest increasing reps if:
    - user has hit target reps consistently (rpe <= 7 for last 3 sessions)
    - top_set_weight slope flat (no major weight increase recently)
    """
    rpe_trend = trend_metrics.get("rpe_trend", 0)
    slope_weight = trend_metrics.get("slope_top_set_weight", 0)
    avg_rpe = trend_metrics.get("avg_rpe", 0)

    decision = slope_weight <= 0.005 and avg_rpe <= 7 and rpe_trend <= 0
    logger.debug(f"Reps increase check: weight_slope={slope_weight}, avg_rpe={avg_rpe}, rpe_trend={rpe_trend} => {decision}")
    return decision


def should_increase_sets(trend_metrics: Dict[str, float]) -> bool:
    """
    Suggest adding a set if:
    - volume plateaued (flat slope)
    - avg_rpe <= 6.5
    - consistency high (low variance in volume)
    """
    slope_volume = trend_metrics.get("slope_volume", 0)
    avg_rpe = trend_metrics.get("avg_rpe", 0)
    consistency = trend_metrics.get("consistency", 0.9)

    decision = abs(slope_volume) < 0.005 and avg_rpe <= 6.5 and consistency >= 0.8
    logger.debug(f"Sets increase check: slope_vol={slope_volume}, avg_rpe={avg_rpe}, consistency={consistency} => {decision}")
    return decision


def recovery_adjustment(trend_metrics: Dict[str, float]) -> str:
    """
    Detect fatigue or under-recovery based on RPE trend.
    """
    avg_rpe = trend_metrics.get("avg_rpe", 0)
    rpe_trend = trend_metrics.get("rpe_trend", 0)
    logger.debug(f"Recovery adjustment check: avg_rpe={avg_rpe}, rpe_trend={rpe_trend}")

    if avg_rpe >= 9 or (rpe_trend > 0.2 and avg_rpe >= 8.5):
        return "deload"
    elif avg_rpe >= 8:
        return "add-rest-day"
    elif avg_rpe <= 5 and rpe_trend < -0.1:
        return "reduce-intensity"  # too easy, might be under-challenged
    return "maintain"


async def build_suggestion_payload(
    exercise_name: str,
    trend_metrics: Dict[str, float],
    is_lower_body: bool = False
) -> OverloadSuggestion:
    """
    Combine rule-based checks into a unified structured suggestion.
    """
    base_inc = DEFAULT_LOWER_INC_KG if is_lower_body else DEFAULT_UPPER_INC_KG
    percent_inc = DEFAULT_PERCENT_INC

    suggestion_type = "maintain"
    value = None
    rationale = ""

    if should_increase_weight(trend_metrics):
        suggestion_type = "increase_weight"
        value = round(base_inc, 2)
        rationale = "Consistent performance with moderate RPE — suitable for a small load increase."
    elif should_increase_reps(trend_metrics):
        suggestion_type = "increase_reps"
        value = 1
        rationale = "Stable RPE and no load increase — suggest adding 1–2 reps per set."
    elif should_increase_sets(trend_metrics):
        suggestion_type = "increase_sets"
        value = 1
        rationale = "Volume plateaued but effort manageable — add one extra set."
    else:
        fatigue_status = recovery_adjustment(trend_metrics)
        if fatigue_status != "maintain":
            suggestion_type = "recovery"
            value = None
            rationale = f"High fatigue detected — suggest {fatigue_status.replace('-', ' ')}."

    confidence = 0.9 if suggestion_type.startswith("increase") else 0.7 if suggestion_type == "maintain" else 0.8

    suggestion = OverloadSuggestion(
        exercise=exercise_name,
        suggestion_type=suggestion_type,
        value=value,
        confidence_score=confidence,
        rationale=rationale,
    )
    logger.info(f"Suggestion for {exercise_name}: {suggestion_type} ({value}), conf={confidence}")
    return suggestion


# =========================================================
# ============ EXISTING LLM-BASED ADVISOR ================
# =========================================================

def summarize_recent_data(df: pd.DataFrame) -> str:
    """Generate a compact text summary of last 2-4 weeks for the LLM."""
    last_28 = df.sort_values("date").tail(28)
    summary_parts = []
    for ex, sub in last_28.groupby("exercise"):
        vol_change = (sub["session_volume"].iloc[-1] - sub["session_volume"].iloc[0]) / (sub["session_volume"].iloc[0] + 1e-6)
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

    df = load_user_data()
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
    df = load_user_data()
    if df.empty:
        return {"error": "No workout data available."}

    # Compute simple trend metrics
    results = []
    for ex, sub in df.groupby("exercise"):
        sub = sub.sort_values("date")
        slope_vol = np.polyfit(range(len(sub)), sub["session_volume"], 1)[0] / (sub["session_volume"].mean() + 1e-6)
        slope_weight = np.polyfit(range(len(sub)), sub["weight"], 1)[0] / (sub["weight"].mean() + 1e-6)
        avg_rpe = sub.get("avg_rpe", pd.Series([7]*len(sub))).tail(4).mean() if "avg_rpe" in sub else 7.0
        trend_metrics = {
            "slope_volume": slope_vol,
            "slope_top_set_weight": slope_weight,
            "avg_rpe": avg_rpe,
            "rpe_trend": 0.0,
            "consistency": 0.9,
        }
        suggestion = await build_suggestion_payload(ex, trend_metrics)
        results.append(suggestion.dict())

    return {"recommendations": results, "summary": "Rule-based overload analysis complete."}


if __name__ == "__main__":
    import asyncio, json
    results = asyncio.run(hybrid_recommendation_pipeline("demo-user"))
    print(json.dumps(results, indent=2))
