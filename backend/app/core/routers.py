from fastapi import FastAPI
from app.routes import auth

def setup_routers(app: FastAPI):
    """
    Central place to register all API routers
    """
    # Authentication routes
    app.include_router(
        auth.router,
        prefix="/api",
        tags=["Authentication"]
    )
    
    # Add more routers here as you build them:
    # app.include_router(
    #     users.router,
    #     prefix="/api",
    #     tags=["Users"]
    # )
    
    # app.include_router(
    #     portfolios.router,
    #     prefix="/api",
    #     tags=["Portfolios"]
    # )

