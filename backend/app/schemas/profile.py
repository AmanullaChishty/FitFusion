from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileResponse(BaseModel):
    username: Optional[str] = None
    id: str
    email: EmailStr
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    created_at: Optional[str] = None  # ISO timestamp
    training_experience: Optional[str] = None

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    training_experience: Optional[str] = None
