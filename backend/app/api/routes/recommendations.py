# backend/routers/recommendations.py
from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.workout_service import fetch_workouts
from app.services.meal_service import get_rolling_averages  # New helper
from .profile import get_profile as fetch_profile
from app.core.auth import get_current_user
from app.ai.recommender import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/")
async def get_recommendations(
    nutrition_window_days: int = Query(14, ge=3, le=60),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns AI-driven training/nutrition/recovery recommendations.
    Integrates rolling averages from meal logs and workout history.
    """
    user_id = current_user["sub"]

    # --- Fetch user data ---
    workouts = await fetch_workouts(user_id)
    if not workouts:
        raise HTTPException(status_code=404, detail="No workouts found")

    profile = await fetch_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    rolling_averages = await get_rolling_averages(user_id, window_days=nutrition_window_days)

    body_weight = profile.get("weight") or 70.0  # fallback
    maintenance_calories = profile.get("maintenance_calories") or (body_weight * 32)  # rough TDEE estimate

    result = generate_recommendations(
        workouts=workouts,
        rolling_averages=rolling_averages,
        body_weight=body_weight,
        maintenance_calories=maintenance_calories,
    )

    return {
        "user_id": user_id,
        "nutrition_window_days": nutrition_window_days,
        **result,
    }


