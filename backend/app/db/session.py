"""
MedTech AI Backend - Database Session Management

Async SQLAlchemy session factory and engine configuration.
"""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = logging.getLogger(__name__)


def create_engine() -> AsyncEngine:
    """
    Create async SQLAlchemy engine with production-ready settings.
    
    Returns:
        AsyncEngine configured for the application
    """
    # Use NullPool for async to prevent connection issues
    # In production, consider using connection pooling with PgBouncer
    engine = create_async_engine(
        settings.database_url,
        echo=settings.debug,  # Log SQL in debug mode
        poolclass=NullPool if settings.is_development else None,
        pool_pre_ping=True,  # Check connection health
        pool_recycle=3600,  # Recycle connections after 1 hour
    )
    
    logger.info(f"Database engine created for {settings.environment} environment")
    return engine


# Create the async engine
async_engine = create_engine()

# Create async session factory
async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async generator that yields database sessions.
    
    Usage:
        async with get_session() as session:
            result = await session.execute(...)
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables.
    
    Note: In production, use Alembic migrations instead.
    """
    from app.db.base import Base
    
    async with async_engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables initialized")


async def close_db() -> None:
    """Close database connections on shutdown."""
    await async_engine.dispose()
    logger.info("Database connections closed")
