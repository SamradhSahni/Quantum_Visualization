# Security Audit & Production Hardening Implementation Plan (v2.0 — Production Grade)

**Project:** Quantum Edge Vision Platform (`d:\Quantum_Edge_FRQI`)  
**Audit & Revision Date:** 2026-11-12  
**Target Stack:** Next.js 15.2+ (App Router) • FastAPI (Async) • SQLAlchemy 2.x (`aiosqlite` / PostgreSQL) • Redis 7 • Qiskit 1.x

---

## 1. Executive Summary & Defense-in-Depth Architecture

The Quantum Edge Vision Platform is transitioning from an open research prototype to a hardened, multi-tenant scientific computing web application. Because the platform executes CPU- and memory-intensive quantum statevector simulations, parses user-supplied OpenQASM circuits, decodes image uploads, and generates LaTeX code, security must address both **traditional web vulnerabilities (OWASP Top 10)** and **scientific compute abuse (parser bombs, event-loop starvation, decompression bombs, and LaTeX injection)**.

```
[ Browser Client ]
       │  HTTPS Only (HSTS, Nonce CSP, __Host- HttpOnly Cookies + HMAC CSRF Header)
       ▼
[ Next.js 15 Edge Middleware & Hardened Proxy (/api/[...path]/route.ts) ]
       │  • Strips x-middleware-subrequest & spoofed X-Forwarded-For
       │  • Enforces path allowlist, URL canonicalization, & 6 MB body stream cap
       │  • Injects verified client IP + X-Internal-Proxy-Secret
       ▼
[ FastAPI Security Pipeline (backend/app/main.py) ]
       ├── 1. TrustedProxy & RequestID Middleware
       ├── 2. Sliding-Window Rate Limiter (Redis / Thread-Safe TTL)
       ├── 3. Strict CORS & Security Headers Middleware
       ├── 4. JWT / Cookie Auth + HMAC-CSRF + RBAC Dependency Guard
       └── 5. Isolated Execution Pools:
              ├─ Argon2id ThreadPool + Semaphore(8) (Max 512 MB RAM)
              └─ Qiskit ProcessPoolExecutor(4) + 12s Hard Timeout
```

---

## 2. Detailed Vulnerability Remediation & Engineering Specifications

### 2.1 Environment, Secrets & Git Hygiene

#### Vulnerabilities Addressed
- Missing `.gitignore` patterns for `.env*`, SQLite WAL files (`*.db-wal`, `*.db-shm`), and private keys.
- Unauthenticated Redis bound to `0.0.0.0:6379` in `infra/docker-compose.yml`.
- Four frontend components hardcoding `http://localhost:8000`, bypassing same-origin cookie and proxy protections:
  - `frontend/app/composer/page.tsx`
  - `frontend/components/architectures/PatchSandbox.tsx`
  - `frontend/components/arena/CustomQasmArena.tsx`
  - `frontend/components/composer/LunarPatchModal.tsx`

#### Implementation Specification
1. **Centralized Fail-Closed Configuration (`backend/app/core/settings.py`):**
   - Load settings via `pydantic-settings`:
     - `ENVIRONMENT`: `"development"` | `"staging"` | `"production"` (default `"development"`)
     - `SECRET_KEY`: Primary signing secret (minimum 32 bytes / 64 hex chars)
     - `INTERNAL_PROXY_SECRET`: 32-byte shared secret authenticating Next.js proxy headers
     - `ACCESS_TOKEN_MINUTES`: `15`
     - `REFRESH_TOKEN_DAYS`: `7`
     - `REFRESH_LEEWAY_SECONDS`: `10` (prevents parallel tab refresh race condition)
     - `DATABASE_URL`: `sqlite+aiosqlite:///./backend/data/quantum_vision.db` (or `postgresql+asyncpg://...`)
     - `REDIS_URL`: `redis://:password@redis:6379/0` (optional in local dev; required in prod)
     - `CORS_ALLOWED_ORIGINS`: Explicit list (never `["*"]`)
     - `TRUSTED_PROXIES`: `["127.0.0.1", "::1", "172.16.0.0/12"]`
     - `COOKIE_SECURE`: Auto-forced to `True` when `ENVIRONMENT == "production"`
     - `MAX_UPLOAD_BYTES`: `5_242_880` (5 MB)
     - `QISKIT_TIMEOUT_SECONDS`: `12.0`
     - `QISKIT_MAX_WORKERS`: `4`
   - **Startup Invariant Check:** If `ENVIRONMENT in ("production", "staging")`, raise `RuntimeError` immediately if `SECRET_KEY` or `INTERNAL_PROXY_SECRET` is missing, shorter than 32 characters, or has low Shannon entropy (e.g., repeated characters or known placeholder strings).
