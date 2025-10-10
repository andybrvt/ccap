from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Type, TypeVar, Generic
from uuid import UUID
from app.models.user import User
from app.core.security import get_password_hash

T = TypeVar('T')  # Generic type for any model

class BaseRepository(Generic[T]):
    def __init__(self, db: Session, model_class: Type[T]):
        self.db = db
        self.model_class = model_class

    def get_by_id(self, item_id: UUID) -> Optional[T]:
        """Get item by ID"""
        return self.db.query(self.model_class).filter(self.model_class.id == item_id).first()

    def get_all(self) -> List[T]:
        """Get all items"""
        return self.db.query(self.model_class).all()

    def create(self, **kwargs) -> T:
        """Create new item"""
        item = self.model_class(**kwargs)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item_id: UUID, **kwargs) -> Optional[T]:
        """Update item by ID"""
        item = self.get_by_id(item_id)
        if not item:
            return None
            
        for field, value in kwargs.items():
            if hasattr(item, field):
                setattr(item, field, value)
                
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item_id: UUID) -> bool:
        """Delete item by ID"""
        item = self.get_by_id(item_id)
        if not item:
            return False
            
        self.db.delete(item)
        self.db.commit()
        return True

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()

    def get_all_students(self) -> List[User]:
        """Get all users with role 'student'"""
        return self.db.query(User).filter(User.role == "student").all()

    def get_all_admins(self) -> List[User]:
        """Get all users with role 'admin'"""
        return self.db.query(User).filter(User.role == "admin").all()

    def create_user(self, email: str, username: str, password: str, role: str = "student") -> User:
        """Create a new user with hashed password"""
        hashed_password = get_password_hash(password)
        return self.create(
            email=email,
            username=username,
            hashed_password=hashed_password,
            role=role
        )

    # Permission-based methods
    def get_students_for_admin(self, admin_user: User) -> List[User]:
        """Get all students - only admins can access this"""
        if admin_user.role != "admin":
            raise PermissionError("Only admins can access all students")
        return self.get_all_students()

    def get_student_by_id_for_admin(self, student_id: UUID, admin_user: User) -> Optional[User]:
        """Get specific student - only admins can access any student"""
        if admin_user.role != "admin":
            raise PermissionError("Only admins can access student data")
        return self.db.query(User).filter(
            and_(User.id == student_id, User.role == "student")
        ).first()

    def get_own_profile(self, user_id: UUID, requesting_user: User) -> Optional[User]:
        """Get user's own profile - users can only access their own data"""
        if requesting_user.id != user_id and requesting_user.role != "admin":
            raise PermissionError("Users can only access their own profile")
        return self.get_by_id(user_id)
