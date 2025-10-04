from fastapi import APIRouter, Depends, HTTPException
from app.services.supabase_client import supabase
from app.core.auth import get_current_user
from app.schemas.profile import ProfileUpdate, ProfileResponse

router = APIRouter()

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: str = Depends(get_current_user)):
    """Fetch user profile from Supabase users table."""
    user_id = current_user["id"]
    email = current_user.get("email")
    response = supabase.table("users").select("*").eq("id",user_id).maybe_single().execute()
    if response is None:
        ins = supabase.table("users").insert({"id": user_id, "email": email}).execute()
        return ins.data
    return response.data


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(payload: ProfileUpdate, current_user: str = Depends(get_current_user)):
    """Update user profile fields in Supabase users table."""
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update fields provided")
    print("Updating profile for user:", current_user["id"])
    print("Update data:", update_data)
    response = supabase.table("users").update(update_data).eq("id", current_user["id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile update failed")
    return response.data[0]
