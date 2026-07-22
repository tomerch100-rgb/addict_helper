from fastapi import APIRouter, HTTPException, Request, Response
from aiogram.types import Update
from service.telegram_service import dp,TELEGRAM_TOKEN,bot

router = APIRouter(
   prefix="/api/v1/telegram",  
   tags=["telegram"]
)

@router.post("/webhook/{token}")
async def telegram_webhook(token:str , request: Request):

    clean_token = token.replace("%3A", ":")

    if clean_token != TELEGRAM_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")

    update_json = await request.json()
    update = Update(**update_json)

    await dp.feed_update(bot, update)
    return {"status": "ok"}