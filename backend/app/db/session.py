"""
MedTech AI Backend - Database Session Management

Async SQLAlchemy session factory and engine configuration.
"""

import logging
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global engine and session factory (lazy initialized)
_async_engine: Optional[AsyncEngine] = None
_async_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


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


def get_engine() -> AsyncEngine:
    """Get or create the async engine."""
    global _async_engine
    if _async_engine is None:
        _async_engine = create_engine()
    return _async_engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Get or create the session factory."""
    global _async_session_factory
    if _async_session_factory is None:
        _async_session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _async_session_factory


# Aliases for backward compatibility
@property
def async_engine() -> AsyncEngine:
    return get_engine()


@property
def async_session_factory() -> async_sessionmaker[AsyncSession]:
    return get_session_factory()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async generator that yields database sessions.
    
    Usage:
        async with get_session() as session:
            result = await session.execute(...)
    """
    factory = get_session_factory()
    async with factory() as session:
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
    
    engine = get_engine()
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables initialized")


async def close_db() -> None:
    """Close database connections on shutdown."""
    global _async_engine
    if _async_engine is not None:
        await _async_engine.dispose()
        _async_engine = None
    logger.info("Database connections closed")