2. **Git Hygiene (`.gitignore` & `.env.example`):**
   - Append to `.gitignore`:
     ```gitignore
     # Security & Secrets
     .env
     .env.*
     !.env.example
     *.pem
     *.key
     *.crt
     # Databases
     *.db
     *.db-wal
     *.db-shm
     *.sqlite
     *.sqlite3
     backend/data/
     ```
3. **Eliminate Hardcoded Localhost Calls:**
   - Replace all four `http://localhost:8000/api/...` calls with centralized `apiClient` relative requests (`/api/...`) so every request inherits cookies, CSRF headers, and proxy protections.

---

### 2.2 Async Database Layer & Non-Blocking Argon2id Cryptography

#### Vulnerabilities Addressed
- Synchronous SQLite blocking the async event loop and throwing `database is locked` under concurrent requests.
- Synchronous Argon2id hashing starving the FastAPI event loop or exhausting container memory during login bursts.
- Timing side-channel user enumeration when verifying non-existent emails.

#### Implementation Specification
1. **Async SQLAlchemy 2.x Engine (`backend/app/db/database.py`):**
   - Use `create_async_engine(settings.database_url, future=True)` and `async_sessionmaker(expire_on_commit=False, class_=AsyncSession)`.
   - Register a synchronous connection hook for SQLite:
     ```python
     @event.listens_for(engine.sync_engine, "connect")
     def _set_sqlite_pragma(dbapi_connection, connection_record):
         cursor = dbapi_connection.cursor()
         cursor.execute("PRAGMA journal_mode=WAL;")
         cursor.execute("PRAGMA synchronous=NORMAL;")
         cursor.execute("PRAGMA foreign_keys=ON;")
         cursor.execute("PRAGMA busy_timeout=5000;")
         cursor.execute("PRAGMA temp_store=MEMORY;")
         cursor.close()
     ```
   - On startup, ensure `backend/data` directory has `0o700` permissions and database files have `0o600` permissions on POSIX systems.
2. **Hardened Data Models (`backend/app/db/models.py`):**
   - `User`:
     - `id`: `String(36)` UUIDv4 PK
     - `email`: `String(254)` unique, indexed, normalized via `email_validator` (lowercased, NFKC normalized)
     - `name`: `String(80)` sanitized display name
     - `password_hash`: `String(255)` Argon2id hash
     - `role`: `String(20)` constrained to `"viewer"`, `"researcher"`, `"admin"`
     - `is_active`: `Boolean` default `True`
     - `token_version`: `Integer` default `1` (incremented on password change or role change to invalidate existing access tokens)
     - `failed_login_attempts`: `Integer` default `0`
     - `last_failed_at`: `DateTime(timezone=True)` nullable
     - `created_at`, `updated_at`: UTC timestamps
   - `RefreshToken`:
     - `id`: `String(36)` UUIDv4 PK
     - `user_id`: `ForeignKey("users.id", ondelete="CASCADE")`, indexed
     - `token_family`: `String(36)` UUIDv4 indexed
     - `token_hash`: `String(64)` unique SHA-256 hex digest
     - `replaced_by_hash`: `String(64)` nullable (stores the new token hash during rotation for the 10-second grace window)
     - `expires_at`, `revoked_at`: `DateTime(timezone=True)`
     - `ip_subnet`: `String(64)`
     - `ua_hash`: `String(64)` SHA-256 of User-Agent
     - `created_at`: UTC timestamp
   - `UserArtifact`:
     - `id`: `String(36)` UUIDv4 PK
     - `owner_id`: `ForeignKey("users.id", ondelete="CASCADE")`, indexed
     - `artifact_type`: `"edge_run"` | `"qasm_submission"` | `"publication_snapshot"`
     - `title`: `String(120)` sanitized
     - `is_public`: `Boolean` default `False`
     - `payload_json`: `Text` (strictly capped at 256 KB serialized JSON)
     - `created_at`: UTC timestamp
   - `SecurityAuditLog`:
     - `id`: `Integer` PK autoincrement
     - `actor_user_id`: `String(36)` nullable, indexed
     - `event_type`: `String(48)` indexed (`LOGIN_SUCCESS`, `LOGIN_FAIL`, `TOKEN_REPLAY_BLOCKED`, `ADMIN_USER_UPDATE`, `RATE_LIMIT_EXCEEDED`, `MALICIOUS_UPLOAD_BLOCKED`, `QASM_SANDBOX_REJECTED`)
     - `ip_address`: `String(64)`
     - `request_id`: `String(36)`
     - `target_resource`: `String(128)`
     - `outcome`: `"allow"` | `"deny"` | `"error"`
     - `detail`: `String(512)` (sanitized; never stores tokens or passwords)
     - `created_at`: UTC timestamp, indexed
