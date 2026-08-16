from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from decimal import Decimal
from app.schemas.order_item import OrderItemCreate, OrderItemResponse
from enum import Enum
from datetime import datetime

from app.schemas.user import UserResponse

class OrderStatus(str, Enum):
    pending = 'pending'
    paid = 'paid'
    shipped = 'shipped'
    delivered = 'delivered'
    cancelled = 'cancelled'

class OrderBase(BaseModel):
    total_price: Decimal = Field(..., gt=0)
    status: OrderStatus = OrderStatus.pending

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderUpdate(BaseModel):
    status: OrderStatus | None = None

class OrderResponse(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    items: List[OrderItemResponse] = []
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)