from typing import Optional
from DB.models.User import User, PatientData
from classes.schema import UserRegister, UserLogin
from core.security import hash_password as get_password_hash, verify_password

async def check_user_exists(username: str, phone: str) -> bool:
    """
    Checks if a user with the given username or phone already exists in the database.
    """
    user = await User.find_one({
        "$or": [
            {"username": username},
            {"phone": phone}
        ]
    })
    return user is not None


async def create_user(user_data: UserRegister) -> User:
    """
    Creates a new user document.
    Encrypts the password using core.security.hash_password.
    If the role is 'patient', initializes an empty PatientData object (with active status).
    Saves and returns the new user.
    """
    hashed_password = get_password_hash(user_data.password)
    
    patient_data = None
    is_approved = False
    if user_data.role == "patient":
        is_approved = True
        patient_data = PatientData(
            badges=[],
            status="active"
        )
        
    new_user = User(
        username=user_data.username,
        phone=user_data.phone,
        password_hash=hashed_password,
        telegram_id=user_data.telegram_id,
        role=user_data.role,
        is_approved=is_approved,
        patient_data=patient_data
    )
    
    await new_user.insert()
    return new_user

async def authenticate_user(user_login: UserLogin) -> Optional[User]:
    """
    Authenticates a user by matching their username and verifying the plaintext password
    against the stored password_hash.
    """
    user = await User.find_one({"username": user_login.username})
    if not user:
        return None
        
    if not verify_password(user.password_hash, user_login.password):
        return None
        
    return user
