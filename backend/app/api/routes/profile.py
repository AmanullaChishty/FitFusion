from fastapi import APIRouter, Depends, HTTPException
from app.services.supabase_client import supabase
from app.core.auth import get_current_user
from app.schemas.profile import ProfileUpdate, ProfileResponse

router = APIRouter()

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user_id: str = Depends(get_current_user)):
    """Fetch user profile from Supabase users table."""
    response = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if response.data is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
    """Update user profile fields in Supabase users table."""
    update_data = payload.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update fields provided")

    response = supabase.table("users").update(update_data).eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile update failed")
    return response.data[0]
