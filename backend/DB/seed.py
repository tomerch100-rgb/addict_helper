# backend/DB/seed.py
import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add parent directory to path to allow importing the DB package correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

# Import models and connection
from DB.models.User import User, PatientData, Badge
from DB.models.danger_zone import DangerZone, GeoJSONPoint
from DB.models.session import Session, Message

load_dotenv()

async def seed_data():
    print("🧹 Cleaning old data from the database...")
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/cleanslate")
    
    # Create the client
    client = AsyncIOMotorClient(mongodb_uri)
    
    # Extract DB name
    db_name = "cleanslate"
    
    # Explicitly retrieve the Database object to prevent Type Checking errors
    database = client[db_name]
    
    # Initialize Beanie with the Database object
    await init_beanie(
        database=database,  # type: ignore
        document_models=[User, DangerZone, Session]
    )
    
    # Delete all existing data to start fresh
    await User.find_all().delete()
    await DangerZone.find_all().delete()
    await Session.find_all().delete()
    
    print("👥 Creating demo users...")
    
    # 1. Create Admin
    admin = User(
        phone_number="0500000001",
        name="Aviv Admin",
        role="admin",
        is_approved=True
    )
    await admin.insert()
    
    # 2. Create Therapist (Psychologist)
    therapist = User(
        phone_number="0500000002",
        name="Dr. Daniel Levi",
        role="therapist",
        is_approved=True
    )
    await therapist.insert()
    
    # 3. Create Volunteer (Buddy)
    buddy = User(
        phone_number="0500000003",
        name="Roy Buddy",
        role="buddy",
        is_approved=True
    )
    await buddy.insert()
    
    # 4. Create Patient with predefined badges
    patient = User(
        phone_number="0501234567",
        telegram_id="123456789",  # Dummy Telegram ID
        name="Tomer Haymi",
        role="patient",
        patient_data=PatientData(
            clean_since=datetime.utcnow() - timedelta(days=12),  # 12 days clean
            assigned_therapist_id=str(therapist.id),  # Assigned therapist link
            assigned_buddy_id=str(buddy.id),  # Assigned buddy link
            badges=[
                Badge(badge_id="first_step", name="First Step", icon="🚀"),
                Badge(badge_id="one_week", name="One Week Clean", icon="🌱", awarded_at=datetime.utcnow() - timedelta(days=5))
            ],
            status="active"
        )
    )
    await patient.insert()
    
    print("📍 Creating a demo danger zone...")
    # Create danger zone (e.g., area of kiosks in Tel Aviv)
    danger_zone = DangerZone(
        patient_id=str(patient.id),
        location_name="Central Kiosk",
        location=GeoJSONPoint(
            type="Point",
            coordinates=[34.7818, 32.0746]  # Tel Aviv Coordinates [Longitude, Latitude]
        ),
        radius_in_meters=100
    )
    await danger_zone.insert()
    
    print("💬 Creating an SOS session and chat history...")
    # Create an active emergency SOS session
    session = Session(
        patient_id=str(patient.id),
        helper_id=str(buddy.id),
        status="active",
        is_sos=True,
        messages=[
            Message(
                sender="patient",
                text="Hey, I'm feeling a really strong urge right now and I need to talk to someone",
                sentiment="high_risk",
                timestamp=datetime.utcnow() - timedelta(minutes=10)
            ),
            Message(
                sender="helper",
                text="Hey Tomer, I'm right here with you. Take a deep breath, tell me where you are.",
                sentiment="supportive",
                timestamp=datetime.utcnow() - timedelta(minutes=8)
            )
        ],
        ai_summary="The patient experienced a high-risk urge and initiated an SOS session with their buddy."
    )
    await session.insert()
    
    print("🎉 Database successfully seeded with awesome demo data!")

if __name__ == "__main__":
    # Run the script asynchronously
    asyncio.run(seed_data())