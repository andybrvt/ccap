from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Base schema
class ProgramStatusBase(BaseModel):
    old_status: str
    new_status: str
    notes: Optional[str] = None

# Schema for creating program status change
class ProgramStatusCreate(ProgramStatusBase):
    student_id: UUID

# Schema for response
class ProgramStatusResponse(ProgramStatusBase):
    id: UUID
    student_id: UUID
    changed_by: Optional[UUID]
    changed_at: datetime
    
    class Config:
        from_attributes = True

