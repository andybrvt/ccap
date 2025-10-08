from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

# Schema for creating like
class LikeCreate(BaseModel):
    post_id: UUID

# Schema for response
class LikeResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

