from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import logging

from app.core.database import get_db
from app.deps.auth import get_current_user
from app.models.user import User
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse
)
from app.repositories.announcement import AnnouncementRepository
from app.services.email_service import email_service

router = APIRouter()
logger = logging.getLogger(__name__)


async def send_announcement_emails_background(
    announcement_id: UUID,
    announcement_title: str,
    announcement_content: str,
    announcement_priority: str,
    announcement_category: str,
    send_to_admins: bool,
    db: Session
):
    """
    Background task to send announcement emails to targeted students
    This runs asynchronously so it doesn't block the API response
    """
    try:
        repo = AnnouncementRepository(db)

        # Get the announcement
        announcement = repo.get_by_id(announcement_id)
        if not announcement:
            logger.error(f"Announcement {announcement_id} not found for email sending")
            return

        # Get all students who should receive this announcement
        target_students = repo.get_students_for_announcement(announcement)

        # Extract valid email addresses from students
        recipient_emails = []
        if target_students and len(target_students) > 0:
            for student in target_students:
                if student.email:
                    recipient_emails.append(student.email)
                elif hasattr(student, 'student_profile') and student.student_profile and student.student_profile.email:
                    recipient_emails.append(student.student_profile.email)

        # Add admin emails if send_to_admins is True
        if send_to_admins:
            from app.models.user import User
            admin_users = db.query(User).filter(User.role == "admin").all()
            for admin in admin_users:
                if admin.email and admin.email not in recipient_emails:
                    recipient_emails.append(admin.email)
            logger.info(f"Added {len(admin_users)} admins to recipient list")

        if not recipient_emails:
            logger.warning(f"No valid email addresses found for announcement {announcement_id}")
            return

        logger.info(f"Sending announcement emails to {len(recipient_emails)} recipients")

        # Send emails in batches to avoid overwhelming SendGrid
        batch_size = 100
        success_count = 0
        failed_count = 0

        for i in range(0, len(recipient_emails), batch_size):
            batch = recipient_emails[i:i + batch_size]

            try:
                success = await email_service.send_announcement_email(
                    to=batch,
                    title=announcement_title,
                    content=announcement_content,
                    priority=announcement_priority,
                    category=announcement_category,
                    db_session=db
                )

                if success:
                    success_count += len(batch)
                    logger.info(f"Successfully sent batch {i//batch_size + 1} ({len(batch)} emails)")
                else:
                    failed_count += len(batch)
                    logger.error(f"Failed to send batch {i//batch_size + 1} ({len(batch)} emails)")

            except Exception as e:
                failed_count += len(batch)
                logger.error(f"Error sending email batch: {str(e)}")

        logger.info(f"Email sending complete: {success_count} successful, {failed_count} failed")

    except Exception as e:
        logger.error(f"Error in background email task: {str(e)}")
    finally:
        db.close()


@router.get("/", response_model=List[AnnouncementResponse])
def get_announcements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get announcements based on user role:
    - Admins: Get all announcements
    - Students: Get filtered announcements (global + location/bucket specific)
    """
    repo = AnnouncementRepository(db)
    
    try:
        if current_user.role == "admin":
            announcements = repo.get_all_announcements(current_user)
        else:
            announcements = repo.get_announcements_for_student(current_user)
        
        return announcements
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching announcements: {str(e)}"
        )


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(
    announcement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific announcement by ID
    - Admins: Can view any announcement
    - Students: Can only view announcements they have access to
    """
    repo = AnnouncementRepository(db)
    
    try:
        announcement = repo.get_announcement_by_id(announcement_id, current_user)
        
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found or you don't have access to it"
            )
        
        return announcement
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching announcement: {str(e)}"
        )


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new announcement
    - Only admins can create announcements
    - Optionally sends email notification to targeted students
    """
    repo = AnnouncementRepository(db)

    try:
        # Validate target audience logic
        if announcement_data.target_audience == "program_stages" and (not announcement_data.target_program_stages or len(announcement_data.target_program_stages) == 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_program_stages is required when target_audience is 'program_stages'"
            )

        if announcement_data.target_audience == "locations" and (not announcement_data.target_locations or len(announcement_data.target_locations) == 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_locations is required when target_audience is 'locations'"
            )

        if announcement_data.target_audience == "both":
            program_stages_empty = not announcement_data.target_program_stages or len(announcement_data.target_program_stages) == 0
            locations_empty = not announcement_data.target_locations or len(announcement_data.target_locations) == 0
            if program_stages_empty and locations_empty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="At least one of target_program_stages or target_locations is required when target_audience is 'both'"
                )

        # Extract send_email and send_to_admins flags before creating announcement
        send_email = announcement_data.send_email
        send_to_admins = announcement_data.send_to_admins

        # Create the announcement (exclude send_email and send_to_admins from model data)
        announcement_dict = announcement_data.model_dump()
        announcement_dict.pop('send_email', None)  # Remove send_email from dict
        announcement_dict.pop('send_to_admins', None)  # Remove send_to_admins from dict

        announcement = repo.create_announcement(
            current_user,
            **announcement_dict
        )

        # Trigger background email task if enabled
        if send_email:
            logger.info(f"Queuing email notification for announcement {announcement.id}")
            background_tasks.add_task(
                send_announcement_emails_background,
                announcement_id=announcement.id,
                announcement_title=announcement.title,
                announcement_content=announcement.content,
                announcement_priority=announcement.priority,
                announcement_category=announcement.category,
                send_to_admins=send_to_admins,
                db=db
            )
        else:
            logger.info(f"Email notification disabled for announcement {announcement.id}")

        return announcement
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating announcement: {str(e)}"
        )


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: UUID,
    announcement_data: AnnouncementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing announcement
    - Only admins can update announcements
    """
    repo = AnnouncementRepository(db)
    
    try:
        # Check if announcement exists
        existing_announcement = repo.get_by_id(announcement_id)
        if not existing_announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found"
            )
        
        # Prepare update data (exclude None values)
        update_data = announcement_data.model_dump(exclude_unset=True)
        
        # Validate target audience logic if being updated
        target_audience = update_data.get('target_audience', existing_announcement.target_audience)
        
        # Validate multi-selection fields
        if target_audience == "program_stages":
            target_program_stages = update_data.get('target_program_stages', existing_announcement.target_program_stages)
            if not target_program_stages or len(target_program_stages) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_program_stages is required when target_audience is 'program_stages'"
                )
        
        if target_audience == "locations":
            target_locations = update_data.get('target_locations', existing_announcement.target_locations)
            if not target_locations or len(target_locations) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_locations is required when target_audience is 'locations'"
                )
        
        if target_audience == "both":
            target_program_stages = update_data.get('target_program_stages', existing_announcement.target_program_stages)
            target_locations = update_data.get('target_locations', existing_announcement.target_locations)
            program_stages_empty = not target_program_stages or len(target_program_stages) == 0
            locations_empty = not target_locations or len(target_locations) == 0
            if program_stages_empty and locations_empty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="At least one of target_program_stages or target_locations is required when target_audience is 'both'"
                )
        
        # Update the announcement
        updated_announcement = repo.update_announcement(
            announcement_id,
            current_user,
            **update_data
        )
        
        if not updated_announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found"
            )
        
        return updated_announcement
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating announcement: {str(e)}"
        )


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an announcement
    - Only admins can delete announcements
    """
    repo = AnnouncementRepository(db)
    
    try:
        success = repo.delete_announcement(announcement_id, current_user)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found"
            )
        
        return None
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting announcement: {str(e)}"
        )

