"""
MedTech AI Backend - Emergency Service

Emergency/SOS event management service.
"""

import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.emergency import (
    EmergencyEvent,
    EmergencyType,
    EmergencyStatus,
    EmergencySeverity,
)
from app.models.patient import Patient
from app.services.ai.gemini_client import gemini_client

logger = logging.getLogger(__name__)


class EmergencyService:
    """
    Emergency/SOS event management service.
    
    Handles:
    - Emergency event triggering
    - Status updates
    - Location tracking
    - AI-powered severity assessment
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.logger = logging.getLogger(f"{__name__}.EmergencyService")
    
    async def get_event_by_id(
        self,
        event_id: UUID,
    ) -> Optional[EmergencyEvent]:
        """Get emergency event by ID."""
        result = await self.db.execute(
            select(EmergencyEvent)
            .options(selectinload(EmergencyEvent.patient))
            .where(EmergencyEvent.id == event_id)
        )
        return result.scalar_one_or_none()
    
    async def get_patient_events(
        self,
        patient_id: UUID,
        include_resolved: bool = False,
    ) -> List[EmergencyEvent]:
        """Get emergency events for a patient."""
        query = select(EmergencyEvent).where(
            EmergencyEvent.patient_id == patient_id
        )
        
        if not include_resolved:
            query = query.where(
                EmergencyEvent.status != EmergencyStatus.RESOLVED
            )
        
        query = query.order_by(EmergencyEvent.triggered_at.desc())
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_active_events(self) -> List[EmergencyEvent]:
        """Get all active emergency events (for admin/dispatch)."""
        result = await self.db.execute(
            select(EmergencyEvent)
            .options(selectinload(EmergencyEvent.patient))
            .where(
                EmergencyEvent.status.in_([
                    EmergencyStatus.TRIGGERED,
                    EmergencyStatus.ACKNOWLEDGED,
                    EmergencyStatus.DISPATCHED,
                ])
            )
            .order_by(
                EmergencyEvent.severity.desc(),
                EmergencyEvent.triggered_at.asc(),
            )
        )
        return list(result.scalars().all())
    
    async def trigger_emergency(
        self,
        patient_id: UUID,
        emergency_type: str,
        description: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        address: Optional[str] = None,
    ) -> EmergencyEvent:
        """
        Trigger a new emergency event.
        
        Args:
            patient_id: Patient ID
            emergency_type: Type of emergency
            description: Optional description
            latitude: GPS latitude
            longitude: GPS longitude
            address: Human-readable address
            
        Returns:
            Created EmergencyEvent
        """
        # Get patient details
        patient = await self.db.get(Patient, patient_id)
        if not patient:
            raise ValueError("Patient not found")
        
        # Assess severity with AI if description provided
        severity = EmergencySeverity.MEDIUM
        ai_analysis = None
        
        if description and gemini_client.is_available:
            try:
                ai_analysis = await self._analyze_emergency(
                    description,
                    emergency_type,
                    patient,
                )
                if ai_analysis:
                    severity_str = ai_analysis.get("severity", "medium").lower()
                    if severity_str in [s.value for s in EmergencySeverity]:
                        severity = EmergencySeverity(severity_str)
            except Exception as e:
                self.logger.error(f"AI emergency analysis failed: {e}")
        
        # For certain emergency types, default to high severity
        if emergency_type in ["cardiac", "breathing", "stroke", "accident"]:
            if severity == EmergencySeverity.LOW:
                severity = EmergencySeverity.MEDIUM
        
        event = EmergencyEvent(
            patient_id=patient_id,
            emergency_type=EmergencyType(emergency_type) if emergency_type in [t.value for t in EmergencyType] else EmergencyType.OTHER,
            description=description,
            latitude=latitude,
            longitude=longitude,
            address=address,
            severity=severity,
            status=EmergencyStatus.TRIGGERED,
            ai_analysis=ai_analysis,
        )
        
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        
        self.logger.critical(
            f"EMERGENCY TRIGGERED: ID={event.id}, Patient={patient_id}, "
            f"Type={emergency_type}, Severity={severity}"
        )
        
        return event
    
    async def acknowledge_event(
        self,
        event: EmergencyEvent,
        responder_id: Optional[UUID] = None,
        responder_notes: Optional[str] = None,
    ) -> EmergencyEvent:
        """Mark emergency event as acknowledged."""
        event.status = EmergencyStatus.ACKNOWLEDGED
        event.acknowledged_at = datetime.utcnow()
        event.responder_id = responder_id
        
        if responder_notes:
            event.responder_notes = responder_notes
        
        await self.db.commit()
        await self.db.refresh(event)
        
        self.logger.info(f"Emergency {event.id} acknowledged by {responder_id}")
        
        return event
    
    async def dispatch_responders(
        self,
        event: EmergencyEvent,
        responder_info: Optional[str] = None,
    ) -> EmergencyEvent:
        """Mark responders as dispatched."""
        event.status = EmergencyStatus.DISPATCHED
        
        if responder_info:
            event.responder_notes = (event.responder_notes or "") + f"\nDispatched: {responder_info}"
        
        await self.db.commit()
        await self.db.refresh(event)
        
        self.logger.info(f"Emergency {event.id} - responders dispatched")
        
        return event
    
    async def resolve_event(
        self,
        event: EmergencyEvent,
        resolution_notes: Optional[str] = None,
    ) -> EmergencyEvent:
        """Resolve/close an emergency event."""
        event.status = EmergencyStatus.RESOLVED
        event.resolved_at = datetime.utcnow()
        
        if resolution_notes:
            event.responder_notes = (event.responder_notes or "") + f"\nResolution: {resolution_notes}"
        
        await self.db.commit()
        await self.db.refresh(event)
        
        self.logger.info(f"Emergency {event.id} resolved")
        
        return event
    
    async def cancel_event(
        self,
        event: EmergencyEvent,
        reason: Optional[str] = None,
    ) -> EmergencyEvent:
        """Cancel an emergency event (false alarm)."""
        event.status = EmergencyStatus.CANCELLED
        event.resolved_at = datetime.utcnow()
        
        if reason:
            event.responder_notes = (event.responder_notes or "") + f"\nCancelled: {reason}"
        
        await self.db.commit()
        await self.db.refresh(event)
        
        self.logger.info(f"Emergency {event.id} cancelled: {reason}")
        
        return event
    
    async def update_location(
        self,
        event: EmergencyEvent,
        latitude: float,
        longitude: float,
        address: Optional[str] = None,
    ) -> EmergencyEvent:
        """Update location for an active emergency."""
        event.latitude = latitude
        event.longitude = longitude
        if address:
            event.address = address
        
        await self.db.commit()
        await self.db.refresh(event)
        
        return event
    
    async def _analyze_emergency(
        self,
        description: str,
        emergency_type: str,
        patient: Patient,
    ) -> Optional[dict]:
        """Use AI to analyze emergency severity and provide guidance."""
        prompt = f"""
        Analyze this emergency situation and provide a structured response.
        
        Emergency Type: {emergency_type}
        Description: {description}
        
        Patient Info:
        - Blood Type: {patient.blood_type or 'Unknown'}
        - Allergies: {', '.join(patient.allergies) if patient.allergies else 'None known'}
        - Chronic Conditions: {', '.join(patient.chronic_conditions) if patient.chronic_conditions else 'None known'}
        
        Respond with JSON:
        {{
            "severity": "low" | "medium" | "high" | "critical",
            "immediate_actions": ["action1", "action2"],
            "dispatch_recommendation": "ambulance" | "police" | "fire" | "all" | "none",
            "medical_considerations": ["consideration1"],
            "eta_priority": "immediate" | "urgent" | "routine"
        }}
        """
        
        return await gemini_client.generate_json(prompt)


def get_emergency_service(db: AsyncSession) -> EmergencyService:
    """Factory function for EmergencyService."""
    return EmergencyService(db)
