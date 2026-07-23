from datetime import datetime, timedelta, UTC
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from DB.models.User import User
from DB.models.session import Session
from DB.models.audit_log import AuditLog
from core.security import require_admin, get_current_user_id

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
async def approve_user(user_id: str, admin_data=Depends(get_current_user_id)):
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

    admin_id, _role = admin_data
    admin = await User.get(admin_id)
    await AuditLog(
        action="user_approved",
        actor_id=admin_id,
        actor_name=admin.username if admin else None,
        target_id=str(user.id),
        target_name=user.username,
        details=f"Approved {user.role} registration"
    ).insert()

    return {"message": f"User {user.username} has been approved successfully."}


class AdminStatsResponse(BaseModel):
    total_patients: int
    success_rate: float
    relapse_rate: float
    avg_sos_response_minutes: Optional[float]
    active_cases: int


class TrendPoint(BaseModel):
    period: str
    success: int
    relapse: int


class OutcomeBreakdown(BaseModel):
    active: int
    completed: int
    relapsed: int


class EmergencyFeedItem(BaseModel):
    session_id: str
    patient_id: str
    patient_name: str
    status: str
    triggered_at: datetime
    last_message: Optional[str]


class AuditLogResponse(BaseModel):
    id: str
    action: str
    actor_name: Optional[str]
    target_name: Optional[str]
    details: Optional[str]
    created_at: datetime


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats():
    """
    Global success/relapse/response-time analytics across every patient in the system.
    """
    patients = await User.find(User.role == "patient").to_list()
    total_patients = len(patients)

    active_cases = sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "active")
    completed = sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "completed")
    relapsed = sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "relapsed")
    finished = completed + relapsed

    success_rate = round((completed / finished) * 100, 1) if finished else 0.0
    relapse_rate = round((relapsed / finished) * 100, 1) if finished else 0.0

    sos_sessions = await Session.find(Session.is_sos == True).to_list()  # noqa: E712
    response_times = []
    for s in sos_sessions:
        if len(s.messages) >= 2:
            first_response = next((m for m in s.messages[1:] if m.sender != s.messages[0].sender), None)
            if first_response:
                delta = first_response.timestamp - s.messages[0].timestamp
                response_times.append(delta.total_seconds() / 60)

    avg_response = round(sum(response_times) / len(response_times), 1) if response_times else None

    return AdminStatsResponse(
        total_patients=total_patients,
        success_rate=success_rate,
        relapse_rate=relapse_rate,
        avg_sos_response_minutes=avg_response,
        active_cases=active_cases
    )


@router.get("/analytics/success-relapse-trend", response_model=List[TrendPoint])
async def get_success_relapse_trend(weeks: int = 6):
    """
    Weekly count of patients who completed the program vs. relapsed, based on
    when their status last changed (created_at is used as a stand-in until
    a dedicated status-history log exists).
    """
    patients = await User.find(User.role == "patient").to_list()
    now = datetime.now(UTC)
    buckets: List[TrendPoint] = []

    for week_index in range(weeks - 1, -1, -1):
        week_start = now - timedelta(weeks=week_index + 1)
        week_end = now - timedelta(weeks=week_index)
        success = 0
        relapse = 0
        for p in patients:
            created = p.created_at if p.created_at.tzinfo else p.created_at.replace(tzinfo=UTC)
            if week_start <= created < week_end:
                if p.patient_data and p.patient_data.is_active == "completed":
                    success += 1
                elif p.patient_data and p.patient_data.is_active == "relapsed":
                    relapse += 1
        buckets.append(TrendPoint(
            period=week_start.strftime("%b %d"),
            success=success,
            relapse=relapse
        ))

    return buckets


@router.get("/patient-outcomes", response_model=OutcomeBreakdown)
async def get_patient_outcomes():
    patients = await User.find(User.role == "patient").to_list()
    return OutcomeBreakdown(
        active=sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "active"),
        completed=sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "completed"),
        relapsed=sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "relapsed"),
    )


@router.get("/emergency-feed", response_model=List[EmergencyFeedItem])
async def get_emergency_feed():
    """
    Active SOS sessions across the whole platform, most recent first.
    """
    active_sos = await Session.find(
        Session.is_sos == True,  # noqa: E712
        Session.status == "active"
    ).sort(-Session.created_at).to_list()

    items = []
    for s in active_sos:
        patient = await User.get(s.patient_id)
        items.append(EmergencyFeedItem(
            session_id=str(s.id),
            patient_id=s.patient_id,
            patient_name=patient.username if patient else "Unknown patient",
            status="active",
            triggered_at=s.created_at,
            last_message=s.messages[-1].text if s.messages else None
        ))
    return items


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(limit: int = 25):
    logs = await AuditLog.find_all().sort(-AuditLog.created_at).limit(limit).to_list()
    return [
        AuditLogResponse(
            id=str(log.id),
            action=log.action,
            actor_name=log.actor_name,
            target_name=log.target_name,
            details=log.details,
            created_at=log.created_at
        )
        for log in logs
    ]
