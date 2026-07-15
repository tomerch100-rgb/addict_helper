from classes.schema import UserRegister,UserLogin
from classes.CRUD import check_user_exists , create_user , authenticate_user
from core.security import hash_password
async def user_register (user_data: UserRegister ) :
    exist = await check_user_exists(user_data.username , user_data.email) 
    if exist :
        return None

    hashing = hash_password(user_data.password)
    new_user = await  create_user(user_data,hashing)
    return new_user

