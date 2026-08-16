# scripts/backfill_slugs.py
import asyncio
import sys
import os
from sqlalchemy import select
from app.database import AsyncSessionLocal  
from app.models.product import Product
from app.utils.slug import generate_slug

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

async def backfill_slugs():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Product).where(Product.slug.is_(None)))
        products = result.scalars().all()
        print(f"عدد المنتجات بدون slug: {len(products)}")

        if not products:
            print("✅ كل المنتجات عندها slug أصلاً، ماكاين والو نديرو")
            return

        existing_result = await db.execute(select(Product.slug).where(Product.slug.is_not(None)))
        existing_slugs = {s for (s,) in existing_result.all()}

        for product in products:
            base_slug = generate_slug(product.title)
            slug = base_slug
            counter = 2
            while slug in existing_slugs:
                slug = f"{base_slug}-{counter}"
                counter += 1
            product.slug = slug
            existing_slugs.add(slug)
            print(f"  #{product.id}: '{product.title}' → '{slug}'")

        await db.commit()
        print("✅ تم تعمير كل الـ slugs بنجاح")


if __name__ == "__main__":
    asyncio.run(backfill_slugs())