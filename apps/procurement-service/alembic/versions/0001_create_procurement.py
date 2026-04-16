"""create procurement tables"""

from alembic import op
import sqlalchemy as sa

revision = "0001_create_procurement"
down_revision = None
branch_labels = None
depends_on = None

status_enum = sa.Enum("Draft", "Submitted", "Approved", "Rejected", "Fulfilled", name="po_status")


def upgrade() -> None:
    op.execute(sa.text("CREATE SCHEMA IF NOT EXISTS procurement"))
    status_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "purchase_orders",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("po_number", sa.String(length=32), unique=True),
        sa.Column("supplier", sa.String(length=120)),
        sa.Column("status", status_enum, nullable=False, server_default="Draft"),
        sa.Column("requestor", sa.String(length=120), nullable=False, server_default="Alex Morgan"),
        sa.Column("cost_center", sa.String(length=40), nullable=False, server_default="CC-1234"),
        sa.Column("needed_by", sa.Date()),
        sa.Column("payment_terms", sa.String(length=60), nullable=False, server_default="Net 30"),
        sa.Column("submitted_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("id", "supplier", name="uq_purchase_orders_id_supplier"),
        schema="procurement",
    )
    op.create_table(
        "purchase_order_lines",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("purchase_order_id", sa.String(length=36), nullable=False),
        sa.Column("item_id", sa.String(length=64), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("supplier", sa.String(length=120), nullable=False),
        sa.Column("item_snapshot", sa.JSON(), nullable=False),
        sa.Column("price_usd_snapshot", sa.Numeric(12, 2)),
        sa.Column("lead_time_days_snapshot", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_purchase_order_lines_quantity_positive"),
        sa.UniqueConstraint("purchase_order_id", "item_id", name="uq_purchase_order_lines_po_item"),
        sa.ForeignKeyConstraint(["purchase_order_id"], ["procurement.purchase_orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["purchase_order_id", "supplier"],
            ["procurement.purchase_orders.id", "procurement.purchase_orders.supplier"],
            name="fk_lines_match_po_supplier",
        ),
        schema="procurement",
    )
    op.create_table(
        "status_history",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("purchase_order_id", sa.String(length=36), nullable=False),
        sa.Column("status", status_enum, nullable=False),
        sa.Column("actor", sa.String(length=120), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["purchase_order_id"], ["procurement.purchase_orders.id"], ondelete="CASCADE"),
        schema="procurement",
    )
    op.create_table(
        "idempotency_keys",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("key", sa.String(length=160), nullable=False),
        sa.Column("scope", sa.String(length=160), nullable=False),
        sa.Column("response", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("key", "scope", name="uq_idempotency_key_scope"),
        schema="procurement",
    )
    op.create_index("ix_purchase_orders_status", "purchase_orders", ["status"], schema="procurement")
    op.create_index("ix_purchase_orders_po_number", "purchase_orders", ["po_number"], schema="procurement")
    op.create_index("ix_status_history_po", "status_history", ["purchase_order_id"], schema="procurement")


def downgrade() -> None:
    op.drop_table("idempotency_keys", schema="procurement")
    op.drop_table("status_history", schema="procurement")
    op.drop_table("purchase_order_lines", schema="procurement")
    op.drop_table("purchase_orders", schema="procurement")
    status_enum.drop(op.get_bind(), checkfirst=True)
    op.execute(sa.text("DROP SCHEMA IF EXISTS procurement"))

