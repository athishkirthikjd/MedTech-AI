"""
MedTech AI Backend - Safety Rules Engine

CRITICAL: Hard-coded safety overrides for medical AI.
AI recommendations NEVER override safety rules.
"""

import re
import logging
from typing import Tuple, Optional

from app.schemas.ai import RiskLevel, SuggestedAction, SymptomCheckResponse

logger = logging.getLogger(__name__)


# ================================================
# EMERGENCY KEYWORDS - NEVER TO BE OVERRIDDEN
# ================================================
# These trigger immediate emergency classification

EMERGENCY_KEYWORDS = [
    # Cardiac
    "chest pain",
    "heart attack",
    "cardiac arrest",
    "heart pain",
    "crushing chest",
    
    # Respiratory
    "can't breathe",
    "cannot breathe",
    "difficulty breathing",
    "breathing difficulty",
    "shortness of breath",
    "choking",
    "suffocating",
    "not breathing",
    "stopped breathing",
    
    # Neurological
    "stroke",
    "seizure",
    "convulsion",
    "unconscious",
    "passed out",
    "fainted",
    "unresponsive",
    "sudden numbness",
    "face drooping",
    "slurred speech",
    "sudden confusion",
    "severe headache sudden",
    
    # Bleeding & Trauma
    "severe bleeding",
    "heavy bleeding",
    "won't stop bleeding",
    "bleeding heavily",
    "major bleeding",
    "lost a lot of blood",
    
    # Poisoning
    "overdose",
    "poisoning",
    "poisoned",
    "swallowed poison",
    "drug overdose",
    
    # Other Critical
    "suicidal",
    "suicide",
    "want to die",
    "kill myself",
    "severe allergic",
    "anaphylaxis",
    "anaphylactic",
    "can't swallow",
    "throat closing",
    "severe burn",
    "electrocution",
    "drowning",
    "near drowning",
]

# High-risk keywords that warrant urgent attention
HIGH_RISK_KEYWORDS = [
    "high fever",
    "very high temperature",
    "blood in urine",
    "blood in stool",
    "coughing blood",
    "vomiting blood",
    "severe pain",
    "intense pain",
    "unbearable pain",
    "confusion",
    "disoriented",
    "vision loss",
    "sudden blindness",
    "severe headache",
    "worst headache",
    "abdominal pain severe",
    "swelling face",
    "swelling tongue",
    "difficulty swallowing",
]

# Self-care appropriate keywords (low risk indicators)
LOW_RISK_KEYWORDS = [
    "mild headache",
    "slight fever",
    "runny nose",
    "sneezing",
    "mild cough",
    "sore throat",
    "minor cut",
    "small bruise",
    "feeling tired",
    "mild nausea",
    "stomach upset",
    "mild rash",
    "dry skin",
    "minor ache",
]


