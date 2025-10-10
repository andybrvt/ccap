from fastapi import FastAPI
from app.routes import auth, students

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
    
    # Student management routes
    app.include_router(
        students.router,
        prefix="/api/students",
        tags=["Students"]
    )

