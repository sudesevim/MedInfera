"""
Safety Filter Service
Ensures medical disclaimers and safety measures are applied to AI responses
"""

import logging
from models.chat_models import AIResponse

logger = logging.getLogger(__name__)

class SafetyFilter:
    def __init__(self):
        self.medical_disclaimers = {
            "general": "⚠️ This information is for general purposes only. Always consult a healthcare professional for medical diagnosis and treatment.",
            "emergency": "🚨 EMERGENCY: These may be serious symptoms. Call 911 immediately or go to the nearest emergency room.",
            "medication": "💊 Medication information is for informational purposes only. Always consult your doctor regarding medication use.",
            "diagnosis": "🩺 I cannot provide medical diagnosis. Always consult a doctor for your symptoms.",
            "interaction": "⚠️ Medication interaction detected. Always consult your doctor or pharmacist about this."
        }
        
        # Safety-critical topics that require extra caution
        self.safety_critical_keywords = [
            'diagnosis', 'disease',
            'treatment', 'medication', 'drug',
            'surgery', 'operation', 'dose',
            'side effect', 'risk', 'danger'
        ]
    
    def filter_response(self, response: AIResponse, original_message: str) -> AIResponse:
        """
        Apply safety filters to AI response
        """
        try:
            filtered_content = response.content
            
            # Check if response needs additional safety measures
            if self._detect_safety_critical_topics(original_message):
                # Ensure disclaimer is present
                if not self._has_disclaimer(filtered_content):
                    filtered_content = self._add_medical_disclaimer(filtered_content, "general")
                
                # Add extra safety warnings for critical topics
                if any(keyword in original_message.lower() for keyword in ['diagnosis']):
                    filtered_content = self._add_medical_disclaimer(filtered_content, "diagnosis")
                
                elif any(keyword in original_message.lower() for keyword in ['medication', 'drug']):
                    filtered_content = self._add_medical_disclaimer(filtered_content, "medication")
            
            # Ensure emergency responses have proper disclaimers
            if response.emergency_detected:
                filtered_content = self._add_medical_disclaimer(filtered_content, "emergency")
            
            # Update response
            filtered_response = AIResponse(
                content=filtered_content,
                confidence=response.confidence,
                requires_disclaimer=True,  # Always require disclaimer
                emergency_detected=response.emergency_detected,
                health_data_used=response.health_data_used,
                suggested_actions=response.suggested_actions,
                follow_up_questions=response.follow_up_questions
            )
            
            return filtered_response
            
        except Exception as e:
            logger.error(f"Safety filter error: {e}")
            # Return original response with general disclaimer as fallback
            response.content = self._add_medical_disclaimer(response.content, "general")
            response.requires_disclaimer = True
            return response
    
    def _detect_safety_critical_topics(self, message: str) -> bool:
        """
        Detect if message contains safety-critical topics
        """
        lower_message = message.lower()
        return any(keyword in lower_message for keyword in self.safety_critical_keywords)
    
    def _has_disclaimer(self, content: str) -> bool:
        """
        Check if content already has a medical disclaimer
        """
        disclaimer_indicators = ["⚠️", "🚨", "💊", "🩺", "for general purposes", "doctor", "healthcare professional", "consult"]
        return any(indicator in content for indicator in disclaimer_indicators)
    
    def _add_medical_disclaimer(self, content: str, disclaimer_type: str = "general") -> str:
        """
        Add medical disclaimer to content
        """
        disclaimer = self.medical_disclaimers.get(disclaimer_type, self.medical_disclaimers["general"])
        
        # Don't add duplicate disclaimers
        if disclaimer in content:
            return content
        
        # Add disclaimer at the end
        if not content.endswith('\n'):
            content += '\n'
        
        return content + '\n' + disclaimer