# Master Specification & Implementation Blueprint: Interactive Quantum ML, 3D Lunar GIS Mission Planner, NISQ Hardware & Pulse Lab, and Scientific Publication Suite

> **Document Version:** 4.0.0 (Ultra-Comprehensive Production & Interactive Visualization Blueprint)  
> **Status:** Approved for Autonomous Antigravity IDE Execution  
> **Target Routes:** `/studio/qml-pipeline`, `/gis-explorer`, `/hardware-lab`, `/publish`, `/arena`  
> **Best-in-Class Technology Stack:**  
> - **Frontend Visualization & WebGL/WebGPU:** Next.js 15 (App Router, React 19, TypeScript 5.8, Tailwind CSS v4), React Three Fiber (`@react-three/fiber`, `@react-three/drei`), Custom GLSL/WebGPU Shaders, Deck.gl (`@deck.gl/geo-layers`), D3.js / Visx (Scientific Plots & Oscilloscopes), Force-Graph 2D/3D (QPU Topologies), KaTeX, OffscreenCanvas Web Workers  
> - **Quantum, AI & Geospatial Backend:** FastAPI (Async Python 3.12, `uv`), Qiskit 1.x, Qiskit Aer 1.15+ (`AerSimulator` Statevector & Density Matrix), PennyLane (`lightning.qubit` & PyTorch Autograd Bridge), Amazon Braket SDK, Rasterio / GDAL (Cloud-Optimized GeoTIFFs), Shapely / OpenCV Headless (Fitzgibbon Crater Fitting), FastMCP, ARQ + Redis, PostgreSQL 16 + PostGIS  
> **Agent Directive Compliance:** Strict adherence to `antigravity_master_skills_manifest_router.md` and `SKILL.md` (`design-system/MASTER.md`)

---

## Table of Contents

