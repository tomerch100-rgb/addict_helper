# backend/DB/seed.py
import asyncio
import os
import sys
from datetime import datetime, timedelta
from core.security import hash_password

# Add parent directory to path to allow importing the DB package correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pymongo import AsyncMongoClient
from beanie import init_beanie
from dotenv import load_dotenv

# Import models and connection
from DB.models.User import User, PatientData, Badge
from DB.models.danger_zone import DangerZone, GeoJSONPoint
from DB.models.session import Session, Message
from DB.models.audit_log import AuditLog

load_dotenv()

async def seed_data():
    print("🧹 Cleaning old data from the database...")
    MONGODB_URI = os.getenv("MONGODB_URI")
    
    # Create the client
    client = AsyncMongoClient(MONGODB_URI)
    
    # Extract DB name
    db_name = "cleanslate"
    
    # Explicitly retrieve the Database object
    database = client[db_name]
    
    # Initialize Beanie with the Database object
    await init_beanie(
        database=database,
        document_models=[User, DangerZone, Session, AuditLog]
    )

    # Delete all existing data to start fresh
    await User.find_all().delete()
    await DangerZone.find_all().delete()
    await Session.find_all().delete()
    await AuditLog.find_all().delete()
    
    print("👥 Creating demo users...")
    
    # 1. Create Admin
    admin = User(
        phone="0500000001",
        username="Aviv Admin",
      password_hash=hash_password("admin123")  ,
        role="admin",
        is_approved=True
    )
    await admin.insert()
    
    # 2. Create Therapist (Psychologist)
    therapist = User(
        phone="0500000002",
        username="Dr. Daniel Levi",
        password_hash=hash_password("therapist123")  ,
        role="therapist",
        is_approved=True
    )
    await therapist.insert()
    
    # 3. Create Volunteer (Buddy)
    buddy = User(
        phone="0500000003",
        username="Roy Buddy",
        password_hash=hash_password("Roy123")  ,
        role="buddy",
        is_approved=True
    )
    await buddy.insert()
    
    # 4. Create Patient with predefined badges
    patient = User(
        phone="0501234567",
        telegram_id="123456789",  # Dummy Telegram ID
        username="Tomer Haymi",
         password_hash=hash_password("Tomer123")  ,
        role="patient",
        patient_data=PatientData(
            clean_since=datetime.utcnow() - timedelta(days=12),  # 12 days clean
            assigned_therapist_id=str(therapist.id),  # Assigned therapist link
            assigned_buddy_id=str(buddy.id),  # Assigned buddy link
            badges=[
                Badge(badge_id="first_step", name="First Step", icon="🚀"),
                Badge(badge_id="one_week", name="One Week Clean", icon="🌱", awarded_at=datetime.utcnow() - timedelta(days=5))
            ],
            is_active="active"
        )
    )
    await patient.insert()

    # 5. Second patient, at-risk / declining mood trend
    patient2 = User(
        phone="0501234568",
        telegram_id="123456790",
        username="Noa Ben-David",
        password_hash="hashed_password",
        role="patient",
        patient_data=PatientData(
            clean_since=datetime.utcnow() - timedelta(days=3),
            assigned_therapist_id=str(therapist.id),
            assigned_buddy_id=str(buddy.id),
            badges=[
                Badge(badge_id="first_step", name="First Step", icon="🚀"),
            ],
            is_active="active"
        )
    )
    await patient2.insert()

    # 6. Third patient, completed the program
    patient3 = User(
        phone="0501234569",
        telegram_id="123456791",
        username="Yossi Cohen",
        password_hash="hashed_password",
        role="patient",
        patient_data=PatientData(
            clean_since=datetime.utcnow() - timedelta(days=265),
            assigned_therapist_id=str(therapist.id),
            badges=[
                Badge(badge_id="first_step", name="First Step", icon="🚀"),
                Badge(badge_id="one_month", name="One Month Clean", icon="🏅", awarded_at=datetime.utcnow() - timedelta(days=235)),
                Badge(badge_id="six_months", name="Six Months Clean", icon="🏆", awarded_at=datetime.utcnow() - timedelta(days=85)),
            ],
            is_active="completed"
        )
    )
    await patient3.insert()

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

    print("📈 Creating 7-day mood history for the sentiment trend chart...")
    # Patient 1 (Tomer): gradually improving mood over the last week
    tomer_daily_sentiments = ["negative", "neutral", "neutral", "positive", "positive", "supportive", "positive"]
    tomer_history = Session(
        patient_id=str(patient.id),
        helper_id=str(therapist.id),
        status="closed",
        messages=[
            Message(
                sender="patient",
                text=f"Daily check-in, day {i + 1}",
                sentiment=sentiment,
                timestamp=datetime.utcnow() - timedelta(days=6 - i, hours=2)
            )
            for i, sentiment in enumerate(tomer_daily_sentiments)
        ],
        closed_at=datetime.utcnow() - timedelta(days=1)
    )
    await tomer_history.insert()

    # Patient 2 (Noa): declining mood over the last week -> high-risk flag
    noa_daily_sentiments = ["positive", "neutral", "neutral", "negative", "negative", "high_risk", "high_risk"]
    noa_history = Session(
        patient_id=str(patient2.id),
        helper_id=str(therapist.id),
        status="active",
        messages=[
            Message(
                sender="patient",
                text=f"Daily check-in, day {i + 1}",
                sentiment=sentiment,
                timestamp=datetime.utcnow() - timedelta(days=6 - i, hours=3)
            )
            for i, sentiment in enumerate(noa_daily_sentiments)
        ],
        ai_summary="Noa's mood has been trending downward over the past three days, with rising mentions of stress and isolation."
    )
    await noa_history.insert()

    print("🗂️ Creating an initial audit log entry...")
    await AuditLog(
        action="user_approved",
        actor_id=str(admin.id),
        actor_name=admin.username,
        target_id=str(therapist.id),
        target_name=therapist.username,
        details="Therapist account approved during database seeding."
    ).insert()

    print("🎉 Database successfully seeded with awesome demo data!")

if __name__ == "__main__":
    # Run the script asynchronously
    asyncio.run(seed_data())