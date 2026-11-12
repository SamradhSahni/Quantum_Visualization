"""
Administrator Security Console Router (/api/admin)
Strictly requires authenticated `admin` role + HMAC CSRF on mutations.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.dependencies import record_audit_event, require_admin, verify_hmac_csrf
from backend.app.core.rate_limiter import extract_client_ip
from backend.app.core.settings import get_settings
from backend.app.db.database import get_db_session
from backend.app.db.models import RefreshToken, SecurityAuditLog, User, UserArtifact

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


class AdminUserUpdateRequest(BaseModel):
    role: Optional[Literal["viewer", "researcher", "admin"]] = None
    is_active: Optional[bool] = None
    reset_lockout: bool = False


def _user_admin_view(u: User) -> Dict[str, Any]:
    return {
        "id": u.id,
        "email": u.email,
        "name": u.name,
        "role": u.role,
        "is_active": bool(u.is_active),
        "token_version": int(u.token_version),
        "failed_login_attempts": int(u.failed_login_attempts),
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }


@router.get("/overview")
async def get_admin_overview(
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    settings = get_settings()
    total_users = await db.scalar(select(func.count(User.id))) or 0
    active_admins = (
        await db.scalar(
            select(func.count(User.id)).where(User.role == "admin", User.is_active.is_(True))
        )
        or 0
    )
    active_sessions = (
        await db.scalar(select(func.count(RefreshToken.id)).where(RefreshToken.revoked_at.is_(None)))
        or 0
    )
    total_artifacts = await db.scalar(select(func.count(UserArtifact.id))) or 0
    total_audit_events = await db.scalar(select(func.count(SecurityAuditLog.id))) or 0

    return {
        "status": "success",
        "environment": settings.environment,
        "cookie_secure": bool(settings.cookie_secure),
        "metrics": {
            "total_users": total_users,
            "active_admins": active_admins,
            "active_refresh_sessions": active_sessions,
            "total_artifacts": total_artifacts,
            "total_audit_events": total_audit_events,
        },
    }


@router.get("/users")
async def list_users(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    rows = (
        await db.scalars(
            select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
        )
    ).all()
    return {"status": "success", "users": [_user_admin_view(u) for u in rows]}


@router.patch("/users/{target_user_id}", dependencies=[Depends(verify_hmac_csrf)])
async def update_user_account(
    target_user_id: str,
    req: AdminUserUpdateRequest,
    request: Request,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    target = await db.scalar(select(User).where(User.id == target_user_id))
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    active_admins = (
        await db.scalar(
            select(func.count(User.id)).where(User.role == "admin", User.is_active.is_(True))
        )
        or 0
    )

    removing_last_admin_priv = target.role == "admin" and target.is_active and (
        (req.role is not None and req.role != "admin") or (req.is_active is False)
    )
    if removing_last_admin_priv and active_admins <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote or deactivate the last active platform administrator.",
        )

    if target.id == admin_user.id and req.role is not None and req.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot self-demote.",
        )

    changes = []
    invalidate_sessions = False

    if req.role is not None and req.role != target.role:
        changes.append(f"role:{target.role}->{req.role}")
        target.role = req.role
        invalidate_sessions = True

    if req.is_active is not None and req.is_active != target.is_active:
        changes.append(f"is_active:{target.is_active}->{req.is_active}")
        target.is_active = req.is_active
        invalidate_sessions = True

    if req.reset_lockout:
        changes.append("reset_lockout")
        target.failed_login_attempts = 0
        target.last_failed_at = None

    if invalidate_sessions:
        target.token_version = int(target.token_version) + 1
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == target.id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(timezone.utc))
        )

    await db.commit()
    await db.refresh(target)

    await record_audit_event(
        db,
        event_type="ADMIN_USER_UPDATE",
        outcome="allow",
        actor_user_id=admin_user.id,
        ip_address=extract_client_ip(request),
        request_id=getattr(request.state, "request_id", ""),
        target_resource=f"/api/admin/users/{target.id}",
        detail=", ".join(changes) if changes else "no-op",
    )
    return {"status": "success", "user": _user_admin_view(target)}


@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    event_type: Optional[str] = Query(default=None, max_length=48),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    stmt = select(SecurityAuditLog)
    if event_type:
        stmt = stmt.where(SecurityAuditLog.event_type == event_type)
    stmt = stmt.order_by(SecurityAuditLog.id.desc()).limit(limit)
    rows = (await db.scalars(stmt)).all()
    return {
        "status": "success",
        "logs": [
            {
                "id": r.id,
                "actor_user_id": r.actor_user_id,
                "event_type": r.event_type,
                "ip_address": r.ip_address,
                "request_id": r.request_id,
                "target_resource": r.target_resource,
                "outcome": r.outcome,
                "detail": r.detail,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ],
    }

