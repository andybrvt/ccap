from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.deps.auth import require_admin
from app.schemas.email_notification import (
    EmailNotificationCreate,
    EmailNotificationUpdate,
    EmailNotificationResponse
)
from app.repositories.email_notification import EmailNotificationRepository
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[EmailNotificationResponse])
async def get_email_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all email notification settings (Admin only)"""
    repo = EmailNotificationRepository(db)
    return repo.get_all()


@router.post("/", response_model=EmailNotificationResponse)
async def create_email_notification(
    email_notification: EmailNotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new email notification setting (Admin only)"""
    repo = EmailNotificationRepository(db)
    return repo.create(email_notification)


@router.put("/{email_id}", response_model=EmailNotificationResponse)
async def update_email_notification(
    email_id: int,
    email_update: EmailNotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update an email notification setting (Admin only)"""
    repo = EmailNotificationRepository(db)
    updated_email = repo.update(email_id, email_update)
    if not updated_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email notification not found"
        )
    return updated_email


@router.delete("/{email_id}")
async def delete_email_notification(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete an email notification setting (Admin only)"""
    repo = EmailNotificationRepository(db)
    success = repo.delete(email_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email notification not found"
        )
    return {"message": "Email notification deleted successfully"}


@router.patch("/{email_id}/toggle")
async def toggle_email_notification(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Toggle the active status of an email notification (Admin only)"""
    repo = EmailNotificationRepository(db)
    updated_email = repo.toggle_active(email_id)
    if not updated_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email notification not found"
        )
    return updated_email


@router.get("/active")
async def get_active_email_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all active email addresses for notifications (Admin only)"""
    repo = EmailNotificationRepository(db)
    active_emails = repo.get_active_emails()
    return {"active_emails": active_emails}