3. **Bounded Async Argon2id Hashing (`backend/app/core/security.py`):**
   - Configure `PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2, hash_len=32, salt_len=16)`.
   - Precompute `DUMMY_ARGON2_HASH = ph.hash("dummy_constant_time_mitigation_secret")` at module import time.
   - Wrap hashing and verification in a bounded semaphore + worker thread:
     ```python
     _ARGON2_SEMAPHORE = asyncio.Semaphore(8)  # Caps peak Argon2 RAM to 8 * 64MB = 512MB

     async def verify_password_async(plain_password: str, password_hash: str | None) -> bool:
         target_hash = password_hash if password_hash is not None else DUMMY_ARGON2_HASH
         async with _ARGON2_SEMAPHORE:
             try:
                 matched = await anyio.to_thread.run_sync(ph.verify, target_hash, plain_password)
                 return matched if password_hash is not None else False
             except VerifyMismatchError:
                 return False
     ```
   - **Password Policy:** Enforce `10 <= len(password) <= 128` characters (supporting NIST SP 800-63B passphrases), normalize Unicode via `NFKC` before hashing, and reject passwords containing the user's email local part or matching a top-1,000 breached password list.

---

### 2.3 Authentication, Race-Safe Token Rotation & Cryptographic CSRF

#### Vulnerabilities Addressed
- Mock `localStorage` authentication and Guest Bypass in `AuthContext.tsx` and `login/page.tsx`.
- Parallel Next.js fetch race condition during refresh token rotation.
- Subdomain cookie tossing against naive double-submit CSRF cookies.
- Permanent account lockout DoS against known researcher/admin emails.

#### Implementation Specification
1. **Cookie Naming & Attributes:**
   - In production (`COOKIE_SECURE=True`), prefix cookies with `__Host-` so browsers enforce `Secure`, `Path=/`, and forbid domain-wide scope:
     - Access Cookie: `__Host-qv_access` (dev: `qv_access`) — `HttpOnly=True`, `SameSite="lax"`, `Path="/"`, `Max-Age=900` (15m). JWT payload contains `sub`, `role`, `ver` (`token_version`), `fam` (`token_family`), `jti`, `iat`, `exp`, `iss="quantum-edge-api"`, `aud="quantum-edge-web"`. Strictly validate `algorithms=["HS256"]`.
     - Refresh Cookie: `qv_refresh` — `HttpOnly=True`, `SameSite="lax"`, `Path="/api/auth"`, `Max-Age=604800` (7d). Contains 32 bytes of `secrets.token_urlsafe(32)`.
     - CSRF Cookie: `__Host-qv_csrf` (dev: `qv_csrf`) — `HttpOnly=False`, `SameSite="lax"`, `Path="/"`, `Max-Age=604800`.
