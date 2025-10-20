from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.deps.auth import require_admin
from app.models.user import User
from app.models.email_log import EmailLog
from app.schemas.email_log import EmailLogResponse

router = APIRouter()


@router.get("/email-logs", response_model=List[EmailLogResponse])
async def get_email_logs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    status_filter: Optional[str] = Query(None, description="Filter by status: success or failed"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get email logs with pagination and filtering (Admin only)"""
    try:
        query = db.query(EmailLog)
        
        # Apply status filter if provided
        if status_filter and status_filter in ["success", "failed"]:
            query = query.filter(EmailLog.status == status_filter)
        
        # Apply pagination and ordering
        email_logs = query.order_by(EmailLog.sent_at.desc()).offset(skip).limit(limit).all()
        
        return email_logs
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve email logs: {str(e)}"
        )


@router.get("/email-logs/stats")
async def get_email_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get email statistics (Admin only)"""
    try:
        total_emails = db.query(EmailLog).count()
        successful_emails = db.query(EmailLog).filter(EmailLog.status == "success").count()
        failed_emails = db.query(EmailLog).filter(EmailLog.status == "failed").count()
        
        return {
            "total_emails": total_emails,
            "successful_emails": successful_emails,
            "failed_emails": failed_emails,
            "success_rate": round((successful_emails / total_emails * 100), 2) if total_emails > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve email stats: {str(e)}"
        )
