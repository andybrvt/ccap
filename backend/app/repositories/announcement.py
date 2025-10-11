from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from uuid import UUID
from app.models.announcement import Announcement
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.repositories.base import BaseRepository


class AnnouncementRepository(BaseRepository[Announcement]):
    def __init__(self, db: Session):
        super().__init__(db, Announcement)

    def get_all_announcements(self, user: User) -> List[Announcement]:
        """
        Get all announcements - only admins can see all announcements
        Students will see filtered announcements via get_announcements_for_student
        """
        if user.role != "admin":
            raise PermissionError("Only admins can view all announcements")
        
        return self.db.query(Announcement).order_by(Announcement.created_at.desc()).all()

    def get_announcements_for_student(self, user: User) -> List[Announcement]:
        """
        Get announcements for a student - filtered by:
        1. Global announcements (target_audience = "all")
        2. Bucket-specific announcements matching student's current_bucket
        3. Location-specific announcements matching student's city/state
        """
        if user.role != "student":
            # If admin, they should use get_all_announcements
            # But we can still return all announcements for them
            return self.get_all_announcements(user)
        
        # Get the student's profile
        student_profile = self.db.query(StudentProfile).filter(
            StudentProfile.user_id == user.id
        ).first()
        
        if not student_profile:
            # If no profile, only show global announcements
            return self.db.query(Announcement).filter(
                Announcement.target_audience == "all"
            ).order_by(Announcement.created_at.desc()).all()
        
        # Build filter conditions
        filters = [
            # 1. Global announcements
            Announcement.target_audience == "all"
        ]
        
        # 2. Bucket-specific announcements
        if student_profile.current_bucket:
            filters.append(
                and_(
                    Announcement.target_audience == "bucket",
                    Announcement.target_bucket == student_profile.current_bucket
                )
            )
        
        # 3. Location-specific announcements (state-level only)
        if student_profile.state:
            filters.append(
                and_(
                    Announcement.target_audience == "location",
                    Announcement.target_state == student_profile.state
                )
            )
        
        # Combine all filters with OR
        return self.db.query(Announcement).filter(
            or_(*filters)
        ).order_by(Announcement.created_at.desc()).all()

    def create_announcement(self, user: User, **kwargs) -> Announcement:
        """
        Create a new announcement - only admins can create announcements
        """
        if user.role != "admin":
            raise PermissionError("Only admins can create announcements")
        
        # Set the created_by to the admin's user ID
        kwargs['created_by'] = user.id
        
        return self.create(**kwargs)

    def update_announcement(self, announcement_id: UUID, user: User, **kwargs) -> Optional[Announcement]:
        """
        Update an announcement - only admins can update announcements
        """
        if user.role != "admin":
            raise PermissionError("Only admins can update announcements")
        
        return self.update(announcement_id, **kwargs)

    def delete_announcement(self, announcement_id: UUID, user: User) -> bool:
        """
        Delete an announcement - only admins can delete announcements
        """
        if user.role != "admin":
            raise PermissionError("Only admins can delete announcements")
        
        return self.delete(announcement_id)

    def get_announcement_by_id(self, announcement_id: UUID, user: User) -> Optional[Announcement]:
        """
        Get a specific announcement by ID
        Admins can view any announcement
        Students can only view announcements they have access to
        """
        announcement = self.get_by_id(announcement_id)
        
        if not announcement:
            return None
        
        # Admins can see any announcement
        if user.role == "admin":
            return announcement
        
        # For students, check if they have access to this announcement
        accessible_announcements = self.get_announcements_for_student(user)
        accessible_ids = [a.id for a in accessible_announcements]
        
        if announcement.id in accessible_ids:
            return announcement
        
        return None

