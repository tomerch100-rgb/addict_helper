
import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
from DB.models.User import User
from DB.models.danger_zone import DangerZone
from DB.models.session import Session

load_dotenv()



async def init_db():
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        print ("data base not found")
    client = AsyncIOMotorClient(MONGODB_URI)
    db_name = "cleanslate"
    

    database = client.get_database(db_name)
    
    
    try:
        # אם המאפיין מחזיר אובייקט (כמו שקורה אצלך), נשתיל עליו את הפונקציה
        database.client.append_metadata = lambda *args, **kwargs: None
    except AttributeError:
        # אם פייתון חוסם הגדרה ישירה, נעקוף דרך ה-__dict__ הפנימי של האובייקט
        object.__setattr__(database.client, 'append_metadata', lambda *args, **kwargs: None)
    
    await init_beanie(
        database=database,  # type: ignore
        document_models=[
            User,
            DangerZone,
            Session
        ]
    )
    print("✅ MongoDB Connection Initialized Successfully with Beanie!")