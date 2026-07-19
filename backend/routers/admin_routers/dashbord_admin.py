from fastapi import APIRouter, HTTPException, Depends, status
from DB.models.User import User
from core.security import require_admin
from typing import List
from pydantic import BaseModel

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)]
)

class UserApprovalStatusResponse(BaseModel):
    id: str
    username: str
    phone: str
    role: str
    is_approved: bool

@router.get("/pending-users", response_model=List[UserApprovalStatusResponse])
async def get_pending_users():
    """
    Retrieve all professional users (therapist/buddy) waiting for approval.
    """
    users = await User.find(
        User.is_approved == False,
        User.role != "patient"
    ).to_list()
    
    return [
        UserApprovalStatusResponse(
            id=str(user.id),
            username=user.username,
            phone=user.phone,
            role=user.role,
            is_approved=user.is_approved
        )
        for user in users
    ]

@router.put("/users/{user_id}/approve")
async def approve_user(user_id: str):
    """
    Approve a professional user by setting is_approved to True.
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_approved = True
    await user.save()
    return {"message": f"User {user.username} has been approved successfully."}
