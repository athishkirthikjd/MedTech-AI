"""
MedTech AI Backend - User Model

Base user model linked to Supabase Auth.
"""

import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Boolean, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.core.security import UserRole

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.doctor import Doctor


class User(Base, UUIDMixin, TimestampMixin):
    """
    User model representing all system users.
    
    Linked to Supabase Auth via the ID field.
    The ID should match the Supabase user UUID.
    """
    
    __tablename__ = "users"
    
    # Supabase Auth ID (matches auth.users.id in Supabase)
    supabase_uid: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    
    # Basic user information
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )
    
    avatar_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Role and status
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.PATIENT,
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    # Last activity tracking
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        nullable=True,
    )
    
    # Relationships
    patient_profile: Mapped[Optional["Patient"]] = relationship(
        "Patient",
        back_populates="user",
        uselist=False,
        lazy="selectin",
    )
    
    doctor_profile: Mapped[Optional["Doctor"]] = relationship(
        "Doctor",
        back_populates="user",
        uselist=False,
        lazy="selectin",
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
