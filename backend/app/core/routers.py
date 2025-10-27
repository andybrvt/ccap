from fastapi import FastAPI
from app.routes import auth, students, announcements, posts, admin, email_notifications, test_email, email_logs, auth_reset

def setup_routers(app: FastAPI):
    """
    Central place to register all API routers
    """
    # Authentication routes
    app.include_router(
        auth.router,
        prefix="/api/auth",
        tags=["Authentication"]
    )
    
    # Password reset routes
    app.include_router(
        auth_reset.router,
        prefix="/api/auth",
        tags=["Password Reset"]
    )
    
    # Student management routes
    app.include_router(
        students.router,
        prefix="/api/students",
        tags=["Students"]
    )
    
    # Announcement routes
    app.include_router(
        announcements.router,
        prefix="/api/announcements",
        tags=["Announcements"]
    )
    
    # Post routes
    app.include_router(
        posts.router,
        prefix="/api/posts",
        tags=["Posts"]
    )
    
    # Admin management routes
    app.include_router(
        admin.router,
        prefix="/api/admin",
        tags=["Admin Management"]
    )
    
    # Email notification routes
    app.include_router(
        email_notifications.router,
        prefix="/api/admin/email-notifications",
        tags=["Email Notifications"]
    )
    
    # Test email route (for development)
    app.include_router(
        test_email.router,
        prefix="/api/admin",
        tags=["Email Testing"]
    )
    
    # Email logs route
    app.include_router(
        email_logs.router,
        prefix="/api/admin",
        tags=["Email Logs"]
    )

