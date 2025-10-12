import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.core.routers import setup_routers
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "CCAP"),
    description="CCAP Backend API",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development (Vite)
        "http://localhost:3000",
        "http://localhost:5174", # Alternative local port
        "https://ccap-gold.vercel.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup all API routes
setup_routers(app)


# # Start backend
# uvicorn app.main:app --reload --port 8001

# # Format code
# black .

# # Lint code
# ruff check .

# # Install dependencies
# pip install -r requirements.txt