from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Base schema
class AnnouncementBase(BaseModel):
    title: str
    content: str
    target_audience: str = "all"
    target_bucket: Optional[str] = None
    target_city: Optional[str] = None
    target_state: Optional[str] = None

# Schema for creating announcement
class AnnouncementCreate(AnnouncementBase):
    pass

# Schema for updating announcement
class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    target_audience: Optional[str] = None
    target_bucket: Optional[str] = None
    target_city: Optional[str] = None
    target_state: Optional[str] = None

# Schema for response
class AnnouncementResponse(AnnouncementBase):
    id: UUID
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

