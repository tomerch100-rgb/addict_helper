# backend/routers/therapist_routers/dashbord_therapist.py
from collections import defaultdict
from datetime import datetime, timedelta, UTC
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from beanie.operators import In

from DB.models.User import User
from DB.models.session import Session, Message
from core.security import require_therapist
from classes.sentiment import sentiment_to_score

router = APIRouter(prefix="/therapist", tags=["Therapist Dashboard"])


async def get_current_therapist(user_data=Depends(require_therapist)) -> User:
    user_id, _role = user_data
    therapist = await User.get(user_id)
    if not therapist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Therapist not found")
    return therapist


async def _get_assigned_patients(therapist_id: str) -> List[User]:
    return await User.find(
        User.role == "patient",
        User.patient_data.assigned_therapist_id == therapist_id
    ).to_list()


def _messages_for_patient(sessions: List[Session], patient_id: str) -> List[Message]:
    messages: List[Message] = []
    for s in sessions:
        if s.patient_id == patient_id:
            messages.extend(s.messages)
    messages.sort(key=lambda m: m.timestamp)
    return messages


def _status_label(patient: User, has_active_sos: bool) -> str:
    if has_active_sos:
        return "SOS Active"
    base = (patient.patient_data.is_active if patient.patient_data else "active") or "active"
    return {
        "active": "Active",
        "completed": "Completed",
        "relapsed": "Relapsed",
    }.get(base, base.capitalize())


def _mood_trend(scores: List[int]) -> str:
    if len(scores) < 2:
        return "stable"
    recent = scores[-3:]
    if len(recent) < 2:
        return "stable"
    delta = recent[-1] - recent[0]
    if delta >= 10:
        return "improving"
    if delta <= -10:
        return "declining"
    return "stable"


class PatientSummary(BaseModel):
    patient_id: str
    name: str
    status: str
    clean_days: int
    last_contact: Optional[datetime]
    mood_trend: str
    badges_count: int


class AIInsight(BaseModel):
    type: str
    patient_id: str
    patient_name: str
    message: str


class DashboardSummary(BaseModel):
    active_patients: int
    high_risk_patients: int
    active_sos: int
    success_rate: float
    ai_insights: List[AIInsight]


class CrisisEvent(BaseModel):
    type: str
    patient_id: str
    patient_name: str
    message: str
    timestamp: datetime


class PatientFileResponse(BaseModel):
    patient_id: str
    name: str
    status: str
    clean_days: int
    is_sos: bool
    active_session_id: Optional[str]
    ai_summary: Optional[str]
    messages: List[Message]


@router.get("/me/summary", response_model=DashboardSummary)
async def get_dashboard_summary(therapist: User = Depends(get_current_therapist)):
    patients = await _get_assigned_patients(str(therapist.id))
    patient_ids = [str(p.id) for p in patients]
    sessions = await Session.find(In(Session.patient_id, patient_ids)).to_list() if patient_ids else []

    active_patients = sum(1 for p in patients if (p.patient_data.is_active if p.patient_data else "active") == "active")
    active_sos = sum(1 for s in sessions if s.is_sos and s.status == "active")

    completed = sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "completed")
    relapsed = sum(1 for p in patients if p.patient_data and p.patient_data.is_active == "relapsed")
    finished = completed + relapsed
    success_rate = round((completed / finished) * 100, 1) if finished else 0.0

    high_risk_patients = 0
    ai_insights: List[AIInsight] = []
    now = datetime.now(UTC)

    for p in patients:
        p_messages = _messages_for_patient(sessions, str(p.id))
        scores = [sentiment_to_score(m.sentiment) for m in p_messages]
        trend = _mood_trend(scores)
        last_msg = p_messages[-1] if p_messages else None

        if scores and scores[-1] <= 30:
            high_risk_patients += 1
            ai_insights.append(AIInsight(
                type="high_risk_flag",
                patient_id=str(p.id),
                patient_name=p.username,
                message=f"Negative sentiment trend detected in recent check-ins for {p.username}."
            ))
        elif trend == "improving":
            ai_insights.append(AIInsight(
                type="positive_trend",
                patient_id=str(p.id),
                patient_name=p.username,
                message=f"Consistent positive language patterns for {p.username} over the last few check-ins."
            ))

        if last_msg:
            last_ts = last_msg.timestamp if last_msg.timestamp.tzinfo else last_msg.timestamp.replace(tzinfo=UTC)
            if (now - last_ts) > timedelta(days=3):
                ai_insights.append(AIInsight(
                    type="low_engagement",
                    patient_id=str(p.id),
                    patient_name=p.username,
                    message=f"No interaction from {p.username} in over 3 days."
                ))

    return DashboardSummary(
        active_patients=active_patients,
        high_risk_patients=high_risk_patients,
        active_sos=active_sos,
        success_rate=success_rate,
        ai_insights=ai_insights
    )


@router.get("/me/patients", response_model=List[PatientSummary])
async def get_assigned_patients(therapist: User = Depends(get_current_therapist)):
    patients = await _get_assigned_patients(str(therapist.id))
    patient_ids = [str(p.id) for p in patients]
    sessions = await Session.find(In(Session.patient_id, patient_ids)).to_list() if patient_ids else []

    result = []
    now = datetime.now(UTC)
    for p in patients:
        p_messages = _messages_for_patient(sessions, str(p.id))
        scores = [sentiment_to_score(m.sentiment) for m in p_messages]
        has_active_sos = any(s.patient_id == str(p.id) and s.is_sos and s.status == "active" for s in sessions)

        clean_days = 0
        if p.patient_data and p.patient_data.clean_since:
            clean_since = p.patient_data.clean_since
            clean_since = clean_since if clean_since.tzinfo else clean_since.replace(tzinfo=UTC)
            clean_days = max(0, (now - clean_since).days)

        result.append(PatientSummary(
            patient_id=str(p.id),
            name=p.username,
            status=_status_label(p, has_active_sos),
            clean_days=clean_days,
            last_contact=p_messages[-1].timestamp if p_messages else None,
            mood_trend=_mood_trend(scores),
            badges_count=len(p.patient_data.badges) if p.patient_data else 0
        ))

    result.sort(key=lambda r: (r.status != "SOS Active", r.last_contact or datetime.min.replace(tzinfo=UTC)), reverse=False)
    return result


