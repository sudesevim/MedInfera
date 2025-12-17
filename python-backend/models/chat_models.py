"""
Data models for the medical chatbot
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum

class SenderType(str, Enum):
    USER = "user"
    BOT = "bot"
    SYSTEM = "system"

class MessageStatus(str, Enum):
    SENDING = "sending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    ERROR = "error"

class MessageType(str, Enum):
    TEXT = "text"
    EMERGENCY = "emergency"
    MEDICATION_REMINDER = "medication_reminder"
    HEALTH_INSIGHT = "health_insight"

class EmergencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class MessageMetadata(BaseModel):
    health_data_referenced: Optional[List[str]] = None
    emergency_level: Optional[EmergencyLevel] = None
    disclaimer_shown: Optional[bool] = None

class ChatMessage(BaseModel):
    id: str
    user_id: str
    content: str
    sender: SenderType
    timestamp: datetime
    status: MessageStatus
    message_type: MessageType
    metadata: Optional[MessageMetadata] = None

class Medication(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    dosage: str
    frequency: str
    start_date: str
    end_date: Optional[str] = None
    instructions: Optional[str] = None
    side_effects: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class VitalSigns(BaseModel):
    id: Optional[str] = None
    type: Literal["blood_pressure", "heart_rate", "temperature", "weight", "blood_sugar"]
    value: str
    unit: str
    date: str
    notes: Optional[str] = None

class Symptom(BaseModel):
    id: Optional[str] = None
    name: str
    severity: Literal["mild", "moderate", "severe"]
    duration: str
    description: Optional[str] = None
    date: str
    body_part: Optional[str] = None

class HealthContext(BaseModel):
    user_id: str
    current_medications: List[Medication] = []
    recent_vitals: List[VitalSigns] = []
    chronic_conditions: List[str] = []
    allergies: List[str] = []
    recent_symptoms: List[Symptom] = []
    last_updated: Optional[datetime] = None

class AIResponse(BaseModel):
    content: str
    confidence: float = Field(ge=0.0, le=1.0)
    requires_disclaimer: bool
    emergency_detected: bool
    health_data_used: List[str] = []
    suggested_actions: Optional[List[str]] = None
    follow_up_questions: Optional[List[str]] = None

class EmergencyContact(BaseModel):
    id: Optional[str] = None
    name: str
    phone: str
    relationship: Optional[str] = None
    is_primary: Optional[bool] = None

class EmergencyAssessment(BaseModel):
    is_emergency: bool
    severity: EmergencyLevel
    symptoms: List[str] = []
    recommended_actions: List[str] = []
    emergency_contacts: Optional[List[EmergencyContact]] = None

class InteractionWarning(BaseModel):
    medication_a: str
    medication_b: str
    severity: Literal["mild", "moderate", "severe"]
    description: str
    recommendation: str

# Request/Response models for API endpoints
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    user_id: str
    health_context: Optional[HealthContext] = None

class ChatResponse(BaseModel):
    response: AIResponse
    emergency_assessment: Optional[EmergencyAssessment] = None
    processing_time_ms: int

class OllamaStatus(BaseModel):
    status: str
    available: bool
    model: Optional[str] = None
    message: Optional[str] = None