from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID

# Base schema
class StudentProfileBase(BaseModel):
    first_name: str
    last_name: str
    preferred_name: Optional[str] = None
    email: Optional[str] = None  # For linking questionnaire to user account
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    
    # Address
    address: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    
    # Relocation
    willing_to_relocate: Optional[str] = None
    relocation_states: Optional[List[str]] = None
    
    # Education
    high_school: Optional[str] = None
    graduation_year: Optional[str] = None
    culinary_class_years: Optional[int] = None
    
    # Work Experience
    currently_employed: Optional[str] = None
    current_employer: Optional[str] = None
    current_position: Optional[str] = None
    current_hours_per_week: Optional[int] = None
    
    previous_employment: Optional[str] = None
    previous_employer: Optional[str] = None
    previous_position: Optional[str] = None
    previous_hours_per_week: Optional[int] = None
    
    # Availability & Work Preferences
    transportation: Optional[str] = None
    hours_per_week: Optional[int] = None
    availability: Optional[List[str]] = None
    weekend_availability: Optional[str] = None
    ready_to_work: Optional[str] = None
    available_date: Optional[str] = None
    
    # Documents
    has_resume: Optional[str] = None
    resume_url: Optional[str] = None
    has_food_handlers_card: Optional[str] = None
    food_handlers_card_url: Optional[str] = None
    has_servsafe: Optional[str] = None
    servsafe_certificate_url: Optional[str] = None
    
    # Interests/Tags
    interests: Optional[List[str]] = None
    
    # Program Status
    current_bucket: str = "Pre-Apprentice"

# Schema for creating student profile
class StudentProfileCreate(StudentProfileBase):
    user_id: UUID

# Schema for updating student profile
class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    preferred_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    
    # Address
    address: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    
    # Relocation
    willing_to_relocate: Optional[str] = None
    relocation_states: Optional[List[str]] = None
    
    # Education
    high_school: Optional[str] = None
    graduation_year: Optional[str] = None
    culinary_class_years: Optional[int] = None
    
    # Work Experience
    currently_employed: Optional[str] = None
    current_employer: Optional[str] = None
    current_position: Optional[str] = None
    current_hours_per_week: Optional[int] = None
    
    previous_employment: Optional[str] = None
    previous_employer: Optional[str] = None
    previous_position: Optional[str] = None
    previous_hours_per_week: Optional[int] = None
    
    # Availability & Work Preferences
    transportation: Optional[str] = None
    hours_per_week: Optional[int] = None
    availability: Optional[List[str]] = None
    weekend_availability: Optional[str] = None
    ready_to_work: Optional[str] = None
    available_date: Optional[str] = None
    
    # Documents
    has_resume: Optional[str] = None
    resume_url: Optional[str] = None
    has_food_handlers_card: Optional[str] = None
    food_handlers_card_url: Optional[str] = None
    has_servsafe: Optional[str] = None
    servsafe_certificate_url: Optional[str] = None
    
    # Interests/Tags
    interests: Optional[List[str]] = None
    
    # Program Status
    current_bucket: Optional[str] = None

# Schema for response
class StudentProfileResponse(StudentProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

