import os
from pymongo import AsyncMongoClient
from beanie import init_beanie
from dotenv import load_dotenv
from DB.models.User import User
from DB.models.danger_zone import DangerZone
from DB.models.session import Session
from DB.models.audit_log import AuditLog

load_dotenv()

async def init_db():
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        print("data base not found")
        return

    client = AsyncMongoClient(MONGODB_URI)
    db_name = "cleanslate"
    database = client[db_name]

    await init_beanie(
        database=database,
        document_models=[
            User,
            DangerZone,
            Session,
            AuditLog
        ]
    )
    print("✅ MongoDB Connection Initialized Successfully with Beanie and PyMongo!")