import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config # <--- استيراد النسخة Async

from alembic import context
from app.models import Base

# هذا هو كائن إعدادات Alembic
config = context.config

# إعداد الـ Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# تحديد MetaData الخاصة بالنواة/الموديلز
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """تشغيل الهجرة في وضع الأوفلاين."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """دالة مساعدة لتطبيق الهجرة داخل الاتصال التزامني الممرر من Async."""
    context.configure(
        connection=connection, 
        target_metadata=target_metadata
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """إنشاء المحرك اللا متزامئ وتشغيل الهجرة."""
    # تعيين رابط الاتصال الخاص بك
    config.set_main_option(
        "sqlalchemy.url",
        "postgresql+asyncpg://postgresUser:mySecretPassword@localhost:5432/mydb"
    )

    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """تشغيل الهجرة في وضع أونلاين عبر asyncio."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()