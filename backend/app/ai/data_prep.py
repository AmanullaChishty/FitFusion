import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import numpy as np
from ..services.supabase_client import supabase

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------------------
# 🧩 Pydantic Models (aligned with backend/app/schemas/ai.py)
# ------------------------------------------------------------------------------

class WorkoutSet(BaseModel):
    set_index: int
    reps: int
    weight: float
    rpe: Optional[float] = None


class RawWorkoutRow(BaseModel):
    user_id: str
    exercise_name: str
    performed_at: datetime
    sets: List[Dict[str, Any]]
    equipment: Optional[str] = None
    notes: Optional[str] = None


class ExerciseTrend(BaseModel):
    exercise_name: str
    sessions: List[Dict[str, Any]]
    trend_metrics: Optional[Dict[str, Any]] = None


# ------------------------------------------------------------------------------
# 🧠 Core Functions
# ------------------------------------------------------------------------------

async def fetch_raw_workouts(user_id: str, exercise_id: Optional[str] = None, window: int = 12) -> List[RawWorkoutRow]:
    """
    Fetch recent raw workouts for a user, optionally filtered by exercise_id.
    """
    try:
        query = supabase.table("workouts").select("*").eq("user_id", user_id)
        if exercise_id:
            query = query.eq("exercise_id", exercise_id)
        query = query.order("performed_at", desc=True).limit(window)
        resp = query.execute()

        workouts = resp.data or []
        logger.info(f"Fetched {len(workouts)} workouts for user {user_id}")
        return [RawWorkoutRow(**w) for w in workouts]
    except Exception as e:
        logger.exception(f"Failed to fetch workouts: {e}")
        return []


async def normalize_sets(raw_workout_row: RawWorkoutRow) -> List[WorkoutSet]:
    """
    Normalize and clean the sets list from a workout row.
    - Ensures numeric weights
    - Estimates 'bodyweight' as ~user weight if provided in notes
    """
    normalized_sets = []
    try:
        for s in raw_workout_row.sets:
            weight = s.get("weight", 0)
            if isinstance(weight, str) and weight.lower() in ["bw", "bodyweight"]:
                # fallback: estimate from notes or default 70kg
                weight = 70.0
            normalized_sets.append(
                WorkoutSet(
                    set_index=s.get("set_index", len(normalized_sets) + 1),
                    reps=int(s.get("reps", 0)),
                    weight=float(weight),
                    rpe=s.get("rpe"),
                )
            )
        return normalized_sets
    except Exception as e:
        logger.error(f"Normalization error for {raw_workout_row.exercise_name}: {e}")
        return []


async def aggregate_exercise_history(
    user_id: str, exercise_name: str, lookback_sessions: List[int] = [4, 8, 12]
) -> ExerciseTrend:
    """
    Aggregate historical performance for a given exercise.
    Returns per-session metrics for trend analysis.
    """
    raw_workouts = await fetch_raw_workouts(user_id, exercise_name, max(lookback_sessions))
    sessions = []

    for w in raw_workouts:
        sets = await normalize_sets(w)
        if not sets:
            continue
        total_volume = sum(s.weight * s.reps for s in sets)
        max_weight = max(s.weight for s in sets)
        avg_rpe = np.mean([s.rpe for s in sets if s.rpe is not None]) if any(s.rpe for s in sets) else None

        sessions.append({
            "date": w.performed_at,
            "total_volume": round(total_volume, 2),
            "max_set_weight": round(max_weight, 2),
            "avg_rpe": round(avg_rpe, 2) if avg_rpe else None,
            "sets": [s.dict() for s in sets],
        })

    sessions.sort(key=lambda x: x["date"])
    trend_metrics = await compute_trend_metrics(sessions)
    return ExerciseTrend(exercise_name=exercise_name, sessions=sessions, trend_metrics=trend_metrics)


async def compute_trend_metrics(sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute performance trends like slope of volume and weight progression.
    """
    try:
        if len(sessions) < 2:
            return {"volume_slope": 0, "weight_slope": 0, "rpe_trend": 0, "consistency": 0}

        vols = np.array([s["total_volume"] for s in sessions])
        weights = np.array([s["max_set_weight"] for s in sessions])
        rpes = np.array([s["avg_rpe"] or 0 for s in sessions])

        x = np.arange(len(vols))
        volume_slope = float(np.polyfit(x, vols, 1)[0])
        weight_slope = float(np.polyfit(x, weights, 1)[0])
        rpe_trend = float(np.polyfit(x, rpes, 1)[0]) if np.any(rpes) else 0

        # Consistency = inverse of std deviation normalized
        consistency = round(1 / (np.std(vols) + 1e-6), 3)

        return {
            "volume_slope": round(volume_slope, 3),
            "weight_slope": round(weight_slope, 3),
            "rpe_trend": round(rpe_trend, 3),
            "consistency": consistency,
        }
    except Exception as e:
        logger.error(f"Error computing trend metrics: {e}")
        return {}


async def serialize_for_recommender(exercise_trend: ExerciseTrend) -> Dict[str, Any]:
    """
    Serialize the exercise trend for LLM consumption.
    """
    try:
        payload = {
            "exercise_name": exercise_trend.exercise_name,
            "sessions": exercise_trend.sessions[-12:],  # limit to recent sessions
            "metrics": exercise_trend.trend_metrics,
        }
        return payload
    except Exception as e:
        logger.error(f"Serialization error: {e}")
        return {}


# ------------------------------------------------------------------------------
# 📊 Example Payload (frontend/backend contract)
# ------------------------------------------------------------------------------
"""
{
  "exercise_name": "bench press",
  "sessions": [
    {"date": "2025-09-01", "total_volume": 3200, "max_set_weight": 80, "avg_rpe": 7.5},
    {"date": "2025-09-04", "total_volume": 3400, "max_set_weight": 82.5, "avg_rpe": 7.8}
  ],
  "metrics": {
    "volume_slope": 50.3,
    "weight_slope": 0.5,
    "rpe_trend": 0.1,
    "consistency": 0.87
  }
}
"""

# ------------------------------------------------------------------------------
# 🧪 Optional local testing entrypoint
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    async def _test():
        user_id = "demo-user"
        trend = await aggregate_exercise_history(user_id, "bench press")
        print(trend.json(indent=2))
    asyncio.run(_test())
