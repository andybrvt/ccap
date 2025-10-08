from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
import uuid
from app.core.database import Base

class CertificationType(str, PyEnum):
    """Types of certifications"""
    FOOD_HANDLER = "food_handler"
    SERVSAFE = "servsafe"
    RESUME = "resume"
    OTHER = "other"

class CertificationStatus(str, PyEnum):
    """Status of certification approval"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    
    # Certification Info
    certification_type = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    status = Column(String, default=CertificationStatus.PENDING.value, nullable=False)
    
    # Review Info
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_notes = Column(String, nullable=True)
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship("StudentProfile", back_populates="certifications")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

