"""add_slug_column_to_products

Revision ID: 550cfbd6e89e
Revises: 1021170a7279
Create Date: 2026-08-15 11:39:07.679628

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '550cfbd6e89e'
down_revision: Union[str, Sequence[str], None] = '1021170a7279'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('products', sa.Column('slug', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_products_slug'), 'products', ['slug'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_products_slug'), table_name='products')
    op.drop_column('products', 'slug')