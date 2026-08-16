import os
import shutil

from fastapi import APIRouter, Query, status, Depends, HTTPException, UploadFile, File
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..schemas.product import ProductImageResponse, ProductResponse
from ..database import get_db
from ..models.product import Product
from ..models.product_image import ProductImage

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

UPLOAD_DIR = "static/images/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get(
    "",
    response_model=List[ProductResponse],
    status_code=status.HTTP_200_OK,
)
async def get_products(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    include_inactive: bool = Query(False, description="تضمين المنتجات غير النشطة/المخفية"),
):
    query = select(Product).offset(skip).limit(limit)
    if not include_inactive:
        query = query.where(Product.is_active == True)
    result = await db.execute(query)
    products = result.scalars().all()
    return products


# 👇 الجديد: لازم يكون قبل /{product_id} (تنظيم أفضل، حتى لو ماشي إجباري تقنياً هنا)
@router.get(
    "/slug/{slug}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
)
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product)
        .where(Product.slug == slug, Product.is_active == True)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"product with slug '{slug}' not found"
        )

    return product


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id, Product.is_active == True)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"product with id {product_id} not found"
        )
    
    return product


@router.post(                          
    "/{product_id}/images",
    response_model=List[ProductImageResponse],
    status_code=status.HTTP_201_CREATED
)
async def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).options(selectinload(Product.images)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")

    uploaded_images = []
    for index, file in enumerate(files):
        filename = f"{product_id}_{index}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        is_primary = True if (index == 0 and len(product.images) == 0) else False
        db_image = ProductImage(
            product_id=product_id,
            image_url=f"/{file_path}".replace("\\", "/"),
            is_primary=is_primary,
            display_order=len(product.images) + index
        )
        db.add(db_image)
        uploaded_images.append(db_image)

    await db.commit()
    for img in uploaded_images:
        await db.refresh(img)

    return uploaded_images