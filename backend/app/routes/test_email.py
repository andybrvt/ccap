from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.core.database import get_db
from app.deps.auth import require_admin
from app.services.email_service import email_service
from app.models.user import User
from app.models.announcement import Announcement
from app.repositories.announcement import AnnouncementRepository

router = APIRouter()


class TestAnnouncementEmailRequest(BaseModel):
    email: EmailStr
    title: str = "Test Announcement: Welcome to C·CAP!"
    content: str = "This is a test announcement email to verify the email template is working correctly.\n\nThe email includes:\n- Professional header with C·CAP branding\n- Priority badges for important announcements\n- Formatted content with proper line breaks\n- Call-to-action button to view on platform\n- Professional footer\n\nIf you can see this email with proper formatting, the announcement email system is working!"
    priority: str = "high"
    category: str = "test"


class TestAnnouncementFlowRequest(BaseModel):
    # Your email to receive the test
    test_email: EmailStr

    # Announcement details
    title: str = "Test Announcement Flow"
    content: str = "Testing the full announcement email flow including student targeting."
    priority: str = "high"
    category: str = "test"

    # Targeting criteria (same as real announcement)
    target_audience: str = "all"  # all, bucket, location, program_stages, locations, both
    target_bucket: Optional[str] = None
    target_state: Optional[str] = None
    target_program_stages: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None


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


@router.post("/test-announcement-email")
async def test_announcement_email(
    request: TestAnnouncementEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Test announcement email template (Admin only)

    Send a test announcement email to verify the HTML template renders correctly.
    You can customize the title, content, priority, and category.
    """
    try:
        # Send test announcement email
        success = await email_service.send_announcement_email(
            to=[request.email],
            title=request.title,
            content=request.content,
            priority=request.priority,
            category=request.category,
            db_session=db
        )

        if success:
            return {
                "message": f"Test announcement email sent successfully to {request.email}!",
                "status": "success",
                "details": {
                    "recipient": request.email,
                    "title": request.title,
                    "priority": request.priority,
                    "category": request.category
                }
            }
        else:
            return {
                "message": "Failed to send test announcement email",
                "status": "error"
            }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Announcement email test failed: {str(e)}"
        )


@router.post("/test-announcement-flow")
async def test_announcement_flow(
    request: TestAnnouncementFlowRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Test the full announcement email flow (Admin only)

    This endpoint:
    1. Creates a mock announcement with your targeting criteria
    2. Finds all students who match the targeting
    3. Shows you how many students would receive the email
    4. Sends the email ONLY to your test email (not to real students)

    Perfect for smoke testing the targeting logic before sending real announcements!
    """
    try:
        repo = AnnouncementRepository(db)

        # Create a mock announcement object (not saved to database)
        mock_announcement = Announcement(
            title=request.title,
            content=request.content,
            priority=request.priority,
            category=request.category,
            target_audience=request.target_audience,
            target_bucket=request.target_bucket,
            target_state=request.target_state,
            target_program_stages=request.target_program_stages,
            target_locations=request.target_locations,
            created_by=current_user.id
        )

        # Find all students who would receive this announcement
        target_students = repo.get_students_for_announcement(mock_announcement)

        # Get student details for the response
        student_details = []
        valid_email_count = 0

        for student in target_students[:10]:  # Show first 10 students
            email = student.email or (student.student_profile.email if student.student_profile else None)
            if email:
                valid_email_count += 1

            student_details.append({
                "name": f"{student.student_profile.first_name} {student.student_profile.last_name}" if student.student_profile else "N/A",
                "email": email or "No email",
                "state": student.student_profile.state if student.student_profile else "N/A",
                "bucket": student.student_profile.current_bucket if student.student_profile else "N/A"
            })

        # Count total valid emails
        total_valid_emails = sum(1 for s in target_students if s.email or (s.student_profile and s.student_profile.email))

        # Send test email to admin's email only
        email_sent = await email_service.send_announcement_email(
            to=[request.test_email],
            title=request.title,
            content=request.content,
            priority=request.priority,
            category=request.category,
            db_session=db
        )

        return {
            "message": "Announcement flow test completed!",
            "status": "success",
            "targeting": {
                "target_audience": request.target_audience,
                "target_bucket": request.target_bucket,
                "target_state": request.target_state,
                "target_program_stages": request.target_program_stages,
                "target_locations": request.target_locations
            },
            "results": {
                "total_students_matched": len(target_students),
                "students_with_valid_emails": total_valid_emails,
                "students_without_emails": len(target_students) - total_valid_emails,
                "sample_students": student_details,
                "note": f"Showing first {len(student_details)} of {len(target_students)} matched students"
            },
            "email_test": {
                "sent_to": request.test_email,
                "success": email_sent,
                "message": "Email sent to your test address (NOT to real students)"
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Announcement flow test failed: {str(e)}"
        )
