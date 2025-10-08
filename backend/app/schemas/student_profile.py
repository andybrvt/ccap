from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Base schema
class StudentProfileBase(BaseModel):
    first_name: str
    last_name: str
    preferred_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    high_school: Optional[str] = None
    graduation_year: Optional[str] = None
    current_employer: Optional[str] = None
    current_position: Optional[str] = None
    current_bucket: str = "Pre-Apprentice"

# Schema for creating student profile
class StudentProfileCreate(StudentProfileBase):
    user_id: UUID

# Schema for updating student profile
class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    preferred_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    high_school: Optional[str] = None
    graduation_year: Optional[str] = None
    current_employer: Optional[str] = None
    current_position: Optional[str] = None
    current_bucket: Optional[str] = None

# Schema for response
class StudentProfileResponse(StudentProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

