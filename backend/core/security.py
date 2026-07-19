import bcrypt
from fastapi import Depends, Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

load_dotenv()
safe = HTTPBearer(auto_error=False)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def hash_password (password)  :
    bytes_password = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(bytes_password, salt)
    return hashed.decode()

def verify_password (stored_hash,check_password) : 
    bytes_hash = stored_hash.encode('utf-8')
    bytes_password =check_password.encode('utf-8')
    return bcrypt.checkpw(bytes_password,bytes_hash)
      
def create_token (user_id,role) :
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=30)       
    payload = {
        "sub" : str(user_id),
        "exp" : expire_time ,
        "role" : role
    }
    token = jwt.encode(payload,SECRET_KEY,ALGORITHM)
    return token
    

def verify_token (token:str) :
    try :
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
def get_current_user_id (request: Request, box: HTTPAuthorizationCredentials = Depends(safe)):
    token = request.cookies.get("my_access_token")
    if not token:
        if box is None or not box.credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        token = box.credentials
    payload = verify_token(token)
    user_id = payload.get("sub")
    role =  payload.get("role")
    return user_id , role


class RoleChecker:
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles 

    def __call__(self, user_data = Depends(get_current_user_id)):
        user_id, role = user_data
        if role not in self.allowed_roles:
            raise HTTPException(status_code=403)
        return user_id, role

require_admin = RoleChecker(["admin"])
require_patient = RoleChecker(["patient"])
require_therapist = RoleChecker(["therapist"])
