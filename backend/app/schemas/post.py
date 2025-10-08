from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Base schema
class PostBase(BaseModel):
    caption: Optional[str] = None
    featured_dish: Optional[str] = None

# Schema for creating post
class PostCreate(PostBase):
    image_url: str

# Schema for updating post
class PostUpdate(BaseModel):
    caption: Optional[str] = None
    featured_dish: Optional[str] = None

# Schema for response
class PostResponse(PostBase):
    id: UUID
    user_id: UUID
    image_url: str
    likes_count: int
    comments_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

