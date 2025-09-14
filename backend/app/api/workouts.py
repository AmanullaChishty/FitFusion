from fastapi import APIRouter
from app.schemas.workout import WorkoutCreate, WorkoutResponse

router = APIRouter()

@router.post("/", response_model=WorkoutResponse)
def log_workout(workout: WorkoutCreate):
    # TODO: Insert into Supabase or Postgres
    return WorkoutResponse(**workout.dict(), id=1)
