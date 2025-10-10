from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.schemas.student_profile import StudentProfileCreate, StudentProfileUpdate
from app.schemas.user import UserCreate
from app.repositories.base import UserRepository

class StudentRepository:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def get_all_students(self, requesting_user: User) -> List[User]:
        """Get all students - with permission check"""
        return self.user_repo.get_students_for_admin(requesting_user)

    def get_student_by_id(self, student_id: UUID, requesting_user: User) -> Optional[User]:
        """Get a specific student by ID - with permission check"""
        return self.user_repo.get_student_by_id_for_admin(student_id, requesting_user)

    def get_student_by_email(self, email: str) -> Optional[User]:
        """Get a student by email - internal use only"""
        return self.user_repo.get_by_email(email)

    def create_student_with_profile(self, user_data: UserCreate, profile_data: StudentProfileCreate) -> User:
        """Create a new student user with profile"""
        # Create the user using base repository
        new_user = self.user_repo.create_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            role="student"
        )
        
        # Create the profile
        new_profile = StudentProfile(
            user_id=new_user.id,
            first_name=profile_data.first_name,
            last_name=profile_data.last_name,
            preferred_name=profile_data.preferred_name,
            phone=profile_data.phone,
            bio=profile_data.bio,
            address=profile_data.address,
            city=profile_data.city,
            state=profile_data.state,
            zip_code=profile_data.zip_code,
            high_school=profile_data.high_school,
            graduation_year=profile_data.graduation_year,
            current_employer=profile_data.current_employer,
            current_position=profile_data.current_position,
            current_bucket=profile_data.current_bucket
        )
        
        self.db.add(new_profile)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def update_student_profile(self, student_id: UUID, profile_data: StudentProfileUpdate) -> Optional[StudentProfile]:
        """Update a student's profile"""
        profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
        
        if not profile:
            return None
            
        # Update only provided fields
        update_data = profile_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)
            
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def delete_student(self, student_id: UUID) -> bool:
        """Delete a student (cascade will delete profile)"""
        return self.user_repo.delete(student_id)