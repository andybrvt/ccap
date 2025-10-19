from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.deps.auth import get_current_user
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.schemas.like import LikeResponse
from app.schemas.comment import CommentCreate, CommentResponse
from app.repositories.post import PostRepository
from app.utils.s3 import S3Service

router = APIRouter()


# Featured dishes list (hardcoded for now - can be moved to admin management later)
FEATURED_DISHES = [
    "Beef Wellington",
    "Coq au Vin",
    "Risotto Milanese",
    "Bouillabaisse",
    "Beef Bourguignon",
    "Ratatouille",
    "Paella",
    "Osso Buco",
    "Cassoulet",
    "Soufflé",
    "Croissants",
    "Macarons",
    "Crème Brûlée",
    "Tarte Tatin",
    "Chicken Cordon Bleu",
]


@router.get("/dishes", response_model=List[str])
def get_featured_dishes():
    """
    Get the list of featured dishes
    Public endpoint - no authentication required
    """
    return FEATURED_DISHES


@router.get("/", response_model=List[PostResponse])
def get_all_posts(
    limit: Optional[int] = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all posts (community feed)
    Students see only public posts from everyone (including NULL values), admins see all posts
    """
    repo = PostRepository(db)
    
    try:
        posts = repo.get_all_posts(limit=limit, offset=offset, user_role=current_user.role, current_user_id=current_user.id)
        return posts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching posts: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=List[PostResponse])
def get_user_posts(
    user_id: UUID,
    limit: Optional[int] = None,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all posts by a specific user
    Students see public posts + their own private posts from that user (including NULL values), admins see all posts
    """
    repo = PostRepository(db)
    
    try:
        posts = repo.get_posts_by_user(user_id, limit=limit, offset=offset, user_role=current_user.role, current_user_id=current_user.id)
        return posts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user posts: {str(e)}"
        )


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific post by ID
    Everyone can view any post
    """
    repo = PostRepository(db)
    
    post = repo.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return post


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    image: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    featured_dish: Optional[str] = Form(None),
    is_private: Optional[bool] = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new post with image upload
    Only students can create posts
    """
    repo = PostRepository(db)
    
    try:
        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Upload image to S3
        image_url = await S3Service.upload_post_image(image, str(current_user.id))
        
        # Create the post
        post = repo.create_post(
            current_user,
            image_url=image_url,
            caption=caption,
            featured_dish=featured_dish,
            is_private=is_private or False
        )
        
        return post
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating post: {str(e)}"
        )


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: UUID,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a post (caption and featured_dish only, not image)
    Only the post owner can update their post
    """
    repo = PostRepository(db)
    
    try:
        # Prepare update data
        update_data = post_data.model_dump(exclude_unset=True)
        
        updated_post = repo.update_post(post_id, current_user, **update_data)
        
        if not updated_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        return updated_post
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating post: {str(e)}"
        )


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a post
    Only the post owner can delete their post
    Also deletes the associated image from S3
    """
    repo = PostRepository(db)
    s3_service = S3Service()
    
    try:
        # First, get the post to extract the image URL
        post = repo.get_by_id(post_id)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Check permission (will raise PermissionError if not owner)
        if post.user_id != current_user.id:
            raise PermissionError("You can only delete your own posts")
        
        # Extract S3 key from image URL
        # URL format: https://bucket-name.s3.amazonaws.com/public/post-images/file.jpg
        # We need: public/post-images/file.jpg
        if post.image_url:
            try:
                # Split by .com/ to get the key
                s3_key = post.image_url.split('.com/')[-1] if '.com/' in post.image_url else None
                
                if s3_key:
                    # Delete from S3
                    s3_service.delete_file(s3_key)
            except Exception as e:
                # Log but don't fail the deletion if S3 cleanup fails
                print(f"Warning: Failed to delete S3 image for post {post_id}: {str(e)}")
        
        # Delete the post from database
        success = repo.delete_post(post_id, current_user)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        return None
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting post: {str(e)}"
        )


# ============= LIKES =============

@router.post("/{post_id}/like", response_model=LikeResponse, status_code=status.HTTP_201_CREATED)
def like_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Like a post
    Everyone can like posts
    """
    repo = PostRepository(db)
    
    try:
        like = repo.like_post(post_id, current_user)
        return like
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error liking post: {str(e)}"
        )


@router.delete("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def unlike_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unlike a post
    Everyone can unlike posts they've liked
    """
    repo = PostRepository(db)
    
    try:
        success = repo.unlike_post(post_id, current_user)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Like not found"
            )
        
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error unliking post: {str(e)}"
        )


@router.get("/{post_id}/liked", response_model=bool)
def check_if_liked(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if current user has liked a post
    """
    repo = PostRepository(db)
    
    try:
        is_liked = repo.check_if_liked(post_id, current_user)
        return is_liked
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking like status: {str(e)}"
        )


# ============= COMMENTS =============

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_post_comments(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all comments for a post
    Everyone can view comments
    """
    repo = PostRepository(db)
    
    try:
        comments = repo.get_comments_for_post(post_id)
        return comments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching comments: {str(e)}"
        )


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: UUID,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a comment to a post
    Only students can comment on posts
    """
    repo = PostRepository(db)
    
    try:
        comment = repo.add_comment(
            post_id,
            current_user,
            comment_data.content
        )
        return comment
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding comment: {str(e)}"
        )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a comment
    Only the comment owner can delete their own comment
    """
    repo = PostRepository(db)
    
    try:
        success = repo.delete_comment(comment_id, current_user)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        return None
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting comment: {str(e)}"
        )

