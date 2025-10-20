from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.deps.auth import require_admin
from app.services.email_service import email_service
from app.models.user import User

router = APIRouter()


@router.post("/test-email")
async def test_email(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Test email sending functionality (Admin only)"""
    try:
        # Send a simple test email to yourself
        success = await email_service.send_email(
            to=["andybrvt@gmail.com"],
            subject="C-CAP Test Email",
            body="<h2>Test Email from C-CAP</h2><p>This is a test email to verify SendGrid is working correctly!</p>",
            db_session=db
        )
        
        if success:
            return {"message": "Test email sent successfully!", "status": "success"}
        else:
            return {"message": "Failed to send test email", "status": "error"}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email test failed: {str(e)}"
        )
