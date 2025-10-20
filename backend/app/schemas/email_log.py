from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EmailLogBase(BaseModel):
    to_email: str
    subject: str
    body: str
    status: str
    error_message: Optional[str] = None


class EmailLogCreate(EmailLogBase):
    pass


class EmailLogResponse(EmailLogBase):
    id: int
    sent_at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
