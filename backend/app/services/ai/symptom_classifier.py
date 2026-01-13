"""
MedTech AI Backend - Symptom Classifier

AI-powered symptom classification with safety overrides.
"""

import logging
from datetime import datetime
from typing import Optional, Dict, Any

from app.schemas.ai import (
    SymptomCheckRequest,
    SymptomCheckResponse,
    RiskLevel,
    SuggestedAction,
)
from app.services.ai.gemini_client import gemini_client
from app.services.ai.safety_rules import safety_rules_engine

logger = logging.getLogger(__name__)


class SymptomClassifier:
    """
    AI Symptom Classification Service.
    
    Combines Gemini AI analysis with mandatory safety rule overrides.
    This is the primary service for symptom checking.
    """
    
    def __init__(self):
        self.gemini = gemini_client
        self.safety_engine = safety_rules_engine
        self.logger = logging.getLogger(f"{__name__}.SymptomClassifier")
    
    async def classify(
        self,
        request: SymptomCheckRequest,
    ) -> SymptomCheckResponse:
        """
        Classify symptoms and return risk assessment.
        
        This method:
        1. Sends symptom data to Gemini AI
        2. Parses and validates the response
        3. Applies mandatory safety overrides
        4. Returns the final assessment
        
        Args:
            request: Symptom check request with symptoms and context
            
        Returns:
            SymptomCheckResponse with risk level and recommendations
        """
        self.logger.info(f"Processing symptom classification request")
        
        # Build context for AI
        context: Dict[str, Any] = {}
        if request.age:
            context["age"] = request.age
        if request.gender:
            context["gender"] = request.gender
        if request.duration_hours:
            context["duration_hours"] = request.duration_hours
        if request.severity:
            context["severity"] = request.severity
        if request.existing_conditions:
            context["existing_conditions"] = request.existing_conditions
        if request.current_medications:
            context["current_medications"] = request.current_medications
        
        # Try AI analysis
        ai_response = None
        if self.gemini.is_available:
            try:
                ai_response = await self.gemini.analyze_for_medical(
                    request.symptom_text,
                    context,
                )
            except Exception as e:
                self.logger.error(f"AI analysis failed: {e}")
        
        # Build response from AI or fallback
        if ai_response:
            response = self._parse_ai_response(ai_response)
        else:
            # Fallback response when AI is unavailable
            response = self._create_fallback_response(request)
        
        # CRITICAL: Apply safety overrides
        response = self.safety_engine.apply_safety_override(
            symptom_text=request.symptom_text,
            ai_response=response,
            age=request.age,
            severity=request.severity,
        )
        
        # Validate final response
        if not self.safety_engine.validate_ai_response(response):
            self.logger.error("Response validation failed, returning safe fallback")
            return self._create_safe_fallback()
        
        self.logger.info(
            f"Classification complete: risk={response.risk_level}, "
            f"action={response.suggested_action}, "
            f"safety_override={response.safety_override_applied}"
        )
        
        return response
    
    def _parse_ai_response(self, ai_data: Dict[str, Any]) -> SymptomCheckResponse:
        """Parse AI response into SymptomCheckResponse."""
        try:
            # Parse risk level
            risk_str = ai_data.get("risk_level", "medium").lower()
            risk_level = RiskLevel(risk_str) if risk_str in [r.value for r in RiskLevel] else RiskLevel.MEDIUM
            
            # Parse suggested action
            action_str = ai_data.get("suggested_action", "book-appointment").lower()
            suggested_action = SuggestedAction(action_str) if action_str in [a.value for a in SuggestedAction] else SuggestedAction.BOOK_APPOINTMENT
            
            # Ensure consistency between risk level and action
            if risk_level == RiskLevel.EMERGENCY:
                suggested_action = SuggestedAction.EMERGENCY_SOS
            elif risk_level == RiskLevel.LOW and suggested_action == SuggestedAction.EMERGENCY_SOS:
                suggested_action = SuggestedAction.SELF_CARE
            
            return SymptomCheckResponse(
                risk_level=risk_level,
                confidence=min(max(float(ai_data.get("confidence", 0.7)), 0.0), 1.0),
                suggested_action=suggested_action,
                reasoning=str(ai_data.get("reasoning", "Please consult a healthcare professional.")),
                possible_conditions=ai_data.get("possible_conditions"),
                recommended_specialists=ai_data.get("recommended_specialists"),
                warning_signs=ai_data.get("warning_signs"),
                self_care_tips=ai_data.get("self_care_tips"),
                safety_override_applied=False,
                analyzed_at=datetime.utcnow(),
            )
        except Exception as e:
            self.logger.error(f"Failed to parse AI response: {e}")
            return self._create_fallback_response(None)
    
    def _create_fallback_response(
        self,
        request: Optional[SymptomCheckRequest],
    ) -> SymptomCheckResponse:
        """Create fallback response when AI is unavailable."""
        return SymptomCheckResponse(
            risk_level=RiskLevel.MEDIUM,
            confidence=0.5,
            suggested_action=SuggestedAction.BOOK_APPOINTMENT,
            reasoning=(
                "Our AI system is currently processing your request. "
                "Based on your symptoms, we recommend consulting with a healthcare "
                "professional for a proper evaluation."
            ),
            warning_signs=[
                "If symptoms worsen, seek immediate medical care",
                "If you experience difficulty breathing, chest pain, or severe symptoms, "
                "call emergency services immediately"
            ],
            safety_override_applied=False,
            analyzed_at=datetime.utcnow(),
        )
    
    def _create_safe_fallback(self) -> SymptomCheckResponse:
        """Create a safe fallback response for error cases."""
        return SymptomCheckResponse(
            risk_level=RiskLevel.MEDIUM,
            confidence=0.5,
            suggested_action=SuggestedAction.BOOK_APPOINTMENT,
            reasoning=(
                "We recommend scheduling an appointment with a healthcare provider "
                "for a proper evaluation of your symptoms."
            ),
            warning_signs=[
                "If you experience severe symptoms, seek immediate medical care",
                "Call emergency services for life-threatening situations"
            ],
            safety_override_applied=False,
            analyzed_at=datetime.utcnow(),
        )


# Module-level instance
symptom_classifier = SymptomClassifier()
