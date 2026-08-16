from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal

class ProductImageResponse(BaseModel):
    id: int 
    image_url: str
    is_primary: bool
    display_order: int

    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    title: str
    description: str | None = None
    price: Decimal = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    image_url: str | None = None

class ProductCreate(ProductBase):
    cost_price: Decimal = Field(..., ge=0)
    slug: str | None = None  # 👈 اختياري: لو ما عطاهش الأدمن، نولدوه تلقائياً

class ProductUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: Decimal | None = Field(None, gt=0)
    stock: int | None = Field(None, ge=0)
    image_url: str | None = None
    cost_price: Decimal | None = Field(None, ge=0)
    is_active: bool | None = None
    slug: str | None = None  # 👈 يسمح للأدمن يبدل الـ slug يدوياً

class ProductResponse(ProductBase):
    id: int
    slug: str  # 👈 الحقل الجديد — هذا اللي غادي يستعملو الفرونت‌إند فالـ URL
    is_active: bool
    images: list[ProductImageResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ProductAdminResponse(ProductResponse):
    cost_price: Decimal
    is_active: bool