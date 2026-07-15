# backend/DB/models/danger_zone.py
from datetime import datetime
from typing import List, Annotated
from pydantic import BaseModel, Field, ConfigDict
from beanie import Document, Indexed


class GeoJSONPoint(BaseModel):
    """מבנה נתונים תקני של GeoJSON עבור נקודה על המפה"""
    type: str = Field(default="Point")
    coordinates: List[float]  # פורמט: [Longitude, Latitude]


class DangerZone(Document):
    """המודל המייצג אזור סיכון שהוגדר על ידי הנגמל"""
    patient_id: Annotated[str, Indexed()]  
    location_name: str = Field(default="אזור סיכון")
    location: GeoJSONPoint
    radius_in_meters: int = Field(default=100)  
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "danger_zones"
        indexes = [
            [("location", "2dsphere")]  # אינדקס גיאוגרפי מהיר
        ]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "patient_id": "60c72b2f9b1d8b2bad7f65a1",
                "location_name": "פיצוציית אלנבי",
                "location": {
                    "type": "Point",
                    "coordinates": [34.7712, 32.0631]
                },
                "radius_in_meters": 150
            }
        }
    )