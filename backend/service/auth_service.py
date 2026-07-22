from classes.schema import UserRegister, UserLogin
from classes.CRUD import check_user_exists, create_user, authenticate_user

async def user_register(user_data: UserRegister):
    """
    Handles the registration logic.
    Returns the created User if successful, or None if the username or phone already exists.
    """
    exist = await check_user_exists(user_data.username, user_data.phone) 
    if exist:
        return None

    new_user = await create_user(user_data)
    return new_user

async def user_login(user_data: UserLogin):
    """
    Handles the login logic.
    Returns the User if authentication is successful, or None otherwise.
    """
    user = await authenticate_user(user_data)
    return user