2. **HMAC-Bound CSRF Token (`backend/app/core/security.py`):**
   - Generate CSRF token bound to the current `token_family`:
     ```python
     def create_csrf_token(token_family: str) -> str:
         nonce = secrets.token_urlsafe(16)
         sig = hmac.new(
             settings.secret_key.encode(),
             f"{token_family}:{nonce}".encode(),
             hashlib.sha256
         ).hexdigest()
         return f"{nonce}.{sig}"
     ```
   - On every `POST`, `PUT`, `PATCH`, or `DELETE` request authenticated via cookies:
     1. Verify `Origin` header (or `Referer` if `Origin` is absent) matches `settings.cors_allowed_origins`.
     2. Verify `X-CSRF-Token` header matches `qv_csrf` cookie via `hmac.compare_digest` **and** verify the HMAC signature against the JWT's `fam` claim.
3. **Grace-Window Refresh Token Rotation (`POST /api/auth/refresh`):**
   - Look up `token_hash = sha256(raw_refresh_cookie)`.
   - **Case 1 (Active Token):** `revoked_at is None` and `expires_at > now`:
     - Generate new refresh token, set `old_token.revoked_at = now`, set `old_token.replaced_by_hash = new_token_hash`, insert new `RefreshToken` row, and issue new `qv_access`, `qv_refresh`, and `qv_csrf` cookies.
   - **Case 2 (Parallel Tab Race — Grace Window):** `revoked_at is not None` and `(now - revoked_at).total_seconds() <= settings.refresh_leeway_seconds` and `ip_subnet` + `ua_hash` match:
     - Do **not** revoke the family. Issue a valid `qv_access` and `qv_csrf` for that `token_family` so the concurrent browser tab succeeds seamlessly.
   - **Case 3 (True Token Replay Theft):** `revoked_at` is older than 10 seconds or comes from a different IP/User-Agent:
     - Execute `UPDATE refresh_tokens SET revoked_at = :now WHERE token_family = :fam`, log `TOKEN_REPLAY_BLOCKED` in `SecurityAuditLog`, clear auth cookies, and return `401 Unauthorized`.
4. **DoS-Resistant Brute-Force Protection (`POST /api/auth/login`):**
   - Track failures per `(email, ip_subnet)` in the rate limiter (blocking that IP subnet after 5 failures for 15 minutes).
   - On the `User` row, if `failed_login_attempts >= 8` within 15 minutes across distributed IPs, enforce a 3-second artificial tarpit delay (`await asyncio.sleep(3.0)`) and require a signed proof-of-work challenge header (`X-PoW-Solution`) before rejecting—preventing bots from locking out the legitimate admin.
5. **Single-Flight Frontend API Client (`frontend/lib/apiClient.ts`):**
   - Maintain a module-scoped `let activeRefreshPromise: Promise<boolean> | null = null;`.
   - When any API call returns `401`, all concurrent callers await the single `activeRefreshPromise` before retrying once.
   - Automatically read `qv_csrf` / `__Host-qv_csrf` from `document.cookie` and attach `X-CSRF-Token` on non-GET requests.

---

### 2.4 Hybrid RBAC Matrix, Anti-IDOR Isolation & Admin Security Console

#### Vulnerabilities Addressed
- Unauthenticated access to expensive compute endpoints and future admin/artifact routes.
- Horizontal privilege escalation (IDOR) between researchers' saved artifacts.
- UX friction if portfolio visitors cannot view precomputed demos (resolved via the **Hybrid Option A+ Architecture**).

#### Implementation Specification
1. **Hybrid Option A+ Role & Access Matrix (`backend/app/core/dependencies.py`):**

