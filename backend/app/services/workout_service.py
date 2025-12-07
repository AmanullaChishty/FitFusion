# backend/app/services/workout_service.py

from typing import List, Dict, Any, Optional
from app.services.supabase_client import supabase

async def insert_workout(user_id: str, workout_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insert a workout into Supabase DB for a specific user.
    """
    workout_data["user_id"] = user_id
    response = supabase.table("workouts").insert(workout_data).execute()
    print("Supabase insert response:", response)
    # If the Supabase client reports an error, surface it. Otherwise return inserted row or empty dict.
    if getattr(response, "error", None):
        raise Exception(f"Supabase insert error: {response.error}")
    return response.data[0] if response.data else {}

async def fetch_workouts(user_id: str, filtered_date: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetch all workouts for a specific user, optionally filtered by date (YYYY-MM-DD).
    """
    print('user_id in fetch_workouts:', user_id, 'filtered_date:', filtered_date)
    query = supabase.table("workouts").select("*").eq("user_id", user_id)
    if filtered_date:
        print("Applying date filter:", filtered_date)
        # Build start and end of the day in ISO format
        start_datetime = f"{filtered_date}T00:00:00Z"
        # To get all times on the day, end is next day 00:00:00
        from datetime import datetime, timedelta
        try:
            next_day = (datetime.strptime(filtered_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
        except Exception as e:
            print("Date parsing error:", e)
            next_day = filtered_date
        end_datetime = f"{next_day}T00:00:00Z"
        query = query.gte("created_at", start_datetime).lt("created_at", end_datetime)
    response = query.order("created_at", desc=True).execute()
    print("Supabase fetch response:", response)
    # If Supabase returned an error, raise it. If no data was returned, just return an empty list.
    if getattr(response, "error", None):
        raise Exception(f"Supabase fetch error: {response.error}")
    return response.data or []

async def update_workout(workout_id: str, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update a workout for a specific user.
    Only updates fields provided in update_data.
    """
    if not update_data:
        return None

    response = (
        supabase.table("workouts")
        .update(update_data)
        .eq("id", workout_id)
        .eq("user_id", user_id)  # ensure users can only update their own workouts
        .execute()
    )

    if getattr(response, "error", None):
        raise Exception(f"Supabase update error: {response.error}")
    return response.data[0] if response.data else None
