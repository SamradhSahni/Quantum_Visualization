"""
Authentication & Session Lifecycle Router (/api/auth)
- Argon2id Registration & Login with Timing-Safe Dummy Verification
- Grace-Window Refresh Token Rotation (10s parallel-tab safe, replay-theft revoking)
- Password Rotation Invalidating token_version Across All Sessions
- __Host- / HttpOnly / SameSite=Lax Cookies + HMAC-Bound CSRF Token
"""
from __future__ import annotations

import asyncio
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.dependencies import (
    _check_allowed_origin,
    record_audit_event,
    require_user,
    verify_hmac_csrf,
)
from backend.app.core.rate_limiter import (
    check_login_subnet_throttle,
    clear_login_failures_for_subnet,
    extract_client_ip,
    extract_ip_subnet_from_ip,
    record_login_failure_for_subnet,
)
from backend.app.core.sanitize import sanitize_text, validate_and_normalize_email
from backend.app.core.security import (
    access_cookie_name,
    check_needs_rehash,
    create_access_token,
    create_csrf_token,
    csrf_cookie_name,
    generate_refresh_token,
    hash_password_async,
    hash_token,
    hash_user_agent,
    refresh_cookie_name,
    validate_password_strength,
    verify_password_async,
)
from backend.app.core.settings import get_settings
from backend.app.db.database import get_db_session
from backend.app.db.models import RefreshToken, User

router = APIRouter(prefix="/api/auth", tags=["authentication"])


def _as_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _user_public_dict(user: User) -> Dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "is_active": bool(user.is_active),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def _set_auth_cookies(
    response: Response,
    *,
    access_jwt: str,
    raw_refresh: Optional[str],
    csrf_token: str,
) -> None:
    settings = get_settings()
    secure = bool(settings.cookie_secure)
    response.set_cookie(
        key=access_cookie_name(),
        value=access_jwt,
        max_age=settings.access_token_minutes * 60,
        path="/",
        httponly=True,
        samesite="lax",
        secure=secure,
    )
    if raw_refresh is not None:
        response.set_cookie(
            key=refresh_cookie_name(),
            value=raw_refresh,
            max_age=settings.refresh_token_days * 86400,
            path="/api/auth",
            httponly=True,
            samesite="lax",
            secure=secure,
        )
    response.set_cookie(
        key=csrf_cookie_name(),
        value=csrf_token,
        max_age=settings.refresh_token_days * 86400,
        path="/",
        httponly=False,
        samesite="lax",
        secure=secure,
    )


def _clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    secure = bool(settings.cookie_secure)
    response.delete_cookie(key=access_cookie_name(), path="/", secure=secure, samesite="lax")
    response.delete_cookie(key=refresh_cookie_name(), path="/api/auth", secure=secure, samesite="lax")
    response.delete_cookie(key=csrf_cookie_name(), path="/", secure=secure, samesite="lax")


def _verify_pow_solution(email: str, solution: str) -> bool:
    if not solution or len(solution) > 64:
        return False
    digest = hashlib.sha256(f"{email}:{solution}".encode("utf-8")).hexdigest()
    return digest.startswith("000")


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=10, max_length=128)
    name: str = Field(default="Quantum Researcher", min_length=1, max_length=80)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=1, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=10, max_length=128)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    req: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    client_ip = extract_client_ip(request)
    req_id = getattr(request.state, "request_id", "")

    try:
        email = validate_and_normalize_email(req.email)
        name = sanitize_text(req.name, max_len=80) or email.split("@")[0]
        pw = validate_password_strength(req.password, email=email)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    existing = await db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    pw_hash = await hash_password_async(pw)
    # Always force 'researcher' regardless of any extra body keys (prevents mass-assignment)
    user = User(
        email=email,
        name=name,
        password_hash=pw_hash,
        role="researcher",
        is_active=True,
    )
    db.add(user)
    await db.flush()

    family = str(uuid.uuid4())
    raw_refresh = generate_refresh_token()
    settings = get_settings()
    rt = RefreshToken(
        user_id=user.id,
        token_family=family,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_days),
        ip_subnet=extract_ip_subnet_from_ip(client_ip),
        ua_hash=hash_user_agent(request.headers.get("user-agent", "")),
    )
    db.add(rt)
    await db.commit()
    await db.refresh(user)

    access_jwt = create_access_token(user.id, user.role, user.token_version, family)
    csrf_tok = create_csrf_token(family)
    _set_auth_cookies(response, access_jwt=access_jwt, raw_refresh=raw_refresh, csrf_token=csrf_tok)

    await record_audit_event(
        db,
        event_type="REGISTER_SUCCESS",
        outcome="allow",
        actor_user_id=user.id,
        ip_address=client_ip,
        request_id=req_id,
        target_resource="/api/auth/register",
        detail=f"Registered researcher {email}",
    )

    return {"status": "success", "user": _user_public_dict(user)}


