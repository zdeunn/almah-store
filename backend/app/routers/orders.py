from fastapi import APIRouter, status, Depends, HTTPException
from ..schemas.order import OrderResponse, OrderCreate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.product import Product
from ..dependencies import get_current_user
from ..models.order import Order
from ..models.order_item import OrderItem
from sqlalchemy.orm import selectinload
from typing import List
from ..schemas.order import OrderStatus

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_price = 0 
    order_items = []

    for item in order_data.items:
        result = await db.execute(
            select(Product)
            .where(Product.id == item.product_id, Product.is_active == True)
        )
        product = result.scalar_one_or_none()

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"product with id {item.product_id} not found",
            )
        
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"insufficient stock for product '{product.title}'"
                       f"(available: {product.stock}, requested: {item.quantity})"
            )
        
        total_price += product.price * item.quantity

        order_items.append(OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=product.price,
            cost_at_purchase=product.cost_price,
        )
        )

        product.stock -= item.quantity

    new_order = Order(
        user_id=current_user.id,
        total_price=total_price,
        items=order_items,
    )

    db.add(new_order)
    await db.commit()
    
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
            )
        .where(Order.id == new_order.id)
    )
    new_order = result.scalar_one()

    return new_order
    
@router.get(
    "",
    response_model=List[OrderResponse],
    status_code=status.HTTP_200_OK,
)
async def get_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
):
    result = await db.execute(
        select(Order)
        .where(Order.user_id == current_user.id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .offset(skip)
        .limit(limit)
    )
    orders = result.scalars().all()

    return orders

@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
)
async def get_order(
    order_id: int,
    db:AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == current_user.id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
        )
    )
    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id {order_id} not found",
        )
    
    return order

@router.patch(
    "/{order_id}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
)
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == current_user.id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
        )
    )
    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id {order_id} not found",
        )
    
    if order.status != OrderStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"cannot cancel order with status '{order.status}'" 
        )
    
    for item in order.items:
        result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = result.scalar_one_or_none()
        if product is not None:
            product.stock += item.quantity

    order.status = OrderStatus.cancelled

    await db.commit()
    await db.refresh(order)

    return order