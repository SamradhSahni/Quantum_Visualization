"""
Cryptographic Security Utilities:
- Bounded Async Argon2id Password Hashing with Timing-Safe Dummy Verification
- HS256 JWT Issuance & Strict Claim Validation
- Cryptographic Refresh Token Generation & SHA-256 Digesting
- HMAC-Bound Double-Submit CSRF Token Generation & Verification
"""
from __future__ import annotations

import asyncio
import hashlib
import hmac
import secrets
import unicodedata
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from backend.app.core.settings import get_settings

JWT_ISSUER = "quantum-edge-api"
JWT_AUDIENCE = "quantum-edge-web"
JWT_ALGORITHM = "HS256"

# Argon2id tuned for responsive security: ~64 MiB memory, bounded by semaphore
_ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=2,
    hash_len=32,
    salt_len=16,
)

# Precomputed dummy hash guarantees constant-time work factor for unknown emails
DUMMY_ARGON2_HASH: str = _ph.hash("quantum_vision_constant_time_dummy_secret_v2")

# Bounded 8-worker executor caps peak concurrent Argon2id RAM at 8 * 64 MiB = 512 MiB
_ARGON2_POOL = ThreadPoolExecutor(max_workers=8, thread_name_prefix="argon2")

_COMMON_WEAK_PASSWORDS = frozenset({
    "password", "password123", "1234567890", "123456789012", "qwerty12345",
    "letmein123", "admin12345", "welcome123", "iloveyou123", "quantum123",
    "guest", "guest12345", "administrator", "changeme123",
})


def normalize_password(plain_password: str) -> str:
    return unicodedata.normalize("NFKC", plain_password or "")


def validate_password_strength(plain_password: str, email: str = "") -> str:
    """Enforces NIST SP 800-63B length bounds and basic breached-password hygiene."""
    pw = normalize_password(plain_password)
    if len(pw) < 10:
        raise ValueError("Password must be at least 10 characters long.")
    if len(pw) > 128:
        raise ValueError("Password must not exceed 128 characters.")
    lower_pw = pw.lower()
    if lower_pw in _COMMON_WEAK_PASSWORDS:
        raise ValueError("Password is too common; choose a stronger passphrase.")
    if email:
        local_part = email.split("@")[0].strip().lower()
        if len(local_part) >= 3 and local_part in lower_pw:
            raise ValueError("Password must not contain your email identifier.")
    return pw


async def hash_password_async(plain_password: str) -> str:
    pw = normalize_password(plain_password)
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_ARGON2_POOL, _ph.hash, pw)


async def verify_password_async(plain_password: str, password_hash: Optional[str]) -> bool:
    """Executes constant-time Argon2id verification via dummy hash when user is absent."""
    pw = normalize_password(plain_password)
    target_hash = password_hash if password_hash is not None else DUMMY_ARGON2_HASH
    loop = asyncio.get_running_loop()
    try:
        matched = await loop.run_in_executor(_ARGON2_POOL, _ph.verify, target_hash, pw)
        return bool(matched) if password_hash is not None else False
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def check_needs_rehash(password_hash: str) -> bool:
    try:
        return _ph.check_needs_rehash(password_hash)
    except Exception:
        return True


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def hash_user_agent(user_agent: str) -> str:
    return hashlib.sha256((user_agent or "unknown").encode("utf-8")).hexdigest()


def extract_ip_subnet(ip_addr: str) -> str:
    ip = (ip_addr or "unknown").strip()
    if "." in ip:
        parts = ip.split(".")
        if len(parts) == 4:
            return ".".join(parts[:3]) + ".0/24"
    if ":" in ip:
        parts = ip.split(":")
        return ":".join(parts[:4]) + "::/64"
    return ip


def create_access_token(
    user_id: str,
    role: str,
    token_version: int,
    token_family: str,
) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.access_token_minutes)
    payload: Dict[str, Any] = {
        "sub": user_id,
        "role": role,
        "ver": int(token_version),
        "fam": token_family,
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options={"require": ["sub", "role", "ver", "fam", "jti", "exp", "iat"]},
        )
    except jwt.PyJWTError:
        return None


def create_csrf_token(token_family: str) -> str:
    settings = get_settings()
    nonce = secrets.token_urlsafe(16)
    sig = hmac.new(
        settings.secret_key.encode("utf-8"),
        f"{token_family}:{nonce}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{nonce}.{sig}"


def verify_csrf_token(cookie_val: str, header_val: str, token_family: str) -> bool:
    """Verifies double-submit equality AND cryptographic HMAC binding to token_family."""
    if not cookie_val or not header_val or not token_family:
        return False
    if not hmac.compare_digest(cookie_val, header_val):
        return False
    if "." not in cookie_val:
        return False
    nonce, provided_sig = cookie_val.split(".", 1)
    if not nonce or not provided_sig:
        return False
    settings = get_settings()
    expected_sig = hmac.new(
        settings.secret_key.encode("utf-8"),
        f"{token_family}:{nonce}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(provided_sig, expected_sig)


def access_cookie_name() -> str:
    return "__Host-qv_access" if get_settings().cookie_secure else "qv_access"


def refresh_cookie_name() -> str:
    return "qv_refresh"


def csrf_cookie_name() -> str:
    return "__Host-qv_csrf" if get_settings().cookie_secure else "qv_csrf"
