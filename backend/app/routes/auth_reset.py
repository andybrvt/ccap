# Password Reset Endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordResponse
)
from app.services.email_service import email_service
import asyncio
from datetime import datetime, timedelta
import secrets
import os

router = APIRouter()

# Frontend URL for password reset links
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://ccap-gold.vercel.app")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request password reset - sends email with reset link
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If that email exists, a password reset link has been sent."}
    
    # Generate secure random token
    token = secrets.token_urlsafe(32)
    
    # Create password reset token (expires in 15 minutes)
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=15),
        used=False
    )
    
    db.add(reset_token)
    db.commit()
    
    # Send email with reset link
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    
    subject = "Password Reset Request"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hello,</p>
        <p>You have requested to reset your password for your C-CAP account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>{reset_link}</p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>C-CAP Team</p>
    </body>
    </html>
    """
    
    # Send email asynchronously
    try:
        asyncio.run(email_service.send_email(
            to=[user.email],
            subject=subject,
            body=body,
            db_session=db
        ))
    except Exception as e:
        # Log error but don't fail the request
        print(f"Failed to send password reset email: {e}")
    
    return {"message": "If that email exists, a password reset link has been sent."}


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using token from email
    """
    # Find token
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token
    ).first()
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token is expired
    if reset_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one."
        )
    
    # Check if token already used
    if reset_token.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has already been used. Please request a new one."
        )
    
    # Get user
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    
    # Mark token as used
    reset_token.used = True
    
    db.commit()
    
    return {"message": "Password has been reset successfully."}

