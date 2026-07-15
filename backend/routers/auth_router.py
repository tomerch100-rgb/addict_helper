from requests import status_codes
from fastapi import APIRouter, Depends, HTTPException , status
from service import auth_service as auth
from classes.schema import UserRegister,UserLogin
from classes.CRUD import authenticate_user
from core.security import create_token

from core.security import RoleChecker

router = APIRouter(
   prefix="/auth",
   tags=["auth"]
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register (user_data : UserRegister ) :
   check = await auth.user_register (user_data)
   if check is None :
      raise HTTPException(
         status_code=status.HTTP_400_BAD_REQUEST,
         detail="the register canot be able"
      )
   return check


@router.post("/login")
async def login_user (user_data : UserLogin) :
   user = await authenticate_user (user_data)
   if user is None :
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="the username or password dont correct"
        )
   access_token = create_token(user_id=user.id, role=user.role)
   return {"access_token": access_token, "token_type": "bearer"}





