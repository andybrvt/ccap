from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_password_hash
from app.deps.auth import require_admin
from app.models.user import User, UserRole
from app.schemas.user import AdminCreate, AdminResponse, AdminWithPassword
from app.utils.password_generator import generate_temporary_password

router = APIRouter()


@router.get("/admins", response_model=List[AdminResponse])
def get_all_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get list of all admin users.
    Only accessible by admins.
    """
    admins = db.query(User).filter(User.role == UserRole.ADMIN.value).all()
    return admins


@router.post("/admins", response_model=AdminWithPassword, status_code=status.HTTP_201_CREATED)
def create_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new admin user.
    Only accessible by admins.
    
    Returns the admin details along with a temporary password (shown only once).
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == admin_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate temporary password
    temp_password = generate_temporary_password()
    
    # Create username from email
    username = admin_data.email.split('@')[0]
    
    # Ensure username is unique
    base_username = username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1
    
    # Hash the password
    hashed_password = get_password_hash(temp_password)
    
    # Create new admin user
    new_admin = User(
        email=admin_data.email,
        username=username,
        hashed_password=hashed_password,
        role=UserRole.ADMIN.value,
        is_active=True
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    # Return admin with temporary password (only time it's shown!)
    return AdminWithPassword(
        id=new_admin.id,
        email=new_admin.email,
        username=new_admin.username,
        created_at=new_admin.created_at,
        temporary_password=temp_password
    )


@router.post("/admins/{admin_id}/reset-password", response_model=AdminWithPassword)
def reset_admin_password(
    admin_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Reset an admin's password.
    Only accessible by admins.
    
    Generates a new temporary password and returns it (shown only once).
    """
    # Find the admin
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == UserRole.ADMIN.value
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Generate new temporary password
    temp_password = generate_temporary_password()
    
    # Hash and update password
    admin.hashed_password = get_password_hash(temp_password)
    
    db.commit()
    db.refresh(admin)
    
    # Return admin with new temporary password (only time it's shown!)
    return AdminWithPassword(
        id=admin.id,
        email=admin.email,
        username=admin.username,
        created_at=admin.created_at,
        temporary_password=temp_password
    )

