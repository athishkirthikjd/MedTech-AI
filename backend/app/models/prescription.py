"""
MedTech AI Backend - Prescription Model

Digital prescriptions issued by doctors.
"""

import uuid
from datetime import date
from enum import Enum
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, Date, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.doctor import Doctor


class PrescriptionStatus(str, Enum):
    """Prescription status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class Prescription(Base, UUIDMixin, TimestampMixin):
    """
    Prescription model for medications issued by doctors.
    """
    
    __tablename__ = "prescriptions"
    
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
    
    # Optional link to appointment
    appointment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    # Prescription details
    diagnosis: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    # Medications stored as JSON array
    # Format: [{"name": "...", "dosage": "...", "frequency": "...", "duration": "...", "notes": "..."}, ...]
    medications: Mapped[List[dict]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    
    # Additional instructions
    instructions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Follow-up recommendation
    follow_up_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    
    follow_up_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Validity
    issue_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    
    expiry_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    
    # Status
    status: Mapped[PrescriptionStatus] = mapped_column(
        SQLEnum(PrescriptionStatus, name="prescription_status"),
        nullable=False,
        default=PrescriptionStatus.ACTIVE,
    )
    
    # Digital signature / verification
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    verification_code: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True,
        nullable=True,
    )
    
    # Relationships
    patient: Mapped["Patient"] = relationship(
        "Patient",
        back_populates="prescriptions",
        lazy="selectin",
    )
    
    doctor: Mapped["Doctor"] = relationship(
        "Doctor",
        back_populates="prescriptions",
        lazy="selectin",
    )
    
    def __repr__(self) -> str:
        return f"<Prescription(id={self.id}, patient_id={self.patient_id}, status={self.status})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if prescription has expired."""
        if not self.expiry_date:
            return False
        return date.today() > self.expiry_date
    
    @property
    def medication_count(self) -> int:
        """Get number of medications in prescription."""
        return len(self.medications) if self.medications else 0
