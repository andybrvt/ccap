import boto3
import os
from datetime import timedelta
from uuid import uuid4
from typing import Optional
from fastapi import UploadFile

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_S3_REGION', 'us-west-2')
)

# Single bucket with public/private folders
BUCKET_NAME = os.getenv('AWS_S3_BUCKET_NAME', 'ccap-production-files')

class S3Service:
    @staticmethod
    async def upload_profile_picture(file: UploadFile, user_id: str) -> str:
        """
        Upload profile picture to PUBLIC folder in S3 bucket
        Returns: Public URL
        """
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        file_key = f"public/profile-pictures/{user_id}_{uuid4()}.{file_extension}"
        
        # Upload to S3 public folder
        s3_client.upload_fileobj(
            file.file,
            BUCKET_NAME,
            file_key,
            ExtraArgs={
                'ContentType': file.content_type or 'image/jpeg',
            }
        )
        
        # Return public URL
        return f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_key}"
    
    @staticmethod
    async def upload_private_document(file: UploadFile, user_id: str, doc_type: str) -> str:
        """
        Upload private document (resume, credentials) to PRIVATE folder in S3 bucket
        Returns: S3 key (not URL, we'll generate signed URLs on demand)
        """
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
        file_key = f"private/{doc_type}/{user_id}_{uuid4()}.{file_extension}"
        
        # Upload to private folder
        s3_client.upload_fileobj(
            file.file,
            BUCKET_NAME,
            file_key,
            ExtraArgs={
                'ContentType': file.content_type or 'application/pdf',
            }
        )
        
        return file_key
    
    @staticmethod
    def generate_signed_url(file_key: str, expiration: int = 3600) -> str:
        """
        Generate a signed URL for private documents
        Default expiration: 1 hour (3600 seconds)
        """
        if not file_key:
            return ""
        
        try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': BUCKET_NAME,
                    'Key': file_key
                },
                ExpiresIn=expiration
            )
            return url
        except Exception as e:
            print(f"Error generating signed URL: {e}")
            return ""
    
    @staticmethod
    def delete_file(file_key: str) -> bool:
        """
        Delete a file from S3
        """
        try:
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=file_key)
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
