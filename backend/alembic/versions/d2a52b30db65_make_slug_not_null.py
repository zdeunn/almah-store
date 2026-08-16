"""make_slug_not_null

Revision ID: d2a52b30db65
Revises: 550cfbd6e89e
Create Date: 2026-08-15 12:00:16.237067

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2a52b30db65'
down_revision: Union[str, Sequence[str], None] = '550cfbd6e89e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('products', 'slug', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('products', 'slug', nullable=True)