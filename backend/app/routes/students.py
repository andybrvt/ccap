from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.deps.auth import require_admin
from app.models.user import User
from app.repositories.student import StudentRepository
from app.schemas.user import UserCreate, UserResponse
from app.schemas.student_profile import StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse

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
    student = student_repo.get_student_by_id(student_id)
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
