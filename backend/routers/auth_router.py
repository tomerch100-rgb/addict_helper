from fastapi import APIRouter, HTTPException, status, Response ,Depends
from classes.schema import UserRegister, UserLogin
from service import auth_service as auth
from DB.models.User import User
from core.security import get_current_user_id
from core.security import create_token

router = APIRouter(
   prefix="/auth",
   tags=["auth"]
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
   new_user = await auth.user_register(user_data)
   if new_user is None:
      raise HTTPException(
         status_code=status.HTTP_400_BAD_REQUEST,
         detail="Username or phone number already exists"
      )
   
   return {"message": "User created successfully", "user_id": str(new_user.id)}

@router.post("/login")
async def login_user(user_data: UserLogin, response: Response):
   user = await auth.user_login(user_data)
   if user is None:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
   
   if user.role == "therapist" and not user.is_approved:
       raise HTTPException(
           status_code=status.HTTP_403_FORBIDDEN,
           detail="Your account is pending admin approval."
       )
   
   access_token = create_token(str(user.id), user.role)
   
   response.set_cookie(
        key="my_access_token",
        value=access_token,
        httponly=True,   
        samesite="lax",
        secure=False
    )

   return {
        "user_id": str(user.id),
        "username": user.username,
        "role" : user.role,
        "phone": user.phone
    }

@router.get("/me", status_code=status.HTTP_200_OK)
async def get_me(user_data: tuple = Depends(get_current_user_id)):
    user_id, role = user_data
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": str(user.id),
        "username": user.username,
        "role": user.role,
        "phone": user.phone,
        "telegram_id": getattr(user, "telegram_id", None)
    }

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """
    Clear the auth cookie and end the session.
    """
    response.delete_cookie(
        key="my_access_token",
        httponly=True,
        samesite="none",  
        secure=True,
    )
    return {"message": "Logged out successfully"}