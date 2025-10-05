from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import date
from uuid import UUID

from app.services.supabase_client import supabase
from app.core.auth import get_current_user
from app.schemas.meal import MealCreate, MealUpdate, MealOut

router = APIRouter(prefix="/meals", tags=["meals"])


# --------------------------
# CREATE
# --------------------------
@router.post("/", response_model=MealOut, status_code=status.HTTP_201_CREATED)
def create_meal(
    payload: MealCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new meal entry for the authenticated user."""
    data = payload.dict()
    data["user_id"] = current_user["id"]  # enforce ownership

    try:
        res = supabase.table("meals").insert(data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create meal")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------
# READ ALL (with filters)
# --------------------------
@router.get("/", response_model=List[MealOut])
def list_meals(
    current_user: dict = Depends(get_current_user),
    date_: Optional[date] = Query(None, alias="date"),
    start: Optional[date] = Query(None),
    end: Optional[date] = Query(None)
):
    """List all meals for a user, optionally filtered by date or date range."""
    query = supabase.table("meals").select("*").eq("user_id", current_user["id"])

    if date_:
        query = query.eq("date", str(date_))
    elif start and end:
        query = query.gte("date", str(start)).lte("date", str(end))

    try:
        res = query.order("date", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------
# READ SINGLE
# --------------------------
@router.get("/{meal_id}", response_model=MealOut)
def get_meal(meal_id: UUID, current_user: dict = Depends(get_current_user)):
    """Retrieve a single meal entry by ID (only if owned by the user)."""
    res = supabase.table("meals").select("*").eq("id", str(meal_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Meal not found")

    meal = res.data[0]
    if meal["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Forbidden")

    return meal


# --------------------------
# UPDATE
# --------------------------
@router.put("/{meal_id}", response_model=MealOut)
def update_meal(
    meal_id: UUID,
    updates: MealUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a meal entry (only by the owner)."""
    res = supabase.table("meals").select("*").eq("id", str(meal_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Meal not found")

    meal = res.data[0]
    if meal["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        updated_data = updates.dict(exclude_unset=True)
        result = supabase.table("meals").update(updated_data).eq("id", str(meal_id)).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------
# DELETE
# --------------------------
@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(meal_id: UUID, current_user: dict = Depends(get_current_user)):
    """Delete a meal entry (only by the owner)."""
    res = supabase.table("meals").select("*").eq("id", str(meal_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Meal not found")

    meal = res.data[0]
    if meal["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        supabase.table("meals").delete().eq("id", str(meal_id)).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
