from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.deps.auth import get_current_user
from app.models.user import User
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse
)
from app.repositories.announcement import AnnouncementRepository

router = APIRouter()


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
def create_announcement(
    announcement_data: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new announcement
    - Only admins can create announcements
    """
    repo = AnnouncementRepository(db)
    
    try:
        # Validate target audience logic
        if announcement_data.target_audience == "bucket" and not announcement_data.target_bucket:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_bucket is required when target_audience is 'bucket'"
            )
        
        if announcement_data.target_audience == "location":
            if not announcement_data.target_state:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_state is required when target_audience is 'location'"
                )
        
        # Create the announcement
        announcement = repo.create_announcement(
            current_user,
            **announcement_data.model_dump()
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
        if 'target_audience' in update_data or 'target_bucket' in update_data:
            target_audience = update_data.get('target_audience', existing_announcement.target_audience)
            target_bucket = update_data.get('target_bucket', existing_announcement.target_bucket)
            
            if target_audience == "bucket" and not target_bucket:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_bucket is required when target_audience is 'bucket'"
                )
        
        if 'target_audience' in update_data or 'target_state' in update_data:
            target_audience = update_data.get('target_audience', existing_announcement.target_audience)
            target_state = update_data.get('target_state', existing_announcement.target_state)
            
            if target_audience == "location" and not target_state:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_state is required when target_audience is 'location'"
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

