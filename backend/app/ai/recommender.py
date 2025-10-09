# backend/ai/recommender.py

import pandas as pd
from typing import List, Dict
from uuid import UUID

def recommend_progressions(user_id: UUID, df: pd.DataFrame) -> List[Dict]:
    """
    Consume the preprocessed fitness dataset and return AI-based recommendations.
    - df follows schema from Day 5 (one row per user-exercise-session)
    """
    results = []

    grouped = df.groupby("exercise")
    for exercise, sub_df in grouped:
        sub_df = sub_df.sort_values("date")

        # recent sessions (last 3)
        recent = sub_df.tail(3)

        avg_rpe = recent["avg_rpe"].mean()
        rolling_28d_trend = sub_df["rolling_28d_volume"].iloc[-1] - sub_df["rolling_28d_volume"].iloc[-2] if len(sub_df) > 1 else 0
        last_weight = recent["weight_kg"].iloc[-1]
        est_1rm_delta = sub_df["est_1rm"].iloc[-1] - sub_df["est_1rm"].iloc[-2] if len(sub_df) > 1 else 0

        # -------------------------------
        # RULES-BASED FALLBACK LOGIC
        # -------------------------------
        suggestion = None
        rationale = ""
        confidence = 0.5

        # Progressive overload condition
        if rolling_28d_trend > 0 and avg_rpe < 7:
            suggestion = {"type": "increase_weight", "value": 2.5}
            rationale = "Consistent volume increase and moderate RPE — ready to progress."
            confidence = 0.85

        elif avg_rpe < 6 and est_1rm_delta > 0:
            suggestion = {"type": "increase_reps", "value": 1}
            rationale = "Low RPE and strength improving — add a rep."
            confidence = 0.8

        # Recovery condition
        elif avg_rpe > 8 and sub_df["body_weight_kg"].pct_change().iloc[-1] < -0.02:
            suggestion = {"type": "recovery", "value": None}
            rationale = "High RPE and recent weight loss — recommend recovery."
            confidence = 0.9

        # Default: maintain load
        else:
            suggestion = {"type": "maintain", "value": None}
            rationale = "Stable performance — maintain current load."
            confidence = 0.6

        results.append({
            "exercise": exercise,
            "current_weight": float(last_weight),
            "suggestion": suggestion,
            "confidence": confidence,
            "rationale": rationale
        })

    return results

