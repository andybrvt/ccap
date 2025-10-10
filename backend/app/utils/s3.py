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
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

# Bucket names
PUBLIC_BUCKET = os.getenv('AWS_S3_PUBLIC_BUCKET', 'ccap-public')
PRIVATE_BUCKET = os.getenv('AWS_S3_PRIVATE_BUCKET', 'ccap-private')

class S3Service:
    @staticmethod
    async def upload_profile_picture(file: UploadFile, user_id: str) -> str:
        """
        Upload profile picture to PUBLIC S3 bucket
        Returns: Public URL
        """
        file_extension = file.filename.split('.')[-1]
        file_key = f"profile-pictures/{user_id}/{uuid4()}.{file_extension}"
        
        # Upload to S3
        s3_client.upload_fileobj(
            file.file,
            PUBLIC_BUCKET,
            file_key,
            ExtraArgs={
                'ContentType': file.content_type,
                'ACL': 'public-read'  # Make publicly accessible
            }
        )
        
        # Return public URL
        return f"https://{PUBLIC_BUCKET}.s3.amazonaws.com/{file_key}"
    
    @staticmethod
    async def upload_private_document(file: UploadFile, user_id: str, doc_type: str) -> str:
        """
        Upload private document (resume, food handlers card) to PRIVATE S3 bucket
        Returns: S3 key (not URL, we'll generate signed URLs on demand)
        """
        file_extension = file.filename.split('.')[-1]
        file_key = f"{doc_type}/{user_id}/{uuid4()}.{file_extension}"
        
        # Upload to private S3
        s3_client.upload_fileobj(
            file.file,
            PRIVATE_BUCKET,
            file_key,
            ExtraArgs={
                'ContentType': file.content_type,
                'ServerSideEncryption': 'AES256'  # Encrypt at rest
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
                    'Bucket': PRIVATE_BUCKET,
                    'Key': file_key
                },
                ExpiresIn=expiration
            )
            return url
        except Exception as e:
            print(f"Error generating signed URL: {e}")
            return ""
    
    @staticmethod
    def delete_file(file_key: str, is_public: bool = False) -> bool:
        """
        Delete a file from S3
        """
        try:
            bucket = PUBLIC_BUCKET if is_public else PRIVATE_BUCKET
            s3_client.delete_object(Bucket=bucket, Key=file_key)
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
