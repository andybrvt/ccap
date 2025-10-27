from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load .env.local only in local development (not in production)
# Railway sets DATABASE_URL, so if it's not set, we're in local dev
if not os.getenv("RAILWAY_ENVIRONMENT"):
    load_dotenv(".env.local")  # Local development with test database

# Always load .env as fallback
load_dotenv(".env")

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ccap.db")

# Log which database is being used (safe - only shows hostname)
if "railway" in DATABASE_URL or "localhost" in DATABASE_URL:
    print(f"[DEBUG] Using database: {DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else DATABASE_URL}")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
