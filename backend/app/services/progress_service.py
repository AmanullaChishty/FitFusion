# backend/app/services/progress_service.py

from typing import List, Dict, Any, Optional
from app.services.supabase_client import supabase

async def insert_progress(user_id: str, progress_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insert a progress record into Supabase DB for a specific user.
    """
    progress_data["user_id"] = user_id
    response = supabase.table("progress").insert(progress_data).execute()
    print("Supabase insert response:", response)
    if not response.data:
        raise Exception(f"Supabase insert error")
    return response.data[0] if response.data else {}

async def fetch_progress(user_id: str, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetch all progress records for a specific user, ordered by recorded_at descending.
    Supports simple pagination via skip and limit.
    """
    response = (
        supabase.table("progress")
        .select("*")
        .eq("user_id", user_id)
        .order("recorded_at", desc=True)
        .range(skip, skip + limit - 1)
        .execute()
    )
    print("Supabase fetch response:", response)
    if not response.data:
        raise Exception(f"Supabase fetch error")
    return response.data or []

async def get_progress_by_id(progress_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch a single progress record by ID for a specific user.
    """
    response = (
        supabase.table("progress")
        .select("*")
        .eq("id", progress_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    print("Supabase get response:", response)
    if not response.data:
        raise Exception(f"Supabase fetch error")
    return response.data if response.data else None

async def update_progress(progress_id: str, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update a progress record for a specific user.
    Only updates fields provided in update_data.
    """
    if not update_data:
        return None

    response = (
        supabase.table("progress")
        .update(update_data)
        .eq("id", progress_id)
        .eq("user_id", user_id)  # ensure users can only update their own records
        .execute()
    )
    print("Supabase update response:", response)
    if not response.data:
        raise Exception(f"Supabase update error")
    return response.data[0] if response.data else None

async def delete_progress(progress_id: str, user_id: str) -> None:
    """
    Delete a progress record for a specific user.
    """
    response = (
        supabase.table("progress")
        .delete()
        .eq("id", progress_id)
        .eq("user_id", user_id)
        .execute()
    )
    print("Supabase delete response:", response)
    if not response.data:
        raise Exception(f"Supabase delete error")
