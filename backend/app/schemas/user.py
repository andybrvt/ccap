from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

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
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

