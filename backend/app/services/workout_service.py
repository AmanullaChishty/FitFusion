# backend/app/services/workout_service.py
from supabase import create_client, Client
from app.core.config import settings
from typing import List, Dict, Any

# Create Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

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
