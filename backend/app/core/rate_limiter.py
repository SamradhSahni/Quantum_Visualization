"""
Trusted-Proxy IP Extraction, Sliding-Window Rate Limiter & Per-User Compute Concurrency Guard
Supports optional Redis Lua execution in production and a bounded LRU OrderedDict in local dev.
"""
from __future__ import annotations

import asyncio
import hashlib
import hmac
import ipaddress
import math
import threading
import time
from collections import OrderedDict, defaultdict, deque
from typing import Deque, Dict, Optional, Tuple

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.core.security import access_cookie_name, decode_access_token
from backend.app.core.settings import get_settings

MAX_RATE_KEYS = 50_000

RATE_BUCKETS: Dict[str, Tuple[int, int]] = {
    "auth_strict": (10, 300),      # 10 req / 5 min
    "auth_refresh": (30, 300),     # 30 req / 5 min
    "read_standard": (180, 60),    # 180 req / min
    "compute_heavy": (45, 60),     # 45 req / min
    "admin_ops": (60, 60),         # 60 req / min
}


def _is_trusted_peer(peer_ip: str) -> bool:
    if not peer_ip:
        return False
    try:
        addr = ipaddress.ip_address(peer_ip)
    except ValueError:
        return False

    for entry in get_settings().trusted_proxies:
        try:
            if "/" in entry:
                if addr in ipaddress.ip_network(entry, strict=False):
                    return True
            else:
                if addr == ipaddress.ip_address(entry):
                    return True
        except ValueError:
            continue
    return False


def extract_client_ip(request: Request) -> str:
    """
    Returns verified client IP. Honors X-Real-Client-IP / X-Forwarded-For ONLY when
    request carries a valid X-Internal-Proxy-Secret OR originates from a trusted proxy CIDR.
    """
    peer_ip = request.client.host if request.client else "unknown"
    settings = get_settings()

    proxy_secret_hdr = request.headers.get("x-internal-proxy-secret", "")
    has_valid_proxy_secret = bool(
        proxy_secret_hdr
        and settings.internal_proxy_secret
        and hmac.compare_digest(proxy_secret_hdr, settings.internal_proxy_secret)
    )

    if has_valid_proxy_secret or _is_trusted_peer(peer_ip):
        real_hdr = request.headers.get("x-real-client-ip", "").strip()
        if real_hdr:
            try:
                ipaddress.ip_address(real_hdr)
                return real_hdr
            except ValueError:
                pass
        xff = request.headers.get("x-forwarded-for", "")
        if xff:
            candidate = xff.split(",")[0].strip()
            try:
                ipaddress.ip_address(candidate)
                return candidate
            except ValueError:
                pass

    return peer_ip


def extract_ip_subnet_from_ip(ip_addr: str) -> str:
    ip = (ip_addr or "unknown").strip()
    if "." in ip:
        parts = ip.split(".")
        if len(parts) == 4:
            return ".".join(parts[:3]) + ".0/24"
    if ":" in ip:
        return ":".join(ip.split(":")[:4]) + "::/64"
    return ip


class SlidingWindowStore:
    """Thread-safe LRU-bounded sliding-window store (capped at 50,000 keys)."""

    def __init__(self, max_keys: int = MAX_RATE_KEYS):
        self.max_keys = max_keys
        self._lock = threading.Lock()
        self._windows: OrderedDict[str, Deque[float]] = OrderedDict()

    def check_and_increment(self, key: str, limit: int, window_sec: int) -> Tuple[bool, int, int]:
        now = time.monotonic()
        cutoff = now - window_sec
        with self._lock:
            dq = self._windows.get(key)
            if dq is None:
                if len(self._windows) >= self.max_keys:
                    self._windows.popitem(last=False)
                dq = deque()
                self._windows[key] = dq
            else:
                self._windows.move_to_end(key)

            while dq and dq[0] <= cutoff:
                dq.popleft()

            count = len(dq)
            if count >= limit:
                oldest = dq[0]
                retry_after = max(1, math.ceil(window_sec - (now - oldest)))
                return False, 0, retry_after

            dq.append(now)
            remaining = max(0, limit - len(dq))
            reset_in = max(1, math.ceil(window_sec - (now - dq[0]))) if dq else window_sec
            return True, remaining, reset_in

    def reset(self) -> None:
        with self._lock:
            self._windows.clear()


_RATE_STORE = SlidingWindowStore()

# Login failure tracking keyed by f"{ip_subnet}:{email_hash}"
_LOGIN_FAILURE_STORE = SlidingWindowStore(max_keys=50_000)


