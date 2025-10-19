from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Minimal user info for post responses
class PostAuthor(BaseModel):
    id: UUID
    username: str
    email: str
    
    class Config:
        from_attributes = True

# Base schema
class PostBase(BaseModel):
    caption: Optional[str] = None
    featured_dish: Optional[str] = None
    is_private: Optional[bool] = False

# Schema for creating post (used with multipart form data)
class PostCreate(PostBase):
    pass  # image comes from file upload, not JSON

# Schema for updating post
class PostUpdate(BaseModel):
    caption: Optional[str] = None
    featured_dish: Optional[str] = None
    is_private: Optional[bool] = None

# Schema for response
class PostResponse(PostBase):
    id: UUID
    user_id: UUID
    image_url: str
    likes_count: int
    comments_count: int
    is_private: bool
    created_at: datetime
    updated_at: Optional[datetime]
    author: Optional[PostAuthor] = None  # Include author info
    
    class Config:
        from_attributes = True

