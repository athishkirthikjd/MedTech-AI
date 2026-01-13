"""
MedTech AI Backend - Emergency Model

Emergency events and SOS handling.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Float, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.patient import Patient


class EmergencyType(str, Enum):
    """Type of emergency."""
    SOS_BUTTON = "sos_button"
    AI_DETECTED = "ai_detected"
    VITALS_ALERT = "vitals_alert"
    MANUAL_REPORT = "manual_report"


class EmergencyStatus(str, Enum):
    """Status of emergency event."""
    TRIGGERED = "triggered"
    ACKNOWLEDGED = "acknowledged"
    RESPONDING = "responding"
    RESOLVED = "resolved"
    FALSE_ALARM = "false_alarm"


class EmergencySeverity(str, Enum):
    """Severity level of emergency."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class EmergencyEvent(Base, UUIDMixin, TimestampMixin):
    """
    Emergency event record.
    
    Tracks all emergency situations including AI-detected emergencies
    and manual SOS triggers.
    """
    
    __tablename__ = "emergency_events"
    
    # Patient reference
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Emergency details
    emergency_type: Mapped[EmergencyType] = mapped_column(
        SQLEnum(EmergencyType, name="emergency_type"),
        nullable=False,
    )
    
    severity: Mapped[EmergencySeverity] = mapped_column(
        SQLEnum(EmergencySeverity, name="emergency_severity"),
        nullable=False,
        default=EmergencySeverity.HIGH,
    )
    
    status: Mapped[EmergencyStatus] = mapped_column(
        SQLEnum(EmergencyStatus, name="emergency_status"),
        nullable=False,
        default=EmergencyStatus.TRIGGERED,
        index=True,
    )
    
    # Trigger information
    triggered_at: Mapped[datetime] = mapped_column(
        nullable=False,
        index=True,
    )
    
    trigger_source: Mapped[str] = mapped_column(
        String(50),  # 'app', 'ai', 'wearable', 'web'
        nullable=False,
    )
    
    # Description and context
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    symptoms_reported: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # AI analysis (if AI-detected)
    ai_analysis: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )
    
    # Location data
    latitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    
    longitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    
    location_address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Response tracking
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(
        nullable=True,
    )
    
    acknowledged_by: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        nullable=True,
    )
    
    resolved_by: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    
    resolution_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Emergency contacts notified
    contacts_notified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    notification_log: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )
    
    # Relationships
    patient: Mapped["Patient"] = relationship(
        "Patient",
        back_populates="emergency_events",
        lazy="selectin",
    )
    
    def __repr__(self) -> str:
        return f"<EmergencyEvent(id={self.id}, type={self.emergency_type}, status={self.status})>"
    
    @property
    def is_active(self) -> bool:
        """Check if emergency is still active."""
        return self.status in [
            EmergencyStatus.TRIGGERED,
            EmergencyStatus.ACKNOWLEDGED,
            EmergencyStatus.RESPONDING,
        ]
    
    @property
    def response_time_seconds(self) -> Optional[int]:
        """Calculate response time in seconds."""
        if self.acknowledged_at:
            delta = self.acknowledged_at - self.triggered_at
            return int(delta.total_seconds())
        return None
