from pydantic import BaseModel, EmailStr, Field 
from pydantic_extra_types.phone_numbers import PhoneNumber
from typing import Literal, Optional

class UserRegister(BaseModel):
    """Payload for registering a new user."""
    email: EmailStr
    username: str = Field(..., min_length=2, description="Username must contain at least 2 characters")
    password: str = Field(..., min_length=6, description="Password must contain at least 6 characters")
    phone: PhoneNumber
    telegram_id: Optional[str] = None
    role: Literal["patient", "therapist", "volunteer"] = Field(...)



class UserLogin(BaseModel):
    """Payload for user authentication credentials."""
    username: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)