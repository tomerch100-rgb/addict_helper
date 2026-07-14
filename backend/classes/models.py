from typing import Optional
from beanie import Document

class User(Document):

    telegram_id: Optional[int] = None  # מתחיל כריק    username: str
    password : str
    age: int
    email: str
    role : str 
    phone :str

    class Settings:
        name = "User"  # שם התיקייה (Collection) שתיפתח ב-MongoDB בענן