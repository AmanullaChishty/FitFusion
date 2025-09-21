from fastapi import APIRouter, Depends, HTTPException, status
from app.services import workout_service
from app.core.auth import get_current_user
from typing import List
from app.schemas.workout import WorkoutCreate, WorkoutResponse, WorkoutUpdate

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
async def log_workout(workout: WorkoutCreate, user: dict = Depends(get_current_user)):
    """
    Log a new workout for the authenticated user.
    """
    try:
        return await workout_service.insert_workout(user["id"], workout.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[WorkoutResponse])
async def get_workouts(user: dict = Depends(get_current_user)):
    """
    Fetch all workouts for the authenticated user.
    """
    try:
        return await workout_service.fetch_workouts(user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{workout_id}", response_model=WorkoutResponse)
async def update_workout(workout_id: str, workout: WorkoutUpdate, user: dict = Depends(get_current_user)):
    """
    Update an existing workout entry.
    """
    try:
        return await workout_service.update_workout(workout_id, user["id"], workout.dict(exclude_unset=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
