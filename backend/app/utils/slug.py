# app/utils/slug.py
import re
import unicodedata
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.product import Product


def generate_slug(title: str) -> str:
    text = unicodedata.normalize('NFKD', title)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^\w\s\u0600-\u06FF-]', '', text, flags=re.UNICODE)
    text = re.sub(r'\s+', '-', text.strip())
    return text.lower()


async def generate_unique_slug(title: str, db: AsyncSession, exclude_id: int | None = None) -> str:
    """يولد slug فريد، ويتأكد ما كاينش تكرار فقاعدة البيانات."""
    base_slug = generate_slug(title)
    slug = base_slug
    counter = 2

    while True:
        query = select(Product).where(Product.slug == slug)
        if exclude_id is not None:
            query = query.where(Product.id != exclude_id)

        result = await db.execute(query)
        if result.scalar_one_or_none() is None:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1