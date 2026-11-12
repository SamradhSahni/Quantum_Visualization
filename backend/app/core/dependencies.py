"""
FastAPI Security Dependencies:
- JWT Cookie / Bearer Resolution with Token Version & Active Account Enforcement
- Role-Based Access Control (viewer, researcher, admin)
- Cryptographic HMAC-Bound CSRF + Origin Check
- Per-User Concurrent Compute Quota Guard
"""
from __future__ import annotations

import asyncio
from typing import AsyncGenerator, Optional, Tuple

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.rate_limiter import extract_client_ip, get_user_compute_semaphore
from backend.app.core.sanitize import sanitize_text
from backend.app.core.security import (
    access_cookie_name,
    csrf_cookie_name,
    decode_access_token,
    verify_csrf_token,
)
from backend.app.core.settings import get_settings
from backend.app.db.database import get_db_session
from backend.app.db.models import SecurityAuditLog, User


async def record_audit_event(
    db: AsyncSession,
    *,
    event_type: str,
    outcome: str = "allow",
    actor_user_id: Optional[str] = None,
    ip_address: str = "unknown",
    request_id: str = "",
    target_resource: str = "",
    detail: str = "",
) -> None:
    """Persists sanitized audit log event without risking caller failure on secondary logs."""
    try:
        entry = SecurityAuditLog(
            actor_user_id=actor_user_id,
            event_type=sanitize_text(event_type, max_len=48),
            ip_address=sanitize_text(ip_address, max_len=64),
            request_id=sanitize_text(request_id, max_len=36),
            target_resource=sanitize_text(target_resource, max_len=128),
            outcome=sanitize_text(outcome, max_len=16),
            detail=sanitize_text(detail, max_len=512),
        )
        db.add(entry)
        await db.commit()
    except Exception:
        await db.rollback()


def _extract_raw_token(request: Request) -> Tuple[Optional[str], bool]:
    cookie_token = request.cookies.get(access_cookie_name())
    if cookie_token:
        return cookie_token, True
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip(), False
    return None, False


async def get_current_user_context(
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> Tuple[User, str, bool]:
    """Resolves authenticated active User, token_family, and via_cookie flag."""
    raw_token, via_cookie = _extract_raw_token(request)
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    claims = decode_access_token(raw_token)
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(claims.get("sub", ""))
    token_ver = int(claims.get("ver", -1))
    token_fam = str(claims.get("fam", ""))

    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None or not user.is_active or int(user.token_version) != token_ver:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is no longer active.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    request.state.user_id = user.id
    request.state.user_role = user.role
    request.state.token_family = token_fam
    request.state.auth_via_cookie = via_cookie
    return user, token_fam, via_cookie


async def require_user(
    ctx: Tuple[User, str, bool] = Depends(get_current_user_context),
) -> User:
    return ctx[0]


async def require_researcher(
    ctx: Tuple[User, str, bool] = Depends(get_current_user_context),
) -> User:
    user = ctx[0]
    if user.role not in ("researcher", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researcher or Administrator role is required for compute operations.",
        )
    return user


async def require_admin(
    ctx: Tuple[User, str, bool] = Depends(get_current_user_context),
) -> User:
    user = ctx[0]
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required.",
        )
    return user


def _check_allowed_origin(request: Request) -> None:
    settings = get_settings()
    origin = request.headers.get("origin", "").strip().rstrip("/")
    referer = request.headers.get("referer", "").strip()
    allowed = set(settings.cors_allowed_origins)

    if origin:
        if origin not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Untrusted request Origin.",
            )
        return

    if referer:
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        ref_origin = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
        if ref_origin not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Untrusted request Referer.",
            )


async def verify_hmac_csrf(
    request: Request,
    ctx: Tuple[User, str, bool] = Depends(get_current_user_context),
) -> None:
    """
    Enforces Origin check + HMAC-bound CSRF header verification on cookie-authenticated
    state-changing requests (POST/PUT/PATCH/DELETE).
    """
    if request.method.upper() in ("GET", "HEAD", "OPTIONS"):
        return

    _user, token_family, via_cookie = ctx
    if not via_cookie:
        # Pure Authorization: Bearer clients are not vulnerable to ambient browser CSRF
        return

    _check_allowed_origin(request)
    cookie_csrf = request.cookies.get(csrf_cookie_name(), "")
    header_csrf = request.headers.get("x-csrf-token", "")
    if not verify_csrf_token(cookie_csrf, header_csrf, token_family):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing CSRF token.",
        )


async def acquire_user_compute_slot(
    user: User = Depends(require_researcher),
) -> AsyncGenerator[User, None]:
    """Caps simultaneous in-flight heavy compute simulations per researcher (max 2)."""
    sem = get_user_compute_semaphore(user.id)
    if sem.locked():
        # Wait briefly up to 0.25s cleanly before rejecting burst overload
        try:
            await asyncio.wait_for(sem.acquire(), timeout=0.25)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many concurrent compute jobs for this account. Please wait a moment.",
            )
        try:
            yield user
        finally:
            sem.release()
        return

    async with sem:
        yield user

