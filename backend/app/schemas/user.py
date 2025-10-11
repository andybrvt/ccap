from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID

# Minimal student profile for auth/me (only what's needed everywhere)
class StudentProfileMinimal(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: Optional[str] = None
    onboarding_step: int = 0  # Track onboarding progress
    
    class Config:
        from_attributes = True

# Base schema
class UserBase(BaseModel):
    email: EmailStr
    username: str

# Schema for user registration
class UserCreate(UserBase):
    password: str
    role: Optional[str] = "student"

# Schema for user login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for user response (no password!)
class UserResponse(UserBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    student_profile: Optional[StudentProfileMinimal] = None  # Minimal profile for auth/me
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
