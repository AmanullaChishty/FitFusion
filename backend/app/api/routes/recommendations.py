# backend/routers/recommendations.py

from fastapi import APIRouter, Depends, HTTPException
from app.services.workout_service import fetch_workouts
from app.core.auth import get_current_user
from app.ai.recommender import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Returns AI-driven recommendations for the logged-in user.
    """
    user_id = current_user["sub"]  # From Supabase JWT
    workouts = await fetch_workouts(user_id)

    if workouts is None:
        raise HTTPException(status_code=404, detail="No workouts found")

    recs = generate_recommendations(workouts)
    return {"user_id": user_id, "recommendations": recs}
