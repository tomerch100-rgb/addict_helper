from .models import  User 
from .schema import UserRegister

async def check_user_exists(email: str, username: str) -> bool:
    user = await User.find_one(
        (User.email == email) | (User.username == username)
    )
    if user:
        return True
    else:
        return False

async def create_user(user_data: UserRegister, hashed_password: str) -> User:
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password=hashed_password,
        phone=str(user_data.phone),
        role=user_data.role,
        telegram_id = None
          )  
    await new_user.insert()
    return new_user