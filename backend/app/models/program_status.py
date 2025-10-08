from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class ProgramStatus(Base):
    __tablename__ = "program_statuses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    
    # Status Change
    old_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)
    
    # Admin Info
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Timestamp
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("StudentProfile", back_populates="program_status_history")
    admin = relationship("User", back_populates="program_status_changes")

