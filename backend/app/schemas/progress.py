# backend/app/schemas/progress.py

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class ProgressCreate(BaseModel):
    """
    Schema for creating or updating a progress record.
    """
    weight_kg: Optional[float] = Field(None, description="Body weight in kg")
    body_fat_pct: Optional[float] = Field(None, description="Body fat percentage")
    strength_milestones: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional JSON of strength milestones")
    notes: Optional[str] = Field(None, description="Optional notes")
    rpe: Optional[float] = Field(None, description="Rate of perceived exertion")
    recorded_at: Optional[datetime] = Field(None, description="Timestamp when the progress was recorded")

class ProgressRead(ProgressCreate):
    """
    Schema for reading progress records from the database.
    Extends ProgressCreate and adds user_id, id, timestamps.
    """
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True
