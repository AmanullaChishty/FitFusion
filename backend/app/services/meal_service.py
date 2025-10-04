# backend/app/services/meal_service.py
from datetime import date, timedelta
from decimal import Decimal
from typing import List
from uuid import UUID

from ..schemas.meal import MealCreate, MealUpdate, MealOut, DailyTotals
from ..services.supabase_client import supabase

TABLE = "meals"
VIEW_DAILY_TOTALS = "daily_nutrition_totals"

# ---------- CRUD ----------

async def create_meal(data: MealCreate) -> MealOut:
    res = supabase.table(TABLE).insert(data.model_dump(mode="json")).execute()
    if not res.data:
        raise Exception(res.error)
    return MealOut(**res.data[0])

async def update_meal(meal_id: UUID, data: MealUpdate) -> MealOut:
    res = supabase.table(TABLE).update(data.model_dump(exclude_none=True)).eq("id", str(meal_id)).execute()
    if not res.data:
        raise Exception(res.error)
    return MealOut(**res.data[0])

async def delete_meal(meal_id: UUID) -> None:
    res = supabase.table(TABLE).delete().eq("id", str(meal_id)).execute()
    if not res.data:
        raise Exception(res.error)

async def get_meals_by_user_and_date(user_id: UUID, target_date: date) -> List[MealOut]:
    res = supabase.table(TABLE).select("*").eq("user_id", str(user_id)).eq("date", target_date.isoformat()).execute()
    if not res.data:
        raise Exception(res.error)
    return [MealOut(**row) for row in res.data]

# ---------- Aggregation ----------

async def get_daily_totals(user_id: UUID, start_date: date, end_date: date) -> List[DailyTotals]:
    res = (
        supabase.table(VIEW_DAILY_TOTALS)
        .select("*")
        .eq("user_id", str(user_id))
        .gte("date", start_date.isoformat())
        .lte("date", end_date.isoformat())
        .execute()
    )
    if not res.data:
        raise Exception(res.error)
    return [DailyTotals(**row) for row in res.data]

async def get_rolling_averages(user_id: UUID, window_days: int) -> dict:
    end_date = date.today()
    start_date = end_date - timedelta(days=window_days - 1)
    daily = await get_daily_totals(user_id, start_date, end_date)

    if not daily:
        return {
            "calories_avg": 0,
            "protein_avg": 0,
            "carbs_avg": 0,
            "fats_avg": 0,
        }

    n = len(daily)
    return {
        "calories_avg": float(sum(d.total_calories for d in daily) / Decimal(n)),
        "protein_avg": float(sum(d.total_protein_g for d in daily) / Decimal(n)),
        "carbs_avg": float(sum(d.total_carbs_g for d in daily) / Decimal(n)),
        "fats_avg": float(sum(d.total_fats_g for d in daily) / Decimal(n)),
    }