| Access Tier | Allowed Roles | Permitted Operations | Security Enforcement |
| :--- | :--- | :--- | :--- |
| **Tier 0: Public & Precomputed Showcase** | Anonymous, `viewer`, `researcher`, `admin` | `GET /api/health`, `GET /api/presets` (canonical sizes only: `64`, `128`, `256`, `512`), `GET /api/benchmark/research-suites`, `GET /api/circuits/{algorithm}`, `GET /api/studio/precomputed/{preset_id}`, `POST /api/auth/*` | Zero dynamic Qiskit simulation or file uploads allowed. Serves precomputed static JSON/PNG bundles for canonical presets so visitors can explore UI without CPU cost. |
| **Tier 1: Authenticated Viewer** | `viewer`, `researcher`, `admin` | `GET /api/auth/me`, `GET /api/artifacts/public`, `GET /api/artifacts/{id}` (if public) | Requires valid `qv_access` JWT + active user check (`user.is_active == True` and `jwt.ver == user.token_version`). |
| **Tier 2: Active Researcher Compute** | `researcher`, `admin` | All live compute `POST` routes (`/api/process/*`, `/api/studio/analyze`, `/api/benchmark/compare`, `/api/v1/composer/*`, `/api/v1/qml/*`, `/api/v1/gis/*`, `/api/v1/hardware/*`, `/api/v1/arena/evaluate-custom`, `/api/v1/publish/*`) + `/api/artifacts` CRUD | Requires `researcher` or `admin` role + valid HMAC CSRF token + compute concurrency quota (`max 2 concurrent simulations per user_id`). |
| **Tier 3: Platform Administrator** | `admin` only | `GET /api/admin/overview`, `GET /api/admin/users`, `PATCH /api/admin/users/{id}`, `GET /api/admin/audit-logs` | Enforces `require_admin`, logs every admin mutation in `SecurityAuditLog`, and forbids self-demotion or deactivating the last active admin. |

2. **Strict Anti-IDOR Ownership Queries (`backend/app/api/routes_artifacts.py`):**
   - Never fetch by `artifact_id` alone and check ownership in Python afterward. Include the ownership predicate directly in the SQL query:
     ```python
     stmt = select(UserArtifact).where(
         UserArtifact.id == artifact_id,
         or_(
             UserArtifact.owner_id == current_user.id,
             UserArtifact.is_public.is_(True),
             literal(current_user.role == "admin")
         )
     )
     ```
   - For `DELETE` and `PATCH`, restrict strictly to `UserArtifact.owner_id == current_user.id` (or `admin`). Return `404 Not Found` (not `403`) when an artifact ID does not belong to the caller so private UUIDs cannot be probed.

---

### 2.5 Process-Isolated Quantum Sandbox, Image Bomb Guard & Input Sanitization

#### Vulnerabilities Addressed
- OpenQASM parser bombs (recursive gate definitions), arbitrary file inclusion, and hung Qiskit simulations.
- Unchunked file uploads, decompression bombs, and EXIF metadata leaks in `image_io.py`.
- LaTeX command/macro injection in `quantikz_generator.py`.
- DOM XSS in `KaTeXBlock.tsx` and `visualization/circuit-studio/studio.js`.

#### Implementation Specification
1. **Isolated OpenQASM 2.0 Sandbox (`backend/app/api/routes_arena.py`):**
   - **Pre-Parse Validation:**
     1. Reject payloads where `len(qasm_code.encode('utf-8')) > 16_384` or line count exceeds `400`.
     2. Strip comments (`//...` and `/*...*/`) and normalize whitespace.
     3. Reject any statement containing `pragma`, `extern`, `opaque`, `barrier` abuse (>32 barriers), or any `include` statement other than `include "qelib1.inc";` or `include "stdgates.inc";` (case-insensitive).
     4. **Macro Bomb Prevention:** Allow at most `3` custom `gate` declarations, and forbid calling a custom gate inside another custom `gate` body.
   - **Subprocess Execution with Hard Timeout:**
     - Parse and execute the circuit inside a dedicated `ProcessPoolExecutor(max_workers=4)` worker function:
       - Pass `custom_instructions=()` and restrict `qreg` total qubits across all registers to `sum(reg.size for reg in qc.qregs) <= 14`.
       - Verify `qc.size() <= 256` total gates and `qc.depth() <= 128` *before* calling `Statevector.from_instruction(qc)`.
       - Wrap the worker future in `await asyncio.wait_for(loop.run_in_executor(qiskit_pool, _safe_qasm_worker, qasm_code), timeout=12.0)`. If `TimeoutError` triggers, terminate the worker process cleanly and return `HTTP 408 / 422 ("Circuit simulation exceeded time budget")`.
