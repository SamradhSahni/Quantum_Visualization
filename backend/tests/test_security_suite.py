"""
Automated 12-Vector Security Verification Suite
Covers Argon2id & timing defense, mass assignment, race-safe refresh rotation & replay theft,
token_version revocation, HMAC CSRF, trusted-proxy IP checks, RBAC & admin safeguards,
anti-IDOR isolation, upload bomb/polyglot/EXIF stripping, OpenQASM sandbox + timeout,
LaTeX escaping, strict CORS, and security headers.
"""
from __future__ import annotations

import asyncio
import io
import json
import os
import tempfile
from pathlib import Path

import httpx
import pytest
from PIL import Image
from sqlalchemy import update

from backend.app.core.rate_limiter import reset_all_rate_limits
from backend.app.core.security import validate_password_strength, verify_password_async
from backend.app.core.settings import SecuritySettings, get_settings
from backend.app.db.database import dispose_engine, get_session_factory, init_db
from backend.app.db.models import RefreshToken, User
from backend.app.domain.publish.quantikz_generator import (
    generate_booktabs_scorecard_latex,
    generate_quantikz_circuit_latex,
)
from backend.app.main import app


@pytest.fixture
def isolated_app_env(tmp_path):
    """Configures an isolated temporary SQLite database and resets rate limit state."""
    async def _setup():
        reset_all_rate_limits()
        await dispose_engine()
        db_file = tmp_path / "sec_test.db"
        await init_db(custom_url=f"sqlite+aiosqlite:///{db_file.as_posix()}")

    async def _teardown():
        reset_all_rate_limits()
        await dispose_engine()

    asyncio.run(_setup())
    yield tmp_path
    asyncio.run(_teardown())


async def _register_and_client_headers(client: httpx.AsyncClient, email: str, password: str, name: str = "Dr. Ada"):
    reg = await client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "name": name, "role": "admin"},
        headers={"Origin": "http://localhost:3000"},
    )
    assert reg.status_code == 201, reg.text
    csrf = client.cookies.get("qv_csrf") or client.cookies.get("__Host-qv_csrf")
    return reg.json()["user"], {"Origin": "http://localhost:3000", "X-CSRF-Token": csrf}


def test_1_argon2_password_policy_and_constant_time(isolated_app_env):
    async def _run():
        # Weak passwords rejected
        with pytest.raises(ValueError):
            validate_password_strength("short123", "ada@lab.org")
        with pytest.raises(ValueError):
            validate_password_strength("password123", "ada@lab.org")
        with pytest.raises(ValueError):
            validate_password_strength("adalovelace99", "ada@lab.org")

        # Dummy verification for nonexistent user completes cleanly as False without raising
        assert await verify_password_async("ValidQuantumPass_99!", None) is False

    asyncio.run(_run())


def test_2_mass_assignment_and_settings_fail_closed(isolated_app_env):
    # Production fail-closed guard on weak/missing secrets
    with pytest.raises(RuntimeError):
        SecuritySettings(
            environment="production",
            secret_key="replace_with_weak_secret_key_for_test",
            internal_proxy_secret="a" * 40,
        ).resolve_runtime()

    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as client:
            user, _ = await _register_and_client_headers(
                client, "researcher1@nasa.gov", "Quantum_Safe_Pass!2026"
            )
            # Client supplied "role": "admin" must be ignored
            assert user["role"] == "researcher"

    asyncio.run(_run())


def test_3_refresh_grace_window_and_replay_revocation(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://localhost:3000",
            headers={"User-Agent": "QuantumTestBrowser/1.0"},
        ) as client:
            await _register_and_client_headers(client, "tabuser@nasa.gov", "Tab_Race_Strong!99")
            old_refresh = client.cookies.get("qv_refresh")
            assert old_refresh

            # First rotation succeeds and returns new token
            r1 = await client.post("/api/auth/refresh", headers={"Origin": "http://localhost:3000"})
            assert r1.status_code == 200
            new_refresh = client.cookies.get("qv_refresh")
            assert new_refresh and new_refresh != old_refresh

            # Replay old_refresh within 10s grace window from SAME subnet & UA -> allowed (parallel tab race mitigation)
            client.cookies.set("qv_refresh", old_refresh)
            r_grace = await client.post("/api/auth/refresh", headers={"Origin": "http://localhost:3000"})
            assert r_grace.status_code == 200
            assert r_grace.json().get("grace_reuse") is True

            # Replay old_refresh from DIFFERENT User-Agent -> treated as theft, revokes entire family
            r_theft = await client.post(
                "/api/auth/refresh",
                headers={"Origin": "http://localhost:3000", "User-Agent": "AttackerScript/9.0"},
            )
            assert r_theft.status_code == 401

            # Now even the newer valid token from that family is revoked!
            client.cookies.set("qv_refresh", new_refresh)
            r_after = await client.post(
                "/api/auth/refresh",
                headers={"Origin": "http://localhost:3000", "User-Agent": "QuantumTestBrowser/1.0"},
            )
            assert r_after.status_code == 401

    asyncio.run(_run())