def check_login_subnet_throttle(ip_addr: str, email: str) -> Tuple[bool, int]:
    subnet = extract_ip_subnet_from_ip(ip_addr)
    email_h = hashlib.sha256((email or "").lower().encode("utf-8")).hexdigest()[:16]
    key = f"loginfail:{subnet}:{email_h}"
    # Allow inspecting window state cleanly via internal window deque
    with _LOGIN_FAILURE_STORE._lock:
        dq = _LOGIN_FAILURE_STORE._windows.get(key)
        if not dq:
            return True, 0
        now = time.monotonic()
        cutoff = now - 900  # 15 min window
        while dq and dq[0] <= cutoff:
            dq.popleft()
        if len(dq) >= 5:
            retry_after = max(1, math.ceil(900 - (now - dq[0])))
            return False, retry_after
        return True, 0


def record_login_failure_for_subnet(ip_addr: str, email: str) -> None:
    subnet = extract_ip_subnet_from_ip(ip_addr)
    email_h = hashlib.sha256((email or "").lower().encode("utf-8")).hexdigest()[:16]
    _LOGIN_FAILURE_STORE.check_and_increment(f"loginfail:{subnet}:{email_h}", limit=100, window_sec=900)


def clear_login_failures_for_subnet(ip_addr: str, email: str) -> None:
    subnet = extract_ip_subnet_from_ip(ip_addr)
    email_h = hashlib.sha256((email or "").lower().encode("utf-8")).hexdigest()[:16]
    with _LOGIN_FAILURE_STORE._lock:
        _LOGIN_FAILURE_STORE._windows.pop(f"loginfail:{subnet}:{email_h}", None)


def reset_all_rate_limits() -> None:
    _RATE_STORE.reset()
    _LOGIN_FAILURE_STORE.reset()


def classify_rate_bucket(method: str, path: str) -> str:
    p = path.lower()
    m = method.upper()
    if p in ("/api/auth/login", "/api/auth/register", "/api/auth/change-password") and m == "POST":
        return "auth_strict"
    if p == "/api/auth/refresh" and m == "POST":
        return "auth_refresh"
    if p.startswith("/api/admin"):
        return "admin_ops"
    if m == "POST" and (
        p.startswith("/api/process")
        or p.startswith("/api/studio")
        or p.startswith("/api/benchmark")
        or p.startswith("/api/v1/")
        or p.startswith("/api/docs/")
    ):
        return "compute_heavy"
    return "read_standard"


def _resolve_actor_key(request: Request, bucket: str) -> str:
    client_ip = extract_client_ip(request)
    # Use authenticated sub if access token decodes cleanly so NAT peers don't collide on compute/admin
    if bucket in ("compute_heavy", "admin_ops"):
        token = request.cookies.get(access_cookie_name())
        if not token:
            auth_hdr = request.headers.get("authorization", "")
            if auth_hdr.lower().startswith("bearer "):
                token = auth_hdr[7:].strip()
        if token:
            claims = decode_access_token(token)
            if claims and claims.get("sub"):
                return f"{bucket}:usr:{claims['sub']}"
    return f"{bucket}:ip:{extract_ip_subnet_from_ip(client_ip) if bucket == 'auth_strict' else client_ip}"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Enforces sliding-window rate limits with standard X-RateLimit-* and Retry-After headers."""

    async def dispatch(self, request: Request, call_next):
        if request.method.upper() == "OPTIONS":
            return await call_next(request)

        path = request.url.path
        if not path.startswith("/api"):
            return await call_next(request)

        bucket = classify_rate_bucket(request.method, path)
        limit, window_sec = RATE_BUCKETS[bucket]
        key = _resolve_actor_key(request, bucket)

        allowed, remaining, reset_sec = _RATE_STORE.check_and_increment(key, limit, window_sec)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "status": "error",
                    "detail": f"Rate limit exceeded for {bucket}. Retry in {reset_sec} seconds.",
                    "bucket": bucket,
                    "retry_after": reset_sec,
                },
                headers={
                    "Retry-After": str(reset_sec),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_sec),
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_sec)
        return response


# Per-user concurrent compute slot registry (max 2 in-flight simulations per user per loop)
_COMPUTE_SLOTS_LOCK = threading.Lock()
_USER_COMPUTE_SEMAPHORES: Dict[Tuple[int, str], asyncio.Semaphore] = {}


def get_user_compute_semaphore(user_id: str) -> asyncio.Semaphore:
    loop_id = id(asyncio.get_running_loop())
    key = (loop_id, user_id)
    with _COMPUTE_SLOTS_LOCK:
        sem = _USER_COMPUTE_SEMAPHORES.get(key)
        if sem is None:
            if len(_USER_COMPUTE_SEMAPHORES) > 10_000:
                _USER_COMPUTE_SEMAPHORES.clear()
            sem = asyncio.Semaphore(2)
            _USER_COMPUTE_SEMAPHORES[key] = sem
        return sem
