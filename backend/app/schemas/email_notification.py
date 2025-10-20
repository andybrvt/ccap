from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class EmailNotificationBase(BaseModel):
    email: EmailStr
    is_active: bool = True


class EmailNotificationCreate(EmailNotificationBase):
    pass


class EmailNotificationUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class EmailNotificationResponse(EmailNotificationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
