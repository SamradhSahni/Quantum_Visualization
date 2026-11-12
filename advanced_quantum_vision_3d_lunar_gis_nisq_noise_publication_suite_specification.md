# Master Specification & Implementation Blueprint: Advanced Quantum ML, 3D Lunar GIS, NISQ Hardware Lab, and Scientific Publication Suite

> **Document Version:** 3.0.0 (Production Extensibility & Research Platform Blueprint)  
> **Status:** Ready for Autonomous Antigravity IDE Execution  
> **Target Routes:** `/studio/qml-pipeline`, `/gis-explorer`, `/hardware-lab`, `/publish`, `/arena`  
> **Target Stack:** Next.js 15 (App Router, React 19, TypeScript 5.8, Tailwind CSS v4, Three.js / React Three Fiber WebGL, KaTeX) + FastAPI (Async Python 3.12, `uv`, Qiskit 1.x, Qiskit Aer 1.15+, PennyLane, Amazon Braket SDK, OpenCV Headless, Rasterio/GDAL, Shapely, FastMCP, Celery/ARQ + Redis, PostgreSQL + PostGIS)  
> **Agent Directive Compliance:** Strict adherence to `antigravity_master_skills_manifest_router.md` and `SKILL.md` (`design-system/MASTER.md`)

---

