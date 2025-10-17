from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID

# Base schema
class AnnouncementBase(BaseModel):
    title: str
    content: str
    priority: str = "medium"  # low, medium, high
    category: str = "general"  # general, feature, maintenance, policy, etc.
    icon: str = "megaphone"  # Icon identifier
    target_audience: str = "all"  # all, bucket, location
    target_bucket: Optional[str] = None
    target_city: Optional[str] = None
    target_state: Optional[str] = None
    
    # New multi-selection fields
    target_program_stages: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None

# Schema for creating announcement
class AnnouncementCreate(AnnouncementBase):
    pass

# Schema for updating announcement
class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    target_audience: Optional[str] = None
    target_bucket: Optional[str] = None
    target_city: Optional[str] = None
    target_state: Optional[str] = None
    
    # New multi-selection fields
    target_program_stages: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None

# Schema for response
class AnnouncementResponse(AnnouncementBase):
    id: UUID
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

