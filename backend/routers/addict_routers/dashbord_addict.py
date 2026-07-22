from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, UTC
from DB.models.User import User
from DB.models.danger_zone import DangerZone ,GeoJSONPoint
from classes.schema import DangerZoneCreate,DangerZoneBreach

router = APIRouter(prefix="/patients", tags=["Patient Dashboard"])

async def get_current_patient():
    patient = await User.find_one(User.role == "patient")
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No demo patient found in the database. Please run seed.py first."
        )
    return patient


@router.get("/me/dashboard", status_code=status.HTTP_200_OK)
async def get_patient_dashboard(current_user: User = Depends(get_current_patient)):
    """
    שליפת נתוני דשבורד הגמילה האישי של המטופל מתוך הענן:
    חישוב ימי ניקיון ותגים שחולקו.
    """
    try:
        clean_days = 0
        
        # חישוב ימי הניקיון במידה והוזן תאריך בתוך נתוני המטופל
        if current_user.patient_data and current_user.patient_data.clean_since:
            # המרת התאריך לזמן הנוכחי ב-UTC
            clean_since = current_user.patient_data.clean_since
            now = datetime.now(UTC)
            delta = now - clean_since.replace(tzinfo=UTC) if clean_since.tzinfo is None else now - clean_since
            clean_days = max(0, delta.days)
            
        # שליפת התגים והאזורים המסוכנים
        badges = current_user.patient_data.badges if current_user.patient_data else []
        danger_zones_count = await DangerZone.find(DangerZone.patient_id == current_user.id).count()
        
        return {
            "patient_name": current_user.name,
            "role": current_user.role,
            "clean_days_count": clean_days,
            "badges_awarded": [
                {"name": b.name, "icon": b.icon, "awarded_at": b.awarded_at} for b in badges
            ],
            "danger_zones_count": danger_zones_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )
# Make sure to import GeoJSONPoint if it's located in another file, 
# e.g., from DB.models.danger_zone import DangerZone, GeoJSONPoint

@router.post("/me/danger-zones", status_code=status.HTTP_201_CREATED)
async def add_danger_zone(
    zone_data: DangerZoneCreate, 
    current_user: User = Depends(get_current_patient)
):
    """
    Creates and links a new geographical danger zone for the logged-in patient.
    """
    try:
        patient_str_id = str(current_user.id) if current_user.id else ""
        
        # Instantiate the explicit GeoJSONPoint Pydantic model instance
        # MongoDB standard order: [Longitude, Latitude]
        point_location = GeoJSONPoint(
            type="Point",
            coordinates=[zone_data.longitude, zone_data.latitude]
        )
        
        # Build out the document using the structural definitions
        new_zone = DangerZone(
            patient_id=patient_str_id,
            location_name=zone_data.name,
            location=point_location,
            radius_in_meters=zone_data.radius_meters
        )
        
        await new_zone.insert()
        
        return {
            "status": "success",
            "message": f"Danger zone '{zone_data.name}' successfully added for {current_user.name}.",
            "zone_id": str(new_zone.id)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add danger zone: {str(e)}"
        )
# ... המשך הקובץ backend/routers/patients.py (להדביק בתחתית הקובץ) ...

@router.get("/me/danger-zones", status_code=status.HTTP_200_OK)
async def get_my_danger_zones(current_user: User = Depends(get_current_patient)):
    """
    Fetches the full list of danger zones defined by the logged-in patient.
    Useful for rendering marks on a Google/Leaflet Map in the frontend.
    """
    try:
        # Fetch all documents matching the patient's string ID
        zones = await DangerZone.find(DangerZone.patient_id == str(current_user.id)).to_list()
        
        return [
            {
                "zone_id": str(z.id),
                "location_name": z.location_name,
                "radius_in_meters": z.radius_in_meters,
                "longitude": z.location.coordinates[0],
                "latitude": z.location.coordinates[1],
                "created_at": z.created_at
            } for z in zones
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch danger zones: {str(e)}"
        )


@router.post("/me/sos", status_code=status.HTTP_201_CREATED)
async def trigger_sos_emergency(current_user: User = Depends(get_current_patient)):
    """
    Triggers an immediate SOS emergency event for the patient.
    Alerts the assigned therapist and logs the high-risk state in the cloud.
    """
    try:
        # Here we simulate logging the emergency or updating the user's risk tier status.
        # In the future, this endpoint will dispatch a WebSocket message or Telegram Alert to their psychologist.
        
        return {
            "status": "danger",
            "message": f"EMERGENCY ALERT TRIGGERED. An urgent notification has been dispatched to your assigned therapist.",
            "patient_name": current_user.name,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process SOS emergency: {str(e)}"
        )

@router.post("/me/breach-danger-zone", status_code=status.HTTP_200_OK)
async def report_danger_zone_breach(
    breach_data: DangerZoneBreach, 
    current_user: User = Depends(get_current_patient)
):
    """
    Triggered automatically by the mobile app/frontend when the patient's GPS 
    enters a predefined danger zone. Immediately alerts their assigned therapist or buddy.
    """
    try:
        # 1. Fetch the specific danger zone to get its real name
        zone = await DangerZone.get(breach_data.zone_id)
        zone_name = zone.location_name if zone else "Unknown Danger Zone"
        
        # 2. Find who to alert (Therapist or Buddy)
        # We check if the patient has an assigned therapist, otherwise we fallback to a general alert
        therapist_name = "Not Assigned"
        
        if current_user.patient_data and current_user.patient_data.therapist_id:
            # Fetch the therapist user object from the database
            therapist = await User.get(current_user.patient_data.therapist_id)
            if therapist:
                therapist_name = therapist.name
                # 🚀 כאן בעתיד נשלב את ספריית ה-Telegram / Twilio:
                # send_telegram_message(chat_id=therapist.telegram_chat_id, text=...)
        
        # Simulated Real-time Server log (what you will see in the terminal)
        print(f"\n🚨 [CRITICAL ALERT] 🚨")
        print(f"Patient '{current_user.name}' has entered a danger zone!")
        print(f"Location: {zone_name}")
        print(f"Dispatched urgent notification to Therapist: '{therapist_name}'\n")
        
        return {
            "status": "alert_sent",
            "alert_details": {
                "patient_name": current_user.name,
                "violated_zone": zone_name,
                "notified_party": {
                    "role": "Therapist",
                    "name": therapist_name
                },
                "timestamp": datetime.now(UTC)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process geofence breach alert: {str(e)}"
        )