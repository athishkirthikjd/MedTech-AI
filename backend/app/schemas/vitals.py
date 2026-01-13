"""
MedTech AI Backend - Vitals Schemas

Pydantic schemas for health vitals data.
"""

from datetime import datetime, date
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator

from app.models.vitals import VitalsSource


class VitalsBase(BaseModel):
    """Base vitals schema."""
    systolic_bp: Optional[int] = Field(None, ge=60, le=250)
    diastolic_bp: Optional[int] = Field(None, ge=40, le=150)
    heart_rate: Optional[int] = Field(None, ge=30, le=250)
    spo2: Optional[int] = Field(None, ge=70, le=100)
    temperature: Optional[float] = Field(None, ge=35.0, le=42.0)
    glucose: Optional[int] = Field(None, ge=20, le=600)
    respiratory_rate: Optional[int] = Field(None, ge=8, le=40)
    weight: Optional[float] = Field(None, ge=1.0, le=500.0)
    height: Optional[float] = Field(None, ge=30.0, le=300.0)
    notes: Optional[str] = None
    
    @field_validator("temperature")
    @classmethod
    def round_temperature(cls, v):
        """Round temperature to one decimal place."""
        if v is not None:
            return round(v, 1)
        return v


class VitalsCreate(VitalsBase):
    """Schema for creating a vitals record."""
    recorded_at: Optional[datetime] = None  # Defaults to now
    source: VitalsSource = VitalsSource.MANUAL
    device_name: Optional[str] = None
    additional_metrics: Optional[Dict[str, Any]] = None


class VitalsBatchCreate(BaseModel):
    """Schema for creating multiple vitals records (from wearable sync)."""
    records: List[VitalsCreate]
    device_name: str


class VitalsUpdate(BaseModel):
    """Schema for updating a vitals record."""
    systolic_bp: Optional[int] = Field(None, ge=60, le=250)
    diastolic_bp: Optional[int] = Field(None, ge=40, le=150)
    heart_rate: Optional[int] = Field(None, ge=30, le=250)
    spo2: Optional[int] = Field(None, ge=70, le=100)
    temperature: Optional[float] = Field(None, ge=35.0, le=42.0)
    glucose: Optional[int] = Field(None, ge=20, le=600)
    notes: Optional[str] = None


class VitalsResponse(VitalsBase):
    """Vitals record response schema."""
    id: str
    patient_id: str
    recorded_at: datetime
    source: VitalsSource
    device_name: Optional[str] = None
    additional_metrics: Optional[Dict[str, Any]] = None
    blood_pressure_string: Optional[str] = None
    bmi: Optional[float] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class VitalsHistoryQuery(BaseModel):
    """Query parameters for vitals history."""
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    source: Optional[VitalsSource] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class VitalsHistoryResponse(BaseModel):
    """Response with vitals history and pagination."""
    records: List[VitalsResponse]
    total_count: int
    page: int
    page_size: int
    has_more: bool


class VitalsSummary(BaseModel):
    """Summary statistics for vitals."""
    latest_record: Optional[VitalsResponse] = None
    avg_systolic_bp: Optional[float] = None
    avg_diastolic_bp: Optional[float] = None
    avg_heart_rate: Optional[float] = None
    avg_spo2: Optional[float] = None
    avg_glucose: Optional[float] = None
    total_records: int = 0
    date_range_start: Optional[datetime] = None
    date_range_end: Optional[datetime] = None


class VitalsAlert(BaseModel):
    """Alert for abnormal vitals."""
    metric: str
    value: float
    normal_range: str
    severity: str  # 'warning' or 'critical'
    message: str
