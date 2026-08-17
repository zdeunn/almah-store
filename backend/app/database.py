import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

load_dotenv()  # take environment variables from .env file
# URL to connect with database (from .env file) + the URL formula
DATABASE_URL = os.getenv(
    "DATABASE_URL"
)

# the engine manage the connect with databse, echo=True for print the query and run them in terminal
engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    connect_args={"prepared_statement_cache_size": 0} 
    )

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
