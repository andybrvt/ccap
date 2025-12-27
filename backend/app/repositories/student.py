from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
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

    def get_all_students(self, requesting_user: User, limit: Optional[int] = None, offset: int = 0) -> List[User]:
        """Get all students - with permission check"""
        return self.user_repo.get_students_for_admin(requesting_user, limit=limit, offset=offset)
    
    def count_all_students(self, requesting_user: User) -> int:
        """Count total number of students - with permission check"""
        if requesting_user.role != "admin":
            raise PermissionError("Only admins can count all students")
        return self.user_repo.count_students()
    
    def _build_filter_query(self, 
                           search: Optional[str] = None,
                           graduation_year: Optional[str] = None,
                           states: Optional[List[str]] = None,
                           relocation_states: Optional[List[str]] = None,
                           buckets: Optional[List[str]] = None,
                           ccap_connections: Optional[List[str]] = None,
                           has_resume: Optional[str] = None,
                           currently_working: Optional[str] = None,
                           food_handlers: Optional[str] = None,
                           servsafe: Optional[str] = None,
                           will_relocate: Optional[str] = None,
                           ready_to_work: Optional[str] = None,
                           onboarding_step: Optional[int] = None,
                           onboarding_complete: Optional[bool] = None):
        """Build a filtered query for students"""
        query = self.db.query(User).join(StudentProfile, User.id == StudentProfile.user_id)
        query = query.filter(User.role == "student")
        
        # Search filter
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    User.email.ilike(search_term),
                    User.username.ilike(search_term),
                    StudentProfile.first_name.ilike(search_term),
                    StudentProfile.last_name.ilike(search_term),
                    StudentProfile.high_school.ilike(search_term)
                )
            )
        
        # Graduation year filter
        if graduation_year:
            query = query.filter(StudentProfile.graduation_year == graduation_year)
        
        # State filter (multiple states)
        if states:
            query = query.filter(StudentProfile.state.in_(states))
        
        # Relocation states filter (array contains)
        if relocation_states:
            conditions = []
            for state in relocation_states:
                conditions.append(StudentProfile.relocation_states.contains([state]))
            query = query.filter(or_(*conditions))
        
        # Bucket filter (multiple buckets)
        if buckets:
            query = query.filter(StudentProfile.current_bucket.in_(buckets))
        
        # C•CAP Connection filter (multiple connections)
        if ccap_connections:
            query = query.filter(StudentProfile.ccap_connection.in_(ccap_connections))
        
        # Has resume filter
        if has_resume:
            query = query.filter(StudentProfile.has_resume == has_resume)
        
        # Currently working filter
        if currently_working:
            query = query.filter(StudentProfile.currently_employed == currently_working)
        
        # Food handlers filter
        if food_handlers:
            query = query.filter(StudentProfile.has_food_handlers_card == food_handlers)
        
        # ServSafe filter
        if servsafe:
            query = query.filter(StudentProfile.has_servsafe == servsafe)
        
        # Will relocate filter
        if will_relocate:
            query = query.filter(StudentProfile.willing_to_relocate == will_relocate)
        
        # Ready to work filter
        if ready_to_work:
            query = query.filter(StudentProfile.ready_to_work == ready_to_work)
        
        # Onboarding step filter
        if onboarding_step is not None:
            query = query.filter(StudentProfile.onboarding_step == onboarding_step)
        
        # Onboarding complete filter
        if onboarding_complete is not None:
            if onboarding_complete:
                query = query.filter(StudentProfile.onboarding_step == 0)
            else:
                query = query.filter(StudentProfile.onboarding_step > 0)
        
        return query
    
    def get_all_students_filtered(self,
                                  requesting_user: User,
                                  limit: Optional[int] = None,
                                  offset: int = 0,
                                  search: Optional[str] = None,
                                  graduation_year: Optional[str] = None,
                                  states: Optional[List[str]] = None,
                                  relocation_states: Optional[List[str]] = None,
                                  buckets: Optional[List[str]] = None,
                                  ccap_connections: Optional[List[str]] = None,
                                  has_resume: Optional[str] = None,
                                  currently_working: Optional[str] = None,
                                  food_handlers: Optional[str] = None,
                                  servsafe: Optional[str] = None,
                                  will_relocate: Optional[str] = None,
                                  ready_to_work: Optional[str] = None,
                                  onboarding_step: Optional[int] = None,
                                  onboarding_complete: Optional[bool] = None) -> List[User]:
        """Get filtered students with pagination"""
        if requesting_user.role != "admin":
            raise PermissionError("Only admins can access all students")
        
        query = self._build_filter_query(
            search=search,
            graduation_year=graduation_year,
            states=states,
            relocation_states=relocation_states,
            buckets=buckets,
            ccap_connections=ccap_connections,
            has_resume=has_resume,
            currently_working=currently_working,
            food_handlers=food_handlers,
            servsafe=servsafe,
            will_relocate=will_relocate,
            ready_to_work=ready_to_work,
            onboarding_step=onboarding_step,
            onboarding_complete=onboarding_complete
        )
        
        # Order by created_at descending
        query = query.order_by(StudentProfile.created_at.desc())
        
        # Apply pagination
        if limit is not None:
            query = query.limit(limit).offset(offset)
        
        return query.all()
    
    def count_all_students_filtered(self,
                                    requesting_user: User,
                                    search: Optional[str] = None,
                                    graduation_year: Optional[str] = None,
                                    states: Optional[List[str]] = None,
                                    relocation_states: Optional[List[str]] = None,
                                    buckets: Optional[List[str]] = None,
                                    ccap_connections: Optional[List[str]] = None,
                                    has_resume: Optional[str] = None,
                                    currently_working: Optional[str] = None,
                                    food_handlers: Optional[str] = None,
                                    servsafe: Optional[str] = None,
                                    will_relocate: Optional[str] = None,
                                    ready_to_work: Optional[str] = None,
                                    onboarding_step: Optional[int] = None,
                                    onboarding_complete: Optional[bool] = None) -> int:
        """Count filtered students"""
        if requesting_user.role != "admin":
            raise PermissionError("Only admins can count all students")
        
        query = self._build_filter_query(
            search=search,
            graduation_year=graduation_year,
            states=states,
            relocation_states=relocation_states,
            buckets=buckets,
            ccap_connections=ccap_connections,
            has_resume=has_resume,
            currently_working=currently_working,
            food_handlers=food_handlers,
            servsafe=servsafe,
            will_relocate=will_relocate,
            ready_to_work=ready_to_work,
            onboarding_step=onboarding_step,
            onboarding_complete=onboarding_complete
        )
        
        return query.count()
    
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