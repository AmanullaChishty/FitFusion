from fastapi import APIRouter
from app.schemas.workout import Workout, WorkoutResponse
from app.services.workout_service import get_mock_workouts
from typing import List

router = APIRouter()

@router.get("", response_model=List[WorkoutResponse])
def list_workouts():
    """
    Get a list of workouts (mock data for now).
    Later this will connect to Supabase DB.
    """
    return get_mock_workouts()
