from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Base schema
class CommentBase(BaseModel):
    content: str

# Schema for creating comment
class CommentCreate(CommentBase):
    post_id: UUID

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
    
    class Config:
        from_attributes = True

