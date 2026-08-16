import os
from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# URL to connect with database (from .env file) + the URL formula
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgresUser:mySecretPassword@localhost:5432/mydb",
)

# the engine manage the connect with databse, echo=True for print the query and run them in terminal
engine = create_async_engine(DATABASE_URL, echo=True)

# creating sessioons when we want to
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# all models have inherit from this class
class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
