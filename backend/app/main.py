from fastapi import FastAPI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from app.routes import router

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "CCAP"),
    description="CCAP Backend API",
    version="1.0.0"
)

# Include routes
app.include_router(router)


# # Start backend
# uvicorn app.main:app --reload --port 8001

# # Format code
# black .

# # Lint code
# ruff check .

# # Install dependencies
# pip install -r requirements.txt