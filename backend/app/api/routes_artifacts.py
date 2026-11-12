"""
User Artifacts Router (/api/artifacts)
Strict Anti-IDOR ownership queries directly inside SQL statements.
"""
from __future__ import annotations

import json
from typing import Any, Dict, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.dependencies import require_researcher, require_user, verify_hmac_csrf
from backend.app.core.sanitize import sanitize_text
from backend.app.db.database import get_db_session
from backend.app.db.models import User, UserArtifact

router = APIRouter(prefix="/api/artifacts", tags=["artifacts"])

MAX_PAYLOAD_JSON_BYTES = 262_144  # 256 KB serialized JSON limit


class CreateArtifactRequest(BaseModel):
    artifact_type: Literal["edge_run", "qasm_submission", "publication_snapshot"]
    title: str = Field(..., min_length=1, max_length=120)
    is_public: bool = False
    payload: Dict[str, Any]


class UpdateArtifactRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    is_public: bool = False


def _serialize_artifact(art: UserArtifact) -> Dict[str, Any]:
    return {
        "id": art.id,
        "owner_id": art.owner_id,
        "artifact_type": art.artifact_type,
        "title": art.title,
        "is_public": bool(art.is_public),
        "payload": json.loads(art.payload_json),
        "created_at": art.created_at.isoformat() if art.created_at else None,
    }


@router.get("")
async def list_my_artifacts(
    limit: int = Query(default=25, ge=1, le=100),
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    stmt = (
        select(UserArtifact)
        .where(UserArtifact.owner_id == user.id)
        .order_by(UserArtifact.created_at.desc())
        .limit(limit)
    )
    rows = (await db.scalars(stmt)).all()
    return {"status": "success", "items": [_serialize_artifact(r) for r in rows]}


@router.get("/public")
async def list_public_artifacts(
    limit: int = Query(default=25, ge=1, le=100),
    _user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    stmt = (
        select(UserArtifact)
        .where(UserArtifact.is_public.is_(True))
        .order_by(UserArtifact.created_at.desc())
        .limit(limit)
    )
    rows = (await db.scalars(stmt)).all()
    return {"status": "success", "items": [_serialize_artifact(r) for r in rows]}


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_hmac_csrf)])
async def create_artifact(
    req: CreateArtifactRequest,
    user: User = Depends(require_researcher),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    title = sanitize_text(req.title, max_len=120)
    if not title:
        raise HTTPException(status_code=400, detail="Artifact title cannot be empty.")

    serialized = json.dumps(req.payload, allow_nan=False)
    if len(serialized.encode("utf-8")) > MAX_PAYLOAD_JSON_BYTES:
        raise HTTPException(status_code=413, detail="Artifact payload exceeds 256 KB limit.")

    art = UserArtifact(
        owner_id=user.id,
        artifact_type=req.artifact_type,
        title=title,
        is_public=bool(req.is_public),
        payload_json=serialized,
    )
    db.add(art)
    await db.commit()
    await db.refresh(art)
    return {"status": "success", "artifact": _serialize_artifact(art)}


@router.get("/{artifact_id}")
async def get_artifact(
    artifact_id: str,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    stmt = select(UserArtifact).where(
        UserArtifact.id == artifact_id,
        or_(
            UserArtifact.owner_id == user.id,
            UserArtifact.is_public.is_(True),
            literal(user.role == "admin"),
        ),
    )
    art = await db.scalar(stmt)
    if art is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found.")
    return {"status": "success", "artifact": _serialize_artifact(art)}


@router.patch("/{artifact_id}", dependencies=[Depends(verify_hmac_csrf)])
async def update_artifact(
    artifact_id: str,
    req: UpdateArtifactRequest,
    user: User = Depends(require_researcher),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    stmt = select(UserArtifact).where(
        UserArtifact.id == artifact_id,
        or_(
            UserArtifact.owner_id == user.id,
            literal(user.role == "admin"),
        ),
    )
    art = await db.scalar(stmt)
    if art is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found.")

    title = sanitize_text(req.title, max_len=120)
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty.")

    art.title = title
    art.is_public = bool(req.is_public)
    await db.commit()
    await db.refresh(art)
    return {"status": "success", "artifact": _serialize_artifact(art)}


@router.delete("/{artifact_id}", dependencies=[Depends(verify_hmac_csrf)])
async def delete_artifact(
    artifact_id: str,
    user: User = Depends(require_researcher),
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    stmt = select(UserArtifact).where(
        UserArtifact.id == artifact_id,
        or_(
            UserArtifact.owner_id == user.id,
            literal(user.role == "admin"),
        ),
    )
    art = await db.scalar(stmt)
    if art is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found.")

    await db.delete(art)
    await db.commit()
    return {"status": "success", "deleted_id": artifact_id}

