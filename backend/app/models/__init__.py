# Import all models to ensure they're registered with SQLAlchemy
from .user import User, UserRole
from .student_profile import StudentProfile
from .post import Post
from .comment import Comment
from .like import Like
from .announcement import Announcement
from .program_status import ProgramStatus
from .certification import Certification

# Make models available for imports
__all__ = [
    "User",
    "UserRole", 
    "StudentProfile",
    "Post",
    "Comment",
    "Like",
    "Announcement",
    "ProgramStatus",
    "Certification",
]
