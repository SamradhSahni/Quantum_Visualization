"""
FastAPI Main Application Entry Point
Hardened with Strict CORS, Security Headers, Sliding-Window Rate Limiting,
Async SQLite/WAL Session Lifecycle, RBAC Routers, and Safe Error Handling.
"""
from __future__ import annotations

import logging
import sys
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.api.routes_admin import router as admin_router
from backend.app.api.routes_arena import router as arena_router
from backend.app.api.routes_artifacts import router as artifacts_router
from backend.app.api.routes_auth import router as auth_router
from backend.app.api.routes_benchmark import router as benchmark_router
from backend.app.api.routes_circuits import router as circuits_router
from backend.app.api.routes_composer import router as composer_router
from backend.app.api.routes_docs import router as docs_router
from backend.app.api.routes_gis import router as gis_router
from backend.app.api.routes_hardware import router as hardware_router
from backend.app.api.routes_presets import router as presets_router
from backend.app.api.routes_process import router as process_router
from backend.app.api.routes_publish import router as publish_router
from backend.app.api.routes_qml import router as qml_router
from backend.app.api.routes_studio import router as studio_router
from backend.app.core.rate_limiter import RateLimitMiddleware
from backend.app.core.settings import get_settings
from backend.app.db.database import dispose_engine, init_db

logger = logging.getLogger("quantum_vision.api")
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield
    await dispose_engine()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attaches defense-in-depth HTTP headers, request correlation IDs, and cache control."""

    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("x-request-id", "")[:36] or str(uuid.uuid4())
        request.state.request_id = req_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), usb=()"

        if settings.cookie_secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        path = request.url.path
        if path.startswith("/api/auth") or path.startswith("/api/admin") or path.startswith("/api/artifacts"):
            response.headers["Cache-Control"] = "no-store, max-age=0"
            response.headers["Pragma"] = "no-cache"

        return response


app = FastAPI(
    title="Quantum Edge Vision Platform API",
    description="Hardened quantum & classical edge detection microservice.",
    version="3.2.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

# Middleware execution order (outermost runs first):
# CORS -> SecurityHeaders -> RateLimiter -> Routers
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token", "X-Request-ID"],
    max_age=600,
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception("Unhandled exception [request_id=%s path=%s]: %s", req_id, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "detail": "Internal server error.",
            "request_id": req_id,
        },
    )


# Register Auth, Artifacts, Admin & Scientific Compute Routers
app.include_router(auth_router)
app.include_router(artifacts_router)
app.include_router(admin_router)
app.include_router(presets_router)
app.include_router(circuits_router)
app.include_router(process_router)
app.include_router(studio_router)
app.include_router(benchmark_router)
app.include_router(docs_router)
app.include_router(composer_router)
app.include_router(qml_router)
app.include_router(gis_router)
app.include_router(hardware_router)
app.include_router(publish_router)
app.include_router(arena_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Quantum Edge Vision Platform API",
        "version": "3.2.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "simulator": "Qiskit AerSimulator (statevector)",
        "supported_algorithms": [
            "FRQI-QHED",
            "QPIE-QHED",
            "NEQR-Gradient",
            "Sobel 3×3 Operator",
            "Canny 5-Stage",
            "Robinson 8-Compass",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=False, server_header=False)
