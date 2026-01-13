"""
MedTech AI Backend - Appointment Model

Appointment scheduling and management.
"""

import uuid
from datetime import datetime, date, time
from enum import Enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Date, Time, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.doctor import Doctor


class AppointmentStatus(str, Enum):
    """Appointment status enum."""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class AppointmentType(str, Enum):
    """Type of appointment."""
    VIDEO = "video"
    IN_PERSON = "in_person"
    PHONE = "phone"


class Appointment(Base, UUIDMixin, TimestampMixin):
    """
    Appointment model for scheduling patient-doctor consultations.
    """
    
    __tablename__ = "appointments"
    
    # Patient and doctor references
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Scheduling
    appointment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )
    
    appointment_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )
    
    duration_minutes: Mapped[int] = mapped_column(
        default=30,
        nullable=False,
    )
    
    # Appointment details
    appointment_type: Mapped[AppointmentType] = mapped_column(
        SQLEnum(AppointmentType, name="appointment_type"),
        nullable=False,
        default=AppointmentType.VIDEO,
    )
    
    status: Mapped[AppointmentStatus] = mapped_column(
        SQLEnum(AppointmentStatus, name="appointment_status"),
        nullable=False,
        default=AppointmentStatus.SCHEDULED,
        index=True,
    )
    
    # Reason and notes
    reason: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )
    
    symptoms: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    patient_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    doctor_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Video consultation link (if applicable)
    video_link: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )
    
    # Cancellation
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(
        nullable=True,
    )
    
    cancellation_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    cancelled_by: Mapped[Optional[str]] = mapped_column(
        String(50),  # 'patient', 'doctor', or 'system'
        nullable=True,
    )
    
    # Completion
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        nullable=True,
    )
    
    # Relationships
    patient: Mapped["Patient"] = relationship(
        "Patient",
        back_populates="appointments",
        lazy="selectin",
    )
    
    doctor: Mapped["Doctor"] = relationship(
        "Doctor",
        back_populates="appointments",
        lazy="selectin",
    )
    
    def __repr__(self) -> str:
        return f"<Appointment(id={self.id}, date={self.appointment_date}, status={self.status})>"
    
    @property
    def is_upcoming(self) -> bool:
        """Check if appointment is in the future."""
        now = datetime.now()
        apt_datetime = datetime.combine(self.appointment_date, self.appointment_time)
        return apt_datetime > now and self.status in [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED,
        ]
    
    @property
    def can_be_cancelled(self) -> bool:
        """Check if appointment can still be cancelled."""
        return self.status in [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED,
        ]