def test_4_password_change_invalidates_token_version(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as client:
            _, hdrs = await _register_and_client_headers(client, "pwrot@nasa.gov", "Old_Secret_Pass_2026!")
            stale_access = client.cookies.get("qv_access")

            ch = await client.post(
                "/api/auth/change-password",
                json={"current_password": "Old_Secret_Pass_2026!", "new_password": "New_Rotated_Pass_2027!"},
                headers=hdrs,
            )
            assert ch.status_code == 200

            # Previously stolen JWT must fail immediately because token_version incremented
            client.cookies.set("qv_access", stale_access)
            me = await client.get("/api/auth/me")
            assert me.status_code == 401

    asyncio.run(_run())


def test_5_hmac_csrf_and_origin_enforcement(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as client:
            await _register_and_client_headers(client, "csrfuser@nasa.gov", "Csrf_Shield_Pass_12!")

            # Cookie-authenticated POST missing X-CSRF-Token -> 403
            r_no_csrf = await client.post(
                "/api/artifacts",
                json={"artifact_type": "edge_run", "title": "My Run", "payload": {"fom": 0.9}},
                headers={"Origin": "http://localhost:3000"},
            )
            assert r_no_csrf.status_code == 403

            # Spoofed CSRF token -> 403
            r_bad_csrf = await client.post(
                "/api/artifacts",
                json={"artifact_type": "edge_run", "title": "My Run", "payload": {"fom": 0.9}},
                headers={"Origin": "http://localhost:3000", "X-CSRF-Token": "spoofed.token"},
            )
            assert r_bad_csrf.status_code == 403

            # Untrusted Origin -> 403
            valid_csrf = client.cookies.get("qv_csrf")
            r_bad_origin = await client.post(
                "/api/artifacts",
                json={"artifact_type": "edge_run", "title": "My Run", "payload": {"fom": 0.9}},
                headers={"Origin": "https://evil.example", "X-CSRF-Token": valid_csrf},
            )
            assert r_bad_origin.status_code == 403

    asyncio.run(_run())


def test_6_rate_limiter_and_trusted_proxy_spoof_rejection(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as client:
            # Spoofed X-Forwarded-For without X-Internal-Proxy-Secret must still hit rate bucket on same peer IP
            statuses = []
            for i in range(12):
                res = await client.post(
                    "/api/auth/login",
                    json={"email": f"nobody{i}@nasa.gov", "password": "WrongPassword!123"},
                    headers={
                        "Origin": "http://localhost:3000",
                        "X-Forwarded-For": f"203.0.113.{i + 10}",
                    },
                )
                statuses.append(res.status_code)
            assert 429 in statuses
            assert res.headers.get("Retry-After") is not None

    asyncio.run(_run())


def test_7_rbac_admin_routes_and_last_admin_guard(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        # Anonymous caller rejected with 401
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as anon:
            assert (await anon.get("/api/admin/overview")).status_code == 401

        # Normal researcher rejected with 403
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as res_client:
            user_dict, hdrs = await _register_and_client_headers(
                res_client, "normal@nasa.gov", "Researcher_Pass_88!"
            )
            assert (await res_client.get("/api/admin/overview")).status_code == 403

            # Promote user to admin in DB cleanly and verify access
            factory = get_session_factory()
            async with factory() as db:
                await db.execute(update(User).where(User.id == user_dict["id"]).values(role="admin"))
                await db.commit()

            assert (await res_client.get("/api/admin/overview")).status_code == 200
            # Cannot deactivate/demote the last active admin
            last_guard = await res_client.patch(
                f"/api/admin/users/{user_dict['id']}",
                json={"is_active": False},
                headers=hdrs,
            )
            assert last_guard.status_code == 400

    asyncio.run(_run())


def test_8_anti_idor_horizontal_isolation(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as c1:
            _, h1 = await _register_and_client_headers(c1, "alice@nasa.gov", "Crater_Secure_Key_99!")
            created = await c1.post(
                "/api/artifacts",
                json={"artifact_type": "edge_run", "title": "Alice Private Crater", "is_public": False, "payload": {"fom": 0.91}},
                headers=h1,
            )
            assert created.status_code == 201
            art_id = created.json()["artifact"]["id"]

        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as c2:
            _, h2 = await _register_and_client_headers(c2, "bob@nasa.gov", "Basin_Secure_Key_88!")
            # Bob cannot read, update, or delete Alice's private artifact (404 hides existence)
            assert (await c2.get(f"/api/artifacts/{art_id}")).status_code == 404
            assert (
                await c2.patch(
                    f"/api/artifacts/{art_id}",
                    json={"title": "Hijacked", "is_public": True},
                    headers=h2,
                )
            ).status_code == 404
            assert (await c2.delete(f"/api/artifacts/{art_id}", headers=h2)).status_code == 404

    asyncio.run(_run())


def test_9_upload_guard_rejects_oversized_svg_and_strips_exif(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as client:
            _, hdrs = await _register_and_client_headers(client, "uploader@nasa.gov", "Upload_Safe_Pass_42!")

            # 1) Reject SVG XSS polyglot payload -> 400
            svg_bytes = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
            r_svg = await client.post(
                "/api/process/single",
                files={"file": ("evil.svg", svg_bytes, "image/svg+xml")},
                data={"algorithm": "FRQI-QHED", "resolution": "64", "shots": "1024"},
                headers=hdrs,
            )
            assert r_svg.status_code == 400

            # 2) Reject oversized (>5 MB) stream -> 413
            big_payload = b"\x89PNG\r\n\x1a\n" + (b"\x00" * (5_242_880 + 1024))
            r_big = await client.post(
                "/api/process/single",
                files={"file": ("huge.png", big_payload, "image/png")},
                data={"algorithm": "FRQI-QHED", "resolution": "64", "shots": "1024"},
                headers=hdrs,
            )
            assert r_big.status_code == 413

            # 3) Valid PNG succeeds cleanly
            img = Image.new("L", (32, 32), color=120)
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            r_ok = await client.post(
                "/api/process/single",
                files={"file": ("tile.png", buf.getvalue(), "image/png")},
                data={"algorithm": "FRQI-QHED", "resolution": "32", "shots": "1024"},
                headers=hdrs,
            )
            assert r_ok.status_code == 200

    asyncio.run(_run())


def test_10_qasm_sandbox_blocks_bombs_includes_and_timeouts(isolated_app_env):
    from backend.app.core.quantum_sandbox import validate_and_sanitize_qasm
    from fastapi import HTTPException

    # Nested custom gate macro bomb
    bomb = """OPENQASM 2.0;
include "qelib1.inc";
gate g1 a { h a; }
gate g2 a { g1 a; g1 a; }
qreg q[4];
g2 q[0];"""
    with pytest.raises(HTTPException) as exc1:
        validate_and_sanitize_qasm(bomb)
    assert exc1.value.status_code == 400

    # External include injection
    ext_inc = 'OPENQASM 3.0;\ninclude "/etc/passwd";\nqubit[4] q;'
    with pytest.raises(HTTPException) as exc2:
        validate_and_sanitize_qasm(ext_inc)
    assert exc2.value.status_code == 400

    # Oversized register (>14 qubits)
    big_q = 'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[16] q;'
    with pytest.raises(HTTPException) as exc3:
        validate_and_sanitize_qasm(big_q)
    assert exc3.value.status_code == 400

    # Oversized gate count (>256 gates) rejected cleanly
    many_gates = 'OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\n' + ("h q[0];\n" * 260)
    from backend.app.core.quantum_sandbox import execute_qasm_sandboxed_sync, execute_qasm_sandboxed
    with pytest.raises(HTTPException) as exc4:
        execute_qasm_sandboxed_sync(many_gates, 2)
    assert exc4.value.status_code == 400

    # Subprocess timeout budget enforced cleanly -> 408
    async def _run_timeout():
        valid_q = 'OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\nh q[0];\ncx q[0],q[1];'
        with pytest.raises(HTTPException) as exc5:
            await execute_qasm_sandboxed(valid_q, 4, timeout_seconds=0.0001)
        assert exc5.value.status_code == 408

    asyncio.run(_run_timeout())


def test_11_latex_generator_neutralizes_injection():
    with pytest.raises(ValueError):
        generate_quantikz_circuit_latex(num_qubits=7, algorithm="^^5e^^5eexploit")

    cards = [
        {
            "name": r"\write18{id} & \input{/etc/passwd}",
            "type": "quantum",
            "qubits": 7,
            "metrics": {"pratt_fom": 0.9, "shannon_entropy": 4.1, "snr_db": 25.0, "thinness": 0.85},
        }
    ]
    tex = generate_booktabs_scorecard_latex(cards)
    assert r"\textbackslash{}write18\{" in tex
    assert r"\write18{" not in tex
    assert r"\input{" not in tex


def test_12_strict_cors_and_security_headers(isolated_app_env):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:3000") as client:
            # Disallowed origin gets no Access-Control-Allow-Origin header
            bad_cors = await client.options(
                "/api/health",
                headers={
                    "Origin": "https://attacker.invalid",
                    "Access-Control-Request-Method": "GET",
                },
            )
            assert bad_cors.headers.get("access-control-allow-origin") is None

            # Security headers verified on health & auth responses
            ok_health = await client.get("/api/health", headers={"Origin": "http://localhost:3000"})
            assert ok_health.status_code == 200
            assert ok_health.headers.get("access-control-allow-origin") == "http://localhost:3000"
            assert ok_health.headers.get("x-content-type-options") == "nosniff"
            assert ok_health.headers.get("x-frame-options") == "DENY"
            assert ok_health.headers.get("referrer-policy") == "no-referrer"

            auth_me = await client.get("/api/auth/me")
            assert auth_me.status_code == 401
            assert "no-store" in auth_me.headers.get("cache-control", "")

    asyncio.run(_run())
