from pydantic import BaseModel
from typing import Optional

class Workout(BaseModel):
    id: int
    name: str
    sets: int
    reps: int

class WorkoutResponse(Workout):
    description: Optional[str] = None
