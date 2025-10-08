from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

# Base schema
class CertificationBase(BaseModel):
    certification_type: str
    file_url: str

# Schema for creating certification
class CertificationCreate(CertificationBase):
    pass

# Schema for updating certification status (admin only)
class CertificationUpdate(BaseModel):
    status: str
    review_notes: Optional[str] = None

# Schema for response
class CertificationResponse(CertificationBase):
    id: UUID
    student_id: UUID
    status: str
    reviewed_by: Optional[UUID]
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]
    uploaded_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

