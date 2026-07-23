# backend/DB/models/audit_log.py
from datetime import datetime
from typing import Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict
from beanie import Document, Indexed


class AuditLog(Document):
    """מודל לתיעוד פעולות רגישות במערכת (אישורים, גישה לפרטי חירום, קריאות SOS)"""
    action: Annotated[str, Indexed()]  # e.g. "user_approved", "sos_triggered", "danger_zone_breach"
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    target_id: Optional[str] = None
    target_name: Optional[str] = None
    details: Optional[str] = None
    created_at: Annotated[datetime, Indexed()] = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "action": "user_approved",
                "actor_id": "60c72b2f9b1d8b2bad7f65a1",
                "actor_name": "Aviv Admin",
                "target_id": "60c72b2f9b1d8b2bad7f65a2",
                "target_name": "Dr. Daniel Levi",
                "details": "Approved therapist registration",
            }
        }
    )
