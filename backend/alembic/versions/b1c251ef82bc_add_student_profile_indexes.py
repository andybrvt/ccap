"""add_student_profile_indexes

Revision ID: b1c251ef82bc
Revises: c904b743e204
Create Date: 2025-11-25 01:04:37.939278

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c251ef82bc'
down_revision: Union[str, Sequence[str], None] = 'c904b743e204'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create indexes on student_profiles table for filtering and sorting
    op.create_index('ix_student_profiles_current_bucket', 'student_profiles', ['current_bucket'])
    op.create_index('ix_student_profiles_graduation_year', 'student_profiles', ['graduation_year'])
    op.create_index('ix_student_profiles_state', 'student_profiles', ['state'])
    op.create_index('ix_student_profiles_ccap_connection', 'student_profiles', ['ccap_connection'])
    op.create_index('ix_student_profiles_created_at', 'student_profiles', ['created_at'])
    op.create_index('ix_student_profiles_has_resume', 'student_profiles', ['has_resume'])
    op.create_index('ix_student_profiles_onboarding_step', 'student_profiles', ['onboarding_step'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes in reverse order
    op.drop_index('ix_student_profiles_onboarding_step', table_name='student_profiles')
    op.drop_index('ix_student_profiles_has_resume', table_name='student_profiles')
    op.drop_index('ix_student_profiles_created_at', table_name='student_profiles')
    op.drop_index('ix_student_profiles_ccap_connection', table_name='student_profiles')
    op.drop_index('ix_student_profiles_state', table_name='student_profiles')
    op.drop_index('ix_student_profiles_graduation_year', table_name='student_profiles')
    op.drop_index('ix_student_profiles_current_bucket', table_name='student_profiles')
