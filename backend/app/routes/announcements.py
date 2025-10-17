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