@router.post("/login")
async def login_user(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    client_ip = extract_client_ip(request)
    req_id = getattr(request.state, "request_id", "")

    try:
        email = validate_and_normalize_email(req.email)
    except ValueError:
        await verify_password_async(req.password, None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    allowed_subnet, retry_after = check_login_subnet_throttle(client_ip, email)
    if not allowed_subnet:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts from this network. Try again in {retry_after}s.",
            headers={"Retry-After": str(retry_after)},
        )

    user = await db.scalar(select(User).where(User.email == email))
    now = datetime.now(timezone.utc)

    # Distributed attack tarpit mitigation without locking legitimate account owners permanently
    if user is not None and user.failed_login_attempts >= 8:
        last_fail = _as_utc(user.last_failed_at)
        if last_fail and (now - last_fail).total_seconds() < 900:
            pow_hdr = request.headers.get("x-pow-solution", "")
            if not _verify_pow_solution(email, pow_hdr):
                await asyncio.sleep(3.0)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Suspicious login burst detected; Proof-of-Work verification required.",
                )

    pw_ok = await verify_password_async(req.password, user.password_hash if user else None)
    if user is None or not pw_ok or not user.is_active:
        record_login_failure_for_subnet(client_ip, email)
        if user is not None:
            last_fail = _as_utc(user.last_failed_at)
            if last_fail and (now - last_fail).total_seconds() > 900:
                user.failed_login_attempts = 1
            else:
                user.failed_login_attempts += 1
            user.last_failed_at = now
            await db.commit()

        await record_audit_event(
            db,
            event_type="LOGIN_FAIL",
            outcome="deny",
            actor_user_id=user.id if user else None,
            ip_address=client_ip,
            request_id=req_id,
            target_resource="/api/auth/login",
            detail="Invalid credentials or inactive account",
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    clear_login_failures_for_subnet(client_ip, email)
    user.failed_login_attempts = 0
    user.last_failed_at = None

    if check_needs_rehash(user.password_hash):
        user.password_hash = await hash_password_async(req.password)

    family = str(uuid.uuid4())
    raw_refresh = generate_refresh_token()
    settings = get_settings()
    rt = RefreshToken(
        user_id=user.id,
        token_family=family,
        token_hash=hash_token(raw_refresh),
        expires_at=now + timedelta(days=settings.refresh_token_days),
        ip_subnet=extract_ip_subnet_from_ip(client_ip),
        ua_hash=hash_user_agent(request.headers.get("user-agent", "")),
    )
    db.add(rt)
    await db.commit()
    await db.refresh(user)

    access_jwt = create_access_token(user.id, user.role, user.token_version, family)
    csrf_tok = create_csrf_token(family)
    _set_auth_cookies(response, access_jwt=access_jwt, raw_refresh=raw_refresh, csrf_token=csrf_tok)

    await record_audit_event(
        db,
        event_type="LOGIN_SUCCESS",
        outcome="allow",
        actor_user_id=user.id,
        ip_address=client_ip,
        request_id=req_id,
        target_resource="/api/auth/login",
        detail="Authenticated session established",
    )

    return {"status": "success", "user": _user_public_dict(user)}


@router.post("/refresh")
async def refresh_session(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    _check_allowed_origin(request)
    raw_refresh = request.cookies.get(refresh_cookie_name())
    if not raw_refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing.")

    client_ip = extract_client_ip(request)
    subnet = extract_ip_subnet_from_ip(client_ip)
    ua_h = hash_user_agent(request.headers.get("user-agent", ""))
    req_id = getattr(request.state, "request_id", "")
    settings = get_settings()
    now = datetime.now(timezone.utc)

    tok_hash = hash_token(raw_refresh)
    rt = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == tok_hash))
    if rt is None:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

    user = await db.scalar(select(User).where(User.id == rt.user_id))
    if user is None or not user.is_active:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is inactive.")

    expires_at = _as_utc(rt.expires_at)
    revoked_at = _as_utc(rt.revoked_at)

    # Case 2 / Case 3: Token was already rotated or revoked
    if revoked_at is not None:
        elapsed = (now - revoked_at).total_seconds()
        if (
            elapsed <= settings.refresh_leeway_seconds
            and rt.replaced_by_hash is not None
            and rt.ip_subnet == subnet
            and rt.ua_hash == ua_h
        ):
            # Case 2: Parallel tab race within grace window -> keep family intact, refresh access+CSRF
            access_jwt = create_access_token(user.id, user.role, user.token_version, rt.token_family)
            csrf_tok = create_csrf_token(rt.token_family)
            _set_auth_cookies(response, access_jwt=access_jwt, raw_refresh=None, csrf_token=csrf_tok)
            return {"status": "success", "user": _user_public_dict(user), "grace_reuse": True}

        # Case 3: Replay theft detected -> revoke entire token family immediately
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.token_family == rt.token_family, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await db.commit()
        _clear_auth_cookies(response)

        await record_audit_event(
            db,
            event_type="TOKEN_REPLAY_BLOCKED",
            outcome="deny",
            actor_user_id=user.id,
            ip_address=client_ip,
            request_id=req_id,
            target_resource="/api/auth/refresh",
            detail=f"Revoked token family {rt.token_family} after stale/foreign replay",
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session revoked due to token replay.")

    if expires_at is None or expires_at <= now:
        rt.revoked_at = now
        await db.commit()
        _clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired.")

    # Case 1: Active token -> rotate cleanly
    new_raw = generate_refresh_token()
    new_hash = hash_token(new_raw)
    rt.revoked_at = now
    rt.replaced_by_hash = new_hash

    next_rt = RefreshToken(
        user_id=user.id,
        token_family=rt.token_family,
        token_hash=new_hash,
        expires_at=now + timedelta(days=settings.refresh_token_days),
        ip_subnet=subnet,
        ua_hash=ua_h,
    )
    db.add(next_rt)
    await db.commit()

    access_jwt = create_access_token(user.id, user.role, user.token_version, rt.token_family)
    csrf_tok = create_csrf_token(rt.token_family)
    _set_auth_cookies(response, access_jwt=access_jwt, raw_refresh=new_raw, csrf_token=csrf_tok)
    return {"status": "success", "user": _user_public_dict(user)}


@router.post("/logout")
async def logout_user(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    _check_allowed_origin(request)
    raw_refresh = request.cookies.get(refresh_cookie_name())
    now = datetime.now(timezone.utc)
    if raw_refresh:
        rt = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_refresh)))
        if rt is not None:
            await db.execute(
                update(RefreshToken)
                .where(RefreshToken.token_family == rt.token_family, RefreshToken.revoked_at.is_(None))
                .values(revoked_at=now)
            )
            await db.commit()
    _clear_auth_cookies(response)
    return {"status": "success", "detail": "Signed out cleanly."}


