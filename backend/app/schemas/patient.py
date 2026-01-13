"""
MedTech AI Backend - Patient Schemas

Pydantic schemas for patient-related data.
"""

from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class EmergencyContactSchema(BaseModel):
    """Emergency contact information."""
    name: str = Field(..., max_length=255)
    phone: str = Field(..., max_length=20)
    relationship: str = Field(..., max_length=50)


class InsuranceInfoSchema(BaseModel):
    """Insurance information."""
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    valid_until: Optional[date] = None


class PatientBase(BaseModel):
    """Base patient schema."""
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_type: Optional[str] = Field(None, max_length=10)
    allergies: Optional[List[str]] = []
    chronic_conditions: Optional[List[str]] = []
    current_medications: Optional[List[str]] = []


class PatientCreate(PatientBase):
    """Schema for creating a patient profile."""
    user_id: str
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None


class PatientUpdate(BaseModel):
    """Schema for updating patient profile."""
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    insurance_info: Optional[InsuranceInfoSchema] = None


class PatientResponse(PatientBase):
    """Patient response schema."""
    id: str
    user_id: str
    age: Optional[int] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class PatientSummaryResponse(BaseModel):
    """Summarized patient information for listings."""
    id: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    has_allergies: bool = False
    
    model_config = {"from_attributes": True}
