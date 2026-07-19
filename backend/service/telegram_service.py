from  aiogram import Bot,Dispatcher,Router,types
from aiogram.filters import CommandStart
from aiogram.types import Message
import os
import logging
from dotenv import load_dotenv

load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
if not TELEGRAM_TOKEN:
    raise ValueError("TELEGRAM_TOKEN environment variable is not set")

bot = Bot(token=TELEGRAM_TOKEN)

dp = Dispatcher()





