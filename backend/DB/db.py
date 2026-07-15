# backend/DB/connection.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv()

from DB.models.User import User
from DB.models.danger_zone import DangerZone
from DB.models.session import Session

async def init_db():
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/cleanslate")
    client = AsyncIOMotorClient(mongodb_uri)
    db_name = mongodb_uri.split("/")[-1] or "cleanslate"
    

    database = client[db_name]
    

    await init_beanie(
        database=database,  # type: ignore
        document_models=[
            User,
            DangerZone,
            Session
        ]
    )
    print("✅ MongoDB Connection Initialized Successfully with Beanie!")