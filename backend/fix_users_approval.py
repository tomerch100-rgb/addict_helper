import asyncio
import os
from pymongo import AsyncMongoClient
from beanie import init_beanie
from dotenv import load_dotenv

from DB.models.User import User
from DB.models.danger_zone import DangerZone
from DB.models.session import Session

async def fix_admin_users():
    load_dotenv()
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        print("MONGODB_URI not found.")
        return
        
    client = AsyncMongoClient(MONGODB_URI)
    database = client["cleanslate"]
    
    await init_beanie(
        database=database,
        document_models=[User, DangerZone, Session]
    )
    
    # Update admins, buddies, and patients where is_approved is False
    users_to_update = await User.find({"role": {"$ne": "therapist"}, "is_approved": False}).to_list()
    if not users_to_update:
        print("No users found to update.")
        return
        
    for user in users_to_update:
        user.is_approved = True
        await user.save()
        
    print(f"Updated {len(users_to_update)} users to is_approved=True")

if __name__ == "__main__":
    asyncio.run(fix_admin_users())