class SafetyRulesEngine:
    """
    Safety rules engine that overrides AI recommendations.
    
    This is a CRITICAL component. AI decisions must pass through
    this engine before being returned to users.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(f"{__name__}.SafetyRulesEngine")
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for keyword matching."""
        return text.lower().strip()
    
    def _check_emergency_keywords(self, text: str) -> Tuple[bool, Optional[str]]:
        """
        Check if text contains emergency keywords.
        
        Returns:
            Tuple of (is_emergency, matched_keyword)
        """
        normalized = self._normalize_text(text)
        
        for keyword in EMERGENCY_KEYWORDS:
            if keyword in normalized:
                self.logger.warning(
                    f"EMERGENCY KEYWORD DETECTED: '{keyword}' in symptom text"
                )
                return True, keyword
        
        return False, None
    
    def _check_high_risk_keywords(self, text: str) -> Tuple[bool, Optional[str]]:
        """
        Check if text contains high-risk keywords.
        
        Returns:
            Tuple of (is_high_risk, matched_keyword)
        """
        normalized = self._normalize_text(text)
        
        for keyword in HIGH_RISK_KEYWORDS:
            if keyword in normalized:
                return True, keyword
        
        return False, None
    
    def _check_severity_indicators(
        self,
        text: str,
        severity: Optional[int],
        age: Optional[int]
    ) -> Optional[RiskLevel]:
        """
        Check severity indicators beyond keywords.
        
        Args:
            text: Symptom text
            severity: User-reported severity (1-10)
            age: Patient age
            
        Returns:
            Suggested risk level if indicators present, None otherwise
        """
        # Very high user-reported severity
        if severity and severity >= 9:
            return RiskLevel.HIGH
        
        # Vulnerable age groups with concerning symptoms
        if age is not None:
            if age < 2 or age > 80:
                # Lower threshold for emergency keywords in vulnerable populations
                normalized = self._normalize_text(text)
                if any(kw in normalized for kw in ["fever", "pain", "breathing", "vomiting"]):
                    return RiskLevel.HIGH
        
        return None
    
    def apply_safety_override(
        self,
        symptom_text: str,
        ai_response: SymptomCheckResponse,
        age: Optional[int] = None,
        severity: Optional[int] = None,
    ) -> SymptomCheckResponse:
        """
        Apply safety overrides to AI response.
        
        This method MUST be called on every AI response before returning to user.
        
        Args:
            symptom_text: Original symptom description
            ai_response: AI-generated response
            age: Patient age (optional)
            severity: User-reported severity (optional)
            
        Returns:
            Potentially modified response with safety overrides applied
        """
        # Check for emergency keywords
        is_emergency, emergency_keyword = self._check_emergency_keywords(symptom_text)
        
        if is_emergency:
            self.logger.critical(
                f"SAFETY OVERRIDE: Emergency detected for keyword '{emergency_keyword}'. "
                f"Original risk: {ai_response.risk_level}, Action: {ai_response.suggested_action}"
            )
            
            return SymptomCheckResponse(
                risk_level=RiskLevel.EMERGENCY,
                confidence=1.0,  # Safety rules are absolute
                suggested_action=SuggestedAction.EMERGENCY_SOS,
                reasoning=(
                    f"Your symptoms indicate a potential emergency. "
                    f"This assessment detected: {emergency_keyword}. "
                    f"Please seek immediate medical attention or call emergency services."
                ),
                possible_conditions=ai_response.possible_conditions,
                warning_signs=["This is a potential medical emergency", "Do not delay seeking care"],
                safety_override_applied=True,
                safety_override_reason=f"Emergency keyword detected: {emergency_keyword}",
            )
        
        # Check for high-risk keywords
        is_high_risk, high_risk_keyword = self._check_high_risk_keywords(symptom_text)
        
        if is_high_risk and ai_response.risk_level == RiskLevel.LOW:
            self.logger.warning(
                f"SAFETY OVERRIDE: Upgrading risk from LOW to MEDIUM. "
                f"High-risk keyword: '{high_risk_keyword}'"
            )
            
            ai_response.risk_level = RiskLevel.MEDIUM
            ai_response.suggested_action = SuggestedAction.BOOK_APPOINTMENT
            ai_response.safety_override_applied = True
            ai_response.safety_override_reason = f"High-risk indicator detected: {high_risk_keyword}"
            ai_response.reasoning += (
                f" Note: Your symptoms mention '{high_risk_keyword}' which warrants "
                f"professional medical evaluation."
            )
        
        # Check severity and age indicators
        severity_risk = self._check_severity_indicators(symptom_text, severity, age)
        
        if severity_risk == RiskLevel.HIGH and ai_response.risk_level in [RiskLevel.LOW, RiskLevel.MEDIUM]:
            self.logger.warning(
                f"SAFETY OVERRIDE: Upgrading risk based on severity/age indicators"
            )
            
            ai_response.risk_level = RiskLevel.HIGH
            ai_response.suggested_action = SuggestedAction.BOOK_APPOINTMENT
            ai_response.safety_override_applied = True
            ai_response.safety_override_reason = "Elevated risk due to severity or patient demographics"
        
        return ai_response
    
    def validate_ai_response(self, response: SymptomCheckResponse) -> bool:
        """
        Validate that AI response meets safety requirements.
        
        Args:
            response: AI-generated response
            
        Returns:
            True if response is valid, False otherwise
        """
        # Ensure emergency risk level has emergency action
        if response.risk_level == RiskLevel.EMERGENCY:
            if response.suggested_action != SuggestedAction.EMERGENCY_SOS:
                self.logger.error(
                    "VALIDATION FAILED: Emergency risk level without emergency action"
                )
                return False
        
        # Ensure confidence is within bounds
        if not 0.0 <= response.confidence <= 1.0:
            self.logger.error(f"VALIDATION FAILED: Invalid confidence value {response.confidence}")
            return False
        
        # Ensure reasoning is present
        if not response.reasoning or len(response.reasoning) < 10:
            self.logger.error("VALIDATION FAILED: Missing or insufficient reasoning")
            return False
        
        return True


# Module-level instance
safety_rules_engine = SafetyRulesEngine()
