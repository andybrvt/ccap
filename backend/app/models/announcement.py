from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Content
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String, default="medium", nullable=False)  # "low", "medium", "high"
    category = Column(String, default="general", nullable=False)  # "general", "feature", "maintenance", etc.
    icon = Column(String, default="megaphone", nullable=False)  # Icon identifier for frontend
    
    # Target audience filtering
    target_audience = Column(String, default="all", nullable=False)  # "all", "bucket", "location"
    target_bucket = Column(String, nullable=True)  # Specific bucket if target_audience = "bucket"
    target_city = Column(String, nullable=True)  # Specific city if target_audience = "location"
    target_state = Column(String, nullable=True)  # Specific state if target_audience = "location"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="announcements")

