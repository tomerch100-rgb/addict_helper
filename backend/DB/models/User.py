# backend/DB/models/User.py
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
    status: str = Field(default="active")


class User(Document):
    """המודל המרכזי של כלל המשתמשים במערכת"""
    username: Annotated[str, Indexed(unique=True)]
    phone: Annotated[str, Indexed(unique=True)]
    password_hash: str
    telegram_id: Optional[Annotated[str, Indexed(unique=True)]] = None
    role: str = Field(default="patient")  # patient, buddy, therapist, admin
    is_approved: bool = Field(default=False)
    patient_data: Optional[PatientData] = None
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
                    "badges": [],
                    "status": "active"
                }
            }
        }
    )