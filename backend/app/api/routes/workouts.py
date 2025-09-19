# backend/app/api/routes/workouts.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.services import workout_service
from app.core.auth import get_current_user
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/workouts", tags=["workouts"])

class WorkoutCreate(BaseModel):
    exercise: str
    sets: int
    reps: int
    weight: float | None = None

@router.post("/", response_model=Dict[str, Any])
async def log_workout(workout: WorkoutCreate, user: dict = Depends(get_current_user)):
    """
    Log a new workout for the authenticated user.
    """
    try:
        return await workout_service.insert_workout(user["id"], workout.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Dict[str, Any]])
async def get_workouts(user: dict = Depends(get_current_user)):
    """
    Fetch all workouts for the authenticated user.
    """
    try:
        return await workout_service.fetch_workouts(user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
