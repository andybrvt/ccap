from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.deps.auth import require_admin, get_current_active_user
from app.models.user import User
from app.repositories.student import StudentRepository
from app.schemas.user import UserCreate, UserResponse
from app.schemas.student_profile import StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse
from app.models.student_profile import StudentProfile
from app.utils.s3 import S3Service

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_all_students(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Get all students - Admin only"""
    student_repo = StudentRepository(db)
    try:
        students = student_repo.get_all_students(admin_user)
        return students
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access all students"
        )

@router.get("/{student_id}", response_model=UserResponse)
def get_student_by_id(
    student_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Get a specific student by ID - Admin only"""
    student_repo = StudentRepository(db)
    try:
        student = student_repo.get_student_by_id(student_id, admin_user)
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        return student
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access student data"
        )

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    user_data: UserCreate,
    profile_data: StudentProfileCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Create a new student with profile - Admin only"""
    student_repo = StudentRepository(db)
    
    # Check if email already exists
    existing_user = student_repo.get_student_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Set role to student
    user_data.role = "student"
    
    try:
        new_student = student_repo.create_student_with_profile(user_data, profile_data)
        return new_student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create student: {str(e)}"
        )

@router.get("/me/profile", response_model=StudentProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current student's full profile"""
    # Only students can access their profile via this endpoint
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    # Get the student's full profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return profile

@router.put("/me/profile", response_model=StudentProfileResponse)
def update_my_profile(
    profile_data: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current student's own profile"""
    # Only students can update their profile via this endpoint
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    
    student_repo = StudentRepository(db)
    
    # Update the student's own profile
    updated_profile = student_repo.update_student_profile(current_user.id, profile_data)
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return updated_profile

@router.put("/{student_id}/profile", response_model=StudentProfileResponse)
def update_student_profile(
    student_id: UUID,
    profile_data: StudentProfileUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Update a student's profile - Admin only"""
    student_repo = StudentRepository(db)
    
    # Check if student exists
    student = student_repo.get_student_by_id(student_id, admin_user)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    updated_profile = student_repo.update_student_profile(student_id, profile_data)
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return updated_profile

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Delete a student - Admin only"""
    student_repo = StudentRepository(db)
    
    success = student_repo.delete_student(student_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return None


# File Upload Endpoints

@router.post("/profile/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload profile picture (public)"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can upload profile pictures"
        )
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        # Upload to S3
        public_url = await S3Service.upload_profile_picture(file, str(current_user.id))
        
        # Update profile in database
        student_repo = StudentRepository(db)
        success = student_repo.update_profile_picture(current_user.id, public_url)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile picture"
            )
        
        return {"url": public_url, "message": "Profile picture uploaded successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile picture: {str(e)}"
        )


@router.post("/profile/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload resume (private)"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can upload resumes"
        )
    
    # Validate file type
    allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if not file.content_type or file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF or Word document"
        )
    
    try:
        # Upload to S3 private folder
        s3_key = await S3Service.upload_private_document(file, str(current_user.id), "resumes")
        
        # Update profile in database
        student_repo = StudentRepository(db)
        success = student_repo.update_resume_url(current_user.id, s3_key)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update resume"
            )
        
        return {"message": "Resume uploaded successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload resume: {str(e)}"
        )


@router.post("/profile/credential")
async def upload_credential(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload credential (food handlers card, etc.) - private"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can upload credentials"
        )
    
    # Validate file type
    allowed_types = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'image/jpg'
    ]
    if not file.content_type or file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF or image (JPEG/PNG)"
        )
    
    try:
        # Upload to S3 private folder
        s3_key = await S3Service.upload_private_document(file, str(current_user.id), "credentials")
        
        # Update profile in database
        student_repo = StudentRepository(db)
        success = student_repo.update_food_handlers_url(current_user.id, s3_key)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update credential"
            )
        
        return {"message": "Credential uploaded successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload credential: {str(e)}"
        )


@router.get("/profile/resume")
async def get_resume_url(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get signed URL for resume download"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access resumes"
        )
    
    student_repo = StudentRepository(db)
    profile = student_repo.get_profile_by_user_id(current_user.id)
    
    if not profile or not profile.resume_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found"
        )
    
    # Generate signed URL (expires in 1 hour)
    signed_url = S3Service.generate_signed_url(profile.resume_url)
    
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download link"
        )
    
    return {"download_url": signed_url}


@router.get("/profile/credential")
async def get_credential_url(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get signed URL for credential download"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access credentials"
        )
    
    student_repo = StudentRepository(db)
    profile = student_repo.get_profile_by_user_id(current_user.id)
    
    if not profile or not profile.food_handlers_card_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No credential found"
        )
    
    # Generate signed URL (expires in 1 hour)
    signed_url = S3Service.generate_signed_url(profile.food_handlers_card_url)
    
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download link"
        )
    
    return {"download_url": signed_url}