@router.get("/me")
async def get_current_me(user: User = Depends(require_user)) -> Dict[str, Any]:
    return {"status": "success", "user": _user_public_dict(user)}


@router.post("/change-password", dependencies=[Depends(verify_hmac_csrf)])
async def change_password(
    req: ChangePasswordRequest,
    request: Request,
    response: Response,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    client_ip = extract_client_ip(request)
    req_id = getattr(request.state, "request_id", "")

    current_ok = await verify_password_async(req.current_password, user.password_hash)
    if not current_ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect.")

    try:
        new_pw = validate_password_strength(req.new_password, email=user.email)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    now = datetime.now(timezone.utc)
    user.password_hash = await hash_password_async(new_pw)
    user.token_version = int(user.token_version) + 1

    # Revoke all old refresh sessions and start fresh family for caller
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
    )

    family = str(uuid.uuid4())
    raw_refresh = generate_refresh_token()
    settings = get_settings()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_family=family,
            token_hash=hash_token(raw_refresh),
            expires_at=now + timedelta(days=settings.refresh_token_days),
            ip_subnet=extract_ip_subnet_from_ip(client_ip),
            ua_hash=hash_user_agent(request.headers.get("user-agent", "")),
        )
    )
    await db.commit()
    await db.refresh(user)

    access_jwt = create_access_token(user.id, user.role, user.token_version, family)
    csrf_tok = create_csrf_token(family)
    _set_auth_cookies(response, access_jwt=access_jwt, raw_refresh=raw_refresh, csrf_token=csrf_tok)

    await record_audit_event(
        db,
        event_type="PASSWORD_CHANGED",
        outcome="allow",
        actor_user_id=user.id,
        ip_address=client_ip,
        request_id=req_id,
        target_resource="/api/auth/change-password",
        detail="Password rotated and prior JWT token_version invalidated",
    )
    return {"status": "success", "detail": "Password updated and prior sessions invalidated."}

