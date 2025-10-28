# backend/app/api/routes/ai_routes.py

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Any
from app.ai.recommender import (
    get_next_workout_suggestions_for_user,
    generate_recommendation_for_exercise
)
from app.core.auth import get_current_user  # assuming it returns a dict with 'id'
from app.ai.data_prep import aggregate_exercise_history

router = APIRouter(prefix="/ai", tags=["AI Recommender"])

# ---------------------------------------------------
# Pydantic Response Models
# ---------------------------------------------------

class CoachingCue(BaseModel):
    text: str

class OverloadSuggestionResponse(BaseModel):
    exercise_name: str
    suggested_action: str
    numeric_recommendation: Optional[str]
    confidence: float
    rationale: str
    coaching_cues: Optional[List[str]]

class ExerciseTrend(BaseModel):
    exercise_name: str
    metrics: dict
    history: Optional[List[dict]]

class NextWorkoutSuggestionResponse(BaseModel):
    exercise_name: str
    base_suggestion: dict
    enriched_suggestion: Optional[dict]


# ---------------------------------------------------
# Routes
# ---------------------------------------------------

@router.get("/next-workout", response_model=List[NextWorkoutSuggestionResponse])
async def get_next_workout(
    limit: int = Query(5, description="Number of exercises to suggest"),
    current_user: dict = Depends(get_current_user),
):
    """
    Generate next-workout recommendations across top exercises.
    """
    print("Current user:", current_user['id'],flush=True)
    # if current_user["id"] != user_id:
    #     raise HTTPException(status_code=403, detail="Not authorized to view this user’s data.")

    try:
        suggestions = await get_next_workout_suggestions_for_user(current_user['id'], limit=limit)
        print("Suggestions:", suggestions)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-exercise", response_model=OverloadSuggestionResponse)
async def analyze_exercise(
    payload: dict,
    current_user: Any = Depends(get_current_user),
):
    """
    Detailed analysis for one exercise using both rule-based and LLM logic.
    """
    user_id = payload.get("user_id")
    exercise_name = payload.get("exercise_name")
    lookback = payload.get("lookback", 5)

    if not user_id or not exercise_name:
        raise HTTPException(status_code=400, detail="Missing user_id or exercise_name.")

    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user’s data.")

    try:
        trend = await aggregate_exercise_history(user_id, exercise_name, lookback_window=lookback)
        suggestion = await generate_recommendation_for_exercise(user_id, exercise_name)
        enriched = suggestion.enriched_suggestion or suggestion.base_suggestion

        return OverloadSuggestionResponse(
            exercise_name=exercise_name,
            suggested_action=enriched["action"],
            numeric_recommendation=enriched.get("numeric_recommendation"),
            confidence=enriched["confidence_score"],
            rationale=enriched["rationale"],
            coaching_cues=enriched.get("coaching_cues", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exercises/{user_id}", response_model=List[str])
async def get_user_exercises(
    user_id: str,
    current_user: Any = Depends(get_current_user)
):
    """
    (Optional) Return user's most frequent or recent exercises.
    """
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        # Placeholder logic (later can use Supabase query)
        return ["bench_press", "squat", "pull_up", "deadlift"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