0. [Antigravity IDE Autonomous Execution Protocol, Best-in-Class Tooling & MCP Router](#0-antigravity-ide-autonomous-execution-protocol-best-in-class-tooling--mcp-router)
1. [Pillar 1: Interactive Quantum Machine Learning (QML) & Multi-Modal Vision Lab (`/studio/qml-pipeline`)](#1-pillar-1-interactive-quantum-machine-learning-qml--multi-modal-vision-lab-studioqml-pipeline)
   - [1.1 Interactive 2D/3D Quantum Haar Wavelet Frequency Equalizer & Speckle Suppressor](#11-interactive-2d3d-quantum-haar-wavelet-frequency-equalizer--speckle-suppressor)
   - [1.2 Quanvolutional Neural Network (QCNN) Live Filter & 3D Hilbert Space Embedding Projector](#12-quanvolutional-neural-network-qcnn-live-filter--3d-hilbert-space-embedding-projector)
   - [1.3 Interactive 3D Variational Loss Landscape & Barren Plateau Diagnostic Explorer](#13-interactive-3d-variational-loss-landscape--barren-plateau-diagnostic-explorer)
   - [1.4 NASA Artemis South Pole Multi-Spectral Fusion Mixer (Optical + Diviner Thermal + Mini-RF SAR)](#14-nasa-artemis-south-pole-multi-spectral-fusion-mixer-optical--diviner-thermal--mini-rf-sar)
   - [1.5 Grover Amplitude Amplification Statevector Oscilloscope & Over-Rotation Guard](#15-grover-amplitude-amplification-statevector-oscilloscope--over-rotation-guard)
   - [1.6 Pillar 1 Interactive UI Wireframe & Meaningful Scientific Insights](#16-pillar-1-interactive-ui-wireframe--meaningful-scientific-insights)
2. [Pillar 2: Planetary 3D GIS, Artemis Lander Hazard Analyzer & Crater Chronology Lab (`/gis-explorer`)](#2-pillar-2-planetary-3d-gis-artemis-lander-hazard-analyzer--crater-chronology-lab-gis-explorer)
   - [2.1 Photorealistic 3D LOLA DEM Terrain Draping with Raymarched Solar Ephemeris Shadows](#21-photorealistic-3d-lola-dem-terrain-draping-with-raymarched-solar-ephemeris-shadows)
   - [2.2 Real-Life Mission Feature: NASA Artemis & Lunar Lander Touchdown Safety & Slope Hazard Analyzer](#22-real-life-mission-feature-nasa-artemis--lunar-lander-touchdown-safety--slope-hazard-analyzer)
   - [2.3 Interactive Elevation Cross-Section Transect Slicer & Autonomous Rover Traverse Planner](#23-interactive-elevation-cross-section-transect-slicer--autonomous-rover-traverse-planner)
   - [2.4 Automated Crater Morphometry, Neukum Chronology Isochrons (Age Dating) & PostGIS GeoJSON Catalog](#24-automated-crater-morphometry-neukum-chronology-isochrons-age-dating--postgis-geojson-catalog)
   - [2.5 Bi-Temporal Quantum Phase Interferometry Change Detector & Blink Comparator](#25-bi-temporal-quantum-phase-interferometry-change-detector--blink-comparator)
   - [2.6 Pillar 2 Interactive UI Wireframe & Meaningful Planetary Insights](#26-pillar-2-interactive-ui-wireframe--meaningful-planetary-insights)
3. [Pillar 3: NISQ Hardware Realism, Error Mitigation, Microwave Pulse Lab & Cloud QPU Bridge (`/hardware-lab`)](#3-pillar-3-nisq-hardware-realism-error-mitigation-microwave-pulse-lab--cloud-qpu-bridge-hardware-lab)
   - [3.1 Interactive QPU Silicon Topology Graph & Animated SABRE SWAP Routing Visualizer](#31-interactive-qpu-silicon-topology-graph--animated-sabre-swap-routing-visualizer)
   - [3.2 4-Way NISQ Error Mitigation Lab: Ideal vs. Raw Noisy vs. TREX Readout vs. Pauli-Twirled ZNE](#32-4-way-nisq-error-mitigation-lab-ideal-vs-raw-noisy-vs-trex-readout-vs-pauli-twirled-zne)
   - [3.3 Transmon Microwave Control Pulse Oscilloscope (OpenPulse DRAG & Cross-Resonance Envelopes)](#33-transmon-microwave-control-pulse-oscilloscope-openpulse-drag--cross-resonance-envelopes)
   - [3.4 Interactive Readout Assignment Confusion Matrix & Tensored Calibration Inverter](#34-interactive-readout-assignment-confusion-matrix--tensored-calibration-inverter)
   - [3.5 Fault-Tolerant Quantum Computing (FTQC) Surface Code & Magic State Factory Planner](#35-fault-tolerant-quantum-computing-ftqc-surface-code--magic-state-factory-planner)
   - [3.6 Asynchronous AWS Braket & IBM Quantum Runtime Cloud Execution Bridge](#36-asynchronous-aws-braket--ibm-quantum-runtime-cloud-execution-bridge)
   - [3.7 Pillar 3 Interactive UI Wireframe & Meaningful Hardware Insights](#37-pillar-3-interactive-ui-wireframe--meaningful-hardware-insights)
4. [Pillar 4 & 5: One-Click LaTeX Academic Publisher, Polyglot SDK Transpiler, FastMCP Copilot & Arena](#4-pillar-4--5-one-click-latex-academic-publisher-polyglot-sdk-transpiler-fastmcp-copilot--arena)
5. [Complete Modular Backend Architecture, PostGIS Schema & FastAPI Data Contracts](#5-complete-modular-backend-architecture-postgis-schema--fastapi-data-contracts)
6. [Antigravity Quality Gates, Automated Verification Tests & Definition of Done](#6-antigravity-quality-gates-automated-verification-tests--definition-of-done)

---

## 0. Antigravity IDE Autonomous Execution Protocol, Best-in-Class Tooling & MCP Router

> **MANDATORY AGENT SYSTEM DIRECTIVE:**  
> Before writing any code for Pillars 1 through 5, the Google Antigravity agent (`agy`) **MUST** execute the 6-step bootstrap sequence from `antigravity_master_skills_manifest_router.md`, verify that all required **Skills** and **Free MCP Servers** are active, index the codebase via `graphify .` and `code-review-graph build`, and enforce `SKILL.md` (`design-system/MASTER.md`).

### 0.1 Master Skill, Free MCP & Best-in-Class Technology Matrix

| Platform Pillar / Subsystem | Classification | Antigravity Skills to Import & Trigger | Free MCP Servers Invoked | Best-in-Class Libraries & Tools |
| :--- | :--- | :--- | :--- | :--- |
| **0. AST Graph, Spec-Driven TDD & Security** | `[MANDATORY]` | `graphify`, `superpowers` (`/brainstorming`, `/write-plan`), `code-review-graph`, `context-mode`, `caveman`, `security-reviewer`, `static-analysis`, `systematic-debugging` | `context7`, `deepwiki`, `fetch`, `sequential-thinking` | `tree-sitter`, `semgrep`, `bandit`, `trivy`, `pytest-asyncio`, `vitest` |
| **1. Pillar 1: QML, Wavelet Equalizer, 3D Hilbert UMAP & Grover Oscilloscope** | `[MANDATORY]` | `ui-ux-pro-max`, `frontend-design`, `react-best-practices`, `fastapi-expert`, `modern-python`, `ml-pipeline`, `fine-tuning-expert` | `context7` (PennyLane / Qiskit / Three.js), `deepwiki`, `chrome-devtools` | `pennylane`, `qiskit-aer`, `torch`, `@react-three/fiber`, `@visx/visx`, `umap-js`, `OffscreenCanvas` |
| **2. Pillar 2: 3D Lunar DEM, Lander Safety Analyzer, Transect Slicer & PostGIS** | `[MANDATORY]` | `ui-ux-pro-max`, `frontend-design`, `web-design-guidelines`, `typescript-pro`, `postgres-pro`, `database-optimizer`, `api-designer` | `context7` (R3F / GLSL / PostGIS), `playwright`, `chrome-devtools` | `@react-three/drei`, Custom WebGL2 GLSL Shaders, `rasterio`, `shapely`, `opencv-python-headless`, `PostGIS` |
| **3. Pillar 3: NISQ Topology Router, ZNE Lab, Pulse Oscilloscope & AWS Braket** | `[MANDATORY]` | `microservices-architect`, `fastapi-expert`, `websocket-engineer`, `cloud-architect`, `terraform-engineer`, `aws-finops-cost-guard` | `aws-docs` (Amazon Braket), `aws-terraform`, `context7`, `deepwiki` | `qiskit_aer.noise`, `rustworkx`, `react-force-graph-2d`, `amazon-braket-sdk`, `arq`, `redis` |
| **4. Pillar 4 & 5: LaTeX Publisher, Polyglot Transpiler, FastMCP Copilot & Arena** | `[MANDATORY]` | `mcp-builder`, `mcp-developer`, `prompt-engineer`, `rag-architect`, `llm-eval-gate`, `vercel-optimize` | `context7` (FastMCP / OpenQASM 3), `fetch`, `sequential-thinking` | `fastmcp`, `qiskit.qasm3`, `quantikz`, `booktabs`, `katex` |
| **5. Real-Browser E2E QA, Load Benchmarking & SRE Observability** | `[MANDATORY]` | `webapp-testing`, `chaos-engineer`, `k6-load-testing`, `devops-engineer`, `monitoring-expert`, `sre-engineer` | `playwright`, `chrome-devtools` (Lighthouse) | `@playwright/test`, `k6`, OpenTelemetry, Prometheus |

### 0.2 Strict `SKILL.md` & `design-system/MASTER.md` Visual Compliance Rules

1. **Typography & Zero-Hyphen Visible UI Copy Mandate:**
   - Headings, navigation, and prose use `Geist` (or `Manrope`).
   - All numeric telemetry, qubit bitstrings (`|q5 q4 q3 q2 q1 q0>`), microwave frequencies ($5.08\text{ GHz}$), selenographic coordinates ($8.97^\circ\text{ S}, 15.50^\circ\text{ E}$), and matrix entries use `Geist Mono` (`Caption 1`, `Caption 3`, `Caption 4`).
   - **Zero Hyphens in Visible UI Text:** Never render a hyphen (`-`) inside any visible UI heading, tab, button, badge, or label. Always render `Zero Noise Extrapolation`, `Three Dimensional Lunar Terrain`, `Multi Spectral Fusion`, `Sub Pixel Interferometry`, `Cross Section Elevation Profile`, and `Landing Safety Index`.
   - **Zero Italics in UI Chrome:** All UI components enforce `font-style: normal`. All mathematical notation uses KaTeX (`$...$` and `$$...$$`).
2. **100% Flat Dark Surface Architecture:**
   - Base Canvas: `#000000`
   - Deep Workspace & Viewport Well: `#181818`
   - Elevated Card / Control Module / Oscilloscope Frame: `#1F1F1F`
   - Interactive Hover / Active Slider Track: `#272727`
   - Warm Diagnostic Verdict Surface: `#131209`
   - Border Stroke: Full 4-sided `1px solid #313131` (single-sided borders are forbidden; use `Spacing-600` ($48\text{px}$) or `Spacing-800` ($80\text{px}$) vertical gaps).
3. **Concentric Nested Radius Rule:**
   $$R_{\text{inner}} = \max\left(4\text{px}, R_{\text{outer}} - \text{Gap}\right)$$

---

## 1. Pillar 1: Interactive Quantum Machine Learning (QML) & Multi-Modal Vision Lab (`/studio/qml-pipeline`)

### 1.1 Interactive 2D/3D Quantum Haar Wavelet Frequency Equalizer & Speckle Suppressor

#### Real-Life Problem & Meaningful Insight
Orbital imagery from the Lunar Reconnaissance Orbiter (LRO) and synthetic aperture radar (SAR) instruments is heavily degraded by high-frequency cosmic-ray hits and multiplicative speckle noise. Classical Gaussian smoothing blurs true crater rims from $1\text{ pixel}$ out to $3\text{ pixels}$, destroying fine geological fracture lines. By applying a **2D Quantum Haar Wavelet Transform ($U_{\text{QHWT}}^{(2\text{D})}$)** inside the quantum circuit *before* QHED edge detection, the $6$-qubit position Hilbert space is partitioned into four orthogonal frequency sub-bands in $\mathcal{O}(1)$ Hadamard depth, allowing researchers to attenuate diagonal sensor speckle ($\text{HH}$) while preserving horizontal ($\text{LH}$) and vertical ($\text{HL}$) crater rim energy at $100\%$ sharpness.

#### Mathematical Formulation
For an $8 \times 8$ patch encoded in a $6$-qubit QPIE state $|\psi_{\text{QPIE}}\rangle = \sum_{Y=0}^{7}\sum_{X=0}^{7} \alpha_{Y,X} |Y\rangle_{q_5 q_4 q_3}|X\rangle_{q_2 q_1 q_0}$ (or $7$-qubit FRQI state), the single-level $1\text{D}$ Quantum Haar Wavelet unitary is:
$$U_{\text{QHWT}}^{(1\text{D})} = P_{\text{ror}} \cdot \left(I^{\otimes 2} \otimes H\right)$$
where $P_{\text{ror}} |b_2 b_1 b_0\rangle = |b_0 b_2 b_1\rangle$ is a cyclic right bit-rotation wire permutation that moves the Hadamard sum/difference qubit to the most-significant bit. Applying the $2\text{D}$ transform $U_{\text{QHWT}}^{(2\text{D})} = U_{\text{QHWT}}^{(Y)} \otimes U_{\text{QHWT}}^{(X)}$ decomposes the statevector into four $4 \times 4$ wavelet sub-bands indexed by $(q_5, q_2)$:
$$|\psi_{\text{wavelet}}\rangle = \sum_{s_Y \in \{0,1\}} \sum_{s_X \in \{0,1\}} |s_Y\rangle_{q_5} |s_X\rangle_{q_2} \otimes \sum_{y'=0}^{3} \sum_{x'=0}^{3} w_{y', x'}^{(s_Y, s_X)} |y'\rangle_{q_4 q_3} |x'\rangle_{q_1 q_0}$$
where the four sub-bands represent:
- **$\text{LL}$ ($s_Y=0, s_X=0$):** Coarse terrain background approximation: $w_{y',x'}^{(0,0)} = \frac{1}{2}\left(\alpha_{2y',2x'} + \alpha_{2y',2x'+1} + \alpha_{2y'+1,2x'} + \alpha_{2y'+1,2x'+1}\right)$
- **$\text{LH}$ ($s_Y=0, s_X=1$):** Horizontal gradient detail: $w_{y',x'}^{(0,1)} = \frac{1}{2}\left(\alpha_{2y',2x'} - \alpha_{2y',2x'+1} + \alpha_{2y'+1,2x'} - \alpha_{2y'+1,2x'+1}\right)$
- **$\text{HL}$ ($s_Y=1, s_X=0$):** Vertical gradient detail: $w_{y',x'}^{(1,0)} = \frac{1}{2}\left(\alpha_{2y',2x'} + \alpha_{2y',2x'+1} - \alpha_{2y'+1,2x'} - \alpha_{2y'+1,2x'+1}\right)$
- **$\text{HH}$ ($s_Y=1, s_X=1$):** Diagonal high-frequency speckle noise: $w_{y',x'}^{(1,1)} = \frac{1}{2}\left(\alpha_{2y',2x'} - \alpha_{2y',2x'+1} - \alpha_{2y'+1,2x'} + \alpha_{2y'+1,2x'+1}\right)$

Applying a controlled soft-attenuation unitary $\mathcal{D}(\eta_{\text{LH}}, \eta_{\text{HL}}, \eta_{\text{HH}})$ conditioned on $(q_5, q_2)$ scales the $\text{HH}$ speckle amplitudes by $(1 - \eta_{\text{HH}})$ before applying the inverse wavelet transform $\left(U_{\text{QHWT}}^{(2\text{D})}\right)^\dagger$ and executing QHED.

#### Interactive Visuals & User Controls
- **Exploded 4-Quadrant Sub-Band Matrix Viewer:** Renders live $60\text{ FPS}$ heatmaps of the $\text{LL}$ (Golden), $\text{LH}$ (Cyan), $\text{HL}$ (Magenta), and $\text{HH}$ (Red Speckle) quantum wavelet sub-bands side-by-side.
- **Interactive Sub-Band Gain Sliders ($\eta_{\text{LH}}, \eta_{\text{HL}}, \eta_{\text{HH}} \in [0, 1]$):** As the user drags $\eta_{\text{HH}} \to 0.85$, they watch the red $\text{HH}$ speckle energy drop to zero while the live **Signal-to-Noise Ratio (SNR) Gauge** climbs from $1.42\times$ to $2.48\times$ and **Structural Similarity (SSIM)** increases in real time.

---

### 1.2 Quanvolutional Neural Network (QCNN) Live Filter & 3D Hilbert Space Embedding Projector

#### Real-Life Problem & Meaningful Insight
Classical convolutional neural networks (CNNs) require thousands of trainable parameters to separate overlapping geological textures in low-contrast planetary images. A **Quanvolutional Neural Network (QCNN)** replaces the first classical convolution layer with a parameter-free or variational **4-Qubit Entangled Quantum Kernel** that maps $2 \times 2$ pixel patches into a $16$-dimensional complex Hilbert space $\mathcal{H} = (\mathbb{C}^2)^{\otimes 4}$, extracting non-linearly entangled spatial correlation features ($\langle Z_0 \rangle, \langle Z_1 \rangle, \langle Z_2 \rangle, \langle Z_3 \rangle, \langle Z_0 Z_1 \rangle, \langle Z_1 Z_2 \rangle$) that make geological terrain classes linearly separable.

#### Mathematical Formulation
For every $2 \times 2$ sliding window $\mathbf{x} = [x_0, x_1, x_2, x_3]^T \in [0, 255]^4$:
1. **Data Re-Uploading & Angle Encoding ($\mathcal{E}(\mathbf{x})$):**
   $$|\psi_0(\mathbf{x})\rangle = \bigotimes_{j=0}^{3} R_y\left(\frac{\pi x_j}{255}\right) H |0\rangle^{\otimes 4}$$
2. **Strongly Entangling Variational Ring ($\mathcal{W}(\boldsymbol{\Theta})$):**
   $$|\psi_{\text{QCNN}}(\mathbf{x}, \boldsymbol{\Theta})\rangle = \prod_{l=1}^{L} \left( \prod_{j=0}^{3} CZ\big(j, (j+1)\bmod 4\big) \bigotimes_{j=0}^{3} R_z(\theta_{l,j,2}) R_y(\theta_{l,j,1}) \right) |\psi_0(\mathbf{x})\rangle$$
3. **Multi-Observable Quantum Feature Extraction:**
   Measure the $4$ single-qubit Pauli-$Z$ expectations and $2$ nearest-neighbor Ising correlators:
   $$f_k(\mathbf{x}) = \langle \psi_{\text{QCNN}} | Z_k | \psi_{\text{QCNN}} \rangle \quad (k \in \{0,1,2,3\}), \qquad f_{4+m}(\mathbf{x}) = \langle \psi_{\text{QCNN}} | Z_m Z_{m+1} | \psi_{\text{QCNN}} \rangle \quad (m \in \{0,1\})$$
4. **Terrain Classification & Quantum Kernel Gram Matrix:**
   For any two lunar patches $\mathbf{x}$ and $\mathbf{x}'$, the fidelity-based **Quantum Kernel** is:
   $$K_Q(\mathbf{x}, \mathbf{x}') = \left| \langle \psi_{\text{QCNN}}(\mathbf{x}) \mid \psi_{\text{QCNN}}(\mathbf{x}') \rangle \right|^2 = \text{Tr}\big(\rho(\mathbf{x})\rho(\mathbf{x}')\big) \in [0, 1]$$

#### Interactive Visuals & Meaningful Insights
- **Live 4-Channel Quantum Feature Map Strip:** Displays the $4$ output channels ($f_0$: Isotropic Albedo, $f_1$: Horizontal Rim Polarity, $f_2$: Vertical Rim Polarity, $f_3$: Entangled Saddle/Corner Curvature) updating live as the user swaps circuit ansatzes (`Basic Entangler`, `Strongly Entangling Ring`, `Hardware Efficient SU(2)`).
- **Interactive 3D Hilbert Space Embedding Projector (Three.js Instanced Scatter Cloud):** Projects all $4,096$ patches of the lunar image into a 3D UMAP/Kernel-PCA coordinate space. Each floating 3D point represents a patch colored by its predicted geological class:
  - **Primary Impact Crater Rim** (`#FF79C6` Electric Magenta)
  - **Smooth Mare Basalt Basin** (`#52525B` Slate)
  - **Sinuous Volcanic Rille / Graben** (`#00F0FF` Neon Cyan)
  - **Bright Ray Ejecta Blanket** (`#FFD700` Golden Sunlight)
  - **Permanently Shadowed Polar Ice Candidate** (`#39D353` Emerald)
  Clicking any point in the 3D Hilbert cloud highlights the exact corresponding $8 \times 8$ patch on the lunar map and displays its $4 \times 4$ Quantum Kernel similarity matrix!

---

### 1.3 Interactive 3D Variational Loss Landscape & Barren Plateau Diagnostic Explorer

#### Real-Life Problem & Meaningful Insight
The single greatest obstacle in training real-life Quantum Machine Learning models is the **Barren Plateau Phenomenon**: as qubit count $n$ and circuit depth $L$ grow, or when using a **Global Cost Function** (measuring all qubits simultaneously), the variance of the cost gradient vanishes exponentially ($\text{Var}[\partial_{\theta_k} \mathcal{L}] \propto \mathcal{O}(2^{-n})$), trapping optimizers on a flat plateau. By contrast, a **Local Cost Function** (measuring individual single-qubit Pauli-$Z_k$ observables) maintains polynomial gradient variance $\mathcal{O}(1/\text{poly}(n))$ for shallow circuits!

#### Mathematical Formulation
1. **Exact Parameter-Shift Rule Gradient:**
   For any gate parameter $\theta_k$ in $R_y(\theta_k) = e^{-i \theta_k Y / 2}$, the exact analytical quantum gradient is computed via two circuit evaluations shifted by $\pm \frac{\pi}{2}$:
   $$\frac{\partial \mathcal{L}(\boldsymbol{\theta})}{\partial \theta_k} = \frac{1}{2} \left[ \mathcal{L}\left(\boldsymbol{\theta} + \frac{\pi}{2}\mathbf{e}_k\right) - \mathcal{L}\left(\boldsymbol{\theta} - \frac{\pi}{2}\mathbf{e}_k\right) \right]$$
2. **Quantum Fisher Information Matrix (QFIM) & Gradient Variance:**
   $$\mathcal{F}_{ij}(\boldsymbol{\theta}) = 4\,\text{Re}\left( \langle \partial_i \psi | \partial_j \psi \rangle - \langle \partial_i \psi | \psi \rangle \langle \psi | \partial_j \psi \rangle \right), \qquad \text{Var}_{\boldsymbol{\theta}}\left[\frac{\partial \mathcal{L}}{\partial \theta_k}\right] = \frac{1}{M} \sum_{m=1}^{M} \left(\frac{\partial \mathcal{L}(\boldsymbol{\theta}^{(m)})}{\partial \theta_k}\right)^2$$

#### Interactive Visuals & Meaningful Insights
- **3D Interactive Loss Landscape Mesh ($\theta_1, \theta_2, \mathcal{L}(\theta_1, \theta_2)$):** Renders a 3D WebGL topographic surface of the QCNN cost landscape around the current parameter point.
- **Local vs. Global Cost Function Toggle:** Switching from `Local Pauli Z Cost` to `Global All Qubit Projector Cost` visually flattens the 3D peaks and valleys into a dead flat **Barren Plateau**, while the live **Gradient Variance Meter** drops from $4.2 \times 10^{-2}$ down to $1.1 \times 10^{-5}$, giving researchers an unforgettable visual intuition for why local observables are mandatory in QML!

---

### 1.4 NASA Artemis South Pole Multi-Spectral Fusion Mixer (Optical + Diviner Thermal + Mini-RF SAR)

#### Real-Life Problem & Meaningful Insight
At the Lunar South Pole (Shackleton, Haworth, and Shoemaker craters), craters sit in **Permanently Shadowed Regions (PSRs)** where sunlight never reaches. Optical cameras see pitch black ($I_{\text{opt}} \approx 0$). However, NASA's **Diviner Lunar Radiometer** measures bolometric temperatures down to $35\text{ K}$ (identifying cryogenic water-ice cold traps), and the **Mini-RF Synthetic Aperture Radar** measures the Circular Polarization Ratio ($\text{CPR} = \sigma_{\text{SC}} / \sigma_{\text{OC}}$), where $\text{CPR} > 1.0$ indicates rough blocky ejecta or coherent backscatter from buried water-ice deposits! Using a **9-Qubit Multi-Channel Quantum Image Representation (NCQI)**, the platform encodes all three co-registered orbital sensors into a single entangled statevector and extracts unified multi-physics boundaries.

#### Mathematical Formulation
For an $8 \times 8$ patch with $3$ co-registered orbital channels—Optical Albedo $I_{\text{opt}}(i)$, Diviner Thermal $I_{\text{therm}}(i)$, and Mini-RF Radar $I_{\text{sar}}(i)$—define three channel rotation angles $\theta_{b,i} = \frac{\pi}{2}\frac{I_b(i)}{255}$ on three dedicated color qubits $|c_{\text{opt}}\rangle |c_{\text{therm}}\rangle |c_{\text{sar}}\rangle$ entangled with $6$ position qubits $|i\rangle_{YX}$:
$$|\psi_{\text{NCQI}}\rangle = \frac{1}{8} \sum_{i=0}^{63} \left[ \bigotimes_{b \in \{\text{opt}, \text{therm}, \text{sar}\}} \left( \cos\theta_{b,i}|0\rangle_b + \sin\theta_{b,i}|1\rangle_b \right) \right] \otimes |i\rangle_{YX}$$
Applying the QHED Hadamard gate $H$ to $q_0$ interferes all three sensor modalities in parallel. Given user-selected barycentric sensor weights $\mathbf{w} = (w_{\text{opt}}, w_{\text{therm}}, w_{\text{sar}})$ with $w_{\text{opt}} + w_{\text{therm}} + w_{\text{sar}} = 1$, the fused multi-spectral quantum edge probability is:
$$P_{\text{NCQI}}(a, b) = \sum_{b \in \{\text{opt}, \text{therm}, \text{sar}\}} w_b \cdot 2\sin^2\left(\frac{\theta_{b,a} - \theta_{b,b}}{2}\right)$$
Furthermore, the **Quantum Cryogenic Ice Candidate Score ($\text{QCICS}$)** at pixel $i$ is evaluated from the joint basis probability of measuring dark optical albedo ($|c_{\text{opt}} = 0\rangle$), ultra-low thermal emission ($|c_{\text{therm}} = 0\rangle$), and high radar polarization ($|c_{\text{sar}} = 1\rangle$):
$$\text{QCICS}(i) = P\left(c_{\text{opt}}=0, c_{\text{therm}}=0, c_{\text{sar}}=1 \mid i\right) = \cos^2\left(\theta_{\text{opt}, i}\right) \cdot \cos^2\left(\theta_{\text{therm}, i}\right) \cdot \sin^2\left(\theta_{\text{sar}, i}\right)$$

#### Interactive Visuals & Meaningful Insights
- **Interactive Ternary Barycentric Sensor Mixer Triangle:** Users drag a glowing reticle inside an equilateral triangle whose three vertices are `LRO WAC Optical`, `Diviner Thermal IR`, and `Mini RF Radar CPR`. Dragging toward the Radar/Thermal edge causes permanently shadowed crater rims and internal ice-bearing mounds to materialize out of the pitch-black optical shadow at $60\text{ FPS}$!

---

### 1.5 Grover Amplitude Amplification Statevector Oscilloscope & Over-Rotation Guard

#### Real-Life Problem & Meaningful Insight
In low-contrast lunar shadows, the post-Hadamard probability of measuring an edge pixel $p_{\text{edge}} = \sin^2\vartheta$ can be as low as $2\text{--}8\%$, requiring thousands of measurement shots to overcome shot noise. **Grover Amplitude Amplification** rotates the quantum statevector in the 2D subspace spanned by $|\psi_{\text{non-edge}}\rangle$ and $|\psi_{\text{edge}}\rangle$ by $2\vartheta$ per Grover iteration $r$, boosting edge probability to $\sin^2((2r+1)\vartheta)$. However, Grover's algorithm exhibits the famous **"Soufflé Problem" (Over-Rotation)**: if you apply too many iterations ($r > r_{\text{opt}} = \lfloor \frac{\pi}{4\vartheta} - \frac{1}{2} \rfloor$), the statevector rotates *past* the target axis and the edge signal collapses back toward zero!

#### Interactive Visuals & Meaningful Insights
- **2D Geometric Grover Subspace Compass:** Draws the unit circle with horizontal axis $|\psi_{\text{non-edge}}\rangle$ and vertical axis $|\psi_{\text{edge}}\rangle$. As the user steps through Grover iterations $r \in \{0, 1, 2, 3, 4\}$, vectors animate the Oracle reflection $U_\omega$ (reflection across $|\psi_{\text{non-edge}}\rangle$) followed by the Diffusion reflection $U_s$ (reflection across $|\psi_{\text{QHED}}\rangle$), showing the angle jumping from $\vartheta \to 3\vartheta \to 5\vartheta \to 7\vartheta$ and triggering a visual **Over-Rotation Alert Badge** if $(2r+1)\vartheta > \frac{\pi}{2}$.

---

### 1.6 Pillar 1 Interactive UI Wireframe & Meaningful Scientific Insights

```
+----------------------------------------------------------------------------------------------------------------+
|  QUANTUM MACHINE LEARNING & MULTI MODAL VISION LAB (/studio/qml-pipeline)                                      |
|  [Preset: Shackleton South Pole PSR | Apollo 16 Highland | Aristarchus Rille]  [Ansatz: Strongly Entangling v] |
+----------------------------------------------------------------------------------------------------------------+
|                                                                                                                |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
|  | 1. QUANTUM HAAR WAVELET SUB BAND EQUALIZER         | | 2. TERNARY MULTI SPECTRAL FUSION MIXER (9 QUBITS)  | |
|  | +---------------------+  +---------------------+   | |               [LRO Optical Albedo]                 | |
|  | | LL: Coarse Terrain  |  | LH: Horiz Rims      |   | |                       /\                           | |
|  | | Energy: 78.4%       |  | Gain: [====o=] 1.0x |   | |                      /  \                          | |
|  | +---------------------+  +---------------------+   | |                     / () \  <-- Drag Sensor Puck   | |
|  | | HL: Vert Rims       |  | HH: Speckle Noise   |   | |                    /______\                        | |
|  | | Gain: [====o=] 1.0x |  | Cut:  [o=====] 0.85 |   | |     [Diviner Thermal]    [Mini RF Radar CPR]       | |
|  | +---------------------+  +---------------------+   | | Weights: Opt 20% | Therm 35% | SAR 45%             | |
|  | Denoised SNR Gain: 1.42x -> 2.48x (+74.6% Clean)   | | Ice Candidate Score (QCICS): 12 Polar Traps Found  | |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
|                                                                                                                |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
|  | 3. 3D HILBERT KERNEL EMBEDDING & QCNN CLASSIFIER   | | 4. BARREN PLATEAU & GROVER AMPLIFICATION COMPASS   | |
|  | [3D WebGL UMAP Scatter Cloud of 4096 Patch States] | | [Tab: 3D Loss Landscape] [Tab: Grover Compass]     | |
|  |   * Primary Crater Rim (Magenta):   18.4%          | |        |psi_edge>                                  | |
|  |   * Smooth Mare Basalt (Slate):     54.2%          | |            ^     /  r=1: P=57.6% (Optimal Boost)   | |
|  |   * Sinuous Lunar Rille (Cyan):     8.1%           | |            |   /                                   | |
|  |   * Bright Ejecta Blanket (Gold):   14.6%          | |            | /  r=0: P=8.0%                        | |
|  |   * Polar Ice Cold Trap (Emerald):  4.7%           | |            +--------------> |psi_non_edge>         | |
|  | Kernel Separability (Silhouette):   0.84 (High)    | | Gradient Var: 0.0412 (Local Cost - Plateau Free)   | |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------------------+
```

---

## 2. Pillar 2: Planetary 3D GIS, Artemis Lander Hazard Analyzer & Crater Chronology Lab (`/gis-explorer`)

### 2.1 Photorealistic 3D LOLA DEM Terrain Draping with Raymarched Solar Ephemeris Shadows

#### Real-Life Problem & Meaningful Insight
Viewing a 2D edge map in isolation makes it difficult for planetary geologists to distinguish between a true topographic cliff (crater rim wall) and a flat surface albedo stain (bright ejecta ray on flat ground). By fusing the **NASA LOLA (Lunar Orbiter Laser Altimeter) Digital Elevation Model (DEM)** with the **Quantum Edge Confidence Map** inside a custom WebGL2 / Three.js shader pipeline, researchers can inspect the exact 3D topography, cast physically accurate low-angle solar shadows across the surface, and verify how FRQI-QHED and QPIE-QHED isolate structural ridges.

#### Mathematical & GLSL Shader Formulation
Given a $512 \times 512$ optical tile $I(u,v)$, LOLA elevation grid $H_{\text{DEM}}(u,v) \in [-3000\text{ m}, +4000\text{ m}]$, and quantum edge map $C_Q(u,v) \in [0, 1]$:
1. **Local Topographic Slope & Aspect Calculation:**
   Given pixel ground resolution $\Delta_{\text{GSD}}$ (in meters/pixel), the local elevation gradients $(p, q)$ and topographic slope angle $\beta_{\text{slope}}(u, v)$ in degrees are:
   $$p = \frac{\partial H_{\text{DEM}}}{\partial x} = \frac{H_{\text{DEM}}(u, v+1) - H_{\text{DEM}}(u, v-1)}{2\Delta_{\text{GSD}}}, \qquad q = \frac{\partial H_{\text{DEM}}}{\partial y} = \frac{H_{\text{DEM}}(u+1, v) - H_{\text{DEM}}(u-1, v)}{2\Delta_{\text{GSD}}}$$
   $$\beta_{\text{slope}}(u, v) = \arctan\left(\sqrt{p^2 + q^2}\right) \cdot \frac{180^\circ}{\pi} \in [0^\circ, 90^\circ]$$
2. **Lommel-Seeliger Lunar Regolith Photometric Reflectance + Raymarched Screen-Space Shadows:**
   Unlike glossy Earth materials, porous lunar regolith scatters light according to the **Lommel-Seeliger Photometric Law** based on incidence cosine $\mu_0 = \max(0, \mathbf{n} \cdot \mathbf{s})$ and emission cosine $\mu = \max(0, \mathbf{n} \cdot \mathbf{v})$:
   $$R_{\text{LS}}(\mu_0, \mu) = \frac{\mu_0}{\mu_0 + \mu + \epsilon}$$
   In the fragment shader, a $32$-step screen-space raymarch along the solar vector $\mathbf{s}(\alpha_{\text{az}}, \beta_{\text{el}})$ checks whether any upwind crater rim occludes the sun ($S_{\text{shadow}}(u,v) \in \{0.08, 1.0\}$), producing razor-sharp lunar shadows that sweep across the 3D crater floor as the user rotates the **Sun Azimuth & Elevation Dial**.

---

### 2.2 Real-Life Mission Feature: NASA Artemis & Lunar Lander Touchdown Safety & Slope Hazard Analyzer

#### Real-Life Problem & Meaningful Insight
During lunar landing missions (such as NASA Artemis Human Landing System, intuitive Machines Odysseus, or ISRO Chandrayaan-3 Vikram), a lander will tip over or crush its landing gear if it touches down on:
1. A local topographic slope exceeding the lander's stability limit ($\beta_{\text{slope}} > 8^\circ\text{--}10^\circ$),
2. A sharp sub-meter crater rim or boulder hazard (indicated by high quantum edge confidence $C_{\text{FRQI}}(u,v)$), or
3. A permanently shadowed communication/solar blackout zone.

This feature turns your quantum edge detector into an interactive **Lunar Lander Hazard Detection & Avoidance (HDA) Simulator**!

#### Mathematical Formulation of the Landing Safety Index ($\text{LSI}$)
For a candidate landing site centered at $(u_0, v_0)$ with circular lander footprint radius $R_{\text{lander}}$ (e.g., $R_{\text{lander}} = 25\text{ m}$ for Artemis Starship HLS, $7.5\text{ m}$ for Blue Moon MK1, or $6\text{ m}$ for Vikram) defining footprint disk $\Omega(u_0, v_0)$, compute:
1. **Maximum Footprint Slope ($\beta_{\max}$):**
   $$\beta_{\max}(u_0, v_0) = \max_{(u,v) \in \Omega(u_0, v_0)} \beta_{\text{slope}}(u, v)$$
2. **Quantum Rim & Boulder Hazard Density ($\mathcal{H}_Q$):**
   $$\mathcal{H}_Q(u_0, v_0) = \frac{1}{|\Omega|} \sum_{(u,v) \in \Omega(u_0, v_0)} C_{\text{FRQI}}(u, v)$$
3. **Topographic Roughness (RMS Elevation Residual $\sigma_H$):**
   $$\sigma_H(u_0, v_0) = \sqrt{\frac{1}{|\Omega|} \sum_{(u,v) \in \Omega(u_0, v_0)} \left(H_{\text{DEM}}(u,v) - \hat{H}_{\text{plane}}(u,v)\right)^2}$$
4. **Composite Landing Safety Index ($\text{LSI} \in [0, 100]$):**
   $$\text{LSI}(u_0, v_0) = 100 \cdot \exp\left( - \left(\frac{\beta_{\max}}{\beta_{\text{crit}}}\right)^2 - \gamma_Q \mathcal{H}_Q(u_0, v_0) - \gamma_R \frac{\sigma_H}{\sigma_{\text{crit}}} \right)$$
   - **$\text{LSI} \ge 80$ (Emerald `#39D353`):** Certified Safe Touchdown Ellipse ($\beta_{\max} < 5^\circ$, zero quantum edge hazards).
   - **$50 \le \text{LSI} < 80$ (Golden `#FFD700`):** Marginal Caution Zone (requires precision hazard-avoidance thruster divert).
   - **$\text{LSI} < 50$ (Crimson `#EF4444`):** Abort / Tip-Over Hazard Zone (crater rim wall or boulder cluster).

#### Interactive Visuals & Meaningful Insights
- **Interactive 3D Lander Reticle & Top-3 Safe Landing Zone Auto-Finder:** Hovering the mouse over the 3D lunar terrain projects a glowing 3D landing ring scaled to the chosen spacecraft (*Artemis HLS Starship*, *Blue Moon*, *Chandrayaan Vikram*) with a live HUD readout of `Max Slope (deg)`, `Quantum Edge Hazard (%)`, `RMS Roughness (m)`, and `Landing Safety Index (0 to 100)`. Clicking **"Find Optimal Landing Sites"** highlights the top $5$ safest touchdown ellipses on the 3D map!

---

### 2.3 Interactive Elevation Cross-Section Transect Slicer & Autonomous Rover Traverse Planner

#### Real-Life Problem & Meaningful Insight
When planning a lunar rover traverse (such as the Artemis Lunar Terrain Vehicle or VIPER rover), mission planners draw a cross-section line across a crater to inspect the rim-crest height, wall steepness, floor depth, and energy cost. In our **Elevation Cross-Section Transect Slicer**, drawing any line $A \to B$ across the 3D terrain immediately renders a dual-axis chart comparing the **Physical Elevation Profile $H_{\text{DEM}}(s)$** against the **Quantum Edge Confidence Profile $C_{\text{FRQI}}(s)$** along arc-length $s \in [0, L_{\text{km}}]$.

#### Mathematical Formulation
Along a parameterized transect path $\mathbf{r}(s) = (u(s), v(s))$ of total length $L_{\text{m}}$ meters sampled at $N_s = 256$ points:
- **Elevation Profile:** $z(s) = H_{\text{DEM}}(u(s), v(s))$
- **Local Grade Along Path:** $\theta_{\text{path}}(s) = \arctan\left(\frac{dz}{ds}\right)$
- **Rover Mechanical Energy Expenditure ($E_{\text{Wh}}$):** For a lunar rover of mass $m_{\text{rover}} = 450\text{ kg}$ under lunar gravity $g_{\text{Moon}} = 1.625\text{ m/s}^2$ and regolith rolling resistance coefficient $\mu_{\text{roll}} = 0.08$:
  $$E_{\text{Wh}} = \frac{1}{3600} \int_{0}^{L_{\text{m}}} m_{\text{rover}} g_{\text{Moon}} \max\Big(0, \mu_{\text{roll}}\cos\theta_{\text{path}}(s) + \sin\theta_{\text{path}}(s)\Big) ds$$

---

### 2.4 Automated Crater Morphometry, Neukum Chronology Isochrons (Age Dating) & PostGIS GeoJSON Catalog

#### Real-Life Problem & Meaningful Insight
How do planetary scientists determine whether a lunar surface is $3.9\text{ billion years old}$ (Imbrian/Nectarian highlands) or $1.2\text{ billion years old}$ (Eratosthenian/Copernican mare)? By counting impact craters and measuring their diameter distribution! Because FRQI-QHED and QPIE-QHED isolate single-pixel crater rims without classical convolution blur, automated Fitzgibbon ellipse fitting on the quantum edge map recovers highly accurate crater diameters $D_{\text{km}}$, plots the **Relative Crater Size-Frequency Distribution ($R$-Plot)**, and fits the **Neukum Lunar Production Function** to estimate the **Absolute Model Age (in Billions of Years, Ga)** of the imaged surface!

#### Mathematical Formulation
1. **Direct Least-Squares Ellipse Fitting (Fitzgibbon Method):**
   Fits conic $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$ subject to $4AC - B^2 = 1$ on each connected quantum edge contour, extracting center $(X_c, Y_c)$, diameter $D = 2\sqrt{ab} \cdot \Delta_{\text{GSD}}$, ellipticity $e = \sqrt{1 - (b/a)^2}$, and depth-to-diameter ratio $\delta = \frac{H_{\text{rim}} - H_{\text{floor}}}{D}$ (classifying craters into **Fresh Bowl $\delta \ge 0.16$**, **Modified Terraced $0.08 \le \delta < 0.16$**, or **Degraded Ancient $\delta < 0.08$**).
2. **Crater Size-Frequency Distribution (CSFD) & Neukum Chronology Age ($T_{\text{Ga}}$):**
   In diameter bins $[D_a, D_b]$ with geometric mean $\overline{D} = \sqrt{D_a D_b}$ over surface area $A_{\text{km}^2}$, the standard **Differential $R$-Value** is:
   $$R(\overline{D}) = \frac{\overline{D}^3 \cdot N_{\text{craters}}(D_a, D_b)}{A_{\text{km}^2} \cdot (D_b - D_a)}$$
   Comparing the cumulative crater density $N(D \ge 1\text{ km})$ against the Neukum ($2001$) lunar chronology relation:
   $$N(D \ge 1\text{ km}) = 5.44 \times 10^{-14} \left(e^{6.93 T_{\text{Ga}}} - 1\right) + 8.38 \times 10^{-4} T_{\text{Ga}}$$
   numerically solves for the estimated **Surface Geological Age $T_{\text{Ga}}$ (in Ga)**!

---

### 2.5 Bi-Temporal Quantum Phase Interferometry Change Detector & Blink Comparator

Loads "Before ($t_1$)" and "After ($t_2$)" orbital passes into the $7$-qubit FRQI register using forward preparation $\mathcal{R}_{\text{FRQI}}(\boldsymbol{\theta}^{(t_1)})$ followed by adjoint inverse preparation $\mathcal{R}_{\text{FRQI}}^\dagger(\boldsymbol{\theta}^{(t_2)})$, yielding change probability $P_{\text{change}}(Y, X) = \sin^2(\theta_{Y,X}^{(t_1)} - \theta_{Y,X}^{(t_2)})$. Includes an interactive **Split-Screen Swipe Curtain** and **10 Hz Blink Comparator** to spot new impact craters and regolith disturbances.

---

### 2.6 Pillar 2 Interactive UI Wireframe & Meaningful Planetary Insights

```
+----------------------------------------------------------------------------------------------------------------+
|  3D LUNAR GIS, ARTEMIS LANDER SAFETY & CRATER CHRONOLOGY LAB (/gis-explorer)                                   |
|  [Site: Apollo 16 Descartes | Shackleton Rim | Tycho Central Peak] [Lander: Artemis HLS 50m v] [Export GeoJSON]|
+----------------------------------------------------------------------------------------------------------------+
|                                                                                                                |
|  +------------------------------------------------------------------+ +--------------------------------------+ |
|  | INTERACTIVE 3D LOLA DEM VIEWPORT + LANDER SAFETY OVERLAY         | | MISSION & MORPHOMETRY TELEMETRY      | |
|  |                                                                  | |                                      | |
|  |        \  Sun (Az: 135 deg, El: 14 deg)                          | | HOVERED LANDING ZONE TELEMETRY:      | |
|  |         \                                                        | | * Selenographic:   8.97 S, 15.50 E   | |
|  |    /\    v     [SAFE ZONE #1: LSI = 94/100]                      | | * Max Local Slope: 3.8 deg (SAFE)    | |
|  |   /  \________  (Green 50m Touchdown Ring)                       | | * Quantum Rim Haz: 1.2% (CLEAR)      | |
|  |  / Crater #04 \  o---o---o  <-- Drawn Transect Line A -> B       | | * RMS Roughness:   0.24 m            | |
|  | /  D: 4.82 km  \____________________________________             | | * Safety Index:    94 / 100 (GO)     | |
|  |                                                                  | |                                      | |
|  | [Layer: FRQI QHED Magenta | Slope Hazard | QCNN Class | LOLA DEM]| | CRATER CHRONOLOGY & MORPHOMETRY:     | |
|  +------------------------------------------------------------------+ | * Craters Fitted:  18 Ellipses       | |
|                                                                       | * Fresh Bowl (d/D >= 0.16): 5        | |
|  +------------------------------------------------------------------+ | * Degraded (d/D < 0.08):    13       | |
|  | ELEVATION CROSS SECTION TRANSECT (A -> B) & QUANTUM EDGE SPIKES  | | * Neukum Model Age: 3.74 Ga (Imbrian)| |
|  | +320m |      /\ <-- Rim Crest (P_edge = 0.88)      /\            | |                                      | |
|  |   0m  |_____/  \                                  /  \_____      | | [Button-md: Auto Find Top 5 Safe LZ] | |
|  | -290m |         \________________________________/               | | [Button-md: Download PostGIS GeoJSON]| |
|  |       0.0 km                3.2 km                      6.4 km   | | [Button-md: Open Bi Temporal Blink]  | |
|  +------------------------------------------------------------------+ +--------------------------------------+ |
+----------------------------------------------------------------------------------------------------------------+
```

---

## 3. Pillar 3: NISQ Hardware Realism, Error Mitigation, Microwave Pulse Lab & Cloud QPU Bridge (`/hardware-lab`)

### 3.1 Interactive QPU Silicon Topology Graph & Animated SABRE SWAP Routing Visualizer

#### Real-Life Problem & Meaningful Insight
In an abstract textbook diagram, any qubit wire can apply a `CNOT` or `CCX` gate to any other wire. On real physical quantum processors, superconducting transmon qubits are fabricated on a fixed 2D silicon coupling graph where two-qubit gates can only execute between physically adjacent wired neighbors. To run our $7$-qubit FRQI or $14$-qubit NEQR circuit on an **IBM Heron 156-Qubit Heavy-Hexagonal QPU** or **Rigetti Ankaa-3 84-Qubit Square Lattice**, the compiler must run the **SABRE (SWAP-Based Bidirectional heuristic search)** routing algorithm, inserting $3$-CNOT `SWAP` gates that inflate circuit depth and introduce decoherence.

#### Mathematical Formulation of Hardware Survival Fidelity
Given a routed physical circuit containing $G_{1q}$ single-qubit gates on edges/nodes with error rates $\epsilon_{1q}(i)$, $G_{2q}$ two-qubit gates (including $3 \times N_{\text{SWAP}}$ from routing) with calibrated error rates $\epsilon_{2q}(i, j)$, total execution duration $T_{\text{exec}}$ across active physical qubits $q \in \mathcal{Q}_{\text{active}}$ with coherence times $(T_{1,q}, T_{2,q})$, and readout assignment errors $\epsilon_{\text{ro}}(q)$, the **Estimated Coherent Hardware Survival Fidelity ($\mathcal{F}_{\text{HW}}$)** is:
$$\mathcal{F}_{\text{HW}} = \left( \prod_{g \in G_{1q}} \big(1 - \epsilon_{1q}(g)\big) \right) \left( \prod_{g \in G_{2q}} \big(1 - \epsilon_{2q}(g)\big) \right) \left( \prod_{q \in \mathcal{Q}_{\text{active}}} \exp\left(-\frac{T_{\text{exec}}}{T_{1,q}} - \frac{T_{\text{exec}}}{T_{2,q}}\right) \big(1 - \epsilon_{\text{ro}}(q)\big) \right)$$

#### Interactive Visuals & Meaningful Insights
- **Interactive QPU Coupling Map Selector:** Switch between three real-life hardware topologies:
  1. **IBM Heron r2 (156-Qubit Heavy-Hexagonal Lattice):** Sparse degree-$2.4$ connectivity (ultra-low crosstalk $\epsilon_{2q} \approx 0.0018$, higher `SWAP` count).
  2. **Rigetti Ankaa-3 (84-Qubit Square Grid):** Degree-$4$ nearest-neighbor grid (fewer `SWAP`s, $\epsilon_{2q} \approx 0.0065$).
  3. **IonQ Forte (36-Qubit All-to-All Trapped Ion Chain):** Complete $K_{36}$ graph (**zero `SWAP` gates required**, long $T_1 > 10\text{ s}$, slower gate speed $t_{2q} \approx 600\text{ }\mu\text{s}$).
- **Animated SABRE SWAP Shuttle Playback:** Clicking **"Animate SABRE Hardware Routing"** lights up the chosen physical qubits on the chip map and animates logical qubits (`q0..q5`, `|c>`) hopping across silicon couplers whenever a `SWAP` gate fires, displaying a side-by-side comparison of **Unrouted Logical Depth vs. Routed Physical Depth**.

---

### 3.2 4-Way NISQ Error Mitigation Lab: Ideal vs. Raw Noisy vs. TREX Readout vs. Pauli-Twirled ZNE

#### Real-Life Problem & Meaningful Insight
Running quantum edge detection on raw, unmitigated NISQ hardware produces two distinct visual artifacts on lunar imagery:
1. **Amplitude Damping ($T_1$ Decay $|1\rangle \to |0\rangle$):** Dims bright crater rim probabilities, causing thin edges to break apart.
2. **Depolarizing & Readout Bit-Flip Noise:** Injects a uniform gray noise floor across flat mare basins, destroying the exact destructive phase cancellation ($\Delta\theta = 0 \implies P = 0$) that makes QHED superior to classical filters!

By combining **Pauli Twirling** (which converts coherent unitary over-rotations into stochastic Pauli channels), **TREX / Confusion-Matrix Readout Mitigation**, and **Richardson Zero-Noise Extrapolation (ZNE)** across unitary-folded scale factors $\lambda \in \{1, 3, 5\}$, researchers can watch the noisy lunar edge map recover $>94\%$ of its ideal statevector SNR!

#### Mathematical Formulation
1. **Pauli Twirling of Two-Qubit $CX$ Gates:**
   Sandwiching every noisy $CX$ gate between random Pauli pairs $(P_a, P_b) \in \{I, X, Y, Z\}^{\otimes 2}$ and their classically precomputed conjugate $(P'_a, P'_b) = CX(P_a \otimes P_b)CX^\dagger$ satisfies:
   $$(P'_a \otimes P'_b) \cdot CX \cdot (P_a \otimes P_b) = CX$$
   Averaging over twirled circuit instances diagonalizes coherent gate errors into a pure stochastic Pauli channel, making Richardson polynomial extrapolation mathematically exact.
2. **Unitary Folding & Richardson Zero-Noise Extrapolation ($\lambda_1=1, \lambda_2=3, \lambda_3=5$):**
   For each pixel boundary $(Y, X)$, measure the noisy edge probability $E(\lambda_m)$ on folded circuits $U(U^\dagger U)^{(\lambda_m - 1)/2}$ and compute both the **Linear** and **Quadratic Richardson Extrapolation**:
   $$\hat{E}_{\text{ZNE, quad}}(0) = \text{clip}_{[0, 1]}\left( \frac{15}{8} E(1) - \frac{5}{4} E(3) + \frac{3}{8} E(5) \right)$$
   and **Exponential Extrapolation** $E(\lambda) \approx a + b e^{-c\lambda} \implies \hat{E}_{\text{ZNE, exp}}(0) = a + b$.

---

### 3.3 Transmon Microwave Control Pulse Oscilloscope (OpenPulse DRAG & Cross-Resonance Envelopes)

#### Real-Life Problem & Meaningful Insight
Most developers treat quantum gates ($H, R_y(\theta), CX$) as abstract boxes on a wire without understanding how they are physically executed inside a dilution refrigerator at $15\text{ millikelvin}$. On a superconducting QPU, every single-qubit gate is a shaped **microwave radio-frequency pulse** at $\omega_q / 2\pi \approx 5.0\text{ GHz}$ employing **DRAG (Derivative Removal by Adiabatic Gate)** quadrature shaping to prevent leakage into the non-computational $|2\rangle$ transmon state, while every two-qubit $CX$ gate is an echoed **Cross-Resonance ($CR$) microwave pulse** driving the control qubit at the target qubit's resonant frequency!

#### Mathematical Formulation of DRAG & Cross-Resonance Envelopes
1. **Single-Qubit Gaussian + DRAG Quadrature Pulse ($R_y(2\theta_i)$ & $H$):**
   For a pulse of duration $t_p \in [20\text{ ns}, 60\text{ ns}]$, standard deviation $\sigma = t_p / 4$, anharmonicity $\Delta_{\text{anh}} / 2\pi \approx -330\text{ MHz}$, and DRAG leakage suppression coefficient $\beta_{\text{DRAG}}$:
   $$\Omega_I(t) = A(\theta_i) \left[ \exp\left(-\frac{(t - t_p/2)^2}{2\sigma^2}\right) - \exp\left(-\frac{(t_p/2)^2}{2\sigma^2}\right) \right]$$
   $$\Omega_Q(t) = -\frac{\beta_{\text{DRAG}}}{\Delta_{\text{anh}}} \frac{d\Omega_I(t)}{dt} = \frac{\beta_{\text{DRAG}}}{\Delta_{\text{anh}}} \frac{t - t_p/2}{\sigma^2} \exp\left(-\frac{(t - t_p/2)^2}{2\sigma^2}\right)$$
2. **Echoed Cross-Resonance ($ECR$) Two-Qubit Pulse ($CX$):**
   Consists of a positive flat-top Gaussian $CR(+\pi/4)$ tone on control channel $U_c$ at target frequency $\omega_t$, an echoing $\pi$-pulse $X_{\pi}$ on drive channel $D_c$, and a negative $CR(-\pi/4)$ tone.

#### Interactive Visuals & Meaningful Insights
- **Multi-Channel Microwave Pulse Oscilloscope:** Clicking any gate in the FRQI or QPIE circuit opens a synchronized nanosecond timeline showing the exact **In-Phase $I(t)$ (Cyan)** and **Quadrature $Q(t)$ (Magenta DRAG derivative)** waveforms on Drive Channels `D0..D6` and Control Channels `U0..U5`. Users can adjust the pixel intensity $I_i \in [0, 255]$ and watch the microwave pulse amplitude $A(\theta_i)$ scale in real time!

---

### 3.4 Interactive Readout Assignment Confusion Matrix & Tensored Calibration Inverter

#### Mathematical Formulation
For each measured qubit $q$ with state-preparation-and-measurement (SPAM) bit-flip probabilities $p(1|0) = \epsilon_0$ (false positive) and $p(0|1) = \epsilon_1$ (false negative), the single-qubit calibration matrix is:
$$\mathbf{M}_q = \begin{pmatrix} 1 - \epsilon_{0,q} & \epsilon_{1,q} \\ \epsilon_{0,q} & 1 - \epsilon_{1,q} \end{pmatrix}, \qquad \mathbf{M}_q^{-1} = \frac{1}{1 - \epsilon_{0,q} - \epsilon_{1,q}} \begin{pmatrix} 1 - \epsilon_{1,q} & -\epsilon_{1,q} \\ -\epsilon_{0,q} & 1 - \epsilon_{0,q} \end{pmatrix}$$
Applying the tensored inverse $\mathbf{p}_{\text{mitigated}} = \left(\bigotimes_{q} \mathbf{M}_q^{-1}\right) \mathbf{p}_{\text{raw}}$ (clipped to the probability simplex via Michelot projection) removes readout bias before ZNE extrapolation.

---

### 3.5 Fault-Tolerant Quantum Computing (FTQC) Surface Code & Magic State Factory Planner

Calculates and plots the exact transition from NISQ to Fault-Tolerant Quantum Computing for planetary GeoTIFFs ($64 \times 64$ up to $4096 \times 4096$):
- **Logical Qubits ($N_{\text{logical}}$):** $2n+1$ (FRQI), $2n$ (QPIE), $2n+8$ (NEQR).
- **Ross-Selinger Clifford+$T$ Count ($N_T$):** $N_T \approx 3 \log_2(1/\epsilon) \cdot 2^{2n}$ for full state preparation, vs. $\mathcal{O}(\text{poly}(n))$ for the QHED edge stage alone.
- **Rotated Surface Code Physical Qubits ($N_{\text{phys}}$):** At code distance $d \in \{13, 17, 21, 27\}$, $N_{\text{phys}} = 2d^2 \cdot N_{\text{logical}} + N_{\text{factory}}$ physical qubits (e.g., $\sim 14,500$ physical qubits for a $512 \times 512$ FRQI register including one $15$-to-$1$ magic state distillation factory).

---

### 3.6 Asynchronous AWS Braket & IBM Quantum Runtime Cloud Execution Bridge

Allows authenticated researchers to dispatch a selected $8 \times 8$ lunar crater rim patch to **Amazon Braket** (`SV1` Statevector, `DM1` Density Matrix, or QPU targets) or **IBM Quantum Runtime** via Redis/ARQ background workers, streaming live task status (`CREATED` $\to$ `QUEUED` $\to$ `RUNNING` $\to$ `COMPLETED`) over WebSockets.

---

### 3.7 Pillar 3 Interactive UI Wireframe & Meaningful Hardware Insights

```
+----------------------------------------------------------------------------------------------------------------+
|  NISQ HARDWARE REALISM, ERROR MITIGATION & MICROWAVE PULSE LAB (/hardware-lab)                                 |
|  [QPU: IBM Heron 156Q HeavyHex | Rigetti Ankaa 84Q | IonQ Forte 36Q]  [Algorithm: FRQI QHED v]  [Run ZNE Lab]  |
+----------------------------------------------------------------------------------------------------------------+
|                                                                                                                |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
|  | 1. INTERACTIVE QPU TOPOLOGY & SABRE SWAP ROUTER    | | 2. 4 WAY ERROR MITIGATION VISUAL COMPARISON        | |
|  | [Interactive Heavy-Hex Silicon Graph Canvas]       | | +----------------------+  +----------------------+ | |
|  |   (Q12)===(Q13)===(Q14)===(Q15)  <-- Active Subgraph | | 1. Ideal Statevector |  | 2. Raw Noisy NISQ    | | |
|  |             ||                   * Logical: 7 Q    | | | SNR: 2.14x | Thin:56%|  | SNR: 1.31x | Blur    | | |
|  |           (Q28)===(Q29)===(Q30)  * Inserted SWAP: 4| | +----------------------+  +----------------------+ | |
|  |                                  * Depth: 14 -> 32 | | | 3. Readout Mitigated |  | 4. Pauli Twirled ZNE | | |
|  |   Survival Fidelity: 86.4%       * 2Q Error: 0.18% | | | SNR: 1.64x | Thin:49%|  | SNR: 2.08x | Thin:55%| | |
|  | [Button-sm: Animate SABRE Routing Step by Step]    | | +----------------------+  +----------------------+ | |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
|                                                                                                                |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
|  | 3. OPENPULSE TRANSMON MICROWAVE OSCILLOSCOPE       | | 4. RICHARDSON ZNE EXTRAPOLATION & FTQC ESTIMATOR   | |
|  | Drive D6 |c> (5.12 GHz):  _/\__/\__  DRAG I(t)/Q(t)| | Edge Prob E(lambda)                                | |
|  | Ctrl  U0 CX  (4.98 GHz):  _|^^^^|_   Echoed CR     | | 0.56 | * <-- ZNE Extrapolated (lambda=0): 0.551    | |
|  | Drive D0 q0  (4.98 GHz):  _______/\  Hadamard H    | | 0.44 |      * (lambda=1: 0.462)                    | |
|  | +------------------------------------------------+ | | 0.32 |            * (lambda=3)     * (lambda=5)   | |
|  | | 0 ns        280 ns        560 ns        840 ns | | |      +-------------------------------------------  | |
|  | Total Schedule: 840 ns (0.47% of T1 = 180 us)      | |      0            1                3            5  | |
|  +----------------------------------------------------+ +----------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------------------+
```

---

## 4. Pillar 4 & 5: One-Click LaTeX Academic Publisher, Polyglot SDK Transpiler, FastMCP Copilot & Arena

1. **One-Click IEEE / Springer LaTeX Bundle Exporter (`/publish`):**
   - Compiles the active quantum circuit into `\begin{quantikz}` macros, formats the 6-algorithm + ZNE benchmark scorecard into `\begin{table}` (`booktabs`), generates BibTeX citations (`references.bib`), and packages $300\text{ DPI}$ figures into a downloadable `.zip` archive.
2. **5-Language Polyglot Quantum SDK AST Transpiler (`/publish`):**
   - Translates any circuit or edge pipeline simultaneously into **IBM Qiskit 1.x**, **Xanadu PennyLane**, **Amazon Braket SDK**, **Google Cirq**, and **OpenQASM 3.0**.
3. **Deterministic SHA-256 Experiment Permalinks (`/run/[hash]`):**
   - Hashes the input GeoTIFF bytes, algorithm parameters, wavelet equalizer gains, and hardware noise configuration into an immutable PostgreSQL + S3 snapshot for instant peer-review reproduction.
4. **FastMCP Quantum Vision Copilot & Custom Unitary Arena (`/arena`):**
   - Exposes schema-validated MCP tools (`inspect_active_statevector`, `diagnose_nisq_degradation`, `recommend_landing_zone`, `synthesize_custom_qasm_operator`) and lets users pit custom OpenQASM 3.0 edge operators against the 6 core algorithms on the live leaderboard.

---

## 5. Complete Modular Backend Architecture, PostGIS Schema & FastAPI Data Contracts

### 5.1 Production Backend Module Layout (`backend/app/`)
```
backend/
├── pyproject.toml                          # uv-managed Python 3.12 (qiskit, qiskit-aer, pennylane, rasterio, shapely, fastmcp)
└── app/
    ├── api/v1/
    │   ├── routes_qml.py                   # POST /api/v1/qml/pipeline (Wavelet + QCNN + NCQI + Grover)
    │   ├── routes_gis.py                   # POST /api/v1/gis/analyze-terrain (3D DEM, Lander LSI, Transect, CSFD Age)
    │   ├── routes_hardware.py              # POST /api/v1/hardware/nisq-lab (SABRE, ZNE, OpenPulse, FTQC)
    │   ├── routes_publish.py               # POST /api/v1/publish/latex-zip, POST /api/v1/publish/transpile
    │   └── routes_arena.py                 # POST /api/v1/arena/compete
    ├── domain/
    │   ├── qml/
    │   │   ├── wavelet_equalizer.py        # 2D Quantum Haar Wavelet sub-band decomposition (LL, LH, HL, HH)
    │   │   ├── qcnn_hilbert.py             # 4-qubit QCNN feature extractor + Quantum Kernel Gram + 3D UMAP
    │   │   ├── barren_plateau.py           # Parameter-shift gradient + QFIM + 3D loss surface evaluator
    │   │   ├── ncqi_fusion.py              # 9-qubit Optical + Diviner Thermal + Mini-RF SAR fusion & QCICS
    │   │   └── grover_compass.py           # Grover amplitude amplification + over-rotation detector
    │   ├── gis/
    │   │   ├── dem_photometry.py           # LOLA DEM slope/aspect + Lommel-Seeliger normal map generator
    │   │   ├── lander_safety.py            # Artemis HLS / Vikram footprint Landing Safety Index (LSI) solver
    │   │   ├── transect_rover.py           # Cross-section elevation profile + rover energy integrator
    │   │   ├── crater_chronology.py        # Fitzgibbon ellipse fitter + CSFD R-plot + Neukum age solver (Ga)
    │   │   └── interferometry.py           # Bi-temporal adjoint FRQI phase change detector
    │   └── hardware/
    │       ├── topology_sabre.py           # Heavy-Hex / Ankaa / Forte graph + step-by-step SABRE SWAP trace
    │       ├── zne_pauli_twirl.py          # Pauli twirling + unitary folding (1,3,5) + Richardson/Exp ZNE
    │       ├── openpulse_waveform.py       # Gaussian + DRAG I(t)/Q(t) & Cross-Resonance pulse generator
    │       ├── readout_mitigator.py        # Tensored 2x2 assignment matrix inverter + simplex projection
    │       └── ftqc_surface_code.py        # Ross-Selinger T-count & rotated surface code resource planner
    └── mcp/
        └── quantum_copilot_server.py       # FastMCP server exposing live quantum & GIS tools
```

### 5.2 FastAPI Data Contracts for the 3 Enhanced Pillars

#### Contract 1: `POST /api/v1/qml/pipeline` (Wavelet Equalizer + QCNN Hilbert + NCQI + Grover)
```json
{
  "request": {
    "preset_id": "shackleton_south_pole_multispectral",
    "wavelet_attenuation": { "lh_gain": 1.0, "hl_gain": 1.0, "hh_cut": 0.85 },
    "spectral_weights": { "optical": 0.20, "thermal": 0.35, "sar_cpr": 0.45 },
    "qcnn_ansatz": "STRONGLY_ENTANGLING_RING",
    "cost_function_type": "LOCAL_PAULI_Z",
    "grover_iterations": 1
  },
  "response": {
    "wavelet_telemetry": {
      "energy_ll_pct": 78.4,
      "energy_lh_pct": 9.2,
      "energy_hl_pct": 8.6,
      "energy_hh_speckle_pct": 3.8,
      "snr_before_qwt": 1.42,
      "snr_after_qwt": 2.48
    },
    "qcnn_classification": {
      "class_fractions": {
        "Primary Impact Rim": 0.184,
        "Smooth Mare Basalt": 0.542,
        "Sinuous Lunar Rille": 0.081,
        "Bright Ejecta Blanket": 0.146,
        "Polar Ice Cold Trap": 0.047
      },
      "hilbert_umap_3d_points": [
        { "patch_id": 0, "x": 1.42, "y": -0.88, "z": 0.31, "class": "Primary Impact Rim", "confidence": 0.94 }
      ],
      "kernel_silhouette_score": 0.84
    },
    "barren_plateau_diagnostics": {
      "gradient_variance": 0.0412,
      "is_barren_plateau": false,
      "loss_surface_grid_21x21": [[...]]
    },
    "grover_oscilloscope": {
      "initial_theta_rad": 0.2868,
      "initial_prob": 0.080,
      "amplified_prob": 0.576,
      "optimal_iterations": 2,
      "over_rotation_warning": false
    }
  }
}
```

#### Contract 2: `POST /api/v1/gis/analyze-terrain` (3D DEM + Artemis Lander LSI + Transect + Neukum Age)
```json
{
  "request": {
    "preset_id": "apollo_16_descartes_512",
    "lander_profile": "ARTEMIS_HLS_STARSHIP_50M",
    "candidate_landing_coord": { "x_px": 240, "y_px": 310 },
    "transect_line": { "start_px": [64, 256], "end_px": [448, 256] }
  },
  "response": {
    "landing_safety_analysis": {
      "lander_display": "Artemis HLS Starship 50m Footprint",
      "max_slope_deg": 3.8,
      "quantum_rim_hazard_pct": 1.2,
      "rms_roughness_m": 0.24,
      "landing_safety_index": 94.2,
      "status": "CERTIFIED_SAFE",
      "top_5_safe_zones": [
        { "rank": 1, "x_px": 240, "y_px": 310, "lsi": 94.2, "max_slope_deg": 3.8 }
      ]
    },
    "transect_profile": {
      "total_distance_km": 6.4,
      "rover_energy_wh": 148.6,
      "max_grade_deg": 19.4,
      "samples_256": [
        { "dist_km": 0.0, "elevation_m": -42.0, "slope_deg": 2.1, "quantum_edge_prob": 0.04 }
      ]
    },
    "crater_chronology": {
      "craters_detected": 18,
      "fresh_bowl_count": 5,
      "degraded_count": 13,
      "neukum_model_age_ga": 3.74,
      "geological_epoch": "Lower Imbrian",
      "csfd_r_plot_bins": [
        { "diam_km_mean": 1.4, "count": 9, "r_value": 0.024, "error_plus": 0.008 }
      ],
      "geojson_url": "https://cdn.quantumvision.io/gis/apollo16_craters.geojson"
    }
  }
}
```

#### Contract 3: `POST /api/v1/hardware/nisq-lab` (SABRE Topology + ZNE + OpenPulse + FTQC)
```json
{
  "request": {
    "algorithm": "FRQI_QHED",
    "hardware_topology": "IBM_HERON_156Q_HEAVY_HEX",
    "inspected_pixel_intensity": 218,
    "zne_scale_factors": [1, 3, 5],
    "enable_pauli_twirling": true,
    "enable_readout_mitigation": true
  },
  "response": {
    "sabre_routing": {
      "topology_display": "IBM Heron 156Q Heavy Hex",
      "logical_qubits": 7,
      "physical_qubits_selected": [12, 13, 14, 15, 28, 29, 30],
      "logical_depth": 14,
      "routed_physical_depth": 32,
      "inserted_swaps": 4,
      "survival_fidelity_pct": 86.4,
      "swap_animation_steps": [
        { "step": 4, "swap_edge": [13, 14], "logical_wires_swapped": ["q1", "q2"] }
      ]
    },
    "mitigation_comparison": {
      "snr_ideal": 2.14,
      "snr_raw_noisy": 1.31,
      "snr_readout_mitigated": 1.64,
      "snr_pauli_twirled_zne": 2.08,
      "richardson_curve": {
        "scale_1": 0.462,
        "scale_3": 0.341,
        "scale_5": 0.258,
        "extrapolated_zero_noise": 0.551,
        "ideal_reference": 0.554
      }
    },
    "openpulse_schedule": {
      "total_duration_ns": 840,
      "t1_fraction_pct": 0.47,
      "channels": [
        {
          "channel": "D6 (|c> Color Qubit)",
          "freq_ghz": 5.12,
          "gate_label": "Ry(2.686 rad)",
          "i_samples": [0.0, 0.18, 0.64, 0.85, 0.64, 0.18, 0.0],
          "q_drag_samples": [0.0, 0.06, 0.03, 0.0, -0.03, -0.06, 0.0]
        }
      ]
    }
  }
}
```

---

## 6. Antigravity Quality Gates, Automated Verification Tests & Definition of Done

Before declaring any module in Pillars 1, 2, or 3 complete, the Antigravity agent (`agy`) **MUST** verify every item below:

- [ ] **Gate 1 — AST & Dependency Graph Synchronized (`graphify` + `code-review-graph`):**
  - [ ] `graphify .` and `code-review-graph build` reflect all new domain services (`wavelet_equalizer`, `qcnn_hilbert`, `lander_safety`, `transect_rover`, `crater_chronology`, `topology_sabre`, `openpulse_waveform`) with zero circular dependencies.
- [ ] **Gate 2 — Scientific & Mathematical Invariants (`pytest-asyncio`):**
  - [ ] **QWT Energy Conservation Test:** Verify that $\sum_{s_Y, s_X} \|w^{(s_Y, s_X)}\|_2^2 = \|\alpha\|_2^2 = 1.0$ (unitarity of $U_{\text{QHWT}}^{(2\text{D})}$) to within $10^{-12}$.
  - [ ] **Grover Soufflé Guard Test:** Verify that `over_rotation_warning` triggers if and only if $(2r+1)\arcsin\sqrt{p_{\text{edge}}} > \frac{\pi}{2}$.
  - [ ] **Artemis Lander Safety Index Test:** Verify that a flat mare region ($\beta_{\max} < 2^\circ, \mathcal{H}_Q < 0.02$) yields $\text{LSI} > 90$, whereas a steep crater rim wall ($\beta_{\max} > 18^\circ, \mathcal{H}_Q > 0.50$) yields $\text{LSI} < 25$.
  - [ ] **OpenPulse DRAG Orthogonality Test:** Verify that the quadrature DRAG envelope $\Omega_Q(t)$ is proportional to $-d\Omega_I(t)/dt$ and integrates to zero ($\int_0^{t_p} \Omega_Q(t) dt = 0$).
- [ ] **Gate 3 — Design System, 60 FPS WebGL & Zero-Hyphen Audit (`ui-ux-pro-max` + `playwright` + `chrome-devtools` MCP):**
  - [ ] Automated Playwright DOM text assertion confirms zero `-` characters appear in any visible UI heading, tab, button, or badge across `/studio/qml-pipeline`, `/gis-explorer`, and `/hardware-lab`.
  - [ ] Three.js 3D LOLA DEM viewport and 3D Hilbert UMAP scatter cloud maintain $\ge 55\text{ FPS}$ on headless Chromium with zero WebGL memory leaks.