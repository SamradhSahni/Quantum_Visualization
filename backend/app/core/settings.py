"""
Fail-Closed Environment & Security Configuration Loader
Uses pydantic-settings with entropy verification for production secrets.
"""
from __future__ import annotations

import logging
import math
import os
import secrets
from collections import Counter
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("quantum_vision.security")

_WEAK_SECRET_SUBSTRINGS = (
    "replace_with",
    "changeme",
    "default",
    "example",
    "insecure",
    "password",
    "secret_key",
)

_DEV_EPHEMERAL_SECRET = secrets.token_hex(32)
_DEV_EPHEMERAL_PROXY_SECRET = secrets.token_hex(32)


def _shannon_entropy(value: str) -> float:
    if not value:
        return 0.0
    counts = Counter(value)
    length = len(value)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())


def validate_secret_strength(secret_value: str, name: str) -> None:
    """Rejects missing, short, placeholder, or low-entropy cryptographic keys."""
    if not secret_value or len(secret_value) < 32:
        raise RuntimeError(f"{name} must be at least 32 characters in staging/production.")
    lower = secret_value.lower()
    if any(tok in lower for tok in _WEAK_SECRET_SUBSTRINGS):
        raise RuntimeError(f"{name} contains a forbidden placeholder pattern.")
    if len(set(secret_value)) < 10 or _shannon_entropy(secret_value) < 3.0:
        raise RuntimeError(f"{name} has insufficient Shannon entropy.")


class SecuritySettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    environment: str = Field(default="development")
    secret_key: str = Field(default="")
    internal_proxy_secret: str = Field(default="")

    access_token_minutes: int = Field(default=15, ge=5, le=120)
    refresh_token_days: int = Field(default=7, ge=1, le=30)
    refresh_leeway_seconds: int = Field(default=10, ge=0, le=30)

    database_url: str = Field(default="sqlite+aiosqlite:///./backend/data/quantum_vision.db")
    redis_url: str = Field(default="")

    cors_allowed_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
    trusted_proxies: List[str] = Field(
        default_factory=lambda: ["127.0.0.1", "::1", "172.16.0.0/12"]
    )

    cookie_secure: bool = Field(default=False)
    max_upload_bytes: int = Field(default=5_242_880, ge=1024, le=20_971_520)
    qiskit_timeout_seconds: float = Field(default=12.0, ge=1.0, le=60.0)
    qiskit_max_workers: int = Field(default=4, ge=1, le=16)

    admin_bootstrap_email: str = Field(default="")
    admin_bootstrap_password: str = Field(default="")
    admin_bootstrap_name: str = Field(default="Platform Administrator")

    @field_validator("environment")
    @classmethod
    def _normalize_env(cls, v: str) -> str:
        val = (v or "development").strip().lower()
        if val not in ("development", "staging", "production"):
            raise ValueError("ENVIRONMENT must be development, staging, or production.")
        return val

    @field_validator("cors_allowed_origins", "trusted_proxies", mode="before")
    @classmethod
    def _split_csv_list(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    @field_validator("cors_allowed_origins")
    @classmethod
    def _forbid_wildcard_cors(cls, origins: List[str]) -> List[str]:
        cleaned = [o.rstrip("/") for o in origins if o.strip()]
        if "*" in cleaned:
            raise ValueError("Wildcard '*' CORS origin is prohibited.")
        return cleaned

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_strict_env(self) -> bool:
        return self.environment in ("staging", "production")

    def resolve_runtime(self) -> "SecuritySettings":
        if self.is_strict_env:
            validate_secret_strength(self.secret_key, "SECRET_KEY")
            validate_secret_strength(self.internal_proxy_secret, "INTERNAL_PROXY_SECRET")
            if self.is_production:
                self.cookie_secure = True
        else:
            if not self.secret_key or any(w in self.secret_key.lower() for w in _WEAK_SECRET_SUBSTRINGS):
                logger.warning("Using ephemeral development SECRET_KEY; set SECRET_KEY in .env for persistent sessions.")
                self.secret_key = _DEV_EPHEMERAL_SECRET
            if not self.internal_proxy_secret or any(w in self.internal_proxy_secret.lower() for w in _WEAK_SECRET_SUBSTRINGS):
                self.internal_proxy_secret = os.environ.get("INTERNAL_PROXY_SECRET") or _DEV_EPHEMERAL_PROXY_SECRET
        return self


@lru_cache(maxsize=1)
def get_settings() -> SecuritySettings:
    return SecuritySettings().resolve_runtime()

