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