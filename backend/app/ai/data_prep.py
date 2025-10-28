import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
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
    id: str
    user_id: str
    exercise_name: str
    sets: int              # integer count of sets
    reps: int              # integer reps per set (as stored now)
    weight: Optional[float] = None
    created_at: datetime 


class ExerciseTrend(BaseModel):
    exercise_name: str
    sessions: List[Dict[str, Any]]
    trend_metrics: Optional[Dict[str, Any]] = None


# ------------------------------------------------------------------------------
# 🧠 Core Functions
# ------------------------------------------------------------------------------

async def fetch_raw_workouts(user_id: str, exercise_name: Optional[str] = None, window: int = 12) -> List[RawWorkoutRow]:
    """
    Fetch recent raw workouts for a user, optionally filtered by exercise_name.
    """
    # print(f"Fetching workouts for user {user_id}, exercise {exercise_name}, window {window}", flush=True)
    try:
        query = supabase.table("workouts").select("*").eq("user_id", user_id)
        if exercise_name:
            query = query.eq("exercise_name", exercise_name)
        query = query.order("created_at", desc=True).limit(window)
        resp = query.execute()
        # print(f"Supabase response: {resp}", flush=True)
        workouts = resp.data or []
        # print(f"Workouts data: {workouts}", flush=True)
        logger.info(f"Fetched {len(workouts)} workouts for user {user_id}")
        items = [RawWorkoutRow.model_validate(r) for r in workouts]
        # print(f"Parsed {items} workout rows", flush=True)
        return items
    except Exception as e:
        logger.exception(f"Failed to fetch workouts: {e}")
        return []


async def normalize_sets(raw_workout_row: RawWorkoutRow) -> List[WorkoutSet]:
    """
    Materialize per-set detail from scalar columns:
    - repeats `sets` times using the same reps/weight (DB stores one row per workout)
    - handles NULL weight (treats as 0.0)
    """
    try:
        sets_count = max(int(raw_workout_row.sets or 0), 0)
        reps_per_set = int(raw_workout_row.reps or 0)
        weight = float(raw_workout_row.weight) if raw_workout_row.weight is not None else 0.0

        normalized = [
            WorkoutSet(set_index=i + 1, reps=reps_per_set, weight=weight)
            for i in range(sets_count)
        ]
        return normalized
    except Exception as e:
        logger.error(f"Normalization error for {raw_workout_row.exercise_name}: {e}")
        return []


async def aggregate_exercise_history(
    user_id: str,
    exercise_name: str,
    lookback_sessions: List[int] = [4, 8, 12],
) -> ExerciseTrend:
    """
    Aggregate historical performance for a given exercise.
    Returns per-session metrics for trend analysis.
    """
    window = max(lookback_sessions) if lookback_sessions else 12
    raw_workouts = await fetch_raw_workouts(user_id, exercise_name, window)
    sessions: List[Dict[str, Any]] = []
    print(f"Fetched {len(raw_workouts)} workouts for exercise {exercise_name}", flush=True)

    for w in raw_workouts:
        sets = await normalize_sets(w)
        if not sets:
            continue

        total_volume = sum(s.weight * s.reps for s in sets)
        max_weight = max((s.weight for s in sets), default=0.0)
        avg_rpe = np.mean([s.rpe for s in sets if s.rpe is not None]) if any(s.rpe for s in sets) else None

        sessions.append({
            "date": w.created_at,                     # use created_at from schema
            "total_volume": round(float(total_volume), 2),
            "max_set_weight": round(float(max_weight), 2),
            "avg_rpe": round(float(avg_rpe), 2) if avg_rpe is not None else None,
            "sets": [s.dict() for s in sets],
        })

    # chronological for trend calc
    sessions.sort(key=lambda x: x["date"])
    # print(f"Normalized sessions for {exercise_name}: {sessions}", flush=True)
    trend_metrics = await compute_trend_metrics(sessions)
    # print(f"Computed trend metrics for {exercise_name}: {trend_metrics}", flush=True)
    return ExerciseTrend(exercise_name=exercise_name, sessions=sessions, trend_metrics=trend_metrics).model_dump()


async def compute_trend_metrics(sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute performance trends like slope of volume and weight progression.
    """
    try:
        if len(sessions) < 2:
            return {"volume_slope": 0, "weight_slope": 0, "rpe_trend": 0, "consistency": 0}

        vols = np.array([float(s["total_volume"]) for s in sessions], dtype=float)
        weights = np.array([float(s["max_set_weight"]) for s in sessions], dtype=float)
        rpes = np.array([float(s["avg_rpe"]) if s["avg_rpe"] is not None else 0.0 for s in sessions], dtype=float)

        x = np.arange(len(vols), dtype=float)
        volume_slope = float(np.polyfit(x, vols, 1)[0])
        weight_slope = float(np.polyfit(x, weights, 1)[0])
        rpe_trend = float(np.polyfit(x, rpes, 1)[0]) if np.any(rpes) else 0.0

        # Consistency = inverse of std deviation (guarded)
        consistency = round(float(1.0 / (np.std(vols) + 1e-6)), 3)

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