2. **Streaming Upload & Decompression Bomb Guard (`backend/app/utils/image_io.py`):**
   - **Chunked Stream Reader:**
     ```python
     async def read_upload_bounded(upload_file: UploadFile, max_bytes: int = 5_242_880) -> bytes:
         chunks = bytearray()
         while chunk := await upload_file.read(65_536):
             chunks.extend(chunk)
             if len(chunks) > max_bytes:
                 raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")
         return bytes(chunks)
     ```
   - **Magic-Byte Verification & Safe Decode:**
     - Inspect the first 12 bytes to allow strictly **PNG** (`\x89PNG\r\n\x1a\n`), **JPEG** (`\xff\xd8\xff`), or **WebP** (`RIFF....WEBP`). Reject SVG, TIFF, PDF, GIF, and HTML polyglots.
     - Set `Image.MAX_IMAGE_PIXELS = 4_194_304` (2048×2048 ceiling) globally.
     - Open with Pillow, verify `getattr(img, "n_frames", 1) == 1`, verify `8 <= img.width <= 2048` and `8 <= img.height <= 2048`, convert to grayscale/RGB `np.asarray(img.convert("L"), dtype=np.uint8)`, and immediately close the Pillow object—**completely stripping all EXIF, GPS, XMP, and ICC metadata**.
3. **LaTeX / Quantikz Escaping (`backend/app/domain/publish/quantikz_generator.py`):**
   - Reject any string containing `^^` (TeX hex escape trigraphs) or control characters (`ord(c) < 32`).
   - Escape all user-supplied labels and titles through a strict translation map before template interpolation:
     ```python
     LATEX_ESCAPE_MAP = str.maketrans({
         "\\": r"\textbackslash{}",
         "{": r"\{",
         "}": r"\}",
         "$": r"\$",
         "&": r"\&",
         "#": r"\#",
         "^": r"\textasciicircum{}",
         "_": r"\_",
         "%": r"\%",
         "~": r"\textasciitilde{}",
     })
     ```
4. **KaTeX & Circuit Studio XSS Hardening:**
   - In `frontend/components/ui/KaTeXBlock.tsx`:
     - Call `katex.renderToString(math, { displayMode, throwOnError: false, strict: "warn", trust: false, maxSize: 20, maxExpand: 100 })`.
     - If rendering fails, render `<code className="font-mono text-xs text-amber-300">{math}</code>` via standard React text nodes—never fall back to raw `dangerouslySetInnerHTML`.
   - In `visualization/circuit-studio/studio.js`:
     - Replace `.innerHTML` string interpolations with DOM node construction (`document.createElement` + `.textContent`).

---

### 2.6 Sliding-Window Rate Limiting & Concurrency Quotas

#### Implementation Specification (`backend/app/core/rate_limiter.py`)
- **Trusted Client IP Extraction:** Read `X-Forwarded-For` / `X-Real-Client-IP` **only** when the request carries a valid `X-Internal-Proxy-Secret` header from the Next.js proxy or originates from a peer IP in `settings.trusted_proxies`. Otherwise, use `request.client.host`.
- **Dual-Layer Rate Limits (Redis Lua script in production; thread-safe bounded `OrderedDict` TTL cache in local dev, capped at 50,000 keys to prevent memory exhaustion):**

| Bucket | Target Routes | Allowance | Concurrency Cap |
| :--- | :--- | :--- | :--- |
| `auth_strict` | `POST /api/auth/login`, `/register`, `/change-password` | **10 req / 5 min** per `(ip_subnet, email_hash)` | Max 8 global Argon2 threads |
| `auth_refresh` | `POST /api/auth/refresh` | **30 req / 5 min** per IP | — |
| `read_standard` | `GET /api/health`, `/presets*`, `/circuits/*`, `/benchmark/research-suites`, `/auth/me`, `/artifacts*` | **180 req / min** per client | — |
| `compute_heavy` | `POST /api/process/*`, `/studio/*`, `/benchmark/*`, `/v1/*` | **45 req / min** per user | **Max 2 in-flight jobs per user** + **Max 4 global Qiskit worker processes** |
| `admin_ops` | `/api/admin/*` | **60 req / min** per admin | — |

- Every response includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. Exceeding a bucket returns `HTTP 429` JSON with `Retry-After` seconds.

---

### 2.7 Hardened Next.js Catch-All Proxy, Middleware & Nonce CSP

