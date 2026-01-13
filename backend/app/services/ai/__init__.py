"""
MedTech AI Backend - AI Services Module

AI-powered services including symptom classification and voice processing.
"""

from app.services.ai.safety_rules import (
    SafetyRulesEngine,
    safety_rules_engine,
    EMERGENCY_KEYWORDS,
    HIGH_RISK_KEYWORDS,
)
from app.services.ai.gemini_client import (
    GeminiClient,
    gemini_client,
)
from app.services.ai.symptom_classifier import (
    SymptomClassifier,
    symptom_classifier,
)
from app.services.ai.voice_pipeline import (
    VoicePipeline,
    voice_pipeline,
)

__all__ = [
    # Safety
    "SafetyRulesEngine",
    "safety_rules_engine",
    "EMERGENCY_KEYWORDS",
    "HIGH_RISK_KEYWORDS",
    # Gemini
    "GeminiClient",
    "gemini_client",
    # Symptom Classifier
    "SymptomClassifier",
    "symptom_classifier",
    # Voice Pipeline
    "VoicePipeline",
    "voice_pipeline",
]
