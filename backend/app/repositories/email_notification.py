from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.email_notification import EmailNotification
from app.schemas.email_notification import EmailNotificationCreate, EmailNotificationUpdate


class EmailNotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, email_notification: EmailNotificationCreate) -> EmailNotification:
        db_email = EmailNotification(
            email=email_notification.email,
            is_active=email_notification.is_active
        )
        self.db.add(db_email)
        self.db.commit()
        self.db.refresh(db_email)
        return db_email

    def get_all(self) -> List[EmailNotification]:
        return self.db.query(EmailNotification).all()

    def get_active_emails(self) -> List[str]:
        """Get all active email addresses for notifications"""
        emails = self.db.query(EmailNotification.email).filter(
            EmailNotification.is_active == True
        ).all()
        return [email[0] for email in emails]

    def get_by_id(self, email_id: int) -> Optional[EmailNotification]:
        return self.db.query(EmailNotification).filter(
            EmailNotification.id == email_id
        ).first()

    def update(self, email_id: int, email_update: EmailNotificationUpdate) -> Optional[EmailNotification]:
        db_email = self.get_by_id(email_id)
        if not db_email:
            return None
        
        if email_update.email is not None:
            db_email.email = email_update.email
        if email_update.is_active is not None:
            db_email.is_active = email_update.is_active
        
        self.db.commit()
        self.db.refresh(db_email)
        return db_email

    def delete(self, email_id: int) -> bool:
        db_email = self.get_by_id(email_id)
        if not db_email:
            return False
        
        self.db.delete(db_email)
        self.db.commit()
        return True

    def toggle_active(self, email_id: int) -> Optional[EmailNotification]:
        """Toggle the active status of an email notification"""
        db_email = self.get_by_id(email_id)
        if not db_email:
            return None
        
        db_email.is_active = not db_email.is_active
        self.db.commit()
        self.db.refresh(db_email)
        return db_email
