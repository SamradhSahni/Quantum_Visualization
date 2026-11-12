"""
Async SQLAlchemy 2.x Database Engine & WAL Session Factory
Configures SQLite WAL concurrency, foreign key enforcement, and optional admin bootstrap.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import AsyncGenerator, Optional

from sqlalchemy import event, select
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from backend.app.core.sanitize import sanitize_text, validate_and_normalize_email
from backend.app.core.security import hash_password_async, validate_password_strength
from backend.app.core.settings import get_settings
from backend.app.db.models import Base, User

logger = logging.getLogger("quantum_vision.db")

_engine: Optional[AsyncEngine] = None
_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


def _ensure_sqlite_dir(db_url: str) -> Optional[Path]:
    if not db_url.startswith("sqlite"):
        return None
    # Handles sqlite+aiosqlite:///./backend/data/quantum_vision.db or sqlite+aiosqlite:////abs/path.db
    raw_path = db_url.split("///", 1)[-1] if "///" in db_url else ""
    if not raw_path or raw_path == ":memory:":
        return None
    db_path = Path(raw_path).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if os.name != "nt":
        try:
            os.chmod(db_path.parent, 0o700)
        except OSError:
            pass
    return db_path


def _attach_sqlite_pragmas(engine: AsyncEngine) -> None:
    if "sqlite" not in str(engine.url):
        return

    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA busy_timeout=5000;")
        cursor.execute("PRAGMA temp_store=MEMORY;")
        cursor.close()


def get_engine(custom_url: Optional[str] = None) -> AsyncEngine:
    global _engine, _session_factory
    if _engine is None or custom_url is not None:
        db_url = custom_url or get_settings().database_url
        _ensure_sqlite_dir(db_url)
        kwargs = {"future": True}
        if db_url.startswith("sqlite"):
            kwargs["connect_args"] = {"check_same_thread": False}
        _engine = create_async_engine(db_url, **kwargs)
        _attach_sqlite_pragmas(_engine)
        _session_factory = async_sessionmaker(
            bind=_engine, expire_on_commit=False, class_=AsyncSession
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    if _session_factory is None:
        get_engine()
    assert _session_factory is not None
    return _session_factory


async def dispose_engine() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


async def init_db(custom_url: Optional[str] = None) -> None:
    engine = get_engine(custom_url=custom_url)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    db_path = _ensure_sqlite_dir(str(engine.url))
    if db_path and db_path.exists() and os.name != "nt":
        try:
            os.chmod(db_path, 0o600)
        except OSError:
            pass

    await _bootstrap_initial_admin()


async def _bootstrap_initial_admin() -> None:
    settings = get_settings()
    email_raw = (settings.admin_bootstrap_email or "").strip()
    pass_raw = settings.admin_bootstrap_password or ""
    if not email_raw or not pass_raw:
        return
    try:
        email = validate_and_normalize_email(email_raw)
        validate_password_strength(pass_raw, email=email)
    except ValueError as exc:
        logger.warning("Skipping invalid ADMIN_BOOTSTRAP config: %s", exc)
        return

    factory = get_session_factory()
    async with factory() as session:
        existing = await session.scalar(select(User).where(User.email == email))
        if existing is None:
            pw_hash = await hash_password_async(pass_raw)
            admin = User(
                email=email,
                name=sanitize_text(settings.admin_bootstrap_name or "Platform Administrator", max_len=80),
                password_hash=pw_hash,
                role="admin",
                is_active=True,
            )
            session.add(admin)
            await session.commit()
            logger.info("Bootstrapped initial platform admin account for %s", email)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    factory = get_session_factory()
    async with factory() as session:
        yield session

