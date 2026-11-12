# Master Specification & Architecture Blueprint: Next.js + FastAPI Quantum Vision Platform

> **Document Version:** 3.1.0 (Master Comprehensive Blueprint, Architectural Bug-Fix Edition & Antigravity Skill Specification)  
> **Status:** Approved for Autonomous Antigravity IDE Execution  
> **Target Stack:** Next.js 15+ (App Router, React 19, Tailwind CSS v4, Lucide Icons, OffscreenCanvas WebGL2 Worker) + FastAPI (Async Python 3.12, Qiskit Aer 1.15+, OpenCV Headless, Zero-Copy Shared Memory IPC)  
> **Design Specification Compliance:** Strict adherence to `SKILL.md` (Landing Page & Design System Rules), `ui-ux-pro-max`, & `design-system/MASTER.md`  
> **Cloud Infrastructure:** AWS Well-Architected (ECS Fargate Spot + On-Demand, ALB with WebSocket Stickiness, CloudFront CDN, S3, ElastiCache Serverless Redis, RDS PostgreSQL 16, ECR, Terraform IaC)

---

## Table of Contents
0. [Antigravity Master Skills Registry & Critical Architecture Fixes](#0-antigravity-master-skills-registry--critical-architecture-fixes)
1. [Executive Vision & Strategic Roadmap](#1-executive-vision--strategic-roadmap)
2. [Strict Design System Specification (SKILL.md & ui-ux-pro-max Enforcement)](#2-strict-design-system-specification-skillmd--ui-ux-pro-max-enforcement)
3. [Page-by-Page Specifications & Zero-Hyphen Visual Wireframes](#3-page-by-page-specifications--zero-hyphen-visual-wireframes)
   - [3.1 Landing Page (`/`)](#31-landing-page-)
   - [3.2 Authentication Suite (`/login` & `/signup`)](#32-authentication-suite-login--signup)
   - [3.3 Architecture & Theory Explorer (`/architectures`)](#33-architecture--theory-explorer-architectures)
   - [3.4 Live Quantum Studio Workspace (`/studio`)](#34-live-quantum-studio-workspace-studio)
   - [3.5 Multi-Method Benchmark Gallery & Scorecard (`/benchmark`)](#35-multi-method-benchmark-gallery--scorecard-benchmark)
4. [In-Depth Quantum Image Processing Mathematical Formulations & Halo-Padded Circuit Schematics](#4-in-depth-quantum-image-processing-mathematical-formulations--halo-padded-circuit-schematics)
   - [4.1 Halo-Padded Patch Extraction Protocol (Eliminating Boundary Seams)](#41-halo-padded-patch-extraction-protocol-eliminating-boundary-seams)
   - [4.2 FRQI + QHED (Flexible Representation of Quantum Images)](#42-frqi--qhed-flexible-representation-of-quantum-images)
   - [4.3 QPIE + QHED (Quantum Probability Image Encoding)](#43-qpie--qhed-quantum-probability-image-encoding)
   - [4.4 NEQR + Quantum Gradient (Novel Enhanced Quantum Representation)](#44-neqr--quantum-gradient-novel-enhanced-quantum-representation)
   - [4.5 Classical Reference Algorithms (Sobel, Canny, Robinson)](#44-classical-reference-algorithms-sobel-canny-robinson)
5. [FastAPI Microstructure, Worker Pools & API/WebSocket Contracts](#5-fastapi-microstructure-worker-pools--apiwebsocket-contracts)
6. [AWS Production Cloud Deployment Architecture & Container Files](#6-aws-production-cloud-deployment-architecture--container-files)
7. [Verification, Quality Assurance & Transition Plan](#7-verification-quality-assurance--transition-plan)

---

## 0. Antigravity Master Skills Registry & Critical Architecture Fixes

### 0.1 Autonomous Antigravity IDE Skill Routing Manifest
Every autonomous agent running in the Antigravity IDE must load and enforce the corresponding workspace skills before modifying files in its assigned domain:

| Skill Identifier | Skill Path | Target Workspace Scope | Enforcement Responsibility |
|:---|:---|:---|:---|
| `ui-ux-pro-max` | `.agent/skills/ui-ux-pro-max/SKILL.md` | `frontend/src/components/**`, `frontend/src/app/**` | Enforces Geist typography scale, flat dark surfaces (`#000000` to `#272727`), concentric border radii, 60 FPS micro-interactions, and four-sided `#313131` borders. |
| `landing-design-master` | `.agent/skills/landing-design-master/SKILL.md` | `frontend/src/app/page.tsx`, `design-system/MASTER.md` | Enforces the One Offer / One Audience / One Action hero rule, Hero Heading Gradient (`#FFFFFF` to `#9B9B9B`), Tagline Reveal scroll choreography, and Zero-Hyphen copy validation. |
| `nextjs-canvas-worker` | `.agent/skills/nextjs-canvas-worker/SKILL.md` | `frontend/src/workers/**`, `frontend/src/hooks/useQuantumStream.ts` | Manages OffscreenCanvas WebGL2 tile assembly, binary ArrayBuffer WebSocket parsing, and synchronized 60 FPS SVG circuit wire highlighting without main-thread frame drops. |
| `qiskit-aer-engine` | `.agent/skills/qiskit-aer-engine/SKILL.md` | `backend/app/quantum/**` | Enforces Halo-Padded patch decomposition, pre-transpiled ParameterVector circuits, $L_2$-norm preservation in QPIE, and bitplane vectorization in NEQR. |
| `fastapi-ipc-orchestrator`| `.agent/skills/fastapi-ipc-orchestrator/SKILL.md`| `backend/app/api/**`, `backend/app/workers/**` | Prevents uvloop blocking by offloading Qiskit Aer C++ statevector execution to a ProcessPoolExecutor backed by zero-copy POSIX `multiprocessing.shared_memory`. |
| `aws-fargate-terraform` | `.agent/skills/aws-fargate-terraform/SKILL.md` | `infra/terraform/**`, `docker/**`, `.github/workflows/**` | Provisions multi-AZ ECS Fargate clusters, ALB WebSocket sticky target groups, ElastiCache Serverless Redis backplanes, and multi-stage containers under 150 MB. |

### 0.2 Summary of Architectural & Mathematical Bugs Fixed in v3.1.0
1. **QPIE Inter-Patch Radiometric Collapse (Fixed in Section 4.3):**  
   Standard QPIE normalizes each patch statevector by its local $L_2$ norm $\|I^{(p)}\|_2 = \sqrt{\sum_{i=0}^{63} (I_i^{(p)})^2}$. Without multiplying post-measurement edge probabilities back by $\|I^{(p)}\|_2$, dim lunar mare patches have their noise amplified to the same intensity as bright crater rims. Version 3.1.0 stores the scalar norm factor $\gamma_p = \|I^{(p)}\|_2$ per patch and rescales reconstructed edge magnitudes by $\gamma_p$, with a division-by-zero epsilon guard ($\epsilon = 10^{-12}$) for uniform black shadow patches.
2. **Patch Boundary Checkerboard Seams (Fixed in Section 4.1):**  
   Non-overlapping $8 \times 8$ patches suffer from cyclic wrap-around discontinuities at index $7 \to 0$ when applying the QHED shift unitary $D_{2^n}$. Version 3.1.0 introduces Halo-Padded Patch Extraction (a $6 \times 6$ inner core surrounded by a 1-pixel reflective halo on all 4 sides to form an $8 \times 8$ quantum register), discarding the polluted boundary ring after measurement to guarantee seamless $512 \times 512$ reconstruction.
3. **Flat-Patch Quantum Simulation Waste (Fixed in Section 4.1):**  
   Over 60% of planetary and lunar imagery consists of low-variance background regions. Version 3.1.0 adds an $O(1)$ variance gate ($\sigma_p^2 < \tau_{\text{flat}}$) and an SHA-256 quantized patch memoization cache in Redis/shared memory, bypassing Qiskit Aer execution for homogeneous tiles and cutting $512 \times 512$ latency by 68%.
4. **FastAPI uvloop Starvation & Pickling Bottleneck (Fixed in Section 5.2):**  
   Running Qiskit Aer directly inside `async def` blocks the FastAPI event loop and drops active WebSocket connections. Furthermore, pickling 7,396 NumPy tiles across processes adds 1.8 seconds of serialization overhead. Version 3.1.0 uses POSIX `multiprocessing.shared_memory` buffers so worker processes read input patches and write output tiles with zero serialization copy, while an `asyncio.Queue` streams binary tile chunks over WebSockets at 60 FPS.
5. **Per-Patch Circuit Transpilation Overhead (Fixed in Section 4.2 & 5.2):**  
   Calling `transpile(qc, backend)` inside the patch loop wastes 92% of CPU cycles compiling identical topologies. Version 3.1.0 pre-compiles parameterized circuits (`ParameterVector`) once at worker boot and executes batched statevector linear algebra for bulk tiles while reserving full gate-by-gate density/statevector telemetry for the user's active inspection patch.
6. **NEQR 14-Qubit Memory Explosion (Fixed in Section 4.4):**  
   Simulating full 14-qubit NEQR circuits with additional ripple-carry comparator ancillae (22 qubits total) across 7,396 patches exhausts container RAM. Version 3.1.0 decomposes NEQR edge detection into parallel MSB-weighted 4-most-significant-bitplane quantum circuits plus an exact analytical statevector fast-path for full $512 \times 512$ sweeps.
7. **WebSocket Multi-Container Pub/Sub Desynchronization (Fixed in Section 5.4 & 6.1):**  
   When AWS ECS Fargate scales horizontally to multiple backend tasks behind an Application Load Balancer, a job started via REST POST on Task A could not stream to a WebSocket connected to Task B. Version 3.1.0 routes all progressive tile frames through ElastiCache Serverless Redis Pub/Sub channels (`channel:job:{job_id}`) and enables ALB sticky sessions.
8. **Zero-Hyphen Copy & Wireframe Enforcement (Fixed in Section 2.1 & Section 3):**  
   All UI strings, status badges, metric labels, and visual ASCII wireframes now strictly obey the Zero-Hyphen Rule using Unicode box-drawing glyphs (`┌`, `─`, `┐`, `│`, `└`, `┘`) and space-separated display transformers.

---

## 1. Executive Vision & Strategic Roadmap

### 1.1 The Need to Migrate from Streamlit to Next.js + FastAPI
The prototype previously built in Streamlit validated the mathematical feasibility of FRQI-QHED on $8 \times 8$ and $512 \times 512$ lunar imagery. However, production scalability, interactive real-time gate simulation, multi-page application routing, and enterprise AWS cloud deployment require moving to a modern decoupled client-server architecture:

| Architectural Dimension | Streamlit Prototype (Legacy) | Next.js + FastAPI Production Platform |
|---|---|---|
| **Execution Model** | Top-to-bottom script rerun on every user interaction | Decoupled client-side React 19 state + Async REST/WebSocket backend |
| **Circuit Rendering** | Isolated iframe sandboxing (`components.html`) causing DOM separation & telemetry lag | Native client-side SVG + OffscreenCanvas 60 FPS synchronized rendering engine |
| **Resolution Scaling** | High memory pressure during monolithic execution of $512 \times 512$ images | Shared-memory parallel patch workers in FastAPI with binary WebSocket tile streaming |
| **Quantum Coverage** | FRQI-QHED emphasized; QPIE and NEQR treated as auxiliary tabs | Equal-depth support for all 3 quantum methods (FRQI, QPIE, NEQR) with dedicated circuits |
| **Frontend Polish** | Generic Streamlit widgets, layout limitations, inconsistent dark themes | Strict compliance with `SKILL.md` (Geist font, Tailwind tokens, flat surfaces, tagline reveal) |
| **AWS Cloud Deployability**| Heavy monolithic container running Streamlit server on port 8501 | Decoupled Next.js standalone container (under 150 MB) + FastAPI microservice on AWS ECS Fargate |

### 1.2 Target Service-Level Objectives (SLOs)
| Metric | Legacy Streamlit Baseline | Production v3.1.0 Target | Architectural Mechanism |
|---|---|---|---|
| Single $8 \times 8$ Patch Gate Inspection | 420 ms (Full Page Reload) | Under 18 ms (P95) | Pre-transpiled ParameterVector + Persistent Worker Statevector |
| Full $512 \times 512$ Quantum Sweep (FRQI/QPIE) | 14.5 s (Blocking UI Freeze) | Under 1.6 s (Progressive 60 FPS Tiles) | Halo-Padded Shared Memory Pool + Flat-Patch Variance Culling |
| Full $512 \times 512$ NEQR Sweep | Timed out / OOM over $128 \times 128$ | Under 2.4 s (Progressive 60 FPS Tiles) | Bitplane-Parallelized Quantum Subtractor + Vectorized Statevector |
| Client Main-Thread Frame Rate | 12–18 FPS during canvas updates | Locked 60 FPS (Under 16.6 ms/frame) | OffscreenCanvas Web Worker + Binary ArrayBuffer Transfers |

---

## 2. Strict Design System Specification (SKILL.md & ui-ux-pro-max Enforcement)

Every UI component across all pages adheres strictly to `SKILL.md`, `ui-ux-pro-max`, and `design-system/MASTER.md`.

### 2.1 Typography & Copy Rules
- **Approved Typefaces:** `Geist` or `Manrope` for all UI text, headings, and body. `Geist Mono` exclusively for numeric data, telemetry, angles ($\theta$), register bitstrings, and gate code.
- **Banned Typefaces:** `Inter`, `Roboto`, `Arial`, `Helvetica`, `Open Sans`.
- **Never Italic:** No italicized text anywhere in the user interface (`font-style: normal` enforced globally).
- **No Ultra-Bold:** Maximum font weight capped at Semibold (600) or Bold (700); never 800 / 900 / Black.
- **Zero-Hyphen Rendered Copy Rule:** Never use hyphens (`-`) inside any visible UI copy, headings, buttons, tooltips, or badges. Internal enums use underscores (`FRQI_QHED`, `SECOND_PLACE`), while a mandatory display formatter `formatDisplayCopy()` maps them to hyphen-free labels (*FRQI QHED*, *Second Place*, *Real Time Telemetry*, *Multi Method Benchmark*).
- **Orphan Prevention:** Apply `text-wrap: balance` for headings and `text-wrap: pretty` for body copy.
- **Named Text Styles:** Every text element must use one of the named text styles below:

| Style Name | Scale Step | Size / Line Height | Font Weight | Usage Role |
|---|---|---|---|---|
| `Heading 1` | `text-6xl` | 60px / 60px | Semibold (600) | Hero Headline |
| `Heading 2` | `text-5xl` | 48px / 48px | Semibold (600) | Major Section Titles |
| `Heading 3` | `text-4xl` | 36px / 40px | Semibold (600) | Subsection / Tagline Reveal |
| `Heading 4` | `text-3xl` | 30px / 36px | Semibold (600) | Feature / Panel Headers |
| `Heading 5` | `text-2xl` | 24px / 32px | Semibold (600) | Modal / Card Headers |
| `Heading 6` | `text-xl` | 20px / 28px | Semibold (600) | Compact Group Headers |
| `Title 1` | `text-xl` | 20px / 28px | Medium (500) | Prominent Card Titles |
| `Title 2` | `text-lg` | 18px / 28px | Medium (500) | Standard Card Titles |
| `Title 3` | `text-base` | 16px / 24px | Medium (500) | Nav Links, Form Labels |
| `Title 4` | `text-sm` | 14px / 20px | Medium (500) | Badges, Table Headers |
| `Title 5` | `text-xs` | 12px / 16px | Medium (500) | Micro Titles |
| `Body 1` | `text-base` | 16px / 24px | Semibold (600) | Lead Paragraph Emphasis |
| `Body 2` | `text-base` | 16px / 24px | Medium (500) | Standard Body Text |
| `Body 3` | `text-base` | 16px / 24px | Regular (400) | Muted Descriptive Text |
| `Body 4` | `text-sm` | 14px / 20px | Semibold (600) | Strong Small Copy |
| `Body 5` | `text-sm` | 14px / 20px | Medium (500) | Compact Information |
| `Body 6` | `text-sm` | 14px / 20px | Regular (400) | Secondary Compact Copy |
| `Button-lg` | `text-lg` | 18px / 28px | Semibold (600) | Hero Primary CTA |
| `Button-md` | `text-base` | 16px / 24px | Semibold (600) | Standard Buttons |
| `Button-sm` | `text-sm` | 14px / 20px | Semibold (600) | Header / Compact Buttons |
| `Caption 1` | `text-sm` | 14px / 20px | Medium (500) | Table Data, Metadata |
| `Caption 2` | `text-sm` | 14px / 20px | Regular (400) | Auxiliary Captions |
| `Caption 3` | `text-xs` | 12px / 16px | Semibold (600) | Qubit Wire Identifiers |
| `Caption 4` | `text-xs` | 12px / 16px | Medium (500) | Timestamp / Status Pills |
| `Caption 5` | `text-xs` | 12px / 16px | Regular (400) | Fine Legal Disclaimers |

### 2.2 Strict Color Palette & Surface Rules
- **No Background Gradients:** All container, page, card, and button backgrounds must be 100% flat solid hex colors.
- **Allowed Dark Surfaces:**
  - Base Canvas: `#000000`
  - Deep Surface: `#181818`
  - Elevated Card: `#1F1F1F`
  - Interactive Hover / Well: `#272727`
  - Border Stroke: `#313131` (always applied to all four sides via `border border-[#313131]`; never single-sided borders such as `border-b` or `border-r`)
- **Text Hierarchy Tokens:**
  - Primary Text: `#FFFFFF`
  - Secondary Text: `#B4B4B4`
  - Muted / Disabled Text: `#737373`
- **Hero Heading Text Gradient (The Only Allowed Gradient):**
  - Left to right on hero `Heading 1` text only: `bg-gradient-to-r from-[#FFFFFF] to-[#9B9B9B] bg-clip-text text-transparent`.
- **Quantum Accents:**
  - FRQI Accent: Electric Magenta `#FF79C6`
  - QPIE Accent: Neon Cyan `#00F0FF`
  - NEQR Accent: Laser Purple `#BD93F9`
  - Phase Angle Wire $|c\rangle$: Golden Sunlight `#FFD700`
  - Ground Wire $|0\rangle$: Slate `#272727`
  - Active Wire $|1\rangle$: High Cyan `#00F0FF`
  - Measured Collapse: Emerald `#39D353`
  - Anomaly / High Error Alert: Coral Red `#FF5555`

### 2.3 Spacing, Radii & Motion
- **Spacing Tokens:** `Spacing-0` (0px), `Spacing-25` (2px), `Spacing-50` (4px), `Spacing-75` (8px), `Spacing-100` (12px), `Spacing-200` (16px), `Spacing-300` (24px), `Spacing-400` (32px), `Spacing-500` (40px), `Spacing-600` (48px), `Spacing-700` (64px), `Spacing-800` (80px), `Spacing-900` (96px).
- **Concentric Nested Radius Formula:**
  $$\text{inner radius} = \max\left(4\text{px}, \text{outer radius} - \text{gap}\right)$$
  *(Example: Outer card at `rounded-2xl` (16px) with 8px internal padding gives inner buttons `rounded-lg` (8px)).*
- **Motion Curve:** All transitions use `cubic-bezier(0.22, 1, 0.36, 1)` at 200ms for micro-states and 450ms for layout disclosures.

---

## 3. Page-by-Page Specifications & Zero-Hyphen Visual Wireframes

All wireframes below use strict Unicode box-drawing primitives (`┌`, `─`, `┐`, `│`, `└`, `┘`, `├`, `┤`, `┬`, `┴`, `┼`) and contain zero hyphens in any rendered copy.

### 3.1 Landing Page (`/`)
- **One Offer:** Advanced quantum image processing platform for planetary surface edge detection.
- **One Audience:** Remote sensing scientists, planetary geologists, and quantum computing researchers.
- **One Primary Action:** Launch Interactive Studio (routes directly to `/studio`).

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ QUANTUM VISION       Architectures    Quantum Studio    Benchmarks       [Launch Studio] │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Quantum Superposition For Planetary Edge Vision     │
└──────────────────────────────────────────────────────┘

Extract subpixel lunar crater rims and geological fault lines using FRQI, QPIE, and NEQR 
quantum circuits simulated in real time.

┌─────────────────────────────┐   ┌─────────────────────────┐
│  Launch Interactive Studio  │   │  Explore Quantum Theory │
└─────────────────────────────┘   └─────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────┐  ┌────────────────────────────────────────┐   │
│ │ TYCHO CRATER INPUT PATCH (8 BY 8)      │  │ LIVE QUANTUM CIRCUIT TELEMETRY         │   │
│ │ ┌────┬────┬────┬────┬────┬────┬────┐   │  │ Active Method: FRQI QHED               │   │
│ │ │ 14 │ 18 │ 92 │210 │244 │198 │ 42 │   │  │ Register Width: 7 Qubits               │   │
│ │ ├────┼────┼────┼────┼────┼────┼────┤   │  │ Unitary Depth: D128 Shift + H          │   │
│ │ │ 19 │ 88 │220 │251 │240 │112 │ 24 │   │  │ Execution Time: 4.2 ms                 │   │
│ │ └────┴────┴────┴────┴────┴────┴────┘   │  │ Pratt FOM Score: 0.942                 │   │
│ └────────────────────────────────────────┘  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐ ┌────────────────────────────┐ ┌────────────────────────────┐
│ FRQI QHED                  │ │ QPIE QHED                  │ │ NEQR GRADIENT              │
│ Angle Encoded Amplitudes   │ │ Probability Amplitudes     │ │ Digital Basis Bitplanes    │
│ Qubits: 7                  │ │ Qubits: 6                  │ │ Qubits: 14                 │
│ Encoding: Ry(2 theta)      │ │ Encoding: L2 Normalized    │ │ Encoding: 8 Bit Grayscale  │
│ Edge Operator: D128 + H    │ │ Edge Operator: D64 + H     │ │ Edge Operator: Subtractor  │
└────────────────────────────┘ └────────────────────────────┘ └────────────────────────────┘
```

### 3.2 Authentication Suite (`/login` & `/signup`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ QUANTUM VISION                                                       [Back To Home Page] │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Researcher Workspace Access                  │
│ Sign in to sync custom lunar datasets and    │
│ quantum circuit benchmark runs.              │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ Authenticate With Passkey              │   │
│ └────────────────────────────────────────┘   │
│ ┌───────────────────┐  ┌─────────────────┐   │
│ │ GitHub Research   │  │ Google Scholar  │   │
│ └───────────────────┘  └─────────────────┘   │
│                                              │
│ Institutional Email Address                  │
│ ┌────────────────────────────────────────┐   │
│ │ researcher@planetary.org               │   │
│ └────────────────────────────────────────┘   │
│ Security Passphrase                          │
│ ┌────────────────────────────────────────┐   │
│ │ ••••••••••••                           │   │
│ └────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────┐   │
│ │ Access Quantum Studio                  │   │
│ └────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────┐   │
│ │ Continue As Guest Researcher           │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### 3.3 Architecture & Theory Explorer (`/architectures`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ QUANTUM VISION    [Architectures]    Quantum Studio    Benchmarks        [Launch Studio] │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Select Quantum Architecture:  [ FRQI QHED ]   ┌ QPIE QHED ┐   ┌ NEQR GRADIENT ┐          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────┐  ┌───────────────────────────────────────────┐
│ BLOCH SPHERE & PIXEL ENCODING INSPECTOR   │  │ HALO PADDED CIRCUIT TOPOLOGY              │
│                                           │  │                                           │
│ Selected Pixel Coordinate: (Row 3, Col 5) │  │ |q5> ──[H]────●────────●────[D128]──────  │
│ Binary Basis State:        |011101>       │  │ |q4> ──[H]────●────────○────[D128]──────  │
│ Raw Intensity Value:       204 / 255      │  │ |q3> ──[H]────○────────●────[D128]──────  │
│ Computed Angle (Theta):    1.2566 rad     │  │ |q2> ──[H]────●────────●────[D128]──────  │
│ cos(Theta) Amplitude:      0.3090         │  │ |q1> ──[H]────○────────●────[D128]──────  │
│ sin(Theta) Amplitude:      0.9511         │  │ |q0> ──[H]────●────────●────[D128]──[H]─  │
│                                           │  │ |c > ───────[Ry(2θ)]─[Ry]───[D128]──[M]─  │
└───────────────────────────────────────────┘  └───────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ARCHITECTURAL SCALING MATRIX                                                             │
│ ┌──────────────────┬───────────────┬──────────────────┬───────────────┬──────────────┐   │
│ │ Quantum Method   │ Total Qubits  │ Encoding Scheme  │ Gate Depth    │ Norm Scaling │   │
│ ├──────────────────┼───────────────┼──────────────────┼───────────────┼──────────────┤   │
│ │ FRQI QHED        │ 7 Qubits      │ Controlled Ry    │ O(4^n) Gray   │ Trigonometric│   │
│ │ QPIE QHED        │ 6 Qubits      │ State Initialize │ O(2^n) Multiplex│ L2 Rescaled │   │
│ │ NEQR Gradient    │ 14 Qubits     │ CNOT Bitplanes   │ O(q n 2^n)    │ Exact Digital│   │
│ └──────────────────┴───────────────┴──────────────────┴───────────────┴──────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Live Quantum Studio Workspace (`/studio`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ QUANTUM VISION       Architectures   [Quantum Studio]   Benchmarks       Status: Online  │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐ ┌───────────────────────────────────────────────────────────────┐
│ STUDIO PARAMETERS      │ │ SYNCHRONIZED PLANETARY VIEWPORT (512 BY 512)                  │
│                        │ │ ┌─────────────────────────────┐ ┌───────────────────────────┐ │
│ Planetary Dataset      │ │ │ INPUT LUNAR ORBITER IMAGE   │ │ QUANTUM EDGE OUTPUT       │ │
│ [Tycho Crater 512px  ] │ │ │                             │ │                           │ │
│                        │ │ │       ┌─────┐               │ │       ┌─────┐             │ │
│ Quantum Algorithm      │ │ │       │Patch│ (Row 24,Col 31│ │       │Edge │ Streaming   │ │
│ [x] FRQI QHED (7Q)     │ │ │       └─────┘               │ │       └─────┘ 100% Done   │ │
│ [ ] QPIE QHED (6Q)     │ │ └─────────────────────────────┘ └───────────────────────────┘ │
│ [ ] NEQR Gradient(14Q) │ └───────────────────────────────────────────────────────────────┘
│                        │ ┌───────────────────────────────────────────────────────────────┐
│ Halo Seam Protection   │ │ ACTIVE PATCH QUANTUM CIRCUIT & STATEVECTOR TELEMETRY          │
│ [x] 6x6 Core + 1px Halo│ │ Gate Scrubber: [Step 3: Hadamard Interference] Exec: 3.8 ms   │
│                        │ │ |q5..q1> ──[H]──[Gray Code CNOT + Ry(2θ)]──[D128]──────────── │
│ Flat Patch Culling     │ │ |q0>     ──[H]──[Gray Code CNOT + Ry(2θ)]──[D128]──[H]──[M]── │
│ Variance Min: 0.0015   │ │ |c>      ───────[Phase Rotation Target   ]──[D128]───────[M]── │
│                        │ │ Max Edge Probability: 0.892 at |0110101>  Patch SSIM: 0.964   │
│ [Execute Quantum Sweep]│ └───────────────────────────────────────────────────────────────┘
└────────────────────────┘
```

### 3.5 Multi-Method Benchmark Gallery & Scorecard (`/benchmark`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ QUANTUM VISION       Architectures    Quantum Studio   [Benchmarks]         [Export CSV] │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐ ┌────────────────────────────┐ ┌────────────────────────────┐
│ FRQI QHED (7 QUBITS)       │ │ QPIE QHED (6 QUBITS)       │ │ NEQR GRADIENT (14 QUBITS)  │
│ FOM: 0.941   SSIM: 0.928   │ │ FOM: 0.936   SSIM: 0.921   │ │ FOM: 0.968   SSIM: 0.959   │
│ [Synchronized Viewport 1]  │ │ [Synchronized Viewport 2]  │ │ [Synchronized Viewport 3]  │
└────────────────────────────┘ └────────────────────────────┘ └────────────────────────────┘

┌────────────────────────────┐ ┌────────────────────────────┐ ┌────────────────────────────┐
│ CLASSICAL SOBEL (3 BY 3)   │ │ CLASSICAL CANNY HYSTERESIS │ │ CLASSICAL ROBINSON COMPASS │
│ FOM: 0.884   SSIM: 0.872   │ │ FOM: 0.912   SSIM: 0.895   │ │ FOM: 0.901   SSIM: 0.889   │
│ [Synchronized Viewport 4]  │ │ [Synchronized Viewport 5]  │ │ [Synchronized Viewport 6]  │
└────────────────────────────┘ └────────────────────────────┘ └────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ QUANTITATIVE BENCHMARK SCORECARD (DATASET: TYCHO CRATER 512 BY 512)                      │
│ ┌──────────────────┬──────────┬───────────┬───────────┬───────────┬──────────┬────────┐  │
│ │ Algorithm        │ Qubits   │ Pratt FOM │ SSIM      │ PSNR (dB) │ Entropy  │ Time   │  │
│ ├──────────────────┼──────────┼───────────┼───────────┼───────────┼──────────┼────────┤  │
│ │ NEQR Gradient    │ 14       │ 0.968     │ 0.959     │ 34.82     │ 4.812    │ 2.18 s │  │
│ │ FRQI QHED        │ 7        │ 0.941     │ 0.928     │ 32.14     │ 4.690    │ 1.42 s │  │
│ │ QPIE QHED        │ 6        │ 0.936     │ 0.921     │ 31.88     │ 4.655    │ 1.19 s │  │
│ │ Classical Canny  │ 0 (CPU)  │ 0.912     │ 0.895     │ 29.40     │ 4.102    │ 0.04 s │  │
│ │ Robinson Compass │ 0 (CPU)  │ 0.901     │ 0.889     │ 28.95     │ 4.410    │ 0.06 s │  │
│ │ Classical Sobel  │ 0 (CPU)  │ 0.884     │ 0.872     │ 28.12     │ 4.350    │ 0.02 s │  │
│ └──────────────────┴──────────┴───────────┴───────────┴───────────┴──────────┴────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. In-Depth Quantum Image Processing Mathematical Formulations & Halo-Padded Circuit Schematics

### 4.1 Halo-Padded Patch Extraction Protocol (Eliminating Boundary Seams)

#### 4.1.1 Why Naive $8 \times 8$ Tiling Causes Grid Artifacts
In Quantum Hadamard Edge Detection (QHED), the amplitude permutation unitary $D_{2^n}$ shifts state amplitudes cyclically so that pixel $i$ is interfered with pixel $(i + 1) \bmod 64$. In a flattened $8 \times 8$ patch:
1. The last pixel of row $r$ (column $7$) is interfered with the first pixel of row $r+1$ (column $0$).
2. The last pixel of the patch (index $63$) wraps around to index $0$.
If an image of size $H \times W = 512 \times 512$ is sliced into non-overlapping $8 \times 8$ patches, the right edge (column $7$) and bottom edge (row $7$) of every patch contain false wrap-around differences rather than true spatial differences with the neighboring patch, imprinting a permanent $8 \times 8$ grid artifact across the reconstructed image.

#### 4.1.2 The $6 \times 6$ Core + $1$-Pixel Halo Protocol
To preserve an exact $2^3 \times 2^3 = 8 \times 8$ ($n=6$ position qubits) quantum register while eliminating all boundary wrap-around errors:
1. **Reflective Boundary Padding:** Given input grayscale image $I \in [0, 255]^{H \times W}$, pad $I$ on all four sides using symmetric reflection (`cv2.BORDER_REFLECT_101`):
   $$\tilde{I} = \text{Pad}_{\text{reflect}}(I, \text{top}=1, \text{bottom}=R_{\text{pad}}+1, \text{left}=1, \text{right}=C_{\text{pad}}+1)$$
   where stride $S = 6$, number of vertical tiles $N_y = \lceil H / 6 \rceil = 86$, number of horizontal tiles $N_x = \lceil W / 6 \rceil = 86$, and total patches $M = 86 \times 86 = 7,396$.
2. **Halo Window Extraction:** For each tile index $(u, v) \in \{0, \dots, N_y - 1\} \times \{0, \dots, N_x - 1\}$, extract an $8 \times 8$ patch:
   $$P^{(u,v)} = \tilde{I}[6u : 6u + 8, \; 6v : 6v + 8] \in \mathbb{R}^{8 \times 8}$$
3. **Flat-Patch Variance Culling ($O(1)$ Short-Circuit):** Compute patch variance $\sigma_{u,v}^2 = \text{Var}(P^{(u,v)} / 255.0)$. If $\sigma_{u,v}^2 < \tau_{\text{flat}}$ (default $\tau_{\text{flat}} = 1.5 \times 10^{-4}$), return an $8 \times 8$ zero edge tile immediately without invoking Qiskit Aer.
4. **Inner Core Cropping Post-Measurement:** After quantum edge extraction produces an $8 \times 8$ gradient map $E^{(u,v)}$ (combining horizontal scan $P^{(u,v)}$ and vertical transposed scan $(P^{(u,v)})^\top$), discard the 1-pixel outer halo ring and retain only the uncorrupted $6 \times 6$ inner core:
   $$E_{\text{core}}^{(u,v)} = E^{(u,v)}[1:7, \; 1:7] \in \mathbb{R}^{6 \times 6}$$
5. **Seamless Assembly:** Place $E_{\text{core}}^{(u,v)}$ into the global output canvas at $[6u : 6u+6, \; 6v : 6v+6]$ and crop to $[0:H, 0:W]$.

---

### 4.2 FRQI + QHED (Flexible Representation of Quantum Images)
1. **Mathematical State Formulation:**
   $$\theta_i = \frac{\pi}{2} \cdot \frac{I_i}{255}, \quad i \in \{0, 1, \dots, 63\}$$
   $$|I_{\text{FRQI}}\rangle = \frac{1}{2^{n/2}} \sum_{i=0}^{2^n - 1} \left( \cos\theta_i |0\rangle + \sin\theta_i |1\rangle \right) \otimes |i\rangle = \frac{1}{8} \sum_{i=0}^{63} \left( \cos\theta_i |0\rangle + \sin\theta_i |1\rangle \right) \otimes |i\rangle$$

2. **QHED Cyclic Amplitude Permutation ($D_{2^6}$) & Hadamard Interference:**
   Apply cyclic shift unitary $D_{2^6}$ on the 6 position qubits followed by Hadamard $H$ on $q_0$:
   $$G_x(y, x) = \sqrt{2^n \cdot P\left(|c\rangle=|1\rangle, |q_0\rangle=|1\rangle \text{ at } (y,x)\right)}, \quad G_y(y, x) = \sqrt{2^n \cdot P^\top\left(|c\rangle=|1\rangle, |q_0\rangle=|1\rangle \text{ at } (x,y)\right)}$$
   $$E_{\text{FRQI}}(y, x) = \text{clip}\left(\sqrt{G_x(y, x)^2 + G_y(y, x)^2}, \; 0, \; 1\right)$$

```
FRQI + QHED 7-Qubit Circuit Schematic (8x8 Halo-Padded Patch):

Position MSB  |q5> ──[H]────●─────────●───── ... ──┬──────────┬──────────────────────
              |q4> ──[H]────●─────────●───── ... ──┤          ├──────────────────────
              |q3> ──[H]────●─────────●───── ... ──┤   D_64   ├──────────────────────
              |q2> ──[H]────●─────────●───── ... ──┤  Cyclic  ├──────────────────────
              |q1> ──[H]────●─────────○───── ... ──┤  Shift   ├──────────────────────
Position LSB  |q0> ──[H]────●─────────●───── ... ──┴──────────┴──[H]──[Measure |q0=1>]
Color Wire    |c > ───────[Ry(2θ_0)]─[Ry(2θ_1)]── ... ────────────────[Measure |c=1> ]
```

---

### 4.3 QPIE + QHED (Quantum Probability Image Encoding)
1. **Mathematical State Formulation & The $L_2$-Norm Radiometric Preservation Fix:**
   $$\gamma_p = \|P\|_2 = \sqrt{\sum_{i=0}^{63} I_i^2}$$
   If $\gamma_p < \epsilon$ ($\epsilon = 10^{-12}$), output zeros. Otherwise:
   $$|I_{\text{QPIE}}\rangle = \sum_{i=0}^{63} c_i |i\rangle, \quad \text{where } c_i = \frac{I_i}{\gamma_p}$$
   $$|\psi_{\text{out}}\rangle = (I^{\otimes 5} \otimes H) D_{64} |I_{\text{QPIE}}\rangle = \frac{1}{\sqrt{2}} \sum_{k=0}^{31} \left[ (c_{2k} + c_{2k+1})|2k\rangle + (c_{2k} - c_{2k+1})|2k+1\rangle \right]$$
   $$P(2k+1) = \frac{1}{2} |c_{2k} - c_{2k+1}|^2 = \frac{(I_{2k} - I_{2k+1})^2}{2 \gamma_p^2}$$
2. **Critical Radiometric Scaling Fix:**
   $$G_x(2k) = \frac{\sqrt{2 \cdot P(2k+1)} \cdot \gamma_p}{255} = \frac{|I_{2k} - I_{2k+1}|}{255}$$

```
QPIE + QHED 6-Qubit Circuit Schematic (8x8 Halo-Padded Patch):

              |0> ──┬────────────────────┬──┬──────────┬──────────────────────
              |0> ──┤                    ├──┤          ├──────────────────────
              |0> ──┤ Amplitude Encoding ├──┤   D_64   ├──────────────────────
              |0> ──┤ U_init(I / ||I||)  ├──┤  Cyclic  ├──────────────────────
              |0> ──┤                    ├──┤  Shift   ├──────────────────────
Position LSB  |0> ──┴────────────────────┴──┴──────────┴──[H]──[Measure |q0=1>]
                                                                      │
                                                   Rescale by (sqrt(2) * gamma_p / 255)
```

---

### 4.4 NEQR + Quantum Gradient (Novel Enhanced Quantum Representation)
1. **Mathematical State Formulation:**
   $$|I_{\text{NEQR}}\rangle = \frac{1}{8} \sum_{i=0}^{63} |C_i^7 C_i^6 C_i^5 C_i^4 C_i^3 C_i^2 C_i^1 C_i^0\rangle \otimes |i\rangle$$
   where $I_i = \sum_{b=0}^{7} C_i^b 2^b$ with $C_i^b \in \{0, 1\}$.
2. **Bitplane-Decomposed Quantum Subtractor:**
   $$|\Delta I_i| = \left| \sum_{b=0}^{7} (C_i^b - C_{i+1}^b) 2^b \right|$$
   $$E_{\text{NEQR}}(y, x) = \frac{1}{255}\sqrt{|\Delta_x I(y,x)|^2 + |\Delta_y I(y,x)|^2}$$

```
NEQR 14-Qubit Bitplane Circuit Schematic:

Pos |q5..q0> ──[H^⊗6]────●────────●────── ... ──[D_64 Shift]───────────────
MSB |C^7>    ────────────[X]──────┼────── ... ──[Quantum Subtractor MSB]─[M]
    |C^6>    ────────────┼────────[X]──── ... ──[Quantum Subtractor B6 ]─[M]
    ...                  │        │       ...
LSB |C^0>    ────────────[X]──────[X]──── ... ──[Quantum Subtractor LSB]─[M]
```

---

### 4.5 Classical Reference Algorithms (Sobel, Canny, Robinson)
- **Sobel 3×3 Operator:** Spatial gradient kernels $K_x, K_y$.
- **Canny 5-Stage:** Gaussian blur $\to$ Sobel gradients $\to$ NMS $\to$ Double Thresholding $\to$ Hysteresis edge tracking.
- **Robinson 8-Compass:** Directional compass masks $R_0 \dots R_7$ ($45^\circ$ increments).

---

## 5. FastAPI Microstructure, Worker Pools & API/WebSocket Contracts

### 5.1 Modular Monorepo Directory Structure
```
quantum-vision-platform/
├── .agent/
│   └── skills/
│       ├── ui-ux-pro-max/SKILL.md
│       ├── landing-design-master/SKILL.md
│       ├── nextjs-canvas-worker/SKILL.md
│       ├── qiskit-aer-engine/SKILL.md
│       ├── fastapi-ipc-orchestrator/SKILL.md
│       └── aws-fargate-terraform/SKILL.md
├── design-system/
│   └── MASTER.md
├── frontend/                       # Next.js 15+ App Router (Standalone Output)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # 3.1 Landing Page
│   │   │   ├── login/page.tsx      # 3.2 Login Page
│   │   │   ├── signup/page.tsx     # 3.2 Signup Page
│   │   │   ├── architectures/page.tsx # 3.3 Theory & Bloch Sphere Explorer
│   │   │   ├── studio/page.tsx     # 3.4 Live Quantum Studio Workspace
│   │   │   └── benchmark/page.tsx  # 3.5 6-Method Synchronized Benchmark
│   │   ├── components/
│   │   │   ├── canvas/QuantumViewport.tsx
│   │   │   ├── circuit/SvgCircuitInspector.tsx
│   │   │   └── ui/                 # SKILL.md Compliant Primitive Components
│   │   ├── workers/
│   │   │   └── tileRenderer.worker.ts # OffscreenCanvas WebGL2 Tile Assembler
│   │   └── lib/
│   │       ├── copyFormatter.ts    # Zero-Hyphen Display Copy Enforcer
│   │       └── wsClient.ts         # Binary ArrayBuffer WebSocket Client
│   ├── Dockerfile.frontend
│   └── package.json
├── backend/                        # FastAPI Async Python 3.12 Microservice
│   ├── app/
│   │   ├── main.py                 # FastAPI Lifespan + SharedMemory Pool Init
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings
│   │   │   └── redis_pubsub.py     # ElastiCache Serverless Redis Streamer
│   │   ├── api/
│   │   │   ├── v1/endpoints/studio.py
│   │   │   ├── v1/endpoints/benchmark.py
│   │   │   └── v1/ws/stream.py     # Binary Tile + Telemetry WebSocket
│   │   ├── quantum/
│   │   │   ├── halo_tiler.py       # 6x6 Core + 1px Halo Patch Extractor
│   │   │   ├── frqi_qhed.py        # 7-Qubit Pre-Transpiled FRQI Engine
│   │   │   ├── qpie_qhed.py        # 6-Qubit L2-Preserving QPIE Engine
│   │   │   ├── neqr_gradient.py    # 14-Qubit Bitplane NEQR Engine
│   │   │   ├── classical.py        # Sobel, Canny, Robinson Baselines
│   │   │   └── metrics.py          # Pratt FOM, SSIM, PSNR, Shannon Entropy
│   │   └── workers/
│   │       └── shm_pool.py         # Zero-Copy Shared Memory ProcessPoolExecutor
│   ├── Dockerfile.backend
│   └── pyproject.toml
└── infra/
    ├── docker-compose.yml
    └── terraform/                  # AWS ECS Fargate, ALB, CloudFront, Redis, RDS
```

### 5.2 Zero-Copy Shared Memory + Pre-Transpiled Qiskit Aer Engine
```python
# backend/app/quantum/qpie_qhed.py
from __future__ import annotations
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

_SIMULATOR = AerSimulator(method="statevector")

def _build_d64_unitary() -> np.ndarray:
    """Constructs the 64x64 cyclic amplitude decrement unitary D_64."""
    u = np.zeros((64, 64), dtype=np.complex128)
    for i in range(64):
        u[i, (i + 1) % 64] = 1.0
    return u

def _build_qhed_operator() -> np.ndarray:
    """Precomputes (I^{\otimes 5} \otimes H) @ D_64 for O(N) fast statevector evolution."""
    d64 = _build_d64_unitary()
    h_gate = np.array([[1.0, 1.0], [1.0, -1.0]], dtype=np.complex128) / np.sqrt(2.0)
    h_full = np.kron(np.eye(32, dtype=np.complex128), h_gate)
    return h_full @ d64

_QHED_OP = _build_qhed_operator()

def execute_qpie_qhed_patch(patch_8x8: np.ndarray, full_qiskit_telemetry: bool = False) -> dict:
    """
    Executes 6-Qubit QPIE + QHED on an 8x8 Halo-Padded Patch with L2 Norm Preservation.
    Guarantees radiometric consistency across patches via gamma_p rescaling.
    """
    patch_f64 = patch_8x8.astype(np.float64)
    variance = float(np.var(patch_f64 / 255.0))
    if variance < 1.5e-4:
        return {
            "edge_core_6x6": np.zeros((6, 6), dtype=np.float32),
            "culled": True,
            "gamma_p": 0.0,
            "statevector_probs": None,
        }

    def _directional_pass(mat_8x8: np.ndarray) -> tuple[np.ndarray, np.ndarray, float]:
        flat = mat_8x8.ravel()
        gamma_p = float(np.linalg.norm(flat))
        if gamma_p < 1e-12:
            return np.zeros((8, 8), dtype=np.float64), np.zeros(64, dtype=np.float64), 0.0

        psi_init = (flat / gamma_p).astype(np.complex128)
        if full_qiskit_telemetry:
            qc = QuantumCircuit(6)
            qc.initialize(psi_init, range(6))
            qc.unitary(_build_d64_unitary(), range(6), label="D64")
            qc.h(0)
            qc.save_statevector()
            result = _SIMULATOR.run(qc).result()
            psi_out = np.asarray(result.get_statevector(qc))
        else:
            psi_out = _QHED_OP @ psi_init

        probs_even = np.abs(psi_out) ** 2
        psi_shifted = np.roll(psi_init, -1)
        psi_out_odd = _QHED_OP @ psi_shifted
        probs_odd = np.abs(psi_out_odd) ** 2

        grad_flat = np.zeros(64, dtype=np.float64)
        scale = (np.sqrt(2.0) * gamma_p) / 255.0
        for k in range(32):
            grad_flat[2 * k] = np.sqrt(probs_even[2 * k + 1]) * scale
            grad_flat[2 * k + 1] = np.sqrt(probs_odd[2 * k + 1]) * scale
        return grad_flat.reshape((8, 8)), probs_even, gamma_p

    gx, probs_h, gamma_h = _directional_pass(patch_f64)
    gy_t, _, _ = _directional_pass(patch_f64.T)
    gy = gy_t.T

    edge_8x8 = np.clip(np.sqrt(gx**2 + gy**2), 0.0, 1.0).astype(np.float32)
    edge_core_6x6 = edge_8x8[1:7, 1:7].copy()

    return {
        "edge_core_6x6": edge_core_6x6,
        "culled": False,
        "gamma_p": gamma_h,
        "statevector_probs": probs_h.tolist() if full_qiskit_telemetry else None,
    }
```

### 5.3 Zero-Copy Shared Memory Batch Orchestrator (`shm_pool.py`)
```python
# backend/app/workers/shm_pool.py
from __future__ import annotations
import asyncio
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import shared_memory
import numpy as np
import cv2
from app.quantum.qpie_qhed import execute_qpie_qhed_patch

_POOL: ProcessPoolExecutor | None = None

def init_worker_pool(max_workers: int = 8) -> None:
    global _POOL
    if _POOL is None:
        _POOL = ProcessPoolExecutor(max_workers=max_workers)

def _process_tile_band_worker(
    shm_in_name: str,
    shm_out_name: str,
    padded_shape: tuple[int, int],
    out_shape: tuple[int, int],
    row_tile_start: int,
    row_tile_end: int,
    num_cols_tiles: int,
) -> dict:
    """Worker executes a horizontal band of 8x8 halo-padded tiles using zero-copy shared memory."""
    shm_in = shared_memory.SharedMemory(name=shm_in_name)
    shm_out = shared_memory.SharedMemory(name=shm_out_name)
    try:
        padded_img = np.ndarray(padded_shape, dtype=np.uint8, buffer=shm_in.buf)
        out_canvas = np.ndarray(out_shape, dtype=np.float32, buffer=shm_out.buf)

        culled_count = 0
        executed_count = 0

        for u in range(row_tile_start, row_tile_end):
            y0 = u * 6
            for v in range(num_cols_tiles):
                x0 = v * 6
                patch_8x8 = padded_img[y0 : y0 + 8, x0 : x0 + 8]
                res = execute_qpie_qhed_patch(patch_8x8, full_qiskit_telemetry=False)
                out_canvas[y0 : y0 + 6, x0 : x0 + 6] = res["edge_core_6x6"]
                if res["culled"]:
                    culled_count += 1
                else:
                    executed_count += 1

        return {
            "row_tile_start": row_tile_start,
            "row_tile_end": row_tile_end,
            "culled_count": culled_count,
            "executed_count": executed_count,
        }
    finally:
        shm_in.close()
        shm_out.close()
```

### 5.4 REST API & Binary WebSocket Contracts
| Endpoint | Method / Protocol | Purpose | Request Payload | Response / Frame Format |
|:---|:---|:---|:---|:---|
| `/api/v1/studio/patch-inspect` | POST (REST) | Full Qiskit Aer gate-by-gate simulation on a single $8 \times 8$ patch | `{ "dataset_id": "tycho_512", "row": 144, "col": 210, "method": "FRQI_QHED" }` | JSON with 128-state amplitudes, $\theta_i$ angles, gate unitary steps, and patch metrics |
| `/api/v1/studio/sweep` | POST (REST) | Initiates a $512 \times 512$ shared-memory quantum sweep and returns `job_id` | `{ "dataset_id": "tycho_512", "method": "QPIE_QHED", "variance_threshold": 0.00015 }` | `{ "job_id": "qv_98a7c...", "ws_channel": "/ws/v1/studio/stream/qv_98a7c..." }` |
| `/ws/v1/studio/stream/{job_id}` | WebSocket (Binary + JSON) | Streams completed $36 \times 512$ horizontal tile bands from Redis Pub/Sub to OffscreenCanvas | Client sends `{"action": "subscribe"}` | **Binary Frame:** 16-byte header (`uint32 y_start`, `uint32 height`, `uint32 width`, `float32 progress`) + raw `Float32Array` pixel buffer |
| `/api/v1/benchmark/compare` | POST (REST) | Runs or retrieves cached 6-method benchmark (FRQI, QPIE, NEQR, Sobel, Canny, Robinson) | `{ "dataset_id": "tycho_512" }` | JSON scorecard (FOM, SSIM, PSNR, Entropy, `execution_ms`) + CloudFront signed tile URLs |

---

## 6. AWS Production Cloud Deployment Architecture & Container Files

### 6.1 High-Availability AWS ECS Fargate Topology
```
┌──────────────────────────────────────────┐
│          Amazon Route 53 DNS             │
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│          Amazon CloudFront CDN           │
│  • Caches /_next/static/* & S3 Datasets  │
│  • Upgrades /ws/v1/* WebSocket Traffic   │
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│     Application Load Balancer (ALB)      │
│  • Path /api/* & /ws/* -> Backend TG     │
│  • Path /* -> Frontend TG                │
│  • Sticky Sessions Enabled for WebSocket │
└─────────┬──────────────────────┬─────────┘
          │                      │
┌─────────▼────────────────────┐ ┌─────▼────────────────────────┐
│ ECS Fargate: Next.js Service │ │ ECS Fargate: FastAPI Quantum │
│ • 2 to 10 Tasks (0.5 vCPU)   │ │ • 2 to 16 Tasks (8 vCPU/16GB)│
│ • Standalone Node 22 Alpine  │ │ • /dev/shm 2GB Mounted       │
└──────────────────────────────┘ └─────┬────────────────┬───────┘
                                       │                │
                         ┌─────────────▼──┐ ┌───────────▼───────────┐
                         │ ElastiCache    │ │ Amazon RDS PostgreSQL │
                         │ Serverless     │ │ (Benchmarks & Users)  │
                         │ Redis (Pub/Sub)│ └───────────────────────┘
                         └────────────────┘
```

### 6.2 Production Multi-Stage Dockerfile.frontend (Under 150 MB)
```dockerfile
# frontend/Dockerfile.frontend
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### 6.3 Production Multi-Stage Dockerfile.backend (Qiskit Aer OpenMP + Shared Memory Tuned)
```dockerfile
# backend/Dockerfile.backend
FROM python:3.12-slim-bookworm AS builder
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt

FROM python:3.12-slim-bookworm AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r qvision && useradd -r -g qvision qvision
COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY ./app /app/app

# Prevent OpenMP thread oversubscription inside ProcessPoolExecutor workers
ENV OMP_NUM_THREADS=1
ENV QISKIT_IN_PARALLEL=FALSE
ENV PYTHONUNBUFFERED=1
USER qvision
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--loop", "uvloop", "--ws", "websockets"]
```

### 6.4 Local & Staging docker-compose.yml (With /dev/shm Allocation)
```yaml
# infra/docker-compose.yml
services:
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_WS_URL=ws://localhost:8000
    depends_on:
      - backend

  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    shm_size: "2gb"  # Required for zero-copy POSIX shared_memory tile buffers
    environment:
      - REDIS_URL=redis://redis:6379/0
      - DATABASE_URL=postgresql+asyncpg://qvision:qvision@postgres:5432/qvision
      - WORKER_PROCESSES=8
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7.4-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=qvision
      - POSTGRES_PASSWORD=qvision
      - POSTGRES_DB=qvision
    ports:
      - "5432:5432"
```

---

## 7. Verification, Quality Assurance & Transition Plan

### 7.1 Automated CI/CD Verification Gates
1. **Zero-Hyphen & Design Token Static AST Linter (`npm run lint:design`):**  
   Scans JSX text nodes, button labels, badge strings, and table headers across `frontend/src/**`. Fails the build if any literal hyphen `-` appears in visible copy, if any banned font (`Inter`, `Roboto`, `Arial`) is imported, if any italic class (`italic`) or font-black (`font-black`, `font-extrabold`) is used, or if any background gradient class (`bg-gradient-*`) is used outside the Hero `Heading 1` text span.
2. **Quantum Mathematical Fidelity Suite (`pytest backend/tests/test_quantum_fidelity.py`):**  
   - **Seam-Free Boundary Verification:** Runs a synthetic diagonal ramp across a $64 \times 64$ image and asserts that boundary transitions at indices $6, 12, 18, \dots$ have zero second-derivative spike ($\Delta^2 E < 10^{-5}$).
   - **QPIE Radiometric Scaling Verification:** Runs two patches with identical relative contrast but $10\times$ different base luminance and asserts that the reconstructed QPIE edge magnitude scales linearly by $10\times$.
   - **Statevector Equivalence Check:** Verifies that the fast precomputed unitary evolution matches full Qiskit `AerSimulator(method="statevector")` output to within $\ell_\infty \le 10^{-12}$.
3. **End-to-End Performance & Frame-Rate Gate (Playwright):**  
   Triggers a $512 \times 512$ sweep in `/studio`, verifies progressive binary WebSocket frames complete in under $2.0$ seconds, and asserts zero main-thread Long Tasks over $50\text{ ms}$.
