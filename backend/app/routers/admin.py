from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..dependencies import get_current_admin
from ..schemas.product import ProductAdminResponse, ProductCreate, ProductUpdate
from ..models.product import Product

from ..models.order import Order
from ..models.order_item import OrderItem
from ..schemas.order import OrderResponse, OrderStatus, OrderUpdate
from ..utils.slug import generate_unique_slug  

from sqlalchemy.future import select



router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)]
)

@router.post(
    "/products",
    response_model=ProductAdminResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    product_dict = product_data.model_dump()

    if not product_dict.get('slug'):
        product_dict['slug'] = await generate_unique_slug(product_dict['title'], db)

    new_product = Product(**product_dict)

    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)

    return new_product
@router.get(
    "/products",
    response_model=List[ProductAdminResponse],
    status_code=status.HTTP_200_OK,
)
async def get_products(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    include_inactive: bool = False
):
    query = select(Product)

    if not include_inactive:
        query = query.where(Product.is_active == True)
    
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()

    return products

@router.get(
    "/products/{product_id}",
    response_model=ProductAdminResponse,
    status_code=status.HTTP_200_OK,
)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"product with id {product_id} not found",
        )
    
    return product

@router.put(
    "/products/{product_id}",
    response_model=ProductAdminResponse,
    status_code=status.HTTP_200_OK,
)
async def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"product with id {product_id} not found",
        )
    
    for field, value in product_data.model_dump().items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)

    return product

@router.patch(
    "/products/{product_id}",
    response_model=ProductAdminResponse,
    status_code=status.HTTP_200_OK,
)
async def partial_update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)  # حماية Endpoint
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    
    # استخراج الحقول المرسلة فقط في الطلب
    updated_fields = product_data.model_dump(exclude_unset=True)

    for field, value in updated_fields.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)

    return product

@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"product with id {product_id} not found"
        )
    
    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="product is already deleted"
        )
    
    product.is_active = False

    await db.commit()

    return None


from sqlalchemy.orm import selectinload

@router.get("/orders", response_model=List[OrderResponse])
async def get_admin_orders(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
):
    query = (
        select(Order)
        .options(
            selectinload(Order.user),  # 👈 جلب بيانات الزبون عبر user_id
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    orders = result.scalars().all()
    return orders

@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
        )
    )

    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id {order_id} not found"
        )
    
    return order

@router.patch(
    "/orders/{order_id}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
)
async def update_order_status(
    order_id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
        )
    )
    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id {order_id} not found"
        )
    
    if order.status in (OrderStatus.cancelled, OrderStatus.delivered):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"cannot update order with status '{order.status}'" 
        )
    
    updated_fields = order_data.model_dump(exclude_unset=True)

    for field, value in updated_fields.items():
        setattr(order, field, value)

    await db.commit()
    await db.refresh(order)

    return order

