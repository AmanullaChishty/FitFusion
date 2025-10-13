# backend/app/schemas/ai.py
from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class WorkoutSet(BaseModel):
    set_index: int = Field(..., description="1-based index of the set in that exercise occurrence")
    reps: int = Field(..., ge=0)
    weight_kg: float = Field(..., ge=0, description="Weight in kilograms (0 for bodyweight)")
    rpe: Optional[float] = Field(None, ge=0, le=10)
    notes: Optional[str] = None

class ExercisePerformance(BaseModel):
    user_id: str
    exercise_id: Optional[str] = None
    exercise_name: str
    performed_at: datetime
    sets: List[WorkoutSet]
    total_volume: float = Field(..., description="sum(reps * weight) for this exercise occurrence")
    max_single_set_weight: float = Field(..., description="max weight used in any set for this occurrence")
    avg_rpe: Optional[float] = None
    is_strength_exercise: bool = Field(..., description="True if exercise is primarily strength based")
    equipment: Optional[str] = None
    notes: Optional[str] = None

class RollingWindowSummary(BaseModel):
    window_size: int = Field(..., description="number of most recent occurrences included (e.g., 4,8,12)")
    occurrences: int = Field(..., description="actual number of occurrences in window (may be < window_size)")
    avg_total_volume: float
    avg_max_weight: float
    avg_rpe: Optional[float] = None
    trend_volume_pct_change: Optional[float] = Field(None, description="percentage change vs previous window, e.g., -2.5")
    trend_max_weight_pct_change: Optional[float] = None
    last_performed_at: Optional[datetime] = None

class ExerciseTrend(BaseModel):
    user_id: str
    exercise_id: Optional[str]
    exercise_name: str
    rolling: List[RollingWindowSummary] = Field(..., description="ordered by increasing window size (e.g., [4,8,12])")
    recent_performances: List[ExercisePerformance] = Field(..., description="raw occurrences used to compute summaries")

class OverloadSuggestion(BaseModel):
    suggestion_type: Literal["increase_weight", "increase_reps", "add_set", "deload", "maintain", "technique_focus", "equipment_change"]
    reason: str
    recommended_change: Optional[str] = Field(None, description="human-readable instruction, e.g., '+2.5 kg', 'add 1 rep', 'deload week: -20% volume'")
    confidence: float = Field(..., ge=0, le=1.0, description="0..1 confidence score from rule-based heuristics / model")
    next_steps: Optional[List[str]] = None

class NextWorkoutSuggestionResponse(BaseModel):
    user_id: str
    exercise_id: Optional[str]
    exercise_name: str
    suggested_weight_kg: Optional[float]
    suggested_reps: Optional[int]
    suggested_sets: Optional[int]
    suggested_rpe_range: Optional[str] = Field(None, description="e.g. '7-8'")
    suggestions: List[OverloadSuggestion]
    metadata: Optional[dict] = None
