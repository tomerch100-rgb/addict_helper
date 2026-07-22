import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from service.telegram_service import dp
# כאן תייבא את החיבור שלך למונגו ואת פונקציית האימות שלך
# או: from auth.jwt import get_current_user

router = APIRouter(
    prefix="/api/v1/users",
    tags=["users"]
)

@router.post("/generate-telegram-token")
async def generate_telegram_token(current_user: dict = Depends(get_current_user)):
    """
    מייצר אסימון זמני לחיבור הטלגרם, שומר אותו במונגו
    מחזיר לאתר (React) את הקישור המוכן לטלגרם עם האסימון בפנים
    """
    # 1. יצירת אסימון אקראי ומאובטח (מחרוזת של 16 תווים היקסדצימליים)
    token = secrets.token_hex(16)
    
    # 2. עדכון מסד הנתונים (MongoDB)
    # אנחנו מוצאים את המשתמש לפי ה-ID שלו, ושותלים לו את הטוקן
    user_id = current_user.get("_id") # או ID לפי המבנה שלך
    
    # פקודת העדכון של מונגו (השתמש בדרייבר שלך - motor / pymongo)
    result = await db_collection.update_one(
        {"_id": user_id},
        {"$set": {"telegram_connect_token": token}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="לא הצלחנו לייצר אסימון במערכת"
        )
    
    # 3. בניית הקישור העמוק (Deep Link) שה-React יקבל
    # תחליף את TomerTherapyBot בשם המשתמש של הבוט שלך (בלי ה-@)
    bot_username = "TomerTherapyBot" 
    telegram_url = f"https://t.me/{bot_username}?start={token}"
    
    # נחזיר ל-React את הקישור ישירות, כדי שהוא פשוט יפתח אותו בכפתור
    return {"telegram_url": telegram_url}