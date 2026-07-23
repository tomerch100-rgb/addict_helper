from aiogram import Bot, Dispatcher, Router, types
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import Message
import os
import logging
from dotenv import load_dotenv

# ייבוא מחלקת המשתמש הנכונה
from DB.models.User import User

load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
if not TELEGRAM_TOKEN:
    raise ValueError("TELEGRAM_TOKEN environment variable is not set")

bot = Bot(token=TELEGRAM_TOKEN)
dp = Dispatcher()
bot_router = Router()

@bot_router.message(CommandStart())
async def command_start_handler(message: Message, command: CommandObject) -> None:
    token = command.args
    if token:
        # חיפוש המשתמש וקישור לחשבון
        user = await User.find_one(User.telegram_connect_token == token)
        if user:
            if message.from_user:
                user.telegram_id = str(message.from_user.id)
                user.telegram_connect_token = None  # איפוס הטוקן לאחר חיבור מוצלח
                await user.save()
                await message.answer(f"היי {user.username}, החיבור לטלגרם בוצע בהצלחה! 🎉")
            else:
                await message.answer("לא הצלחנו לזהות את פרטי המשתמש שלך בטלגרם.")
            return
            
    user_name = message.from_user.full_name if message.from_user else "שם"
    await message.answer(f"היי {user_name}, לא נמצא טוקן חיבור תקין.")

dp.include_router(bot_router)
