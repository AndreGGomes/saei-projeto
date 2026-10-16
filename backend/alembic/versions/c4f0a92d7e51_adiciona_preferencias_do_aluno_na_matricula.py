"""adiciona_preferencias_do_aluno_na_matricula

Revision ID: c4f0a92d7e51
Revises: a08abb3821cb
Create Date: 2026-10-15 12:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4f0a92d7e51'
down_revision: Union[str, Sequence[str], None] = 'a08abb3821cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # server_default='' garante que as matrículas já existentes passem a ter a preferência vazia
    op.add_column(
        'matriculas',
        sa.Column('preferencias_do_aluno', sa.String(), nullable=False, server_default='')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('matriculas', 'preferencias_do_aluno')
