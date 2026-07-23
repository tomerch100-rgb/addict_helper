from contextlib import asynccontextmanager
from fastapi import FastAPI
import contextlib
from fastapi.middleware.cors import CORSMiddleware 
from routers.auth_router import router as auth_router
from routers.usersUploadFile import router as users_router
from routers.telegram.telegram_router import router as telegram_router
from routers.addict_routers.dashbord_addict import router as patients_router
from routers.admin_routers.dashbord_admin import router as admin_router
from routers.therapist_routers.dashbord_therapist import router as therapist_router
from routers.telegram.telegram_connect import router as telegram_connect_router

from DB.db import init_db


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="CleanSlate API",
    lifespan=lifespan
    )

origins = [
    "http://localhost:5175", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)


app.include_router(auth_router) 
app.include_router(users_router)
app.include_router(patients_router)
app.include_router(admin_router)
app.include_router(therapist_router)
app.include_router(telegram_router)
app.include_router(telegram_connect_router)
