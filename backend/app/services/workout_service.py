# backend/app/services/workout_service.py
from supabase import create_client, Client
from app.core.config import settings
from typing import List, Dict, Any, Optional
from app.services.supabase_client import supabase

async def insert_workout(user_id: str, workout_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insert a workout into Supabase DB for a specific user.
    """
    workout_data["user_id"] = user_id
    response = supabase.table("workouts").insert(workout_data).execute()
    
    if response.error:
        raise Exception(f"Supabase insert error: {response.error}")
    return response.data[0] if response.data else {}

async def fetch_workouts(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetch all workouts for a specific user.
    """
    response = supabase.table("workouts").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    
    if response.error:
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

    if response.error:
        raise Exception(f"Supabase update error: {response.error}")
    return response.data[0] if response.data else None
