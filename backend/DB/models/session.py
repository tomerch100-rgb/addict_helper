# backend/DB/models/session.py
from datetime import datetime
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict
from beanie import Document, Indexed


class Message(BaseModel):
    """מבנה של הודעה בודדת בתוך שיחה"""
    sender: str  # "patient", "helper", or "ai"
    text: str
    sentiment: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Session(Document):
    """המודל המנהל מפגש צ'אט (שיחה פעילה או קריאת SOS)"""
    patient_id: Annotated[str, Indexed()]
    helper_id: Optional[Annotated[str, Indexed()]] = None
    status: str = Field(default="active")  # "active" או "closed"
    is_sos: bool = Field(default=False)
    messages: List[Message] = Field(default=[])
    ai_summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None

    class Settings:
        name = "sessions"
model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "patient_id": "60c72b2f9b1d8b2bad7f65a1",
                "helper_id": "60c72b2f9b1d8b2bad7f65a2",
                "is_active": "active",
                "is_sos": True,
                "messages": [
                    {
                        "sender": "patient",
                        "text": "I'm feeling a strong urge right now, I need help",
                        "sentiment": "high_risk",
                        "timestamp": "2026-07-15T12:00:00Z"
                    }
                ],
                "ai_summary": "The user experienced a strong urge around noon and requested immediate support."
            }
        }
    )