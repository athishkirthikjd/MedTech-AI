"""
MedTech AI Backend - Vitals Model

Health vitals tracking and history.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Float, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.patient import Patient


class VitalsSource(str, Enum):
    """Source of vitals data."""
    MANUAL = "manual"
    WEARABLE = "wearable"
    CLINIC = "clinic"
    HOME_DEVICE = "home_device"


class VitalsRecord(Base, UUIDMixin, TimestampMixin):
    """
    Vitals record for patient health metrics.
    """
    
    __tablename__ = "vitals_records"
    
    # Patient reference
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Timestamp of measurement
    recorded_at: Mapped[datetime] = mapped_column(
        nullable=False,
        index=True,
    )
    
    # Source of data
    source: Mapped[VitalsSource] = mapped_column(
        SQLEnum(VitalsSource, name="vitals_source"),
        nullable=False,
        default=VitalsSource.MANUAL,
    )
    
    device_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    
    # Blood Pressure
    systolic_bp: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    diastolic_bp: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    # Heart Rate
    heart_rate: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    # Blood Oxygen (SpO2)
    spo2: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    # Temperature (in Celsius)
    temperature: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    
    # Blood Glucose (mg/dL)
    glucose: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    # Respiratory Rate
    respiratory_rate: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    # Weight (kg)
    weight: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    
    # Height (cm) - usually static but can be tracked
    height: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    
    # Additional metrics (stored as JSON)
    additional_metrics: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Relationships
    patient: Mapped["Patient"] = relationship(
        "Patient",
        back_populates="vitals_records",
        lazy="selectin",
    )
    
    def __repr__(self) -> str:
        return f"<VitalsRecord(id={self.id}, patient_id={self.patient_id}, recorded_at={self.recorded_at})>"
    
    @property
    def blood_pressure_string(self) -> Optional[str]:
        """Get blood pressure as string."""
        if self.systolic_bp and self.diastolic_bp:
            return f"{self.systolic_bp}/{self.diastolic_bp}"
        return None
    
    @property
    def bmi(self) -> Optional[float]:
        """Calculate BMI if weight and height are available."""
        if self.weight and self.height:
            height_m = self.height / 100
            return round(self.weight / (height_m ** 2), 1)
        return None
