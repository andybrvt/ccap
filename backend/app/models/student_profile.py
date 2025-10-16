from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Personal Info
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    preferred_name = Column(String, nullable=True)
    email = Column(String, nullable=True)  # For linking questionnaire to user account
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)  # Store as string for now
    
    # Address
    address = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    
    # Relocation
    willing_to_relocate = Column(String, nullable=True)  # "Yes", "No"
    relocation_states = Column(ARRAY(String), nullable=True)  # Array of state codes
    
    # Education
    high_school = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)
    culinary_class_years = Column(Integer, nullable=True)
    ccap_connection = Column(String, nullable=True)  # How student is connected to CCAP
    
    # Work Experience
    currently_employed = Column(String, nullable=True)  # "Yes", "No"
    current_employer = Column(String, nullable=True)
    current_position = Column(String, nullable=True)
    current_hours_per_week = Column(Integer, nullable=True)
    
    previous_employment = Column(String, nullable=True)  # "Yes", "No"
    previous_employer = Column(String, nullable=True)
    previous_position = Column(String, nullable=True)
    previous_hours_per_week = Column(Integer, nullable=True)
    
    # Availability & Work Preferences
    transportation = Column(String, nullable=True)
    hours_per_week = Column(Integer, nullable=True)
    availability = Column(ARRAY(String), nullable=True)  # Array of time slots
    weekend_availability = Column(String, nullable=True)  # "Yes", "No"
    ready_to_work = Column(String, nullable=True)  # "Yes", "No"
    available_date = Column(String, nullable=True)
    
    # Documents
    has_resume = Column(String, nullable=True)  # "Yes", "No"
    resume_url = Column(String, nullable=True)
    has_food_handlers_card = Column(String, nullable=True)  # "Yes", "No", "In Progress"
    food_handlers_card_url = Column(String, nullable=True)
    has_servsafe = Column(String, nullable=True)  # "Yes", "No", "Expired", "In Progress"
    servsafe_certificate_url = Column(String, nullable=True)
    
    # Interests/Tags (THE IMPORTANT PART!)
    interests = Column(ARRAY(String), nullable=True)  # Array of culinary interests
    
    # Program Status
    current_bucket = Column(String, default="Pre-Apprentice", nullable=False)
    
    # Onboarding Status
    # 0 = onboarding complete
    # 1-6 = current step in onboarding process
    onboarding_step = Column(Integer, default=1, server_default='0', nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")
    program_status_history = relationship("ProgramStatus", back_populates="student", cascade="all, delete-orphan")

