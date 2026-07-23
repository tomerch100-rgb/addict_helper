import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from core.security import get_current_user_id
from DB.models.User import User

router = APIRouter(
    prefix="/api/telegram",
    tags=["users"]
)

@router.post("/generate-telegram-token")
async def generate_telegram_token(current_user: tuple = Depends(get_current_user_id)):
    token = secrets.token_hex(16)

    user_id, role = current_user
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")
    
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")

    user.telegram_connect_token = token
    await user.save()    

    bot_username = "clean_slate_tomers_bot"
    telegram_url = f"https://t.me/{bot_username}?start={token}"
    
    return {"telegram_url": telegram_url}