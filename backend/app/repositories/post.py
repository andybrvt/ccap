from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from uuid import UUID
from app.models.post import Post
from app.models.like import Like
from app.models.comment import Comment
from app.models.user import User
from app.repositories.base import BaseRepository


class PostRepository(BaseRepository[Post]):
    def __init__(self, db: Session):
        super().__init__(db, Post)

    def get_all_posts(self, limit: Optional[int] = None, offset: int = 0) -> List[Post]:
        """
        Get all posts (community feed)
        Everyone can view all posts
        """
        query = self.db.query(Post).order_by(Post.created_at.desc())
        
        if limit:
            query = query.limit(limit).offset(offset)
        
        return query.all()

    def get_posts_by_user(self, user_id: UUID, limit: Optional[int] = None, offset: int = 0) -> List[Post]:
        """
        Get all posts by a specific user
        Everyone can view any user's posts
        """
        query = self.db.query(Post).filter(
            Post.user_id == user_id
        ).order_by(Post.created_at.desc())
        
        if limit:
            query = query.limit(limit).offset(offset)
        
        return query.all()

    def create_post(self, user: User, image_url: str, caption: Optional[str] = None, 
                    featured_dish: Optional[str] = None) -> Post:
        """
        Create a new post
        Only students can create posts (for themselves)
        """
        if user.role != "student":
            raise PermissionError("Only students can create posts")
        
        # Create the post with the user's ID
        post = self.create(
            user_id=user.id,
            image_url=image_url,
            caption=caption,
            featured_dish=featured_dish
        )
        
        return post

    def update_post(self, post_id: UUID, user: User, **kwargs) -> Optional[Post]:
        """
        Update a post
        Only the post owner can update their own post
        """
        post = self.get_by_id(post_id)
        
        if not post:
            return None
        
        # Check if user is the owner
        if post.user_id != user.id:
            raise PermissionError("You can only edit your own posts")
        
        return self.update(post_id, **kwargs)

    def delete_post(self, post_id: UUID, user: User) -> bool:
        """
        Delete a post
        Only the post owner can delete their own post
        """
        post = self.get_by_id(post_id)
        
        if not post:
            return False
        
        # Check if user is the owner
        if post.user_id != user.id:
            raise PermissionError("You can only delete your own posts")
        
        return self.delete(post_id)

    def like_post(self, post_id: UUID, user: User) -> Like:
        """
        Like a post
        Everyone can like posts (creates a like record)
        """
        # Check if post exists
        post = self.get_by_id(post_id)
        if not post:
            raise ValueError("Post not found")
        
        # Check if user already liked this post
        existing_like = self.db.query(Like).filter(
            and_(Like.post_id == post_id, Like.user_id == user.id)
        ).first()
        
        if existing_like:
            raise ValueError("You already liked this post")
        
        # Create like
        like = Like(post_id=post_id, user_id=user.id)
        self.db.add(like)
        
        # Increment likes count
        post.likes_count += 1
        
        self.db.commit()
        self.db.refresh(like)
        return like

    def unlike_post(self, post_id: UUID, user: User) -> bool:
        """
        Unlike a post
        Everyone can unlike posts they've liked
        """
        # Check if post exists
        post = self.get_by_id(post_id)
        if not post:
            raise ValueError("Post not found")
        
        # Find the like
        like = self.db.query(Like).filter(
            and_(Like.post_id == post_id, Like.user_id == user.id)
        ).first()
        
        if not like:
            raise ValueError("You haven't liked this post")
        
        # Delete like
        self.db.delete(like)
        
        # Decrement likes count
        post.likes_count = max(0, post.likes_count - 1)
        
        self.db.commit()
        return True

    def check_if_liked(self, post_id: UUID, user: User) -> bool:
        """
        Check if a user has liked a post
        """
        like = self.db.query(Like).filter(
            and_(Like.post_id == post_id, Like.user_id == user.id)
        ).first()
        
        return like is not None

    def add_comment(self, post_id: UUID, user: User, content: str) -> Comment:
        """
        Add a comment to a post
        Only students can comment on posts
        """
        # Check if user is a student
        if user.role != "student":
            raise PermissionError("Only students can comment on posts")
        
        # Check if post exists
        post = self.get_by_id(post_id)
        if not post:
            raise ValueError("Post not found")
        
        # Create comment
        comment = Comment(
            post_id=post_id,
            user_id=user.id,
            content=content
        )
        self.db.add(comment)
        
        # Increment comments count
        post.comments_count += 1
        
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def get_comments_for_post(self, post_id: UUID) -> List[Comment]:
        """
        Get all comments for a post
        Everyone can view comments
        """
        return self.db.query(Comment).filter(
            Comment.post_id == post_id
        ).order_by(Comment.created_at.asc()).all()

    def delete_comment(self, comment_id: UUID, user: User) -> bool:
        """
        Delete a comment
        Only the comment owner can delete their own comment
        """
        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        
        if not comment:
            return False
        
        # Check if user is the owner
        if comment.user_id != user.id:
            raise PermissionError("You can only delete your own comments")
        
        # Get the post to decrement count
        post = self.get_by_id(comment.post_id)
        if post:
            post.comments_count = max(0, post.comments_count - 1)
        
        self.db.delete(comment)
        self.db.commit()
        return True

