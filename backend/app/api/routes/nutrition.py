from fastapi import APIRouter, Depends, Query
from typing import Dict, Optional
from datetime import date, timedelta
from app.services.supabase_client import supabase
from app.core.auth import get_current_user

router = APIRouter(prefix="/nutrition", tags=["nutrition"])

@router.get("/daily-totals")
def get_daily_totals(
    current_user: dict = Depends(get_current_user),
    start: Optional[date] = Query(None),
    end: Optional[date] = Query(None)
):
    """Return daily total calories/macros grouped by date."""
    query = supabase.table("meals").select("*").eq("user_id", current_user["id"])
    if start and end:
        query = query.gte("date", str(start)).lte("date", str(end))

    res = query.execute()
    meals = res.data or []

    totals: Dict[str, Dict[str, float]] = {}
    for m in meals:
        d = m["date"]
        if d not in totals:
            totals[d] = {"calories": 0, "protein_g": 0, "carbs_g": 0, "fats_g": 0}
        totals[d]["calories"] += m.get("calories", 0)
        totals[d]["protein_g"] += m.get("protein_g", 0)
        totals[d]["carbs_g"] += m.get("carbs_g", 0)
        totals[d]["fats_g"] += m.get("fats_g", 0)

    # Convert to list sorted by date
    return [
        {"date": d, **vals}
        for d, vals in sorted(totals.items(), key=lambda x: x[0])
    ]


@router.get("/rolling-averages")
def get_rolling_averages(
    window: int = Query(7, ge=1, le=60),
    current_user: dict = Depends(get_current_user)
):
    """Return rolling averages for calories and macros across last N days."""
    today = date.today()
    start_date = today - timedelta(days=window)
    res = supabase.table("meals").select("*").eq("user_id", current_user["id"]) \
        .gte("date", str(start_date)).lte("date", str(today)).execute()

    meals = res.data or []
    if not meals:
        return {"calories_avg": 0, "protein_avg": 0, "carbs_avg": 0, "fats_avg": 0}

    total_days = len(set(m["date"] for m in meals))
    sums = {"calories": 0, "protein_g": 0, "carbs_g": 0, "fats_g": 0}
    for m in meals:
        sums["calories"] += m.get("calories", 0)
        sums["protein_g"] += m.get("protein_g", 0)
        sums["carbs_g"] += m.get("carbs_g", 0)
        sums["fats_g"] += m.get("fats_g", 0)

    return {
        "calories_avg": round(sums["calories"] / total_days, 2),
        "protein_avg": round(sums["protein_g"] / total_days, 2),
        "carbs_avg": round(sums["carbs_g"] / total_days, 2),
        "fats_avg": round(sums["fats_g"] / total_days, 2),
    }
