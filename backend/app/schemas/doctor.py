"""
MedTech AI Backend - Doctor Schemas

Pydantic schemas for doctor-related data.
"""

from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class TimeSlotSchema(BaseModel):
    """Time slot for availability."""
    start: str = Field(..., pattern=r"^\d{2}:\d{2}$")  # HH:MM format
    end: str = Field(..., pattern=r"^\d{2}:\d{2}$")


class DayAvailabilitySchema(BaseModel):
    """Availability for a single day."""
    available: bool = True
    slots: List[str] = []  # List of time slots like ["09:00", "10:00"]


class WeeklyScheduleSchema(BaseModel):
    """Weekly availability schedule."""
    monday: Optional[DayAvailabilitySchema] = None
    tuesday: Optional[DayAvailabilitySchema] = None
    wednesday: Optional[DayAvailabilitySchema] = None
    thursday: Optional[DayAvailabilitySchema] = None
    friday: Optional[DayAvailabilitySchema] = None
    saturday: Optional[DayAvailabilitySchema] = None
    sunday: Optional[DayAvailabilitySchema] = None


class DoctorBase(BaseModel):
    """Base doctor schema."""
    specialty: str = Field(..., max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    years_of_experience: int = Field(0, ge=0)
    consultation_fee: float = Field(0.0, ge=0)
    video_consultation_available: bool = True
    in_clinic_available: bool = True
    languages: List[str] = []
    bio: Optional[str] = None


class DoctorCreate(DoctorBase):
    """Schema for creating a doctor profile."""
    user_id: str
    license_number: str = Field(..., max_length=50)
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    qualifications: List[str] = []


class DoctorUpdate(BaseModel):
    """Schema for updating doctor profile."""
    specialty: Optional[str] = None
    department: Optional[str] = None
    years_of_experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    video_consultation_available: Optional[bool] = None
    in_clinic_available: Optional[bool] = None
    languages: Optional[List[str]] = None
    bio: Optional[str] = None
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    qualifications: Optional[List[str]] = None
    availability_schedule: Optional[Dict] = None


class DoctorResponse(DoctorBase):
    """Doctor response schema."""
    id: str
    user_id: str
    license_number: str
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    qualifications: List[str] = []
    rating: float = 0.0
    total_reviews: int = 0
    total_patients: int = 0
    is_verified: bool = False
    availability_schedule: Optional[Dict] = None
    created_at: datetime
    updated_at: datetime
    
    # Joined from user
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    
    model_config = {"from_attributes": True}


class DoctorListResponse(BaseModel):
    """Doctor listing for search results."""
    id: str
    full_name: str
    specialty: str
    hospital_name: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    years_of_experience: int = 0
    consultation_fee: float = 0.0
    video_consultation_available: bool = True
    avatar_url: Optional[str] = None
    next_available_slot: Optional[str] = None
    
    model_config = {"from_attributes": True}


class DoctorSearchQuery(BaseModel):
    """Query parameters for doctor search."""
    specialty: Optional[str] = None
    department: Optional[str] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_fee: Optional[float] = Field(None, ge=0)
    video_available: Optional[bool] = None
    language: Optional[str] = None
    search: Optional[str] = None  # General search term
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=50)
