from pydantic import BaseModel

class WorkoutCreate(BaseModel):
    exercise: str
    sets: int
    reps: int
    weight: float | None = None

class WorkoutResponse(WorkoutCreate):
    id: int
