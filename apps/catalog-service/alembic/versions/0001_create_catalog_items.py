"""create catalog items"""

from alembic import op
import sqlalchemy as sa

revision = "0001_create_catalog_items"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("CREATE SCHEMA IF NOT EXISTS catalog"))
    op.create_table(
        "catalog_items",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("supplier", sa.String(length=120), nullable=False),
        sa.Column("manufacturer", sa.String(length=120), nullable=False),
        sa.Column("model", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("lead_time_days", sa.Integer(), nullable=False),
        sa.Column("price_usd", sa.Numeric(12, 2), nullable=False),
        sa.Column("in_stock", sa.Boolean(), nullable=False),
        sa.Column("specs", sa.JSON(), nullable=False),
        sa.Column("compatible_with", sa.JSON(), nullable=False, server_default="[]"),
        schema="catalog",
    )
    op.create_index("ix_catalog_items_name", "catalog_items", ["name"], schema="catalog")
    op.create_index("ix_catalog_items_category", "catalog_items", ["category"], schema="catalog")
    op.create_index("ix_catalog_items_supplier", "catalog_items", ["supplier"], schema="catalog")
    op.create_index("ix_catalog_items_model", "catalog_items", ["model"], schema="catalog")
    op.create_index("ix_catalog_items_in_stock", "catalog_items", ["in_stock"], schema="catalog")


def downgrade() -> None:
    op.drop_table("catalog_items", schema="catalog")
    op.execute(sa.text("DROP SCHEMA IF EXISTS catalog"))

