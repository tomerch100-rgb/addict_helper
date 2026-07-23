# backend/DB/models/User.py
from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict
from beanie import Document, Indexed


class Badge(BaseModel):
    """מודל המייצג תג הישג שהנגמל קיבל"""
    badge_id: str
    name: str
    icon: str
    awarded_at: datetime = Field(default_factory=datetime.utcnow)


class PatientData(BaseModel):
    """נתונים הייחודיים אך ורק למשתמשים שהם נגמלים (Patients)"""
    clean_since: datetime = Field(default_factory=datetime.utcnow)
    badges: List[Badge] = Field(default=[])
    assigned_therapist_id: Optional[str] = None
    assigned_buddy_id: Optional[str] = None
    is_active: str = Field(default="active")
    onboarding_answers: Optional[OnboardingAnswers] = None
    therapist_id: Optional[str] = Field(default=None, description="מזהה ה-ID של הפסיכולוג המטפל במערכת")
    buddy_phone: Optional[str] = Field(default=None, description="מספר הטלפון של החבר/מלווה למקרה חירום")


class OnboardingAnswers(BaseModel):
    """Answers from the initial onboarding questionnaire"""
    addiction_type: str  # e.g., "alcohol", "gambling", "substances"
    addiction_duration_years: float  # How long they have been addicted
    usage_frequency: str  # e.g., "daily", "few_times_a_week", "socially"
    primary_triggers: List[str] = Field(default=[])  # e.g., ["loneliness", "stress", "evenings"]
    motivation_anchors: List[str] = Field(default=[])  # e.g., ["family", "health", "finances"]
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class User(Document):
    """המודל המרכזי של כלל המשתמשים במערכת"""
    username: Annotated[str, Indexed(unique=True)]
    phone: Annotated[str, Indexed(unique=True)]
    password_hash: str
    telegram_id: Optional[Annotated[str, Indexed(unique=True)]] = None
    role: str = Field(default="patient")  # patient, buddy, therapist, admin
    is_approved: bool = Field(default=False)
    patient_data: Optional[PatientData] = Field(default=None)
    is_active : str = Field(default= "active")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users" 
        
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "tomerh",
                "phone": "0501234567",
                "telegram_id": "123456789",
                "role": "patient",
                "patient_data": {
                    "clean_since": "2026-07-01T12:00:00Z",
                    "badges": [
                        {
                            "badge_id": "first_step",
                            "name": "First Step",
                            "icon": "🚀",
                            "awarded_at": "2026-07-01T12:05:00Z"
                        }
                    ],
                    "is_active": "active"
                }
            }
        }
    )