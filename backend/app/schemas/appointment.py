"""
MedTech AI Backend - Appointment Schemas

Pydantic schemas for appointment-related data.
"""

from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.appointment import AppointmentStatus, AppointmentType


class AppointmentBase(BaseModel):
    """Base appointment schema."""
    appointment_date: date
    appointment_time: time
    appointment_type: AppointmentType = AppointmentType.VIDEO
    duration_minutes: int = Field(30, ge=15, le=120)
    reason: Optional[str] = Field(None, max_length=500)
    symptoms: Optional[str] = None
    patient_notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    """Schema for creating an appointment."""
    doctor_id: str


class AppointmentUpdate(BaseModel):
    """Schema for updating an appointment."""
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    appointment_type: Optional[AppointmentType] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=120)
    patient_notes: Optional[str] = None


class AppointmentDoctorUpdate(BaseModel):
    """Schema for doctor to update appointment."""
    status: Optional[AppointmentStatus] = None
    doctor_notes: Optional[str] = None
    video_link: Optional[str] = None


class AppointmentCancelRequest(BaseModel):
    """Request to cancel an appointment."""
    reason: Optional[str] = Field(None, max_length=500)


class AppointmentResponse(AppointmentBase):
    """Appointment response schema."""
    id: str
    patient_id: str
    doctor_id: str
    status: AppointmentStatus
    video_link: Optional[str] = None
    doctor_notes: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Joined data
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    doctor_avatar: Optional[str] = None
    patient_name: Optional[str] = None
    
    model_config = {"from_attributes": True}


class AppointmentListResponse(BaseModel):
    """Summarized appointment for listings."""
    id: str
    appointment_date: date
    appointment_time: time
    appointment_type: AppointmentType
    status: AppointmentStatus
    reason: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    patient_name: Optional[str] = None
    is_upcoming: bool = False
    
    model_config = {"from_attributes": True}


class AppointmentQueryParams(BaseModel):
    """Query parameters for appointment listing."""
    status: Optional[AppointmentStatus] = None
    appointment_type: Optional[AppointmentType] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    doctor_id: Optional[str] = None
    patient_id: Optional[str] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=50)


class AvailableSlotsRequest(BaseModel):
    """Request available time slots for a doctor."""
    doctor_id: str
    date: date


class AvailableSlotsResponse(BaseModel):
    """Response with available time slots."""
    doctor_id: str
    date: date
    available_slots: list[str]  # List of times like ["09:00", "10:30"]
    booked_slots: list[str]