#### Implementation Specification
1. **Hardened Next.js Route Proxy (`frontend/app/api/[...path]/route.ts`):**
   - **Allowlisted Top-Level Prefixes:** `const ALLOWED_PREFIXES = new Set(["health", "presets", "circuits", "process", "studio", "benchmark", "v1", "auth", "admin", "artifacts"]);`
   - **Path Canonicalization & SSRF Defense:**
     - Reject any segment containing `..`, `\`, `\0`, `%2e`, `%2f`, or `@`.
     - Construct `const targetUrl = new URL(\`/api/\${cleanSegments.join("/")}\${req.nextUrl.search}\`, BACKEND_INTERNAL_URL);` and assert `targetUrl.origin === new URL(BACKEND_INTERNAL_URL).origin`.
   - **Multi-Cookie Forwarding & Proxy Authentication:**
     - Forward incoming `cookie`, `x-csrf-token`, `content-type`, and `accept` headers.
     - Inject `X-Internal-Proxy-Secret: process.env.INTERNAL_PROXY_SECRET` and `X-Real-Client-IP` (derived from platform socket/trusted ingress).
     - Copy upstream cookies back using `for (const cookie of upstreamRes.headers.getSetCookie()) { resHeaders.append("Set-Cookie", cookie); }`.
2. **Next.js Edge Middleware (`frontend/middleware.ts`) & Nonce CSP:**
   - **CVE-2025-29927 Mitigation:** Pin `next >= 15.2.3` in `frontend/package.json` and configure ingress/ALB/Nginx to drop any incoming `x-middleware-subrequest` header.
   - Generate a per-request 128-bit cryptographic nonce (`crypto.randomUUID()`) and set `Content-Security-Policy`:
     ```text
     default-src 'self';
     script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: blob:;
     font-src 'self' data:;
     connect-src 'self';
     worker-src 'self' blob:;
     frame-ancestors 'none';
     object-src 'none';
     base-uri 'self';
     form-action 'self';
     ```
     *(In local `NODE_ENV === "development"`, append `'unsafe-eval'` to `script-src` for Next.js React Refresh / HMR).*

---

### 2.8 Container, Redis & Cloud Infrastructure Hardening

1. **Docker Compose (`infra/docker-compose.yml`) & Dockerfiles:**
   - Run both `backend` and `frontend` containers as non-root `user: "10001:10001"`.
   - Enable `read_only: true` root filesystems with `tmpfs: ["/tmp"]` and a dedicated named volume mounted at `/app/backend/data`.
   - Set `security_opt: ["no-new-privileges:true"]` and `cap_drop: ["ALL"]`.
   - Place `redis` on an internal-only bridge network (`internal: true`), remove `ports: ["6379:6379"]`, and require `--requirepass ${REDIS_PASSWORD} --rename-command FLUSHALL "" --rename-command CONFIG ""`.
2. **Standalone Visualization Server (`visualization/real_case_server.py`):**
   - Bind strictly to `127.0.0.1` (never `0.0.0.0`).
   - Resolve requested file paths via `resolved = (JOB.output / rel_path).resolve()`, assert `resolved.is_relative_to(JOB.output.resolve())`, and allow only `.html`, `.js`, `.css`, `.json`, and `.png` extensions (explicitly blocking `.log`, `.bin`, `.py`, `.db`, and dotfiles).

---

## 3. Phased Execution Roadmap

### Phase 1: Foundation, Async DB & Bounded Cryptography
1. Update `.gitignore`, create `.env.example`, and pin `argon2-cffi>=23.1.0`, `PyJWT>=2.8.0`, `sqlalchemy>=2.0.0`, `aiosqlite>=0.20.0`, `email-validator>=2.1.0`, `anyio>=4.0.0` in `backend/requirements.txt`.
2. Build `backend/app/core/settings.py` (fail-closed config + entropy checks) and `backend/app/core/sanitize.py` (Unicode NFKC normalization, control-char stripping, LaTeX & filename sanitizers).
3. Build `backend/app/core/security.py` (async thread-pooled Argon2id with `Semaphore(8)` + dummy constant-time verification, HS256 JWT with `iss`/`aud`/`ver`/`fam` claims, and HMAC-bound CSRF tokens).
4. Build `backend/app/db/database.py` (`sqlite+aiosqlite` WAL engine with `0o600` file permissions) and `backend/app/db/models.py` (`User`, `RefreshToken`, `UserArtifact`, `SecurityAuditLog`).

### Phase 2: Auth Lifecycle, Grace-Window Rotation, RBAC & Anti-IDOR
5. Build `backend/app/core/dependencies.py` (`get_current_user`, `require_user`, `require_researcher`, `require_admin`, `verify_hmac_csrf`, `acquire_user_compute_slot`).
6. Build `backend/app/api/routes_auth.py` (`/register`, `/login`, `/refresh` with 10-second parallel-tab grace window, `/logout`, `/me`, `/change-password` incrementing `token_version`).
7. Build `backend/app/api/routes_artifacts.py` (SQL-level ownership predicates) and `backend/app/api/routes_admin.py` (user management, self-demotion guard, audit log viewer).

### Phase 3: Compute Sandboxing, Upload Hardening & Rate Limiting
8. Build `backend/app/core/rate_limiter.py` (trusted proxy verification, sliding-window buckets, per-user compute semaphore).
9. Build `backend/app/core/quantum_sandbox.py` (`ProcessPoolExecutor(4)` with 12s timeout and OpenQASM macro-bomb AST/regex validator) and wire into `routes_arena.py` and `routes_composer.py`.
10. Harden `backend/app/utils/image_io.py` (64 KB chunk streaming, 5 MB cap, PNG/JPEG/WebP magic-byte check, `MAX_IMAGE_PIXELS`, single-frame check, EXIF stripping via NumPy conversion) and apply strict Pydantic `Field(ge=..., le=...)` bounds across all API routers.
11. Harden `backend/app/domain/publish/quantikz_generator.py` with character-level LaTeX escaping and wire middleware/handlers into `backend/app/main.py`.

### Phase 4: Frontend Auth Refactor, Single-Flight Proxy & Nonce CSP
12. Create `frontend/lib/apiClient.ts` (single-flight refresh mutex, automatic `X-CSRF-Token` injection, `credentials: "include"`) and replace the 4 hardcoded `localhost:8000` calls.
13. Refactor `AuthContext.tsx`, `login/page.tsx`, `signup/page.tsx`, `Navbar.tsx`, and create `frontend/app/admin/page.tsx`.
14. Harden `frontend/app/api/[...path]/route.ts` (`getSetCookie()` loop, prefix allowlist, SSRF origin assertion, `X-Internal-Proxy-Secret`), `frontend/middleware.ts` (nonce CSP), `KaTeXBlock.tsx`, `studio.js`, and `infra/docker-compose.yml`.

### Phase 5: Automated 12-Vector Security Verification Suite
15. Implement `backend/tests/test_security_suite.py` verifying:
    - [x] Async Argon2id hashing, password policy enforcement, and constant-time unknown email verification
    - [x] Mass-assignment immunity (`"role": "admin"` ignored on `/api/auth/register`)
    - [x] Parallel refresh token requests within 10s succeed without false-positive family revocation, while replay after 10s revokes the entire token family
    - [x] Password change increments `token_version` and immediately invalidates previously issued access JWTs
    - [x] HMAC-CSRF guard blocks state-changing cookie requests missing or spoofing `X-CSRF-Token` or `Origin`
    - [x] Spoofed `X-Forwarded-For` headers without `X-Internal-Proxy-Secret` are ignored by the rate limiter
    - [x] Admin routes return `401` for anonymous, `403` for `researcher`, `200` for `admin`, and block deactivating the last admin
    - [x] Anti-IDOR blocks User B from reading, updating, or deleting User A's private artifacts (`404`)
    - [x] Upload guard rejects >5 MB streams (`413`), SVG/HTML polyglots (`400`), decompression bombs (`400`), and strips EXIF metadata
    - [x] OpenQASM sandbox blocks nested custom gate bombs, external `include` paths, >14 qubits, and terminates simulations exceeding 12s
    - [x] LaTeX generator neutralizes `\write18`, `\input`, `\catcode`, and `^^` hex trigraphs
    - [x] Security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Cache-Control: no-store`) are present on responses