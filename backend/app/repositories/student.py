from sqlalchemy.orm import Session
from sqlalchemy import or_
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
    
    def search_students(self, query: str, requesting_user: User) -> List[User]:
        """
        Search students by name, email, or school
        Admin only - returns students matching the search query
        """
        if requesting_user.role != "admin":
            raise PermissionError("Only admins can search students")
        
        # If query is too short, return empty list
        if len(query.strip()) < 2:
            return []
        
        search_term = f"%{query.lower()}%"
        
        # Search across User and StudentProfile tables
        # Note: first_name and last_name are in StudentProfile, not User
        students = (
            self.db.query(User)
            .join(StudentProfile, User.id == StudentProfile.user_id, isouter=True)
            .filter(
                User.role == "student",
                or_(
                    User.email.ilike(search_term),
                    User.username.ilike(search_term),
                    StudentProfile.first_name.ilike(search_term),
                    StudentProfile.last_name.ilike(search_term),
                    StudentProfile.high_school.ilike(search_term)
                )
            )
            .distinct()
            .all()
        )
        
        return students

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
    
    def get_profile_by_user_id(self, user_id: UUID) -> Optional[StudentProfile]:
        """Get student profile by user ID"""
        return self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    
    def update_profile_picture(self, user_id: UUID, picture_url: str) -> bool:
        """Update profile picture URL"""
        try:
            profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
            if profile:
                profile.profile_picture_url = picture_url
                self.db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error updating profile picture: {e}")
            self.db.rollback()
            return False
    
    def update_resume_url(self, user_id: UUID, resume_url: str) -> bool:
        """Update resume URL (S3 key)"""
        try:
            profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
            if profile:
                profile.resume_url = resume_url
                self.db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error updating resume URL: {e}")
            self.db.rollback()
            return False
    
    def update_food_handlers_url(self, user_id: UUID, credential_url: str) -> bool:
        """Update food handlers card URL (S3 key)"""
        try:
            profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
            if profile:
                profile.food_handlers_card_url = credential_url
                self.db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error updating credential URL: {e}")
            self.db.rollback()
            return False
    
    def update_servsafe_url(self, user_id: UUID, servsafe_url: str) -> bool:
        """Update ServSafe certificate URL (S3 key)"""
        try:
            profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
            if profile:
                profile.servsafe_certificate_url = servsafe_url
                self.db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error updating ServSafe certificate URL: {e}")
            self.db.rollback()
            return False