@router.get("/me/crisis-timeline", response_model=List[CrisisEvent])
async def get_crisis_timeline(therapist: User = Depends(get_current_therapist)):
    patients = await _get_assigned_patients(str(therapist.id))
    patients_by_id = {str(p.id): p for p in patients}
    patient_ids = list(patients_by_id.keys())
    if not patient_ids:
        return []

    sos_sessions = await Session.find(
        In(Session.patient_id, patient_ids),
        Session.is_sos == True  # noqa: E712
    ).sort(-Session.created_at).limit(20).to_list()

    events: List[CrisisEvent] = []
    for s in sos_sessions:
        patient = patients_by_id.get(s.patient_id)
        patient_name = patient.username if patient else "Unknown patient"
        trigger_msg = s.messages[0].text if s.messages else "SOS triggered"
        events.append(CrisisEvent(
            type="sos_triggered",
            patient_id=s.patient_id,
            patient_name=patient_name,
            message=trigger_msg,
            timestamp=s.created_at
        ))
        if s.status == "closed" and s.closed_at:
            events.append(CrisisEvent(
                type="resolved",
                patient_id=s.patient_id,
                patient_name=patient_name,
                message=s.ai_summary or "Session resolved.",
                timestamp=s.closed_at
            ))

    events.sort(key=lambda e: e.timestamp, reverse=True)
    return events[:20]


@router.get("/me/sentiment-trend")
async def get_sentiment_trend(days: int = 7, therapist: User = Depends(get_current_therapist)):
    patients = await _get_assigned_patients(str(therapist.id))
    patient_ids = [str(p.id) for p in patients]
    if not patient_ids:
        return {"dates": [], "average": [], "series": []}

    sessions = await Session.find(In(Session.patient_id, patient_ids)).to_list()
    since = datetime.now(UTC) - timedelta(days=days - 1)

    date_keys = [(since + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

    per_patient_daily = {str(p.id): defaultdict(list) for p in patients}
    for s in sessions:
        for m in s.messages:
            ts = m.timestamp if m.timestamp.tzinfo else m.timestamp.replace(tzinfo=UTC)
            if ts < since:
                continue
            day_key = ts.strftime("%Y-%m-%d")
            per_patient_daily.setdefault(s.patient_id, defaultdict(list))[day_key].append(sentiment_to_score(m.sentiment))

    series = []
    daily_all_scores = defaultdict(list)
    for p in patients:
        daily = per_patient_daily.get(str(p.id), {})
        scores = []
        for day in date_keys:
            day_scores = daily.get(day, [])
            avg = round(sum(day_scores) / len(day_scores), 1) if day_scores else None
            if avg is not None:
                daily_all_scores[day].append(avg)
            scores.append(avg)
        series.append({
            "patient_id": str(p.id),
            "patient_name": p.username,
            "scores": scores
        })

    average = [
        round(sum(daily_all_scores[day]) / len(daily_all_scores[day]), 1) if daily_all_scores[day] else None
        for day in date_keys
    ]

    return {"dates": date_keys, "average": average, "series": series}


@router.get("/me/patients/{patient_id}/file", response_model=PatientFileResponse)
async def get_patient_file(patient_id: str, therapist: User = Depends(get_current_therapist)):
    patient = await User.get(patient_id)
    if not patient or patient.role != "patient":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if not patient.patient_data or patient.patient_data.assigned_therapist_id != str(therapist.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This patient is not assigned to you")

    sessions = await Session.find(Session.patient_id == patient_id).sort(-Session.created_at).to_list()
    messages = _messages_for_patient(sessions, patient_id)
    active_sos_session = next((s for s in sessions if s.is_sos and s.status == "active"), None)

    now = datetime.now(UTC)
    clean_days = 0
    if patient.patient_data.clean_since:
        clean_since = patient.patient_data.clean_since
        clean_since = clean_since if clean_since.tzinfo else clean_since.replace(tzinfo=UTC)
        clean_days = max(0, (now - clean_since).days)

    return PatientFileResponse(
        patient_id=patient_id,
        name=patient.username,
        status=_status_label(patient, active_sos_session is not None),
        clean_days=clean_days,
        is_sos=active_sos_session is not None,
        active_session_id=str(active_sos_session.id) if active_sos_session else None,
        ai_summary=(active_sos_session.ai_summary if active_sos_session else (sessions[0].ai_summary if sessions else None)),
        messages=messages[-50:]
    )


@router.post("/me/sessions/{session_id}/resolve")
async def resolve_session(session_id: str, therapist: User = Depends(get_current_therapist)):
    session = await Session.get(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    patient = await User.get(session.patient_id)
    if not patient or not patient.patient_data or patient.patient_data.assigned_therapist_id != str(therapist.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This session is not assigned to you")

    session.status = "closed"
    session.closed_at = datetime.now(UTC)
    await session.save()

    return {"status": "resolved", "session_id": session_id, "resolved_at": session.closed_at}
