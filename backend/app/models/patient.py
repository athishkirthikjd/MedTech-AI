"""
MedTech AI Backend - Patient Model

Patient profile with medical information.
"""

import uuid
from datetime import date
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, Date, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.appointment import Appointment
    from app.models.prescription import Prescription
    from app.models.vitals import VitalsRecord
    from app.models.emergency import EmergencyEvent


class Patient(Base, UUIDMixin, TimestampMixin):
    """
    Patient profile with medical information.
    
    Contains health data, emergency contacts, and medical history.
    """
    
    __tablename__ = "patients"
    
    # Link to user account
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    
    # Personal information
    date_of_birth: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    
    gender: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )
    
    blood_type: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
    )
    
    # Medical information
    allergies: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        default=list,
    )
    
    chronic_conditions: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        default=list,
    )
    
    current_medications: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        default=list,
    )
    
    # Emergency contact
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )
    
    emergency_contact_relationship: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    
    # Address
    address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    city: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    
    state: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    
    zip_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )
    
    # Insurance information (stored as JSON)
    insurance_info: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )
    
    # Medical notes (for doctors)
    medical_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="patient_profile",
        lazy="selectin",
    )
    
    appointments: Mapped[List["Appointment"]] = relationship(
        "Appointment",
        back_populates="patient",
        lazy="selectin",
    )
    
    prescriptions: Mapped[List["Prescription"]] = relationship(
        "Prescription",
        back_populates="patient",
        lazy="selectin",
    )
    
    vitals_records: Mapped[List["VitalsRecord"]] = relationship(
        "VitalsRecord",
        back_populates="patient",
        lazy="selectin",
        order_by="desc(VitalsRecord.recorded_at)",
    )
    
    emergency_events: Mapped[List["EmergencyEvent"]] = relationship(
        "EmergencyEvent",
        back_populates="patient",
        lazy="selectin",
    )
    
    def __repr__(self) -> str:
        return f"<Patient(id={self.id}, user_id={self.user_id})>"
    
    @property
    def age(self) -> Optional[int]:
        """Calculate patient age from date of birth."""
        if not self.date_of_birth:
            return None
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
