# backend/app/api/routes/progress.py

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from datetime import date, datetime
from ...schemas.progress import ProgressCreate, ProgressRead
from ...services import progress_service
from ...core.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])

@router.post("/", response_model=ProgressRead)
async def create_progress(payload: ProgressCreate, user=Depends(get_current_user)):
    """
    Create a new progress record for the current user.
    """
    data = payload.model_dump()
    if isinstance(data.get("recorded_at"), (date, datetime)):
        data["recorded_at"] = data["recorded_at"].isoformat()
    print("progress post data:", data)
    try:
        return await progress_service.insert_progress(user["id"], data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ProgressRead])
async def list_progress(skip: int = 0, limit: int = 50, user=Depends(get_current_user)):
    """
    List all progress records for the current user, with pagination.
    """
    try:
        return await progress_service.fetch_progress(user["id"], skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{progress_id}", response_model=ProgressRead)
async def get_progress(progress_id: str, user=Depends(get_current_user)):
    """
    Retrieve a single progress record by ID for the current user.
    """
    record = await progress_service.get_progress_by_id(progress_id, user["id"])
    if not record:
        raise HTTPException(status_code=404, detail="Progress record not found")
    return record

@router.put("/{progress_id}", response_model=ProgressRead)
async def update_progress(progress_id: str, payload: ProgressCreate, user=Depends(get_current_user)):
    """
    Update an existing progress record for the current user.
    """
    try:
        updated = await progress_service.update_progress(progress_id, user["id"], payload.model_dump(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Progress record not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{progress_id}")
async def delete_progress(progress_id: str, user=Depends(get_current_user)):
    """
    Delete a progress record for the current user.
    """
    try:
        await progress_service.delete_progress(progress_id, user["id"])
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
