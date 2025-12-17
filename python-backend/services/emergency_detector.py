"""
Emergency Detection Service
"""

import logging
from typing import List
from models.chat_models import EmergencyAssessment, EmergencyLevel, EmergencyContact

logger = logging.getLogger(__name__)

class EmergencyDetector:
    def __init__(self):
        # Emergency keywords and patterns
        self.critical_keywords = [
            'heart attack', 'can\'t breathe', 'chest pain', 'unconscious',
            'stroke', 'severe headache', 'vomiting blood', 'high fever'
        ]
        
        self.high_severity_keywords = [
            'severe pain', 'difficulty breathing', 'fainting', 'severe abdominal pain',
            'fracture', 'bleeding', 'poisoning', 'allergic reaction', 'shock'
        ]
        
        self.medium_severity_keywords = [
            'fever', 'nausea', 'vomiting', 'headache', 'abdominal pain', 'diarrhea',
            'stomach hurts', 'stomach pain', 'stomachache', 'belly hurts', 'belly pain',
            'hurts', 'pain', 'ache'
        ]
        
        # Emergency contacts
        self.emergency_contacts = [
            EmergencyContact(
                name="Emergency Services",
                phone="911",
                relationship="emergency_services",
                is_primary=True
            ),
            EmergencyContact(
                name="Poison Control",
                phone="1-800-222-1222",
                relationship="poison_control",
                is_primary=False
            )
        ]
    
    async def detect_emergency(self, message: str) -> EmergencyAssessment:
        """
        Detect emergency situations in user message
        """
        try:
            lower_message = message.lower()
            
            # Check for critical emergency
            critical_symptoms = self._extract_symptoms(message, self.critical_keywords)
            if critical_symptoms:
                return EmergencyAssessment(
                    is_emergency=True,
                    severity=EmergencyLevel.CRITICAL,
                    symptoms=critical_symptoms,
                    recommended_actions=[
                        "Call 911 immediately",
                        "Go to the nearest emergency room",
                        "Try to stay calm",
                        "Have someone with you if possible"
                    ],
                    emergency_contacts=self.emergency_contacts
                )
            
            # Check for high severity
            high_symptoms = self._extract_symptoms(message, self.high_severity_keywords)
            if high_symptoms:
                return EmergencyAssessment(
                    is_emergency=True,
                    severity=EmergencyLevel.HIGH,
                    symptoms=high_symptoms,
                    recommended_actions=[
                        "Seek emergency care",
                        "Monitor your condition closely",
                        "Call 911 if symptoms worsen"
                    ],
                    emergency_contacts=self.emergency_contacts
                )
            
            # Check for medium severity
            medium_symptoms = self._extract_symptoms(message, self.medium_severity_keywords)
            if medium_symptoms:
                return EmergencyAssessment(
                    is_emergency=False,
                    severity=EmergencyLevel.MEDIUM,
                    symptoms=medium_symptoms,
                    recommended_actions=[
                        "Consult your doctor",
                        "Monitor your symptoms",
                        "Seek emergency care if your condition worsens"
                    ]
                )
            
            # No emergency detected
            return EmergencyAssessment(
                is_emergency=False,
                severity=EmergencyLevel.LOW,
                symptoms=[],
                recommended_actions=[
                    "Follow general health recommendations",
                    "Schedule regular checkups"
                ]
            )
            
        except Exception as e:
            logger.error(f"Emergency detection error: {e}")
            
            # Return conservative assessment on error
            return EmergencyAssessment(
                is_emergency=True,
                severity=EmergencyLevel.MEDIUM,
                symptoms=["Unable to assess"],
                recommended_actions=[
                    "Consult a healthcare professional for safety",
                    "Seek emergency care if your symptoms are serious"
                ],
                emergency_contacts=self.emergency_contacts
            )
    
    def _extract_symptoms(self, message: str, keywords: List[str]) -> List[str]:
        """
        Extract symptoms from message based on keywords
        """
        found_symptoms = []
        lower_message = message.lower()
        
        for keyword in keywords:
            if keyword.lower() in lower_message:
                found_symptoms.append(keyword)
        
        return found_symptoms