"""
MedTech AI Backend - Doctor Model

Doctor profile with specialization and availability.
"""

import uuid
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.appointment import Appointment
    from app.models.prescription import Prescription


class Doctor(Base, UUIDMixin, TimestampMixin):
    """
    Doctor profile with professional information.
    
    Contains specialization, experience, availability, and ratings.
    """
    
    __tablename__ = "doctors"
    
    # Link to user account
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    
    # Professional information
    specialty: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    
    department: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    
    license_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )
    
    qualifications: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        default=list,
    )
    
    years_of_experience: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    
    # Hospital/Clinic information
    hospital_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    
    hospital_address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Consultation details
    consultation_fee: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    
    video_consultation_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    in_clinic_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    # Languages spoken
    languages: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        default=list,
    )
    
    # About/Bio
    bio: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Ratings and reviews
    rating: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    
    total_reviews: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    
    total_patients: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    
    # Availability schedule (stored as JSON)
    # Format: {"monday": {"available": true, "slots": ["09:00", "10:00", ...]}, ...}
    availability_schedule: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )
    
    # Verification status
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="doctor_profile",
        lazy="selectin",
    )
    
    appointments: Mapped[List["Appointment"]] = relationship(
        "Appointment",
        back_populates="doctor",
        lazy="selectin",
    )
    
    prescriptions: Mapped[List["Prescription"]] = relationship(
        "Prescription",
        back_populates="doctor",
        lazy="selectin",
    )
    
    def __repr__(self) -> str:
        return f"<Doctor(id={self.id}, specialty={self.specialty})>"
