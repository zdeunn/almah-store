from __future__ import annotations
from typing import TYPE_CHECKING

from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal
from ..database import Base
from sqlalchemy import ForeignKey

if TYPE_CHECKING:
    from app.models.order_item import OrderItem
    from app.models.user import User

class Order(Base):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"),nullable=False)
    total_price: Mapped[Decimal] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(default='pending')
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    user: Mapped['User'] = relationship('User', back_populates='orders')
    items: Mapped[list['OrderItem']] = relationship('OrderItem', back_populates='order')