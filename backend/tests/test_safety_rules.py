"""
MedTech AI Backend - AI Safety Rules Tests

Tests for the critical safety rules engine.
"""

import pytest
from app.services.ai.safety_rules import safety_rules_engine, EMERGENCY_KEYWORDS
from app.schemas.ai import SymptomCheckResponse, RiskLevel, SuggestedAction


class TestSafetyRules:
    """Test suite for safety rules engine."""
    
    def test_emergency_keywords_detected(self):
        """Test that emergency keywords are properly detected."""
        test_cases = [
            "I'm having severe chest pain",
            "My friend can't breathe",
            "I think I'm having a heart attack",
            "There's severe bleeding from the wound",
            "I feel like I want to kill myself",
        ]
        
        for symptom_text in test_cases:
            is_emergency, keyword = safety_rules_engine._check_emergency_keywords(symptom_text)
            assert is_emergency, f"Should detect emergency in: {symptom_text}"
            assert keyword is not None
    
    def test_emergency_override_applied(self):
        """Test that emergency keywords override AI response."""
        # Simulate an AI response that incorrectly classified as low risk
        ai_response = SymptomCheckResponse(
            risk_level=RiskLevel.LOW,
            confidence=0.9,
            suggested_action=SuggestedAction.SELF_CARE,
            reasoning="This seems like minor discomfort.",
        )
        
        # Apply safety override with emergency keyword
        result = safety_rules_engine.apply_safety_override(
            symptom_text="I'm having chest pain and difficulty breathing",
            ai_response=ai_response,
        )
        
        assert result.risk_level == RiskLevel.EMERGENCY
        assert result.suggested_action == SuggestedAction.EMERGENCY_SOS
        assert result.safety_override_applied
        assert result.confidence == 1.0  # Safety rules are absolute
    
    def test_high_risk_upgrade(self):
        """Test that high-risk keywords upgrade low risk to medium."""
        ai_response = SymptomCheckResponse(
            risk_level=RiskLevel.LOW,
            confidence=0.8,
            suggested_action=SuggestedAction.SELF_CARE,
            reasoning="Minor issue.",
        )
        
        result = safety_rules_engine.apply_safety_override(
            symptom_text="I have a very high fever and severe headache",
            ai_response=ai_response,
        )
        
        assert result.risk_level == RiskLevel.MEDIUM
        assert result.suggested_action == SuggestedAction.BOOK_APPOINTMENT
        assert result.safety_override_applied
    
    def test_no_override_for_normal_symptoms(self):
        """Test that normal symptoms don't trigger override."""
        ai_response = SymptomCheckResponse(
            risk_level=RiskLevel.LOW,
            confidence=0.9,
            suggested_action=SuggestedAction.SELF_CARE,
            reasoning="This appears to be a common cold.",
        )
        
        result = safety_rules_engine.apply_safety_override(
            symptom_text="I have a runny nose and mild cough",
            ai_response=ai_response,
        )
        
        assert result.risk_level == RiskLevel.LOW
        assert not result.safety_override_applied
    
    def test_vulnerable_age_consideration(self):
        """Test that vulnerable ages trigger appropriate response."""
        ai_response = SymptomCheckResponse(
            risk_level=RiskLevel.LOW,
            confidence=0.7,
            suggested_action=SuggestedAction.SELF_CARE,
            reasoning="Monitor symptoms.",
        )
        
        # Test with elderly patient
        result = safety_rules_engine.apply_safety_override(
            symptom_text="Having fever and some pain",
            ai_response=ai_response,
            age=85,
            severity=7,
        )
        
        assert result.risk_level == RiskLevel.HIGH
        assert result.safety_override_applied
    
    def test_all_emergency_keywords_covered(self):
        """Ensure all emergency keywords trigger detection."""
        for keyword in EMERGENCY_KEYWORDS:
            test_text = f"Patient reports {keyword} symptoms"
            is_emergency, detected = safety_rules_engine._check_emergency_keywords(test_text)
            assert is_emergency, f"Emergency keyword not detected: {keyword}"
    
    def test_validation_passes_valid_response(self):
        """Test that validation passes for valid responses."""
        valid_response = SymptomCheckResponse(
            risk_level=RiskLevel.MEDIUM,
            confidence=0.75,
            suggested_action=SuggestedAction.BOOK_APPOINTMENT,
            reasoning="Based on your symptoms, a medical evaluation is recommended.",
        )
        
        assert safety_rules_engine.validate_ai_response(valid_response)
    
    def test_validation_fails_invalid_emergency(self):
        """Test that validation fails for inconsistent emergency response."""
        invalid_response = SymptomCheckResponse(
            risk_level=RiskLevel.EMERGENCY,
            confidence=0.9,
            suggested_action=SuggestedAction.SELF_CARE,  # Wrong!
            reasoning="Emergency detected.",
        )
        
        assert not safety_rules_engine.validate_ai_response(invalid_response)
