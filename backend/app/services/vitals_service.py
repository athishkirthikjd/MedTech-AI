"""
MedTech AI Backend - Vitals Service

Health vitals tracking and analysis service.
"""

import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vitals import VitalsRecord, VitalsSource
from app.schemas.vitals import (
    VitalsCreate,
    VitalsUpdate,
    VitalsResponse,
    VitalsHistoryQuery,
    VitalsHistoryResponse,
    VitalsSummary,
    VitalsAlert,
)

logger = logging.getLogger(__name__)


# Normal ranges for vitals (simplified)
VITAL_RANGES = {
    "systolic_bp": {"low": 90, "high": 140, "critical_low": 70, "critical_high": 180},
    "diastolic_bp": {"low": 60, "high": 90, "critical_low": 40, "critical_high": 120},
    "heart_rate": {"low": 60, "high": 100, "critical_low": 40, "critical_high": 150},
    "spo2": {"low": 95, "high": 100, "critical_low": 90, "critical_high": 100},
    "temperature": {"low": 36.1, "high": 37.2, "critical_low": 35.0, "critical_high": 39.5},
    "glucose": {"low": 70, "high": 140, "critical_low": 50, "critical_high": 400},
}


class VitalsService:
    """
    Health vitals management service.
    
    Handles:
    - Recording and updating vitals
    - Historical data retrieval
    - Trend analysis
    - Alert generation
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.logger = logging.getLogger(f"{__name__}.VitalsService")
    
    async def get_vitals_by_id(self, vitals_id: UUID) -> Optional[VitalsRecord]:
        """Get vitals record by ID."""
        result = await self.db.execute(
            select(VitalsRecord).where(VitalsRecord.id == vitals_id)
        )
        return result.scalar_one_or_none()
    
    async def get_latest_vitals(self, patient_id: UUID) -> Optional[VitalsRecord]:
        """Get most recent vitals for a patient."""
        result = await self.db.execute(
            select(VitalsRecord)
            .where(VitalsRecord.patient_id == patient_id)
            .order_by(VitalsRecord.recorded_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_vitals_history(
        self,
        patient_id: UUID,
        query: VitalsHistoryQuery,
    ) -> VitalsHistoryResponse:
        """
        Get vitals history with filtering and pagination.
        
        Args:
            patient_id: Patient ID
            query: Query parameters
            
        Returns:
            VitalsHistoryResponse with records and summary
        """
        # Build query
        stmt = select(VitalsRecord).where(
            VitalsRecord.patient_id == patient_id
        )
        
        if query.from_date:
            stmt = stmt.where(VitalsRecord.recorded_at >= datetime.combine(query.from_date, datetime.min.time()))
        if query.to_date:
            stmt = stmt.where(VitalsRecord.recorded_at <= datetime.combine(query.to_date, datetime.max.time()))
        
        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar()
        
        # Apply pagination
        stmt = stmt.order_by(VitalsRecord.recorded_at.desc())
        stmt = stmt.offset(query.offset).limit(query.limit)
        
        result = await self.db.execute(stmt)
        records = list(result.scalars().all())
        
        # Generate summary if requested
        summary = None
        if query.include_summary:
            summary = await self._generate_summary(patient_id, query.from_date, query.to_date)
        
        return VitalsHistoryResponse(
            records=[VitalsResponse.model_validate(r) for r in records],
            total=total,
            summary=summary,
        )
    
    async def create_vitals(
        self,
        patient_id: UUID,
        data: VitalsCreate,
    ) -> VitalsRecord:
        """
        Record new vitals.
        
        Args:
            patient_id: Patient ID
            data: Vitals data
            
        Returns:
            Created VitalsRecord
        """
        vitals = VitalsRecord(
            patient_id=patient_id,
            systolic_bp=data.systolic_bp,
            diastolic_bp=data.diastolic_bp,
            heart_rate=data.heart_rate,
            spo2=data.spo2,
            temperature=data.temperature,
            glucose=data.glucose,
            weight=data.weight,
            height=data.height,
            respiratory_rate=data.respiratory_rate,
            notes=data.notes,
            source=VitalsSource(data.source) if data.source else VitalsSource.MANUAL,
            device_id=data.device_id,
            recorded_at=data.recorded_at or datetime.utcnow(),
        )
        
        self.db.add(vitals)
        await self.db.commit()
        await self.db.refresh(vitals)
        
        # Check for alerts
        alerts = self._check_vital_alerts(vitals)
        if alerts:
            self.logger.warning(f"Vitals alerts for patient {patient_id}: {[a.message for a in alerts]}")
        
        return vitals
    
    async def update_vitals(
        self,
        vitals: VitalsRecord,
        data: VitalsUpdate,
    ) -> VitalsRecord:
        """Update a vitals record."""
        update_data = data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(vitals, field, value)
        
        await self.db.commit()
        await self.db.refresh(vitals)
        
        return vitals
    
    async def delete_vitals(self, vitals: VitalsRecord) -> None:
        """Delete a vitals record."""
        await self.db.delete(vitals)
        await self.db.commit()
    
    def _check_vital_alerts(self, vitals: VitalsRecord) -> List[VitalsAlert]:
        """Check vitals for concerning values."""
        alerts = []
        
        # Check blood pressure
        if vitals.systolic_bp:
            ranges = VITAL_RANGES["systolic_bp"]
            if vitals.systolic_bp >= ranges["critical_high"]:
                alerts.append(VitalsAlert(
                    vital_name="Systolic Blood Pressure",
                    value=vitals.systolic_bp,
                    severity="critical",
                    message=f"Critical: Systolic BP {vitals.systolic_bp} mmHg is dangerously high",
                ))
            elif vitals.systolic_bp <= ranges["critical_low"]:
                alerts.append(VitalsAlert(
                    vital_name="Systolic Blood Pressure",
                    value=vitals.systolic_bp,
                    severity="critical",
                    message=f"Critical: Systolic BP {vitals.systolic_bp} mmHg is dangerously low",
                ))
            elif vitals.systolic_bp > ranges["high"]:
                alerts.append(VitalsAlert(
                    vital_name="Systolic Blood Pressure",
                    value=vitals.systolic_bp,
                    severity="warning",
                    message=f"Warning: Systolic BP {vitals.systolic_bp} mmHg is elevated",
                ))
        
        # Check heart rate
        if vitals.heart_rate:
            ranges = VITAL_RANGES["heart_rate"]
            if vitals.heart_rate >= ranges["critical_high"]:
                alerts.append(VitalsAlert(
                    vital_name="Heart Rate",
                    value=vitals.heart_rate,
                    severity="critical",
                    message=f"Critical: Heart rate {vitals.heart_rate} bpm is dangerously high",
                ))
            elif vitals.heart_rate <= ranges["critical_low"]:
                alerts.append(VitalsAlert(
                    vital_name="Heart Rate",
                    value=vitals.heart_rate,
                    severity="critical",
                    message=f"Critical: Heart rate {vitals.heart_rate} bpm is dangerously low",
                ))
        
        # Check SpO2
        if vitals.spo2:
            ranges = VITAL_RANGES["spo2"]
            if vitals.spo2 <= ranges["critical_low"]:
                alerts.append(VitalsAlert(
                    vital_name="Oxygen Saturation",
                    value=vitals.spo2,
                    severity="critical",
                    message=f"Critical: SpO2 {vitals.spo2}% indicates severe hypoxia",
                ))
            elif vitals.spo2 < ranges["low"]:
                alerts.append(VitalsAlert(
                    vital_name="Oxygen Saturation",
                    value=vitals.spo2,
                    severity="warning",
                    message=f"Warning: SpO2 {vitals.spo2}% is below normal",
                ))
        
        # Check temperature
        if vitals.temperature:
            ranges = VITAL_RANGES["temperature"]
            if vitals.temperature >= ranges["critical_high"]:
                alerts.append(VitalsAlert(
                    vital_name="Temperature",
                    value=vitals.temperature,
                    severity="critical",
                    message=f"Critical: Temperature {vitals.temperature}°C indicates high fever",
                ))
            elif vitals.temperature > ranges["high"]:
                alerts.append(VitalsAlert(
                    vital_name="Temperature",
                    value=vitals.temperature,
                    severity="warning",
                    message=f"Warning: Temperature {vitals.temperature}°C is elevated",
                ))
        
        # Check glucose
        if vitals.glucose:
            ranges = VITAL_RANGES["glucose"]
            if vitals.glucose >= ranges["critical_high"]:
                alerts.append(VitalsAlert(
                    vital_name="Blood Glucose",
                    value=vitals.glucose,
                    severity="critical",
                    message=f"Critical: Glucose {vitals.glucose} mg/dL is dangerously high",
                ))
            elif vitals.glucose <= ranges["critical_low"]:
                alerts.append(VitalsAlert(
                    vital_name="Blood Glucose",
                    value=vitals.glucose,
                    severity="critical",
                    message=f"Critical: Glucose {vitals.glucose} mg/dL indicates severe hypoglycemia",
                ))
        
        return alerts
    
    async def _generate_summary(
        self,
        patient_id: UUID,
        from_date: Optional[date],
        to_date: Optional[date],
    ) -> VitalsSummary:
        """Generate summary statistics for vitals."""
        stmt = select(VitalsRecord).where(
            VitalsRecord.patient_id == patient_id
        )
        
        if from_date:
            stmt = stmt.where(VitalsRecord.recorded_at >= datetime.combine(from_date, datetime.min.time()))
        if to_date:
            stmt = stmt.where(VitalsRecord.recorded_at <= datetime.combine(to_date, datetime.max.time()))
        
        result = await self.db.execute(stmt)
        records = list(result.scalars().all())
        
        if not records:
            return VitalsSummary(total_records=0)
        
        # Calculate averages
        def avg(values):
            valid = [v for v in values if v is not None]
            return round(sum(valid) / len(valid), 1) if valid else None
        
        return VitalsSummary(
            total_records=len(records),
            avg_systolic_bp=avg([r.systolic_bp for r in records]),
            avg_diastolic_bp=avg([r.diastolic_bp for r in records]),
            avg_heart_rate=avg([r.heart_rate for r in records]),
            avg_spo2=avg([r.spo2 for r in records]),
            avg_temperature=avg([r.temperature for r in records]),
            avg_glucose=avg([r.glucose for r in records]),
            period_start=from_date or (min(r.recorded_at for r in records).date() if records else None),
            period_end=to_date or (max(r.recorded_at for r in records).date() if records else None),
        )


def get_vitals_service(db: AsyncSession) -> VitalsService:
    """Factory function for VitalsService."""
    return VitalsService(db)
