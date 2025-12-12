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
    query = supabase.table("workouts").select("*").eq("user_id", user_id)
    if filtered_date:
        from datetime import datetime, timedelta
        try:
            date_obj = datetime.strptime(filtered_date, "%Y-%m-%d")
            start_datetime = f"{filtered_date}T00:00:00Z"
            next_day = (date_obj + timedelta(days=1)).strftime("%Y-%m-%d")
            end_datetime = f"{next_day}T00:00:00Z"
            query = query.gte("created_at", start_datetime).lt("created_at", end_datetime)
        except Exception as e:
            print("Invalid date_filter passed to fetch_workouts, ignoring filter:", e)
            # Just don’t apply any created_at filter if parsing fails

    response = query.order("created_at", desc=True).execute()
    print("Supabase fetch response:", response)

    if getattr(response, "error", None):
        raise Exception(f"Supabase fetch error: {response.error}")
    return response.data or []

async def fetch_workout_by_id(user_id: str, workout_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch a single workout by id for a specific user.
    """
    response = (
        supabase.table("workouts")
        .select("*")
        .eq("user_id", user_id)
        .eq("id", workout_id)
        .single()
        .execute()
    )

    if getattr(response, "error", None):
        # Supabase returns an error if no row or other issue
        # You can decide to return None on 406 "No rows" if you want
        if getattr(response.error, "code", None) == "PGRST116":  # no rows
            return None
        raise Exception(f"Supabase fetch_by_id error: {response.error}")

    return response.data

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


async def delete_workout(workout_id: str, user_id: str) -> bool:
    """
    Delete a workout owned by `user_id`. Returns True if a row was deleted.
    """
    response = (
        supabase.table("workouts")
        .delete()
        .eq("id", workout_id)
        .eq("user_id", user_id)
        .execute()
    )
    print("Supabase delete response:", response)
    if getattr(response, "error", None):
        raise Exception(f"Supabase delete error: {response.error}")
    # If deleted rows are returned in `data`, treat that as success.
    if response.data:
        return True
    # Some clients return a `count` attribute instead.
    deleted_count = getattr(response, "count", None)
    if deleted_count is not None:
        return deleted_count > 0
    return False
