from pydantic import BaseModel
from typing import Optional

class FileUploadResponse(BaseModel):
    """Response schema for file upload"""
    file_url: str
    file_key: Optional[str] = None  # For private files, we store the key
    message: str

class SignedUrlRequest(BaseModel):
    """Request schema for generating signed URL"""
    file_key: str
    expiration: int = 3600  # Default 1 hour
