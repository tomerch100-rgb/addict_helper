from fastapi import APIRouter, Depends, HTTPException
from core.security import RoleChecker

router = APIRouter(
   prefix="/auth",
   tags=["Geography"]
)


