from pydantic import BaseModel, Field
from typing import Optional

class UserRegister(BaseModel):
    """Payload for registering a new user."""
    username: str = Field(..., min_length=2, description="Username must contain at least 2 characters")
    password: str = Field(..., min_length=6, description="Password must contain at least 6 characters")
    phone: str = Field(..., description="User phone number")
    telegram_id: Optional[str] = None
    role: str = Field(default="patient")

class UserLogin(BaseModel):
    """Payload for user authentication credentials."""
    username: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)

class DangerZoneCreate(BaseModel):
    name: str = Field(..., description="The name of the location, e.g., 'The Neighborhood Bar' or 'Herzl St Corner'")
    latitude: float = Field(..., description="Geographical latitude coordinate")
    longitude: float = Field(..., description="Geographical longitude coordinate")
    radius_meters: int = Field(default=100, description="The geofence alert radius in meters around the point")

class DangerZoneBreach(BaseModel):
    """
    Validates background GPS updates forwarded automatically 
    by the patient's mobile application.
    """
    zone_id: str = Field(..., description="The unique database ID of the breached danger zone")
    current_latitude: float = Field(..., description="The current latitude reading from the user's mobile GPS device")
    current_longitude: float = Field(..., description="The current longitude reading from the user's mobile GPS device")