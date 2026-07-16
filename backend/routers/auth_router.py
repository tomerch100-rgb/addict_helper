from multiprocessing import resource_sharer
from fastapi import APIRouter, HTTPException, status,Response
from service import auth_service as auth
from classes.schema import UserRegister, UserLogin
from classes.CRUD import authenticate_user
from core.security import create_token

router = APIRouter(
   prefix="/auth",
   tags=["auth"]
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
   check = await auth.user_register(user_data)
   if check is None:
      raise HTTPException(
         status_code=status.HTTP_400_BAD_REQUEST,
         detail="the register cannot be completed"
      )
   return {"message": "User created successfully", "user_id": str(check.id)}


@router.post("/login")
async def login_user(user_data: UserLogin,response: Response):
   user = await authenticate_user(user_data)
   if user is None:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="the username or password is not correct"
        )
   
   access_token = create_token(str(user.id),user.role)
   
   response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,   
        samesite="lax",
        secure=False
    )

   return {
        "user_id": str(user.id),
          "username": user.username,
          "role" : user.role
    }