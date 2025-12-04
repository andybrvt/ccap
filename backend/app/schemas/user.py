from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from app.schemas.student_profile import StudentProfileResponse

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

# Schema for admin endpoints with full student profile
class UserWithFullProfile(UserBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    student_profile: Optional[StudentProfileResponse] = None  # Full profile for admin
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[UUID] = None

# Schema for bulk update request
class BulkProgramStatusUpdate(BaseModel):
    student_ids: List[UUID]
    program_status: str

# Admin Management Schemas
class AdminCreate(BaseModel):
    email: EmailStr

class AdminResponse(BaseModel):
    id: UUID
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    id: UUID
    email: str
    username: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminWithPassword(AdminResponse):
    temporary_password: str  # Only returned once on creation/reset

# Pagination schema
class PaginatedStudentsResponse(BaseModel):
    students: List[UserWithFullProfile]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    class Config:
        from_attributes = True
