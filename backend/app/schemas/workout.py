from pydantic import BaseModel, Field
from typing import Optional, Annotated
from datetime import datetime
from uuid import UUID


# Replacements for conint / confloat
PositiveInt = Annotated[int, Field(gt=0)]
NonNegativeFloat = Annotated[float, Field(ge=0)]


class WorkoutBase(BaseModel):
    exercise_name: str
    sets: PositiveInt
    reps: PositiveInt
    weight: Optional[NonNegativeFloat] = None


class WorkoutCreate(WorkoutBase):
    """Schema for creating a workout (POST)."""
    pass


class WorkoutUpdate(BaseModel):
    """Schema for updating a workout (PUT)."""
    exercise_name: Optional[str] = None
    sets: Optional[PositiveInt] = None
    reps: Optional[PositiveInt] = None
    weight: Optional[NonNegativeFloat] = None


class WorkoutResponse(WorkoutBase):
    """Schema for returning workouts (GET)."""
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2
