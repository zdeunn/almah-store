from pydantic import BaseModel, ConfigDict, Field, computed_field
from decimal import Decimal

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class ProductMini(BaseModel):
    id: int
    title: str
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

class OrderItemResponse(BaseModel):
    id: int 
    order_id: int
    product: ProductMini
    quantity: int
    price_at_purchase: Decimal
    product_id: int

    model_config = ConfigDict(from_attributes=True)

class OrderItemAdminResponse(OrderItemResponse):
    cost_at_purchase: Decimal
    
    @computed_field
    @property
    def profit(self) -> Decimal:
        return (self.price_at_purchase - self.cost_at_purchase) * self.quantity