## Table of Contents
0. [Antigravity IDE Autonomous Execution Protocol, Skill Routing & MCP Architecture](#0-antigravity-ide-autonomous-execution-protocol-skill-routing--mcp-architecture)
1. [Suite 1: Advanced Quantum Image Processing & Quantum Machine Learning (`/studio/qml-pipeline`)](#1-suite-1-advanced-quantum-image-processing--quantum-machine-learning-studioqml-pipeline)
   - [1.1 Quantum Fourier & Haar Wavelet Pre-Edge Denoising (QFT / QWT)](#11-quantum-fourier--haar-wavelet-pre-edge-denoising-qft--qwt)
   - [1.2 Quanvolutional Neural Network (QCNN) Geological Feature Classifier](#12-quanvolutional-neural-network-qcnn-geological-feature-classifier)
   - [1.3 Multi-Spectral & SAR Quantum Encoding (NCQI)](#13-multi-spectral--sar-quantum-encoding-ncqi)
   - [1.4 Adaptive Grover Amplitude Amplification Thresholding Oracle](#14-adaptive-grover-amplitude-amplification-thresholding-oracle)
2. [Suite 2: Planetary 3D GIS, Crater Morphometry & Temporal Interferometry (`/gis-explorer`)](#2-suite-2-planetary-3d-gis-crater-morphometry--temporal-interferometry-gis-explorer)
   - [2.1 Interactive 3D Crater DEM Terrain Projection (WebGL / Three.js)](#21-interactive-3d-crater-dem-terrain-projection-webgl--threejs)
   - [2.2 Automated Crater Morphometry & GIS GeoJSON Exporter](#22-automated-crater-morphometry--gis-geojson-exporter)
   - [2.3 Sub-Pixel Temporal Phase Interferometry Change Detector](#23-sub-pixel-temporal-phase-interferometry-change-detector)
3. [Suite 3: NISQ Hardware Realism, Error Mitigation & Cloud QPU Bridge (`/hardware-lab`)](#3-suite-3-nisq-hardware-realism-error-mitigation--cloud-qpu-bridge-hardware-lab)
   - [3.1 NISQ Decoherence Lab & Zero-Noise Extrapolation (ZNE)](#31-nisq-decoherence-lab--zero-noise-extrapolation-zne)
   - [3.2 Physical QPU Coupling Map & SABRE SWAP Router Visualizer](#32-physical-qpu-coupling-map--sabre-swap-router-visualizer)
   - [3.3 Asynchronous AWS Braket & IBM Quantum Runtime Cloud Bridge](#33-asynchronous-aws-braket--ibm-quantum-runtime-cloud-bridge)
   - [3.4 Fault-Tolerant Clifford + $T$ & Surface Code Resource Estimator](#34-fault-tolerant-clifford--t--surface-code-resource-estimator)
4. [Suite 4: Scientific Reproducibility, LaTeX Paper Exporter & Polyglot Transpiler (`/publish`)](#4-suite-4-scientific-reproducibility-latex-paper-exporter--polyglot-transpiler-publish)
   - [4.1 One-Click LaTeX (`quantikz` + `booktabs` + BibTeX) Academic Bundle Generator](#41-one-click-latex-quantikz--booktabs--bibtex-academic-bundle-generator)
   - [4.2 Polyglot Quantum SDK AST Transpiler](#42-polyglot-quantum-sdk-ast-transpiler)
   - [4.3 Deterministic Experiment Permalinks & SHA-256 Snapshot Store](#43-deterministic-experiment-permalinks--sha-256-snapshot-store)
5. [Suite 5: MCP Quantum Copilot & Custom Unitary Algorithm Arena (`/arena`)](#5-suite-5-mcp-quantum-copilot--custom-unitary-algorithm-arena-arena)
   - [5.1 FastMCP Quantum Vision Copilot Server](#51-fastmcp-quantum-vision-copilot-server)
   - [5.2 Custom Unitary Matrix & OpenQASM 3.0 Algorithm Arena](#52-custom-unitary-matrix--openqasm-30-algorithm-arena)
6. [Unified Modular Architecture, Wireframes, Database Schema & FastAPI Contracts](#6-unified-modular-architecture-wireframes-database-schema--fastapi-contracts)
7. [Verification Matrix, Performance Benchmarks & Antigravity Definition of Done](#7-verification-matrix-performance-benchmarks--antigravity-definition-of-done)

---

## 0. Antigravity IDE Autonomous Execution Protocol, Skill Routing & MCP Architecture

> **MANDATORY AGENT SYSTEM DIRECTIVE:**  
> Before scaffolding any module in Suites 1 through 5, the Google Antigravity agent (`agy`) **MUST** parse this blueprint against `antigravity_master_skills_manifest_router.md`, verify all Tier 0 through Tier 7 skills and Free MCP servers are active, build the AST knowledge graph (`graphify .` and `code-review-graph build`), and enforce `SKILL.md` (`design-system/MASTER.md`).

### 0.1 Master Skill & Free MCP Routing Matrix Across All 5 Expansion Suites

| Expansion Suite / Module | Classification | Required Antigravity Skills to Import & Trigger | Free MCP Servers to Invoke |
| :--- | :--- | :--- | :--- |
| **0. Core AST Graph, Spec Planning & TDD** | `[MANDATORY]` | `graphify`, `superpowers` (`/brainstorming`, `/write-plan`), `code-review-graph`, `context-mode`, `caveman`, `security-reviewer`, `static-analysis`, `systematic-debugging` | `context7`, `deepwiki`, `fetch`, `sequential-thinking` |
| **1. Suite 1: QML, QWT Denoising, NCQI & Grover Oracle** | `[MANDATORY]` | `fastapi-expert`, `modern-python`, `ml-pipeline`, `fine-tuning-expert`, `architecture-designer`, `api-designer` | `context7` (Qiskit / PennyLane docs), `deepwiki` |
| **2. Suite 2: 3D Lunar DEM WebGL & PostGIS Morphometry** | `[MANDATORY]` | `ui-ux-pro-max`, `frontend-design`, `react-best-practices`, `web-design-guidelines`, `typescript-pro`, `postgres-pro`, `database-optimizer` | `context7` (Three.js / R3F / GeoJSON), `chrome-devtools`, `playwright` |
| **3. Suite 3: NISQ Noise Lab, ZNE & AWS Braket Bridge** | `[MANDATORY]` | `microservices-architect`, `fastapi-expert`, `websocket-engineer`, `cloud-architect`, `terraform-engineer`, `aws-finops-cost-guard` | `aws-docs` (AWS Braket), `aws-terraform`, `context7` |
| **4. Suite 4: LaTeX Exporter, Polyglot Transpiler & Permalinks** | `[MANDATORY]` | `typescript-pro`, `modern-python`, `postgres-pro`, `api-designer`, `vercel-optimize` | `context7`, `fetch`, `playwright` |
| **5. Suite 5: FastMCP Quantum Copilot & Custom Unitary Arena** | `[MANDATORY]` | `mcp-builder`, `mcp-developer`, `prompt-engineer`, `rag-architect`, `llm-eval-gate`, `security-reviewer` | `context7` (FastMCP), `deepwiki`, `sequential-thinking` |
| **6. Full-Stack E2E QA, Chaos Resilience & Observability** | `[MANDATORY]` | `webapp-testing`, `chaos-engineer`, `k6-load-testing`, `devops-engineer`, `monitoring-expert`, `sre-engineer` | `playwright`, `chrome-devtools` (Lighthouse) |

### 0.2 Strict `SKILL.md` & `ui-ux-pro-max` Design System Rules
1. **Typography & Zero-Hyphen Visible Copy Rule:**
   - Primary UI Typeface: `Geist` (or `Manrope`).
   - Telemetry, Qubit Registers, Unitary Matrices, GeoJSON Coordinates, and LaTeX Preview Code: `Geist Mono`.
   - **Zero Hyphens in Visible UI Text:** Never render a hyphen (`-`) inside any visible UI heading, button, tab, badge, or label. Render `Zero Noise Extrapolation`, `Three Dimensional Terrain`, `Multi Spectral Encoding`, `Sub Pixel Interferometry`, `One Click Paper Export`, and `Fault Tolerant Estimator`.
   - **Zero Italics in UI Chrome:** Enforce `font-style: normal` on all UI components. Mathematical expressions must be rendered exclusively via KaTeX (`$...$` and `$$...$$`).
2. **100% Flat Dark Surface Hierarchy:**
   - Base Page Canvas: `#000000`
   - Primary Section Well / 3D Viewport Container: `#181818`
   - Elevated Control Card / Circuit Panel / Telemetry Card: `#1F1F1F`
   - Interactive Hover / Active Toggle Well: `#272727`
   - Border Stroke: Full 4-sided `1px solid #313131` (single-sided borders are banned; use `Spacing-600` ($48\text{px}$) or `Spacing-800` ($80\text{px}$) vertical gaps).
3. **Concentric Nested Radius Formula:**
   $$R_{\text{inner}} = \max\left(4\text{px}, R_{\text{outer}} - \text{Gap}\right)$$

---

## 1. Suite 1: Advanced Quantum Image Processing & Quantum Machine Learning (`/studio/qml-pipeline`)

### 1.1 Quantum Fourier & Haar Wavelet Pre-Edge Denoising (QFT / QWT)

#### Plain-Language Explanation
Satellite cameras orbiting the Moon often suffer from "speckle noise"—tiny random bright and dark static dots caused by cosmic rays and thermal sensor noise. If you run edge detection directly on a noisy photo, the algorithm mistakes those static dots inside smooth craters for real geological edges. **Quantum Wavelet & Fourier Denoising** solves this *inside* the quantum circuit before edge detection runs: it converts the image patch into quantum frequency waves, zeroes out the ultra-high-frequency static, and transforms it back into a crystal-clear image so QHED only detects real crater rims.

#### Mathematical Formulation & Circuit Topology
For an $8 \times 8$ patch encoded in a $6$-qubit QPIE state $|\psi_{\text{QPIE}}\rangle = \sum_{Y=0}^{7}\sum_{X=0}^{7} \alpha_{Y,X} |Y\rangle|X\rangle$ (or $7$-qubit FRQI state), the single-level $1\text{D}$ **Quantum Haar Wavelet Transform** ($U_{\text{QHWT}}$) is a cyclic permutation $P_{\text{ror}}$ followed by a Hadamard gate $H$ on the least-significant qubit:
$$U_{\text{QHWT}}^{(1\text{D})} = P_{\text{ror}} \cdot (I^{\otimes (n-1)} \otimes H)$$
Applying the $2\text{D}$ separable transform $U_{\text{QHWT}}^{(2\text{D})} = U_{\text{QHWT}}^{(Y)} \otimes U_{\text{QHWT}}^{(X)}$ decomposes the $8 \times 8$ patch Hilbert space into four orthogonal $4 \times 4$ wavelet sub-bands indexed by the most-significant wavelet qubits $(q_3, q_0)$:
- $|q_3 = 0, q_0 = 0\rangle$ ($\text{LL}$ Sub-band): Low-frequency smooth structural topography.
- $|q_3 = 0, q_0 = 1\rangle$ ($\text{LH}$ Sub-band): Horizontal geological boundaries.
- $|q_3 = 1, q_0 = 0\rangle$ ($\text{HL}$ Sub-band): Vertical geological boundaries.
- $|q_3 = 1, q_0 = 1\rangle$ ($\text{HH}$ Sub-band): High-frequency diagonal sensor speckle noise.

To suppress high-frequency speckle while preserving coherent crater edges, we apply a controlled soft-attenuation rotation $C^2 R_y(-2\theta_{\text{denoise}})$ conditioned on the $\text{HH}$ sub-band $|q_3 = 1, q_0 = 1\rangle$, followed by the inverse wavelet transform $\left(U_{\text{QHWT}}^{(2\text{D})}\right)^\dagger$ prior to executing the QHED Hadamard pass:
$$|\psi_{\text{clean}}\rangle = \left(U_{\text{QHWT}}^{(2\text{D})}\right)^\dagger \cdot \mathcal{D}_{\text{HH}}(\eta) \cdot U_{\text{QHWT}}^{(2\text{D})} |\psi_{\text{in}}\rangle$$
where $\eta \in [0, 1]$ is the user-adjustable **Quantum Wavelet Denoising Strength**.

```
=====================================================================================================
CHAINED QUANTUM HAAR WAVELET DENOISER + QHED EDGE PIPELINE (6 OR 7 QUBITS)
=====================================================================================================
q0 (Col LSB): ---[State Prep]---[ H ]---[       ]---o---[       ]---[ H ]---[QHED Shift & H]---[ M ]
q1 (Col Mid): ---[  (FRQI / ]---[   ]---[ P_ror ]---|---[P_ror^+]---[   ]---[              ]---[ M ]
q2 (Col MSB): ---[   QPIE)  ]---[   ]---[       ]---|---[       ]---[   ]---[              ]---[ M ]
q3 (Row LSB): ---[          ]---[ H ]---[       ]---o---[       ]---[ H ]---[              ]---[ M ]
q4 (Row Mid): ---[          ]---[   ]---[ P_ror ]---|---[P_ror^+]---[   ]---[              ]---[ M ]
q5 (Row MSB): ---[          ]---[   ]---[       ]---|---[       ]---[   ]---[              ]---[ M ]
|a> (Filter): ---|0>--------------------------------[Ry]--------------------------------------------
                 └─ Stage 1 ┘   └─── Forward QWT ───┘   └─ Inverse QWT ─┘   └── Stage 3 ───┘
=====================================================================================================
```

---

### 1.2 Quanvolutional Neural Network (QCNN) Geological Feature Classifier

#### Plain-Language Explanation
Standard edge detection only tells you *"this pixel is an edge"*; it does not tell you *what* geological structure that edge belongs to. The **Quanvolutional Neural Network (QCNN)** acts like a smart quantum microscope that slides a $2 \times 2$ ($4$-pixel) window across the lunar image, passes the $4$ pixels through an entangled $4$-qubit variational quantum circuit, and classifies every region into four planetary terrain categories:
1. **Primary Impact Crater Rim** (steep circular ridges, highlighted in Electric Magenta `#FF79C6`)
2. **Smooth Mare Basalt Basin** (flat volcanic plains, highlighted in Deep Slate `#3F3F46`)
3. **Sinuous Lunar Rille / Fracture** (narrow lava channels and tectonic grabens, highlighted in Neon Cyan `#00F0FF`)
4. **Bright Ejecta Ray Blanket** (radial debris patterns, highlighted in Golden Sunlight `#FFD700`)

#### Mathematical Formulation
For each $2 \times 2$ sliding window $\mathbf{x} = [x_0, x_1, x_2, x_3]^T \in [0, 255]^4$:
1. **Angle Embedding Layer ($\mathcal{E}(\mathbf{x})$):** Encode the $4$ pixels into $4$ qubits using $R_y$ rotations:
   $$|\psi_0(\mathbf{x})\rangle = \bigotimes_{j=0}^{3} R_y\left(\frac{\pi x_j}{255}\right) |0\rangle^{\otimes 4}$$
2. **Strongly Entangling Variational Ansatz ($\mathcal{W}(\boldsymbol{\Theta})$):** Apply $L = 2$ layers of parameterized rotations $R_z(\theta_{l,j,1}) R_y(\theta_{l,j,2}) R_z(\theta_{l,j,3})$ followed by a cyclic ring of $CNOT$ gates ($CX(0,1), CX(1,2), CX(2,3), CX(3,0)$):
   $$|\psi_{\text{QCNN}}(\mathbf{x}, \boldsymbol{\Theta})\rangle = \prod_{l=1}^{L} \left( \prod_{j=0}^{3} CX(j, (j+1)\bmod 4) \bigotimes_{j=0}^{3} U_3(\boldsymbol{\theta}_{l,j}) \right) |\psi_0(\mathbf{x})\rangle$$
3. **Pauli-$Z$ Expectation Readout ($4$ Quantum Feature Maps):** Measure the expectation value of the Pauli-$Z$ observable on each wire $k \in \{0, 1, 2, 3\}$:
   $$f_k(\mathbf{x}) = \langle \psi_{\text{QCNN}}(\mathbf{x}, \boldsymbol{\Theta}) | Z_k | \psi_{\text{QCNN}}(\mathbf{x}, \boldsymbol{\Theta}) \rangle \in [-1, +1]$$
4. **Linear Softmax Classification Head:** A lightweight pre-trained classical linear layer $\mathbf{W}_{\text{cls}} \in \mathbb{R}^{4 \times 4}$ maps the $4$ quantum features $\mathbf{f}(\mathbf{x}) = [f_0, f_1, f_2, f_3]^T$ to class probabilities:
   $$\mathbf{p}(\text{class} \mid \mathbf{x}) = \text{Softmax}\left(\mathbf{W}_{\text{cls}} \mathbf{f}(\mathbf{x}) + \mathbf{b}_{\text{cls}}\right)$$

---

### 1.3 Multi-Spectral & SAR Quantum Encoding (NCQI)

#### Plain-Language Explanation
At the Moon's South Pole (the target of NASA Artemis missions), deep crater interiors sit in permanent shadow where sunlight never reaches. A normal optical camera only sees pitch black. However, orbital **Synthetic Aperture Radar (SAR)** and **Thermal Infrared** sensors can see straight into the dark! **Multi-Spectral Quantum Encoding (NCQI)** lets users upload or select a $3$-band lunar dataset (Band 1: Optical Albedo, Band 2: Diviner Bolometric Temperature, Band 3: Mini-RF Radar Circular Polarization Ratio) and packs all three bands into a $9$-qubit quantum state ($6$ position qubits + $3$ channel color qubits $|c_{\text{opt}}\rangle |c_{\text{therm}}\rangle |c_{\text{sar}}\rangle$), detecting hidden ice-bearing crater rims inside permanent shadows.

#### Mathematical Formulation
For an $8 \times 8$ patch with $3$ co-registered spectral bands $\big(I_{\text{opt}}(i), I_{\text{therm}}(i), I_{\text{sar}}(i)\big) \in [0, 255]^3$, define three spectral rotation angles $\theta_{b,i} = \frac{\pi}{2}\frac{I_{b}(i)}{255}$ for $b \in \{\text{opt}, \text{therm}, \text{sar}\}$. The $9$-qubit **Multi-Spectral FRQI/NCQI State** is:
$$|\psi_{\text{NCQI}}\rangle = \frac{1}{8} \sum_{i=0}^{63} \left[ \bigotimes_{b \in \{\text{opt}, \text{therm}, \text{sar}\}} \left(\cos\theta_{b,i}|0\rangle_b + \sin\theta_{b,i}|1\rangle_b\right) \right] \otimes |i\rangle_{YX}$$
Applying the QHED Hadamard gate $H$ to the position LSB $q_0$ interferes all three spectral channels simultaneously! The multi-spectral edge probability between adjacent pixels $(a, b)$ is the weighted spectral interference norm:
$$P_{\text{multi}}(a, b) = \sum_{b \in \{\text{opt}, \text{therm}, \text{sar}\}} w_b \cdot 2\sin^2\left(\frac{\theta_{b,a} - \theta_{b,b}}{2}\right), \quad w_{\text{opt}} + w_{\text{therm}} + w_{\text{sar}} = 1$$
Users can adjust the spectral mixing weights $(w_{\text{opt}}, w_{\text{therm}}, w_{\text{sar}})$ in real time using a ternary mixer triangle in the UI.

---

### 1.4 Adaptive Grover Amplitude Amplification Thresholding Oracle

#### Plain-Language Explanation
When you set a fixed classical threshold (like $\tau = 0.38$), you face a painful trade-off: if you set it high, you lose faint shadowed crater rims; if you set it low, background noise floods the image. The **Adaptive Grover Thresholding Oracle** uses Grover's famous quantum search algorithm on the QHED output state. Before measuring the circuit, a quantum phase oracle marks candidate edge states whose gradient exceeds a local noise floor and runs $r = 1$ or $r = 2$ Grover diffusion reflections. This physically transfers probability amplitude *away* from flat background pixels and *into* faint crater boundaries, amplifying weak edges by up to $3\text{ to }5\times$ before shot measurement!

#### Mathematical Formulation
Let $|\psi_{\text{QHED}}\rangle = \sqrt{1 - p_{\text{edge}}}|\psi_{\text{non-edge}}\rangle + \sqrt{p_{\text{edge}}}|\psi_{\text{edge}}\rangle$ be the post-Hadamard quantum state where $p_{\text{edge}} = \sum_{k \in \mathcal{M}} |\beta_k|^2$ is the total probability mass of marked edge states $\mathcal{M}$ (where $|q_0 = 1\rangle$ and $|c = 1\rangle$). Define the initial angle $\sin\vartheta = \sqrt{p_{\text{edge}}}$.
1. **Phase Oracle ($U_\omega$):** Applies a phase flip $-1$ to marked edge states in $\mathcal{M}$ via a $CZ$ gate between the QHED difference qubit $q_0$ and color qubit $|c\rangle$:
   $$U_\omega |k\rangle = \begin{cases} -|k\rangle & \text{if } k \in \mathcal{M} \\ +|k\rangle & \text{if } k \notin \mathcal{M} \end{cases}$$
2. **Grover Diffusion Operator ($U_s$):** Reflects amplitudes about the mean amplitude:
   $$U_s = 2|\psi_{\text{QHED}}\rangle\langle\psi_{\text{QHED}}| - I$$
3. **Amplified Probability After $r$ Grover Iterations:**
   Applying the Grover iterate $\mathcal{G} = U_s U_\omega$ exactly $r \in \{1, 2\}$ times rotates the statevector toward the edge subspace by $2r\vartheta$:
   $$\mathcal{G}^r |\psi_{\text{QHED}}\rangle = \cos\big((2r+1)\vartheta\big)|\psi_{\text{non-edge}}\rangle + \sin\big((2r+1)\vartheta\big)|\psi_{\text{edge}}\rangle$$
   The total probability of sampling a true edge pixel increases from $\sin^2\vartheta$ to:
   $$P_{\text{amplified}}^{(r)} = \sin^2\big((2r + 1)\vartheta\big)$$
   For faint shadowed rims where $p_{\text{edge}} = 0.08$ ($\vartheta = 0.2868\text{ rad}$), a single $r = 1$ Grover iteration boosts the edge detection probability to $\sin^2(3 \times 0.2868) = \mathbf{0.576}$ ($7.2\times$ amplification!).

---

## 2. Suite 2: Planetary 3D GIS, Crater Morphometry & Temporal Interferometry (`/gis-explorer`)

### 2.1 Interactive 3D Crater DEM Terrain Projection (WebGL / Three.js)

#### Plain-Language Explanation
Planetary geologists do not experience the Moon as a flat 2D square; they study steep impact craters, central peaks, and terraced walls in 3D. The **3D Crater DEM Terrain Explorer** takes the Lunar Orbiter Laser Altimeter (LOLA) Digital Elevation Model (DEM) heightmap corresponding to the active image tile and builds a real-time, interactive $60\text{ FPS}$ 3D lunar surface in the browser. It then drapes your glowing Electric Magenta FRQI-QHED or Neon Cyan QPIE-QHED edge map directly onto the 3D terrain so you can orbit, tilt, adjust sun illumination angles, and visually confirm that every quantum edge locks onto a physical cliff or crater rim.

#### Mathematical & WebGL Shader Specification
Given a co-registered $512 \times 512$ optical intensity matrix $I(Y, X) \in [0, 255]$, a LOLA elevation heightmap $H_{\text{DEM}}(Y, X) \in [-2500\text{ m}, +3500\text{ m}]$, and the quantum edge confidence map $C(Y, X) \in [0, 1]$:
1. **3D Vertex Displacement Mapping (Custom GLSL Vertex Shader):**
   For each grid vertex $(u, v) \in [0, 1]^2$, compute the displaced 3D position $\mathbf{P}(u, v)$ with user-controlled vertical exaggeration factor $\kappa_z \in [0.5, 5.0]$:
   $$\mathbf{P}(u, v) = \begin{pmatrix} (u - 0.5) \cdot L_x \\ (v - 0.5) \cdot L_y \\ \kappa_z \cdot \frac{H_{\text{DEM}}(u, v) - H_{\min}}{H_{\max} - H_{\min}} \cdot Z_{\text{scale}} \end{pmatrix}$$
2. **Surface Normal & Solar Azimuth/Elevation Lighting (Custom GLSL Fragment Shader):**
   Compute finite-difference tangent vectors $\mathbf{t}_u = \frac{\partial \mathbf{P}}{\partial u}$ and $\mathbf{t}_v = \frac{\partial \mathbf{P}}{\partial v}$, surface normal $\mathbf{n} = \frac{\mathbf{t}_u \times \mathbf{t}_v}{\|\mathbf{t}_u \times \mathbf{t}_v\|}$, and solar illumination vector $\mathbf{s}(\alpha_{\text{az}}, \beta_{\text{el}}) = (\cos\beta_{\text{el}}\cos\alpha_{\text{az}}, \cos\beta_{\text{el}}\sin\alpha_{\text{az}}, \sin\beta_{\text{el}})^T$. The shaded fragment color blends the Lommel-Seeliger lunar reflectance $L_{\text{LS}}$ with the quantum edge emissive overlay $\mathbf{c}_{\text{quantum}}$:
   $$\mathbf{C}_{\text{frag}}(u, v) = \big(1 - \gamma C(u, v)\big) L_{\text{LS}}(\mathbf{n}, \mathbf{s}) \cdot \mathbf{c}_{\text{albedo}}(u,v) + \gamma C(u, v) \cdot \mathbf{c}_{\text{quantum}}$$

---

### 2.2 Automated Crater Morphometry & GIS GeoJSON Exporter

#### Plain-Language Explanation
After extracting a clean $1$-pixel-thin edge map with FRQI-QHED, scientists need quantitative measurements: *How many craters are in this tile? What are their diameters in kilometers? Are they circular or elliptical? How old is this lunar surface?* The **Automated Crater Morphometry Engine** traces closed contours on the quantum edge map, fits mathematical ellipses to every crater rim, generates a standard **Crater Size-Frequency Distribution (CSFD)** plot, and exports an industry-standard **GeoJSON** file that opens directly in QGIS, ArcGIS, or NASA Moon Trek.

#### Mathematical Formulation
1. **Connected Contour Extraction & Fitzgibbon Direct Least-Squares Ellipse Fitting:**
   For each connected edge component $\mathcal{C}_m = \{(x_i, y_i)\}_{i=1}^{K}$ with $K \ge 12$ edge pixels, fit the general conic equation:
   $$F(\mathbf{a}, \mathbf{x}) = A x^2 + B x y + C y^2 + D x + E y + F = 0 \quad \text{subject to } 4AC - B^2 = 1$$
   Solving the generalized eigenvalue system $\mathbf{D}^T \mathbf{D} \mathbf{a} = \lambda \mathbf{C}_{\text{const}} \mathbf{a}$ yields the exact crater center $(X_c, Y_c)$, semi-major axis $a$ (px), semi-minor axis $b$ (px), and orientation angle $\varphi$.
2. **Physical Planetary Scaling & Morphometric Indices:**
   Given sensor ground sample distance $\Delta_{\text{GSD}}$ (in meters/pixel, e.g., $100\text{ m/px}$ for LRO WAC or $0.5\text{ m/px}$ for LRO NAC):
   - **Equivalent Rim Diameter:** $D_{\text{km}} = \frac{2\sqrt{a \cdot b} \cdot \Delta_{\text{GSD}}}{1000}$
   - **Crater Ellipticity:** $e = \sqrt{1 - \left(\frac{b}{a}\right)^2} \in [0, 1)$
   - **Depth-to-Diameter Ratio (from LOLA DEM):** $\delta = \frac{H_{\text{rim, mean}} - H_{\text{floor, min}}}{D_{\text{m}}}$ (fresh simple lunar craters exhibit $\delta \approx 0.20$; degraded ancient craters exhibit $\delta < 0.08$).
3. **RFC 7946 GeoJSON Export with Selenographic CRS (`IAU_2015:30100`):**
   Exports every detected crater rim as a `Polygon` feature containing properties `crater_id`, `diameter_km`, `depth_m`, `ellipticity`, `quantum_algorithm`, `rim_confidence_mean`, and `edge_thinness_pct`.

---

### 2.3 Sub-Pixel Temporal Phase Interferometry Change Detector

#### Plain-Language Explanation
NASA's Lunar Reconnaissance Orbiter photographs the same regions of the Moon repeatedly over years to find new meteoroid impact craters, boulder tracks, or landing site blast zones from recent lunar landers. **Sub-Pixel Temporal Phase Interferometry** loads two images of the exact same coordinate taken at different times ($t_1$ "Before" and $t_2$ "After") into a single quantum circuit. Because the rotation angle of the first image is subtracted from the second image on the color qubit ($R_y(2\theta_{t_2}) R_y(-2\theta_{t_1}) = R_y(2(\theta_{t_2} - \theta_{t_1}))$), every boulder and crater that stayed the same cancels out to $|0\rangle_c$, while any new impact crater or disturbed regolith lights up immediately!

#### Mathematical Formulation
Given co-registered patches $I^{(t_1)}$ and $I^{(t_2)}$ with FRQI angles $\theta_i^{(t_1)}$ and $\theta_i^{(t_2)}$:
1. Apply the forward FRQI preparation $\mathcal{R}_{\text{FRQI}}\big(\boldsymbol{\theta}^{(t_1)}\big)$ followed immediately by the adjoint inverse preparation $\mathcal{R}_{\text{FRQI}}^\dagger\big(\boldsymbol{\theta}^{(t_2)}\big)$ on the same $7$-qubit register:
   $$R_y^\dagger\left(2\theta_i^{(t_2)}\right) R_y\left(2\theta_i^{(t_1)}\right) |0\rangle_c = R_y\left(2\left(\theta_i^{(t_1)} - \theta_i^{(t_2)}\right)\right) |0\rangle_c = \cos\left(\Delta\theta_i^{(t_1, t_2)}\right)|0\rangle_c + \sin\left(\Delta\theta_i^{(t_1, t_2)}\right)|1\rangle_c$$
2. Measuring the color qubit in the $|1\rangle_c$ state yields the exact temporal change probability at pixel $i$:
   $$P_{\text{change}}(Y, X) = \sin^2\left(\frac{\pi}{2} \cdot \frac{|I^{(t_1)}(Y, X) - I^{(t_2)}(Y, X)|}{255}\right) \in [0, 1]$$

---

## 3. Suite 3: NISQ Hardware Realism, Error Mitigation & Cloud QPU Bridge (`/hardware-lab`)

### 3.1 NISQ Decoherence Lab & Zero-Noise Extrapolation (ZNE)

#### Plain-Language Explanation
Today's real quantum computers (called **NISQ**—Noisy Intermediate-Scale Quantum devices) are not perfect: qubits slowly lose their energy ($T_1$ decay), lose their phase synchronization ($T_2$ dephasing), and suffer slight errors when two-qubit `CNOT` gates fire. In the **NISQ Decoherence & Error Mitigation Lab**, users can dial in realistic hardware noise from actual IBM Eagle/Heron or Rigetti processors to see how hardware noise blurs the quantum edge map. Even better, users can toggle **Zero-Noise Extrapolation (ZNE)**—a cutting-edge error mitigation technique that intentionally runs the circuit at $1\times$, $3\times$, and $5\times$ noise levels and mathematically extrapolates backward to recover the clean, zero-noise crater rim map!

#### Mathematical Formulation
1. **Density Matrix Kraus Operator Channel ($\mathcal{E}(\rho)$):**
   - **Two-Qubit Depolarizing Channel (per $CX$ gate with error rate $p_{2q} \in [0, 0.05]$):**
     $$\mathcal{E}_{\text{depol}}(\rho) = (1 - p_{2q})\rho + \frac{p_{2q}}{15} \sum_{\substack{P_a, P_b \in \{I, X, Y, Z\} \\ (P_a, P_b) \neq (I, I)}} (P_a \otimes P_b) \rho (P_a \otimes P_b)^\dagger$$
   - **Thermal Relaxation ($T_1$ Amplitude Damping $\gamma_1 = 1 - e^{-t_{\text{gate}}/T_1}$ & $T_2$ Phase Damping $\gamma_\phi = 1 - e^{-t_{\text{gate}}/T_\phi}$):**
     $$K_0 = \begin{pmatrix} 1 & 0 \\ 0 & \sqrt{1 - \gamma_1 - \gamma_\phi} \end{pmatrix}, \quad K_1 = \begin{pmatrix} 0 & \sqrt{\gamma_1} \\ 0 & 0 \end{pmatrix}, \quad K_2 = \begin{pmatrix} 0 & 0 \\ 0 & \sqrt{\gamma_\phi} \end{pmatrix}$$
2. **Unitary Folding & Richardson Zero-Noise Extrapolation (ZNE):**
   To evaluate the noisy edge probability $E(\lambda_m)$ at odd noise scale factors $\lambda_m \in \{1, 3, 5\}$, replace every two-qubit $CX$ gate (or circuit layer $U$) with its unitary-folded equivalent:
   $$U \longrightarrow U \left(U^\dagger U\right)^{\frac{\lambda_m - 1}{2}}$$
   In an ideal noiseless simulator, $U^\dagger U = I$, so the circuit unitary is unchanged, but on noisy hardware the effective error rate scales by $\lambda_m$. Using **Richardson Extrapolation** across $\lambda_1 = 1, \lambda_2 = 3, \lambda_3 = 5$, the mitigated zero-noise edge probability $\hat{E}_{\text{ZNE}}(0)$ is:
   $$\hat{E}_{\text{ZNE}}(0) = \sum_{m=1}^{3} \gamma_m E(\lambda_m), \quad \text{where } \gamma_m = \prod_{j \neq m} \frac{-\lambda_j}{\lambda_m - \lambda_j}$$
   Substituting $\lambda = (1, 3, 5)$ gives the exact analytical ZNE weights:
   $$\hat{E}_{\text{ZNE}}(0) = \frac{15}{8} E(1) - \frac{5}{4} E(3) + \frac{3}{8} E(5)$$

---

### 3.2 Physical QPU Coupling Map & SABRE SWAP Router Visualizer

#### Plain-Language Explanation
In a textbook quantum circuit, any qubit wire can connect to any other qubit wire. On a real superconducting quantum chip, qubits are wired on a fixed 2D silicon grid (like IBM's Heavy-Hexagonal lattice) and can only interact with their immediate physical neighbors. To run a $7$-qubit FRQI or $14$-qubit NEQR circuit on real hardware, a compiler must insert `SWAP` gates to shuttle quantum states across the chip. The **QPU Coupling Map Visualizer** draws the actual chip layout of **IBM Heron (Heavy-Hex)**, **Rigetti Ankaa (Square-Octagon)**, and **IonQ Aria (All-to-All)**, animates how logical qubits (`q0..q5`, `|c>`) map onto physical hardware qubits, and shows the exact `SWAP` overhead and circuit depth before and after SABRE routing.

---

### 3.3 Asynchronous AWS Braket & IBM Quantum Runtime Cloud Bridge

#### Plain-Language Explanation
Because the platform is deployed on AWS, authenticated researchers can select any critical $8 \times 8$ lunar crater rim patch in the Studio and dispatch it to **Amazon Braket** (e.g., AWS Braket `SV1` managed statevector simulator, `DM1` density-matrix simulator, or QPU targets) or **IBM Quantum Runtime** via a non-blocking background job queue. The UI displays real-time queue status (`QUEUED`, `RUNNING`, `COMPLETED`) via WebSockets and compares the hardware-sampled edge map side-by-side against the local Qiskit Aer ideal baseline.

---

### 3.4 Fault-Tolerant Clifford + $T$ & Surface Code Resource Estimator

#### Plain-Language Explanation
How big of a fault-tolerant quantum computer will humanity need in the future to process an entire $512 \times 512$ satellite GeoTIFF in a single shot without patch slicing? The **Fault-Tolerant Resource Estimator** calculates the exact number of logical qubits, non-Clifford $T$ gates, $T$-depth, physical surface-code qubits (at code distance $d \in \{13, 17, 21\}$), and runtime in milliseconds required for FRQI, QPIE, and NEQR across image resolutions from $8 \times 8$ up to $4096 \times 4096$.

#### Mathematical Formulation
For a $2^n \times 2^n$ image synthesized to rotation precision $\epsilon_{\text{synth}} = 10^{-4}$, each arbitrary single-qubit $R_y(\theta)$ rotation compiled via Ross-Selinger optimal Clifford+$T$ synthesis requires:
$$N_T(\text{single } R_y) \approx 3 \log_2\left(\frac{1}{\epsilon_{\text{synth}}}\right) \approx 40 \text{ } T\text{-gates}$$
Using surface code lattice surgery with physical gate error $p_{\text{phys}} = 10^{-3}$ and threshold $p_{\text{th}} = 10^{-2}$, the required code distance $d$ and physical qubits per logical qubit $N_{\text{phys/logical}} = 2d^2$ are computed dynamically and displayed in a comparative scalability chart.

---

## 4. Suite 4: Scientific Reproducibility, LaTeX Paper Exporter & Polyglot Transpiler (`/publish`)

### 4.1 One-Click LaTeX (`quantikz` + `booktabs` + BibTeX) Academic Bundle Generator

#### Plain-Language Explanation
Writing a quantum image processing research paper usually takes days of manually drawing circuit diagrams in TikZ and copying numbers into LaTeX tables. With **One-Click Paper Export**, clicking **"Export IEEE / Springer LaTeX Bundle (.zip)"** automatically generates:
1. `circuit_diagram.tex`: Publication-grade `\begin{quantikz} ... \end{quantikz}` LaTeX source code of the active circuit.
2. `benchmark_table.tex`: A formatted `\begin{table}` using `booktabs` (`\toprule`, `\midrule`, `\bottomrule`) containing the exact 6-algorithm scorecard metrics (Score, Thinness, SNR, Coverage, Qubits, Latency) from the user's run, with the top performer bolded.
3. `references.bib`: Complete BibTeX citations for FRQI, QPIE, NEQR, QHED, and Qiskit.
4. `figures/`: High-DPI ($300\text{ DPI}$) lossless PNG/PDF renders of the original image, quantum edge overlays, and noise mitigation plots.

---

### 4.2 Polyglot Quantum SDK AST Transpiler

#### Plain-Language Explanation
Different quantum research labs use different software frameworks. Some use IBM **Qiskit**, others use Xanadu **PennyLane** (for quantum machine learning), Google **Cirq**, **Amazon Braket SDK**, or raw **OpenQASM 3.0**. The **Polyglot SDK Transpiler** converts any circuit built in `/composer` or any patch pipeline in `/studio` into all five languages simultaneously, with copy-to-clipboard and downloadable `.py` / `.qasm` scripts.

| Target Framework | Generated Code Idiom | Primary Ecosystem Audience |
| :--- | :--- | :--- |
| **IBM Qiskit 1.x** | `qc = QuantumCircuit(7); qc.ry(2*theta, 6)` | IBM Quantum hardware & Aer researchers |
| **Xanadu PennyLane** | `@qml.qnode(dev)` with `qml.RY`, `qml.Hadamard`, `qml.expval` | Quantum Machine Learning (PyTorch/JAX) researchers |
| **Amazon Braket SDK** | `circuit = Circuit().ry(6, 2*theta).h(0)` | AWS Cloud & IonQ / Rigetti / QuEra users |
| **Google Cirq** | `q = cirq.LineQubit.range(7); cirq.ry(2*theta).on(q[6])` | Google Quantum AI & fermionic simulation labs |
| **OpenQASM 3.0** | `OPENQASM 3.0; include "stdgates.inc"; qubit[7] q;` | Hardware-agnostic compilers & C++/Rust simulators |

---

### 4.3 Deterministic Experiment Permalinks & SHA-256 Snapshot Store

#### Plain-Language Explanation
Every time a researcher runs a benchmark or builds a custom circuit, they can click **"Create Reproducible Permalink"**. The backend computes a cryptographic SHA-256 hash of the exact input image bytes, algorithm parameters, shot count, random seed, and noise profile, stores the immutable snapshot in PostgreSQL + Amazon S3, and generates a permanent citation URL (e.g., `https://quantumvision.io/run/qv-8f92a1c4`). Any peer reviewer or professor who opens that link immediately sees the exact same inputs, circuits, and outputs.

---

## 5. Suite 5: MCP Quantum Copilot & Custom Unitary Algorithm Arena (`/arena`)

### 5.1 FastMCP Quantum Vision Copilot Server

#### Plain-Language Explanation
Built using the **Model Context Protocol (MCP)** (`mcp-builder` and `mcp-developer` skills from `antigravity_master_skills_manifest_router.md`), the **Quantum Vision Copilot** is not a generic chatbot—it is an AI agent with direct, schema-validated tool access to the live quantum statevector, circuit AST, and lunar scorecard metrics. A user can ask:
- *"Why did QPIE-QHED have lower SNR than FRQI-QHED on this dark crater patch?"* $\to$ The agent calls `inspect_patch_telemetry()`, reads the patch $L_2$ norm $\|\mathbf{I}\|_2$, and explains the exact mathematical reason.
- *"Build a 4-qubit circuit in the composer that prepares an entangled GHZ state with a $\frac{\pi}{4}$ phase on $|1111\rangle$"* $\to$ The agent calls `mutate_composer_circuit()` and places the exact $H$, $CX$, and $T$ gates onto the user's canvas in real time!

#### Exposed FastMCP Tools (`backend/app/mcp/quantum_copilot_server.py`)
1. `inspect_active_statevector(step_index: int) -> StatevectorSummary`: Returns non-zero basis states, phases, Bloch purity vectors, and entanglement entropy at step $t$.
2. `synthesize_circuit_from_goal(target_description: str, num_qubits: int) -> CircuitGateList`: Synthesizes validated gate sequences and loads them into `/composer`.
3. `diagnose_benchmark_scorecard(job_id: str) -> DiagnosticReport`: Analyzes the 6-algorithm scorecard and recommends optimal shot count, phase gain $\alpha$, or wavelet denoising $\eta$.
4. `estimate_nisq_fidelity(circuit_json: dict, backend_profile: str) -> FidelityEstimate`: Computes expected circuit fidelity and recommends ZNE scale factors.

---

### 5.2 Custom Unitary Matrix & OpenQASM 3.0 Algorithm Arena

#### Plain-Language Explanation
What if a researcher invents their own quantum edge detection circuit and wants to test it against FRQI-QHED, QPIE-QHED, NEQR-Gradient, Sobel, Canny, and Robinson? In the **Custom Algorithm Arena (`/arena`)**, users can define a custom $8 \times 8$ patch unitary (either by typing an OpenQASM 3.0 circuit or importing a circuit from `/composer`) and click **"Enter Benchmark Arena"**. The backend executes their custom quantum operator across the uploaded lunar image and ranks their custom algorithm right alongside the 6 built-in methods on the unified Quantitative Scorecard!

---

## 6. Unified Modular Architecture, Wireframes, Database Schema & FastAPI Contracts

### 6.1 Master Visual Wireframe: 3D Lunar GIS & NISQ Hardware Lab (`/gis-explorer` & `/hardware-lab`)

```
+----------------------------------------------------------------------------------------------------------------+
|  [Floating Navbar: Quantum Vision | Architectures | Studio | Composer | 3D GIS | Hardware Lab | Arena | Export]|
+----------------------------------------------------------------------------------------------------------------+
|  ACTIVE MODULE SWITCHER:                                                                                       |
|  [Tab 1: QWT Denoise & QCNN] [Tab 2: 3D Crater DEM & GeoJSON] [Tab 3: NISQ Noise & ZNE] [Tab 4: Paper Export]  |
+----------------------------------------------------------------------------------------------------------------+
|                                                                                                                |
|  +------------------------------------------------------------------+ +--------------------------------------+ |
|  | INTERACTIVE 3D LUNAR DEM TERRAIN VIEWPORT (WebGL / Three.js)     | | MORPHOMETRY & NISQ HARDWARE CONTROLS | |
|  | (#181818 Container, 1px #313131, Concentric rounded-xl)          | | (#1F1F1F Card, 1px #313131)          | |
|  |                                                                  | |                                      | |
|  |         /\      * Electric Magenta FRQI QHED Rim Overlay         | | 1. Pre-Edge Quantum Wavelet Denoise  | |
|  |        /  \       draped over Apollo 16 LOLA Elevation Mesh      | |    Denoise Strength: [====o===] 0.65 | |
|  |   ____/    \____  /\                                             | |    Grover Boost (r): [ 0 | 1 | 2 ]   | |
|  |  /  Crater #04  \/  \     [Detected Crater #04]                  | |                                      | |
|  | /  Diam: 4.82 km     \    * Center: (8.97 S, 15.50 E)            | | 2. 3D Terrain & Solar Illumination   | |
|  |                       \   * Depth: 612 m (d/D = 0.127)           | |    Z Exaggeration:   [=====o==] 2.5x | |
|  |                        \  * QCNN Class: Primary Impact Rim (96%) | |    Sun Elevation:    [==o=====] 18 deg| |
|  |                                                                  | |                                      | |
|  | [Orbit: Mouse Drag] [Overlay: FRQI QHED | QCNN Classes | Change] | | 3. NISQ Noise & ZNE Mitigation       | |
|  +------------------------------------------------------------------+ |    Device: [IBM Heron 133Q HeavyHex] | |
|                                                                       |    CX Error Rate:    0.0045 (0.45%)  | |
|  +------------------------------------------------------------------+ |    Mitigation:       [ON: ZNE 1,3,5] | |
|  | ZNE MITIGATION & CRATER SIZE FREQUENCY DISTRIBUTION (CSFD)       | |                                      | |
|  | * Raw Noisy SNR: 1.38x  -->  ZNE Mitigated SNR (lambda->0): 2.09x| | [Button-md: Export GeoJSON Catalog]  | |
|  | * Craters Detected: 14  |  Mean Rim Thinness: 55.8%              | | [Button-md: Export IEEE LaTeX ZIP]   | |
|  +------------------------------------------------------------------+ +--------------------------------------+ |
+----------------------------------------------------------------------------------------------------------------+
```

---

### 6.2 Extended Hexagonal Backend Directory Structure

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── routes_qml.py               # POST /api/v1/qml/denoise-and-classify (QWT + QCNN + Grover)
│   │   ├── routes_gis.py               # POST /api/v1/gis/morphometry, GET /api/v1/gis/dem/{preset_id}
│   │   ├── routes_hardware.py          # POST /api/v1/hardware/simulate-nisq, POST /api/v1/hardware/braket
│   │   ├── routes_publish.py           # POST /api/v1/publish/latex-bundle, POST /api/v1/publish/transpile
│   │   └── routes_arena.py             # POST /api/v1/arena/evaluate-custom
│   ├── domain/
│   │   ├── qml/
│   │   │   ├── wavelet_denoiser.py     # 2D Quantum Haar Wavelet Transform + HH soft attenuation
│   │   │   ├── qcnn_classifier.py      # 4-qubit variational Quanvolutional terrain classifier
│   │   │   ├── ncqi_multispectral.py   # 9-qubit 3-band Optical + Thermal + SAR encoding
│   │   │   └── grover_oracle.py        # Adaptive Grover amplitude amplification (r=1,2)
│   │   ├── gis/
│   │   │   ├── dem_mesh.py             # LOLA GeoTIFF heightmap parser & normal map generator
│   │   │   ├── crater_fitter.py        # Fitzgibbon ellipse fitting + CSFD R-plot calculator
│   │   │   ├── geojson_exporter.py     # RFC 7946 IAU_2015:30100 GeoJSON serializer
│   │   │   └── interferometry.py       # Bi-temporal quantum phase change detector
│   │   ├── hardware/
│   │   │   ├── nisq_channels.py        # T1/T2 thermal + depolarizing Kraus noise builder
│   │   │   ├── zne_mitigator.py        # Unitary folding (1,3,5) + Richardson extrapolator
│   │   │   ├── sabre_visualizer.py     # Heavy-Hex & Ankaa coupling map SWAP router trace
│   │   │   └── ftqc_estimator.py       # Clifford+T & surface code physical qubit calculator
│   │   └── publish/
│   │       ├── quantikz_generator.py   # Circuit AST -> LaTeX quantikz + booktabs compiler
│   │       └── polyglot_transpiler.py  # Qiskit / PennyLane / Cirq / Braket / OpenQASM 3.0
│   └── mcp/
│       └── quantum_copilot_server.py   # FastMCP tool server for AI circuit & telemetry inspection
```

---

### 6.3 PostgreSQL + PostGIS Database Schema (`postgres-pro`)

```sql
-- 1. Immutable Reproducible Experiment Snapshots (Permalinks)
CREATE TABLE experiment_snapshots (
    snapshot_hash VARCHAR(64) PRIMARY KEY,          -- SHA-256 content-addressable ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    algorithm_id VARCHAR(32) NOT NULL,
    resolution INTEGER NOT NULL,
    shots INTEGER NOT NULL,
    parameters_json JSONB NOT NULL,                 -- Denoise, Grover r, ZNE, Phase Gain
    scorecard_json JSONB NOT NULL,                  -- Full 6+1 algorithm metrics
    s3_assets_prefix TEXT NOT NULL                  -- CloudFront URL prefix for overlays & DEM
);

-- 2. Automated Crater Morphometry Catalog (PostGIS Enabled)
CREATE TABLE lunar_crater_detections (
    crater_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_hash VARCHAR(64) REFERENCES experiment_snapshots(snapshot_hash) ON DELETE CASCADE,
    center_x_px DOUBLE PRECISION NOT NULL,
    center_y_px DOUBLE PRECISION NOT NULL,
    semi_major_px DOUBLE PRECISION NOT NULL,
    semi_minor_px DOUBLE PRECISION NOT NULL,
    diameter_km DOUBLE PRECISION NOT NULL,
    depth_m DOUBLE PRECISION,
    ellipticity DOUBLE PRECISION NOT NULL,
    qcnn_terrain_class VARCHAR(32) NOT NULL,
    rim_confidence_mean DOUBLE PRECISION NOT NULL,
    geojson_polygon JSONB NOT NULL
);

CREATE INDEX idx_crater_snapshot ON lunar_crater_detections(snapshot_hash);
CREATE INDEX idx_crater_diameter ON lunar_crater_detections(diameter_km);
```

---

### 6.4 FastAPI Endpoint Contracts (`api-designer`)

#### Endpoint 1: `POST /api/v1/hardware/simulate-nisq`
Simulates any quantum edge algorithm under realistic NISQ hardware noise and computes the Zero-Noise Extrapolated (ZNE) recovery:
```json
{
  "request": {
    "preset_id": "apollo_16_crater_64",
    "algorithm": "FRQI_QHED",
    "hardware_profile": "IBM_HERON_133Q",
    "t1_us": 180.0,
    "t2_us": 140.0,
    "cx_error_rate": 0.0045,
    "readout_error": 0.012,
    "enable_zne": true,
    "zne_scale_factors": [1, 3, 5]
  },
  "response": {
    "hardware_profile_display": "IBM Heron 133Q Heavy Hex",
    "logical_qubits": 7,
    "routed_physical_qubits": [12, 13, 14, 15, 28, 29, 30],
    "inserted_swap_gates": 6,
    "transpiled_depth": 41,
    "snr_ideal": 2.14,
    "snr_noisy_scale_1": 1.42,
    "snr_noisy_scale_3": 1.11,
    "snr_noisy_scale_5": 0.94,
    "snr_zne_mitigated": 2.08,
    "urls": {
      "ideal_edge_url": "https://cdn.quantumvision.io/nisq/ideal.webp",
      "noisy_edge_url": "https://cdn.quantumvision.io/nisq/noisy_s1.webp",
      "zne_mitigated_url": "https://cdn.quantumvision.io/nisq/zne_mitigated.webp"
    }
  }
}
```

#### Endpoint 2: `POST /api/v1/gis/morphometry`
Runs Fitzgibbon ellipse fitting, QCNN terrain classification, and RFC 7946 GeoJSON generation:
```json
{
  "job_id": "0196a8e2-7c4b-7000-8000-1a2b3c4d5e6f",
  "craters_detected": 14,
  "mean_diameter_km": 3.42,
  "qcnn_class_distribution": {
    "Primary Impact Rim": 0.18,
    "Smooth Mare Basin": 0.61,
    "Sinuous Lunar Rille": 0.07,
    "Bright Ejecta Blanket": 0.14
  },
  "geojson_download_url": "https://cdn.quantumvision.io/runs/0196a8e2/craters_iau2015.geojson",
  "dem_heightmap_url": "https://cdn.quantumvision.io/presets/apollo16_lola_dem.webp"
}
```

---

## 7. Verification Matrix, Performance Benchmarks & Antigravity Definition of Done

Before declaring any module in Suites 1 through 5 complete, the Antigravity agent (`agy`) **MUST** verify every gate below:

- [ ] **Gate 1 — AST & Dependency Graph Updated (`graphify` + `code-review-graph`):**
  - [ ] `graphify .` and `code-review-graph build` index all new domain modules (`qml`, `gis`, `hardware`, `publish`, `mcp`).
- [ ] **Gate 2 — Mathematical & Scientific Unit Tests (`pytest-asyncio`):**
  - [ ] **QWT Denoising Test:** Verify that adding Gaussian/speckle noise ($\sigma = 20$) to a synthetic lunar crater patch and running $U_{\text{QHWT}}$ with $\eta = 0.7$ improves output SNR by $\ge 25\%$ over un-denoised QHED.
  - [ ] **Grover Amplification Test:** Verify that $r = 1$ Grover iteration on a low-contrast boundary ($\Delta I = 18$) increases post-selected edge probability from $P_0$ to $\sin^2(3\arcsin\sqrt{P_0})$ within $10^{-6}$ numerical tolerance.
  - [ ] **Richardson ZNE Test:** Verify that $\hat{E}_{\text{ZNE}}(0) = \frac{15}{8}E(1) - \frac{5}{4}E(3) + \frac{3}{8}E(5)$ cancels first- and second-order polynomial depolarizing error terms on the $7$-qubit FRQI circuit.
  - [ ] **GeoJSON & Ellipse Fitting Test:** Verify that Fitzgibbon ellipse fitting recovers the synthetic crater radius $R = 24\text{ px}$ within $\pm 0.5\text{ px}$ and outputs valid RFC 7946 GeoJSON.
- [ ] **Gate 3 — UI/UX & Zero-Hyphen Compliance (`ui-ux-pro-max` + `playwright` MCP):**
  - [ ] Automated Playwright DOM text assertion confirms zero `-` characters appear in any visible UI heading, tab, badge, or button across `/studio/qml-pipeline`, `/gis-explorer`, `/hardware-lab`, `/publish`, and `/arena`.
  - [ ] Three.js 3D DEM viewport renders at $\ge 55\text{ FPS}$ on headless Chromium (`chrome-devtools` MCP performance trace) with proper WebGL context cleanup on unmount.
- [ ] **Gate 4 — Security & Sandbox Isolation (`security-reviewer` + `static-analysis`):**
  - [ ] Custom Algorithm Arena (`/arena`) parses OpenQASM 3.0 ASTs strictly via a non-eval lexer/parser with a hard qubit limit ($n \le 14$), gate count cap ($\le 512$ gates), and process timeout ($5.0\text{ s}$).