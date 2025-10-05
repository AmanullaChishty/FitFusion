# backend/app/schemas/meal.py
from datetime import date as dt_date, datetime
from typing import List, Union, Dict
from uuid import UUID
from pydantic import BaseModel, Field

class MealCreate(BaseModel):
    meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner|snack)$")
    food_items: Union[List[Dict], List[str]]
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float
    date: dt_date

class MealUpdate(BaseModel):
    meal_type: str | None = None
    food_items: Union[List[Dict], List[str]] | None = None
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fats_g: float | None = None
    date: dt_date | None = None

class MealOut(BaseModel):
    id: UUID
    user_id: UUID
    meal_type: str
    food_items: Union[List[Dict], List[str]]
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float
    date: dt_date
    created_at: datetime
    updated_at: datetime

class DailyTotals(BaseModel):
    date: dt_date
    total_calories: int
    total_protein_g: float
    total_carbs_g: float
    total_fats_g: float
