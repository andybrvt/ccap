from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Minimal user info for comment responses
class CommentAuthor(BaseModel):
    id: UUID
    username: str
    email: str
    
    class Config:
        from_attributes = True

# Base schema
class CommentBase(BaseModel):
    content: str

# Schema for creating comment
class CommentCreate(CommentBase):
    pass  # post_id comes from URL path, not request body

# Schema for updating comment
class CommentUpdate(BaseModel):
    content: str

# Schema for response
class CommentResponse(CommentBase):
    id: UUID
    post_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    user: Optional[CommentAuthor] = None  # Include author info
    
    class Config:
        from_attributes = True

