from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func, String

from decimal import Decimal
from datetime import datetime

from app.models.product_image import ProductImage
from ..database import Base

if TYPE_CHECKING:
    from app.models.order_item import OrderItem

class Product(Base):
    __tablename__ = 'products'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    cost_price: Mapped[Decimal] = mapped_column(nullable=False)
    price: Mapped[Decimal] = mapped_column(nullable=False)
    image_url: Mapped[str] = mapped_column(nullable=False)
    stock: Mapped[int] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    is_active: Mapped[bool] = mapped_column(default=True)

    order_items: Mapped[list['OrderItem']] = relationship(back_populates='product')

    images: Mapped[list['ProductImage']] = relationship(back_populates='product', cascade='all, delete-orphan', lazy='selectin')