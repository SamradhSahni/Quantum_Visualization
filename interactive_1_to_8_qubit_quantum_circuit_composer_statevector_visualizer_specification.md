# Master Specification & Mathematical Blueprint: Interactive 1-to-8 Qubit Quantum Circuit Composer & Step-by-Step Statevector Visualizer

> **Document Version:** 3.0.0 (Production Feature Specification & Mathematical Engine Blueprint)  
> **Target Route:** `/composer` (Integrated with `/studio` and `/architectures/[slug]`)  
> **Target Stack:** Next.js 15 (App Router, React 19, TypeScript 5.8, Tailwind CSS v4, Web Worker Zero-Latency Tensor Engine, Three.js / Custom SVG Bloch Spheres, KaTeX) + FastAPI (Async Python 3.12, Qiskit 1.x, Qiskit Aer 1.15+, OpenQASM 3.0)  
> **Agent Directive Compliance:** Strict adherence to `antigravity_master_skills_manifest_router.md` and `SKILL.md` (`design-system/MASTER.md`)

---

## Table of Contents
0. [Antigravity IDE Autonomous Execution Protocol & Skill Routing](#0-antigravity-ide-autonomous-execution-protocol--skill-routing)
1. [Executive Vision & High-Impact Platform Differentiators](#1-executive-vision--high-impact-platform-differentiators)
2. [Complete 1-to-8 Qubit Gate Library & Exact Unitary Matrices](#2-complete-1-to-8-qubit-gate-library--exact-unitary-matrices)
   - [2.1 Single-Qubit Pauli, Clifford & Phase Gates](#21-single-qubit-pauli-clifford--phase-gates)
   - [2.2 Parametric Continuous Rotation Gates](#22-parametric-continuous-rotation-gates)
   - [2.3 Multi-Qubit Controlled, Swap & Toffoli Gates](#23-multi-qubit-controlled-swap--toffoli-gates)
   - [2.4 Quantum Image Processing (QIP) Macro Subroutines](#24-quantum-image-processing-qip-macro-subroutines)
3. [Mathematical Engine: How Statevectors, Amplitudes & Phases Propagate Step-by-Step](#3-mathematical-engine-how-statevectors-amplitudes--phases-propagate-step-by-step)
   - [3.1 Dynamic $n$-Qubit Hilbert Space Allocation ($1 \le n \le 8$)](#31-dynamic-n-qubit-hilbert-space-allocation-1-le-n-le-8)
   - [3.2 Gate-by-Gate Unitary Tensor Expansion & Butterfly Index Pairing](#32-gate-by-gate-unitary-tensor-expansion--butterfly-index-pairing)
   - [3.3 Complex Amplitude Decomposition: Cartesian, Polar & Relative Phase](#33-complex-amplitude-decomposition-cartesian-polar--relative-phase)
   - [3.4 Partial Trace, Reduced Density Matrices & 8-Qubit Bloch Sphere Vectors](#34-partial-trace-reduced-density-matrices--8-qubit-bloch-sphere-vectors)
   - [3.5 Pairwise Entanglement Entropy & Quantum Mutual Information](#35-pairwise-entanglement-entropy--quantum-mutual-information)
4. [Concrete Step-by-Step Numerical & Phase Propagation Walkthrough](#4-concrete-step-by-step-numerical--phase-propagation-walkthrough)
5. [UI/UX Architecture, Zero-Hyphen Wireframes & Interactive Visualizers](#5-uiux-architecture-zero-hyphen-wireframes--interactive-visualizers)
   - [5.1 Master Workspace Wireframe (`/composer`)](#51-master-workspace-wireframe-composer)
   - [5.2 Step-by-Step Mathematical Calculation Inspector Drawer](#52-step-by-step-mathematical-calculation-inspector-drawer)
   - [5.3 Phase Color Wheel & Amplitude Bar Visualizer](#53-phase-color-wheel--amplitude-bar-visualizer)
   - [5.4 Value-Boosting Features for Platform Attraction](#54-value-boosting-features-for-platform-attraction)
6. [Hybrid Client-Server Simulation Architecture & FastAPI Contracts](#6-hybrid-client-server-simulation-architecture--fastapi-contracts)
7. [Verification Suite, Mathematical Invariants & Definition of Done](#7-verification-suite-mathematical-invariants--definition-of-done)

---

## 0. Antigravity IDE Autonomous Execution Protocol & Skill Routing

> **MANDATORY AGENT DIRECTIVE:**  
> Before implementing the `/composer` visual circuit builder, client-side tensor simulator, or FastAPI Qiskit Aer transpilation endpoints, the Google Antigravity agent (`agy`) **MUST** execute the bootstrap protocol defined in `antigravity_master_skills_manifest_router.md`.

### 0.1 Skill & Free MCP Routing Matrix for the Quantum Circuit Composer

| Module / Subsystem | Classification | Required Antigravity Skills | Free MCP Servers to Invoke |
| :--- | :--- | :--- | :--- |
| **0. AST Graph, Spec Planning & TDD** | `[MANDATORY]` | `graphify`, `superpowers` (`/brainstorming`, `/write-plan`), `code-review-graph`, `context-mode`, `caveman`, `systematic-debugging` | `context7`, `deepwiki`, `sequential-thinking` |
| **1. Drag-and-Drop Composer Canvas & Bloch UI** | `[MANDATORY]` | `ui-ux-pro-max`, `frontend-design`, `react-best-practices`, `web-design-guidelines`, `vercel-optimize`, `typescript-pro` | `context7`, `shadcn`, `chrome-devtools`, `playwright` |
| **2. FastAPI Qiskit Aer & OpenQASM 3.0 Service** | `[MANDATORY]` | `fastapi-expert`, `modern-python`, `api-designer`, `websocket-engineer`, `security-reviewer`, `static-analysis` | `context7`, `deepwiki`, `fetch` |
| **3. End-to-End Playwright & Unitary Math QA** | `[MANDATORY]` | `webapp-testing`, `test-driven-development`, `chaos-engineer` | `playwright`, `chrome-devtools` (Lighthouse) |

### 0.2 Strict `SKILL.md` & `design-system/MASTER.md` Compliance Rules
1. **Typography & Zero-Hyphen Copy Rule:**
   - All headings, labels, and explanatory copy use `Geist` (or `Manrope`).
   - All qubit wire labels (`q0..q7`), ket vectors ($|b_7\dots b_0\rangle$), unitary matrix entries, complex numbers ($a + bi$), and angles ($\theta, \phi, \lambda$) use `Geist Mono` (`Caption 1`, `Caption 3`, `Caption 4`).
   - **Zero Hyphens in Visible UI Text:** Never render a hyphen (`-`) inside any visible UI heading, button, tab, badge, or label. Use `Single Qubit Gates`, `Multi Qubit Gates`, `Step by Step Math`, `Two Qubit Entanglement`, `Eight Qubit Register`, `Statevector Amplitudes`, and `Phase Angle Wheel`.
   - **Zero Italics in UI Chrome:** All UI controls enforce `font-style: normal`. All mathematical notation uses KaTeX (`$...$` and `$$...$$`).
2. **Flat Dark Surface Hierarchy:**
   - Base Page Canvas: `#000000`
   - Composer Grid Well / Telemetry Container: `#181818`
   - Elevated Gate Cards / Bloch Sphere Cards / Math Inspector Drawer: `#1F1F1F`
   - Active Wire Slot / Hovered Gate Tile: `#272727`
   - Border Stroke: Full 4-sided `1px solid #313131` (single-sided borders are strictly prohibited).
3. **Concentric Nested Radius Rule:**
   $$R_{\text{inner}} = \max\left(4\text{px}, R_{\text{outer}} - \text{Gap}\right)$$
   An outer composer container with `rounded-2xl` ($16\text{px}$) and `p-2` ($8\text{px}$ gap) must house inner gate tiles and canvas wells with `rounded-lg` ($8\text{px}$).

---

## 1. Executive Vision & High-Impact Platform Differentiators

The **Quantum Circuit Composer & Step-by-Step Visualizer (`/composer`)** empowers researchers, students, and remote sensing engineers to visually construct any quantum circuit from **$1$ to $8$ qubits** ($2^1 = 2$ to $2^8 = 256$ complex Hilbert basis states), place arbitrary single-qubit and multi-controlled gates on any wire, scrub forward and backward through time steps $t = 0, 1, \dots, M$, and inspect the exact linear algebra, amplitude mixing, and phase rotation occurring inside every gate.

```
+---------------------------------------------------------------------------------------------------+
|                   DUAL ENGINE QUANTUM COMPOSER & STATE PROPAGATION ARCHITECTURE                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  USER DRAGS GATE TO WIRE (q0..q7, Step t)                                                         |
|         |                                                                                         |
|         +---> [TIER 1: CLIENT WEB WORKER TENSOR ENGINE (< 1.5 ms for 1 to 8 Qubits)]              |
|         |     * Computes exact statevector |psi^(t)> = U^(t) |psi^(t-1)> for all steps t=0..M     |
|         |     * Extracts Cartesian (a + bi), Polar (r * e^(i*phi)), and Born Probabilities P(k)   |
|         |     * Computes Partial Trace rho_q = Tr_{!=q}(|psi><psi|) & 8 Bloch Vectors (rx,ry,rz)  |
|         |     * Generates symbolic LaTeX butterfly equations for the active gate inspection drawer|
|         |                                                                                         |
|         +---> [TIER 2: FASTAPI + QISKIT AER BACKEND ENGINE (/api/v1/composer/*)]                  |
|               * Bidirectional OpenQASM 3.0 & Qiskit Python code generation and parsing            |
|               * Hardware gate transpilation, circuit depth reduction & CNOT count optimization    |
|               * Realistic NISQ hardware noise simulation (T1/T2 thermal relaxation & depolarizing)|
|               * Finite-shot QASM measurement histogram sampling (128 to 65536 shots)              |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Why This Composer Stands Above Existing Tools
1. **Gate-by-Gate "White-Box" Arithmetic Inspector:** Unlike standard quantum composers that only show the final bar chart, clicking any time column $t$ opens a live **Butterfly Calculation Inspector** that displays the exact $2 \times 2$ or $2^k \times 2^k$ matrix multiplication acting on each pair of basis states, showing *how* numbers add, subtract, or rotate in the complex plane.
2. **Real-Time Phase Color Wheel & Complex Plane Argand Diagram:** Every basis state $|k\rangle$ is rendered with both its probability height $|\alpha_k|^2$ and its complex phase angle $\phi_k = \arg(\alpha_k) \in (-\pi, \pi]$, alongside an interactive 2D Argand complex plane ($x = \text{Re}(\alpha_k), y = \text{Im}(\alpha_k)$) where vectors visibly rotate when $Z$, $S$, $T$, or $R_z(\phi)$ gates are applied.
3. **"Load Lunar Crater Patch Into Composer" Bridge:** Users can select a $2 \times 2$ ($2$-qubit position) or $4 \times 4$ ($4$-qubit position) micro-patch directly from a lunar crater image and click **Load into Circuit Composer**. The composer automatically places the exact **FRQI**, **QPIE**, or **NEQR** state preparation gates plus the **QHED** Hadamard and Decrement gates onto the wires so the user can step through them gate-by-gate!
4. **Live Entanglement & Bloch Purity Tracker:** Computes the partial trace $\rho_q$ for each of the $1\text{ to }8$ qubits at every step $t$. When a user creates a Bell state or GHZ state, they see the individual qubit Bloch vector shrink toward the origin ($\|\vec{r}_q\| \to 0$) and its entanglement entropy rise to $S(\rho_q) = 1.0\text{ bit}$, providing an unforgettable visual demonstration of quantum entanglement.

---

## 2. Complete 1-to-8 Qubit Gate Library & Exact Unitary Matrices

Users can drag and drop any of the following gates onto any qubit wire $q_i \in \{q_0, \dots, q_{n-1}\}$ at any time column $t \in \{1, \dots, M\}$.

### 2.1 Single-Qubit Pauli, Clifford & Phase Gates

| Gate Symbol | Display Name | Unitary Matrix $U$ | Physical Action on Bloch Sphere & Phase |
| :---: | :--- | :--- | :--- |
| $I$ | Identity Gate | $\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$ | No operation; preserves amplitude and phase for 1 time step. |
| $X$ | Pauli X (Bit Flip) | $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ | $\pi\text{ rad}$ ($180^\circ$) rotation around $X$-axis; swaps $\|0\rangle \leftrightarrow \|1\rangle$. |
| $Y$ | Pauli Y (Bit & Phase Flip) | $\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$ | $\pi\text{ rad}$ ($180^\circ$) rotation around $Y$-axis; maps $\|0\rangle \to i\|1\rangle$, $\|1\rangle \to -i\|0\rangle$. |
| $Z$ | Pauli Z (Phase Flip) | $\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$ | $\pi\text{ rad}$ ($180^\circ$) rotation around $Z$-axis; flips phase of $\|1\rangle$ by $e^{i\pi} = -1$. |
| $H$ | Hadamard Gate | $\frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$ | Maps $Z$-axis to $X$-axis ($\|0\rangle \to \|+\rangle$, $\|1\rangle \to \|-\rangle$); core QHED interferometer. |
| $S$ | Phase $\frac{\pi}{2}$ Gate ($\sqrt{Z}$) | $\begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}$ | $+\frac{\pi}{2}\text{ rad}$ ($+90^\circ$) rotation around $Z$-axis; adds $+i = e^{i\pi/2}$ phase to $\|1\rangle$. |
| $S^\dagger$ | Inverse Phase Gate | $\begin{pmatrix} 1 & 0 \\ 0 & -i \end{pmatrix}$ | $-\frac{\pi}{2}\text{ rad}$ ($-90^\circ$) rotation around $Z$-axis; adds $-i = e^{-i\pi/2}$ phase to $\|1\rangle$. |
| $T$ | $\frac{\pi}{8}$ Gate ($\sqrt{S}$) | $\begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}$ | $+\frac{\pi}{4}\text{ rad}$ ($+45^\circ$) rotation around $Z$-axis; universal non-Clifford phase gate. |
| $T^\dagger$ | Inverse $\frac{\pi}{8}$ Gate | $\begin{pmatrix} 1 & 0 \\ 0 & e^{-i\pi/4} \end{pmatrix}$ | $-\frac{\pi}{4}\text{ rad}$ ($-45^\circ$) rotation around $Z$-axis. |
| $SX$ | Square Root of NOT ($\sqrt{X}$) | $\frac{1}{2}\begin{pmatrix} 1+i & 1-i \\ 1-i & 1+i \end{pmatrix}$ | $+\frac{\pi}{2}\text{ rad}$ ($+90^\circ$) rotation around $X$-axis; native superconducting hardware basis gate. |

---

### 2.2 Parametric Continuous Rotation Gates

When any parametric gate is dropped onto a wire, a precision floating-point & symbolic $\pi$-fraction popover ($\pm\frac{\pi}{16}, \pm\frac{\pi}{8}, \pm\frac{\pi}{4}, \pm\frac{\pi}{2}, \pm\pi$, or continuous slider $\theta \in [0, 2\pi]$) appears:

1. **Rotation Around $X$-Axis ($R_x(\theta)$):**
   $$R_x(\theta) = \exp\left(-i\frac{\theta}{2}X\right) = \begin{pmatrix} \cos\left(\frac{\theta}{2}\right) & -i\sin\left(\frac{\theta}{2}\right) \\ -i\sin\left(\frac{\theta}{2}\right) & \cos\left(\frac{\theta}{2}\right) \end{pmatrix}$$
2. **Rotation Around $Y$-Axis ($R_y(\theta)$ — Core FRQI Intensity Gate):**
   $$R_y(\theta) = \exp\left(-i\frac{\theta}{2}Y\right) = \begin{pmatrix} \cos\left(\frac{\theta}{2}\right) & -\sin\left(\frac{\theta}{2}\right) \\ \sin\left(\frac{\theta}{2}\right) & \cos\left(\frac{\theta}{2}\right) \end{pmatrix}$$
3. **Rotation Around $Z$-Axis ($R_z(\phi)$):**
   $$R_z(\phi) = \exp\left(-i\frac{\phi}{2}Z\right) = \begin{pmatrix} e^{-i\phi/2} & 0 \\ 0 & e^{i\phi/2} \end{pmatrix}$$
4. **Pure Relative Phase Gate ($P(\lambda)$):**
   $$P(\lambda) = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\lambda} \end{pmatrix}$$
5. **Universal 3-Angle Euler Gate ($U_3(\theta, \phi, \lambda)$):**
   $$U_3(\theta, \phi, \lambda) = \begin{pmatrix} \cos\left(\frac{\theta}{2}\right) & -e^{i\lambda}\sin\left(\frac{\theta}{2}\right) \\ e^{i\phi}\sin\left(\frac{\theta}{2}\right) & e^{i(\phi+\lambda)}\cos\left(\frac{\theta}{2}\right) \end{pmatrix}$$

---

### 2.3 Multi-Qubit Controlled, Swap & Toffoli Gates

Users can assign **any wire** $q_c \in \{0, \dots, n-1\}$ as a positive control ($\bullet$, active on $|1\rangle$) or negative/open control ($\circ$, active on $|0\rangle$), and **any distinct wire** $q_t \neq q_c$ as the target:

1. **Controlled-NOT ($\text{CNOT}$ / $CX$):** Flips target qubit $q_t$ if and only if control qubit $q_c$ is in state $|1\rangle$:
   $$CX = |0\rangle\langle 0|_c \otimes I_t + |1\rangle\langle 1|_c \otimes X_t = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}$$
2. **Controlled-Phase ($CZ$ & $CP(\lambda)$):** Applies phase $e^{i\lambda}$ (or $-1$ for $CZ$) only when both $|q_c = 1\rangle$ and $|q_t = 1\rangle$:
   $$CP(\lambda) = \text{diag}\left(1, 1, 1, e^{i\lambda}\right), \quad CZ = \text{diag}(1, 1, 1, -1)$$
3. **Controlled Parameterized Rotations ($CR_x(\theta)$, $CR_y(\theta)$, $CR_z(\phi)$):**
   $$CR_y(\theta) = |0\rangle\langle 0|_c \otimes I_t + |1\rangle\langle 1|_c \otimes R_y(\theta)_t$$
4. **$\text{SWAP}$ and $i\text{SWAP}$ Gates:** Exchanges quantum states between any two wires $q_a$ and $q_b$:
   $$\text{SWAP} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}, \quad i\text{SWAP} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & i & 0 \\ 0 & i & 0 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$
5. **Toffoli Gate ($CCX$) & General Multi-Controlled Gate ($C^k U$ for $1 \le k \le 7$):**
    Given a set of positive control wires $\mathcal{C}_1$, negative control wires $\mathcal{C}_0$, and target wire $q_t$ with single-qubit gate $U \in \{X, Y, Z, H, R_y(\theta), P(\lambda)\}$, the exact $n$-qubit unitary acts on the target wire only in the subspace where all $c \in \mathcal{C}_1$ are $|1\rangle$ and all $c' \in \mathcal{C}_0$ are $|0\rangle$:
   $$\Pi_{\text{ctrl}} = \bigotimes_{c \in \mathcal{C}_1} |1\rangle\langle 1|_c \otimes \bigotimes_{c' \in \mathcal{C}_0} |0\rangle\langle 0|_{c'}$$
   $$C^k U = \left(I^{\otimes n} - \Pi_{\text{ctrl}} \otimes I_t\right) + \Pi_{\text{ctrl}} \otimes U_t$$

---

### 2.4 Quantum Image Processing (QIP) Macro Subroutines

To bridge circuit theory directly with the platform's planetary edge detection algorithms, the palette includes three **Expandable Macro Blocks** (users can toggle **"Expand Macro into Elementary Gates"** to see the internal CNOT/Toffoli decomposition):
1. **Cyclic Decrement Gate ($D_{2^k}$):** Shifts basis states $|x\rangle \to |(x - 1) \bmod 2^k\rangle$ using $X(q_0) \to CX(q_0, q_1) \to CCX(q_0, q_1, q_2) \dots$ (used in FRQI-QHED and QPIE-QHED odd-pair passes).
2. **Cyclic Increment Gate ($I_{2^k}$):** Shifts basis states $|x\rangle \to |(x + 1) \bmod 2^k\rangle$.
3. **Quantum Fourier Transform ($\text{QFT}_k$ & $\text{IQFT}_k$):** Maps computational basis states into the frequency/phase domain:
   $$\text{QFT}_k |x\rangle = \frac{1}{\sqrt{2^k}} \sum_{y=0}^{2^k-1} \exp\left(\frac{2\pi i x y}{2^k}\right) |y\rangle$$

---

## 3. Mathematical Engine: How Statevectors, Amplitudes & Phases Propagate Step-by-Step

### 3.1 Dynamic $n$-Qubit Hilbert Space Allocation ($1 \le n \le 8$)
When a user selects $n \in \{1, 2, 3, 4, 5, 6, 7, 8\}$ qubits, the simulation engine initializes a complex statevector $|\psi^{(0)}\rangle \in \mathbb{C}^{2^n}$ indexed in standard little-endian Qiskit bit-ordering $|q_{n-1} \dots q_1 q_0\rangle$, where $q_0$ is the least-significant bit:
$$|\psi^{(t)}\rangle = \sum_{k=0}^{2^n - 1} \alpha_k^{(t)} |k\rangle, \quad \alpha_k^{(t)} = a_k^{(t)} + i b_k^{(t)} \in \mathbb{C}, \quad \sum_{k=0}^{2^n - 1} \left|\alpha_k^{(t)}\right|^2 = 1$$
Each wire $q_j$ can be initialized independently before $t = 1$ to any single-qubit state $|\phi_j\rangle = \cos\left(\frac{\theta_j}{2}\right)|0\rangle + e^{i\varphi_j}\sin\left(\frac{\theta_j}{2}\right)|1\rangle$, yielding the initial tensor product state:
$$|\psi^{(0)}\rangle = |\phi_{n-1}\rangle \otimes \dots \otimes |\phi_1\rangle \otimes |\phi_0\rangle$$

---

### 3.2 Gate-by-Gate Unitary Tensor Expansion & Butterfly Index Pairing
Instead of constructing dense $256 \times 256$ matrices for every step, the composer's calculation engine uses **Pairwise Butterfly Amplitude Updates**, which both executes in $<0.2\text{ ms}$ in the browser and produces human-readable step-by-step algebra for the user!

When a single-qubit gate $U = \begin{pmatrix} u_{00} & u_{01} \\ u_{10} & u_{11} \end{pmatrix}$ (optionally controlled by a control mask) acts on target wire $q_t$ at time step $t$:
1. Every basis state index $k \in \{0, \dots, 2^n - 1\}$ whose $t$-th bit is $0$ ($k_0$ with bit $t = 0$) is paired with its partner index $k_1 = k_0 \mid (1 \ll t)$ (identical bits everywhere except bit $t = 1$).
2. If $k_0$ satisfies all active control wires in column $t$, the pair of amplitudes $(\alpha_{k_0}^{(t-1)}, \alpha_{k_1}^{(t-1)})$ transforms via the exact $2 \times 2$ linear system:
   $$\begin{pmatrix} \alpha_{k_0}^{(t)} \\ \alpha_{k_1}^{(t)} \end{pmatrix} = \begin{pmatrix} u_{00} & u_{01} \\ u_{10} & u_{11} \end{pmatrix} \begin{pmatrix} \alpha_{k_0}^{(t-1)} \\ \alpha_{k_1}^{(t-1)} \end{pmatrix} = \begin{pmatrix} u_{00} \alpha_{k_0}^{(t-1)} + u_{01} \alpha_{k_1}^{(t-1)} \\ u_{10} \alpha_{k_0}^{(t-1)} + u_{11} \alpha_{k_1}^{(t-1)} \end{pmatrix}$$
3. If $k_0$ does **not** satisfy the control conditions, the amplitudes pass through unchanged:
   $$\alpha_{k_0}^{(t)} = \alpha_{k_0}^{(t-1)}, \quad \alpha_{k_1}^{(t)} = \alpha_{k_1}^{(t-1)}$$

This butterfly pairing is displayed directly in the **Step-by-Step Calculation Inspector**, so the user sees the exact numbers being multiplied and added for every active state!

---

### 3.3 Complex Amplitude Decomposition: Cartesian, Polar & Relative Phase
At every time slice $t \in \{0, \dots, M\}$ and for every basis state $|k\rangle \in \{|0\dots 0\rangle, \dots, |1\dots 1\rangle\}$, the engine computes five synchronized quantities:
1. **Cartesian Complex Amplitude:**
   $$\alpha_k^{(t)} = \text{Re}\left(\alpha_k^{(t)}\right) + i\,\text{Im}\left(\alpha_k^{(t)}\right)$$
2. **Magnitude (Modulus):**
   $$r_k^{(t)} = \left|\alpha_k^{(t)}\right| = \sqrt{\left[\text{Re}\left(\alpha_k^{(t)}\right)\right]^2 + \left[\text{Im}\left(\alpha_k^{(t)}\right)\right]^2} \in [0, 1]$$
3. **Born Measurement Probability:**
   $$P_k^{(t)} = \left(r_k^{(t)}\right)^2 = \left|\alpha_k^{(t)}\right|^2 \in [0, 1]$$
4. **Phase Angle (in Radians, Degrees, and Symbolic $\pi$-Fractions):**
   $$\phi_k^{(t)} = \begin{cases} 0 & \text{if } r_k^{(t)} < 10^{-9} \\ \text{atan2}\left(\text{Im}\left(\alpha_k^{(t)}\right), \text{Re}\left(\alpha_k^{(t)}\right)\right) & \text{otherwise} \end{cases} \in (-\pi, \pi]$$
5. **Step-to-Step Delta Telemetry ($\Delta$ from Step $t-1 \to t$):**
   $$\Delta P_k^{(t)} = P_k^{(t)} - P_k^{(t-1)}, \quad \Delta \phi_k^{(t)} = \left(\phi_k^{(t)} - \phi_k^{(t-1)} + \pi\right) \bmod 2\pi - \pi$$

---

### 3.4 Partial Trace, Reduced Density Matrices & 8-Qubit Bloch Sphere Vectors
How do we visualize $n = 8$ qubits on individual Bloch spheres when the system may be entangled? We compute the exact single-qubit **Reduced Density Matrix** $\rho_q^{(t)} \in \mathbb{C}^{2 \times 2}$ for each qubit $q \in \{0, \dots, n-1\}$ by tracing out all other $n-1$ qubits:
$$\rho_q^{(t)} = \text{Tr}_{\neq q}\left(|\psi^{(t)}\rangle\langle\psi^{(t)}|\right) = \begin{pmatrix} \rho_{00} & \rho_{01} \\ \rho_{10} & \rho_{11} \end{pmatrix}$$
Using the butterfly bit-partition $S_0^{(q)} = \{k \mid \text{bit } q \text{ of } k = 0\}$ and $k_1 = k_0 \mid (1 \ll q)$:
$$\rho_{00} = \sum_{k_0 \in S_0^{(q)}} \left|\alpha_{k_0}^{(t)}\right|^2, \quad \rho_{11} = \sum_{k_0 \in S_0^{(q)}} \left|\alpha_{k_1}^{(t)}\right|^2, \quad \rho_{01} = \sum_{k_0 \in S_0^{(q)}} \alpha_{k_0}^{(t)} \left(\alpha_{k_1}^{(t)}\right)^*$$
From $\rho_q^{(t)}$, we extract the exact 3D **Bloch Vector** $\vec{r}_q^{(t)} = (r_x, r_y, r_z)$:
$$r_x = 2\,\text{Re}(\rho_{01}), \quad r_y = -2\,\text{Im}(\rho_{01}), \quad r_z = \rho_{00} - \rho_{11}$$
- **Bloch Vector Length (Purity Radius):**
  $$\|\vec{r}_q^{(t)}\| = \sqrt{r_x^2 + r_y^2 + r_z^2} \in [0, 1]$$
- **Single-Qubit Purity & Entanglement Entropy:**
  $$\mathcal{P}_q^{(t)} = \text{Tr}\left(\left[\rho_q^{(t)}\right]^2\right) = \frac{1 + \|\vec{r}_q^{(t)}\|^2}{2} \in [0.5, 1.0]$$
  $$S\left(\rho_q^{(t)}\right) = -\lambda_+ \log_2(\lambda_+) - \lambda_- \log_2(\lambda_-), \quad \lambda_{\pm} = \frac{1 \pm \|\vec{r}_q^{(t)}\|}{2} \in [0, 1]\text{ bit}$$
  - When $\|\vec{r}_q\| = 1$ ($S = 0$), qubit $q$ is in a **pure unentangled state**, and its arrow touches the surface of the Bloch sphere.
  - When $\|\vec{r}_q\| < 1$ ($S > 0$), qubit $q$ is **entangled** with other qubits in the circuit, and its arrow visibly contracts inside the sphere (reaching the center $\|\vec{r}_q\| = 0$ for a maximally entangled Bell or GHZ pair!).

---

### 3.5 Pairwise Entanglement Entropy & Quantum Mutual Information
To show *which* specific wires are entangled with each other at step $t$, the engine computes the two-qubit reduced density matrix $\rho_{q_a, q_b}^{(t)} = \text{Tr}_{\neq \{q_a, q_b\}}(|\psi^{(t)}\rangle\langle\psi^{(t)}|) \in \mathbb{C}^{4 \times 4}$ and evaluates the **Quantum Mutual Information**:
$$I(q_a : q_b) = S(\rho_{q_a}) + S(\rho_{q_b}) - S(\rho_{q_a, q_b}) \in [0, 2]$$
Non-zero mutual information $I(q_a : q_b) > 0$ renders a glowing cyan entanglement arc connecting wire $q_a$ and wire $q_b$ in the Entanglement Topology widget.

---

## 4. Concrete Step-by-Step Numerical & Phase Propagation Walkthrough

Below is an exact trace showing how the composer demonstrates values, calculations, and phase shifts moving forward across a $3$-qubit circuit ($q_2, q_1, q_0$) implementing **Superposition + Phase Rotation + Entanglement + Hadamard Interference**:

```
=====================================================================================================
EXAMPLE 3-QUBIT CIRCUIT TRACE (STEP t=0 TO STEP t=4)
=====================================================================================================
Time Slice:    t = 0 (Init)     t = 1 (Superpos)     t = 2 (Phase Rot)    t = 3 (Entangle)    t = 4 (Interfere)
-----------------------------------------------------------------------------------------------------
q0 (Wire 0):   |0> -------------[ H ]----------------[ P(pi/2) = S ]------o-------------------[ H ]-----------
                                                                          |
q1 (Wire 1):   |0> -------------[ H ]----------------[   Ry(pi/2)  ]-----(+)------------------[ I ]-----------
                                                                          |
q2 (Wire 2):   |0> -------------[ I ]----------------[      I      ]-----(+)------------------[ I ]-----------
=====================================================================================================
```

### Step-by-Step Statevector, Calculation & Phase Evolution Table

| Step $t$ | Active Gate(s) | Explicit Butterfly Calculation Performed | Non-Zero Basis Amplitudes $\alpha_k^{(t)}$ (Cartesian & Polar $r e^{i\phi}$) | Probability $P_k$ & Phase $\phi_k$ | Bloch Vectors $\vec{r}_{q} = (r_x, r_y, r_z)$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **$t = 0$** | Ground Init $\|000\rangle$ | $\|\psi^{(0)}\rangle = \|0\rangle_{q_2} \otimes \|0\rangle_{q_1} \otimes \|0\rangle_{q_0}$ | $\|000\rangle: 1.000 + 0.000i = 1.000 e^{i\cdot 0}$ | $\|000\rangle: P=100\%, \phi=0\text{ rad}$ | $q_0: (0, 0, +1)$<br>$q_1: (0, 0, +1)$<br>$q_2: (0, 0, +1)$ |
| **$t = 1$** | $H$ on $q_0$<br>$H$ on $q_1$ | $\alpha_{000}^{(1)} = \frac{1}{\sqrt{2}} \cdot \frac{1}{\sqrt{2}} (1) = 0.5$<br>Spreads amplitude equally across $\|000\rangle, \|001\rangle, \|010\rangle, \|011\rangle$ | $\|000\rangle: 0.500 = 0.500 e^{i\cdot 0}$<br>$\|001\rangle: 0.500 = 0.500 e^{i\cdot 0}$<br>$\|010\rangle: 0.500 = 0.500 e^{i\cdot 0}$<br>$\|011\rangle: 0.500 = 0.500 e^{i\cdot 0}$ | Each of $4$ states:<br>$P = 25.0\%$<br>$\phi = 0\text{ rad} (0^\circ)$ | $q_0: (+1, 0, 0)$<br>$q_1: (+1, 0, 0)$<br>$q_2: (0, 0, +1)$ |
| **$t = 2$** | $S = P(\frac{\pi}{2})$ on $q_0$<br>$R_y(\frac{\pi}{2})$ on $q_1$ | 1. $S$ multiplies states with $q_0=1$ ($\|001\rangle, \|011\rangle$) by $e^{i\pi/2} = +i$.<br>2. $R_y(\frac{\pi}{2})$ sends $q_1: \|+\rangle \to \|1\rangle$, constructively concentrating amplitude into $q_1=1$! | $\|000\rangle: 0.000$ (Cancelled!)<br>$\|001\rangle: 0.000$ (Cancelled!)<br>$\|010\rangle: \frac{1}{\sqrt{2}} = 0.7071 e^{i\cdot 0}$<br>$\|011\rangle: \frac{i}{\sqrt{2}} = 0.7071 e^{i\pi/2}$ | $\|010\rangle: P=50\%, \phi=0$<br>$\|011\rangle: P=50\%, \phi=+\frac{\pi}{2}$ | $q_0: (0, +1, 0)$<br>$q_1: (0, 0, -1)$<br>$q_2: (0, 0, +1)$ |
| **$t = 3$** | $CX(q_0 \to q_1)$<br>$CCX(q_0, q_1 \to q_2)$ | For $\|011\rangle$ ($q_0=1, q_1=1$), Toffoli flips $q_2: 0 \to 1$ ($\|011\rangle \to \|111\rangle$) and $CX$ flips $q_1: 1 \to 0$ ($\|111\rangle \to \|101\rangle$). | $\|010\rangle: 0.7071 + 0.000i = 0.7071 e^{i\cdot 0}$<br>$\|101\rangle: 0.000 + 0.7071i = 0.7071 e^{i\pi/2}$ | $\|010\rangle: P=50\%, \phi=0$<br>$\|101\rangle: P=50\%, \phi=+\frac{\pi}{2}$ | $q_0: (0, 0, 0)$ Entangled!<br>$q_1: (0, 0, 0)$ Entangled!<br>$q_2: (0, 0, 0)$ Entangled! |
| **$t = 4$** | $H$ on $q_0$ | Butterfly pairs $(010, 011)$ and $(100, 101)$:<br>$\alpha_{010}^{(4)} = \frac{0.7071 + 0}{\sqrt{2}} = 0.5$<br>$\alpha_{011}^{(4)} = \frac{0.7071 - 0}{\sqrt{2}} = 0.5$<br>$\alpha_{100}^{(4)} = \frac{0 + 0.7071i}{\sqrt{2}} = 0.5i$<br>$\alpha_{101}^{(4)} = \frac{0 - 0.7071i}{\sqrt{2}} = -0.5i$ | $\|010\rangle: +0.500 = 0.5 e^{i\cdot 0}$<br>$\|011\rangle: +0.500 = 0.5 e^{i\cdot 0}$<br>$\|100\rangle: +0.500i = 0.5 e^{+i\pi/2}$<br>$\|101\rangle: -0.500i = 0.5 e^{-i\pi/2}$ | $\|010\rangle: P=25\%, \phi=0$<br>$\|011\rangle: P=25\%, \phi=0$<br>$\|100\rangle: P=25\%, \phi=+\frac{\pi}{2}$<br>$\|101\rangle: P=25\%, \phi=-\frac{\pi}{2}$ | All $3$ qubits remain in a maximally entangled GHZ-like state ($S(\rho_q) = 1.0\text{ bit}$) |

---

## 5. UI/UX Architecture, Zero-Hyphen Wireframes & Interactive Visualizers

### 5.1 Master Workspace Wireframe (`/composer`)

```
+----------------------------------------------------------------------------------------------------------------+
|  [Floating Navbar: Quantum Vision | Overview | Architectures | Composer (Active) | Studio | Benchmarks]        |
+----------------------------------------------------------------------------------------------------------------+
|  COMPOSER TOP TOOLBAR (#181818 Well, 1px #313131 Border, Nested Radii):                                        |
|  [Qubits: (-) 3 (+) (1 to 8)]  [Preset Circuit v] (Bell | GHZ | FRQI 4px | QPIE | NEQR Sub | QFT)              |
|  [Load Lunar Crater Patch]     [Optimize & Transpile]     [Noise Model: Ideal Statevector v]     [Clear Grid]  |
|  [Step Controls: |<< Step 0 | < Prev Gate | [Play Auto Propagation] | Next Gate > | Step M >>|]                |
+----------------------------------------------------------------------------------------------------------------+
|                                                                                                                |
|  +---------------------------+  +----------------------------------------------------------------------------+ |
|  | GATE PALETTE (#1F1F1F)    |  | INTERACTIVE QUANTUM CIRCUIT CANVAS (TIME SCRUBBER AT STEP t = 2 / 4)       | |
|  |                           |  |                                                [Laser Time Cursor: Step 2] | |
|  | Single Qubit Pauli & Cliff|  |Wire   Init State     Step 1        Step 2 (ACTIVE)    Step 3       Step 4  | |
|  | [ I ] [ X ] [ Y ] [ Z ]   |  |----------------------------------------------------------------------------| |
|  | [ H ] [ S ] [Sdg] [ T ]   |  | q0:   [ |0> v ] ------[ H ]---------[ P(pi/2) ]---------o-----------[ H ]--| |
|  | [Tdg] [SX ]               |  |       <r>=+1.0z       <r>=+1.0x     <r>=+1.0y (90deg)   |           <r>=0  | |
|  |                           |  |                                                         |                  | |
|  | Parametric Rotations      |  | q1:   [ |0> v ] ------[ H ]---------[ Ry(pi/2)]--------(+)----------[ I ]--| |
|  | [Rx(t)] [Ry(t)] [Rz(p)]   |  |       <r>=+1.0z       <r>=+1.0x     <r>=-1.0z (|1>)     |           <r>=0  | |
|  | [P(l) ] [U3(t,p,l)]       |  |                                                         |                  | |
|  |                           |  | q2:   [ |0> v ] ------[ I ]---------[    I    ]--------(+)----------[ I ]--| |
|  | Multi Qubit & Entangling  |  |       <r>=+1.0z       <r>=+1.0z     <r>=+1.0z          <r>=0        <r>=0  | |
|  | [ CX ] [ CY ] [ CZ ]      |  |----------------------------------------------------------------------------| |
|  | [CRy ] [CP  ] [SWAP]      |  | Live Wire State Badges at Step 2:                                          | |
|  | [CCX (Toffoli)] [C^k-U]   |  | q0: 0.707|0> + 0.707i|1> (Phase +pi/2) | q1: 1.000|1> | q2: 1.000|0>       | |
|  |                           |  +----------------------------------------------------------------------------+ |
|  | QIP & Vision Macros       |                                                                                 |
|  | [D_2^n Shift] [QFT_n]     |  +----------------------------------------------------------------------------+ |
|  | [QFS Subtractor] [Meas M] |  | STEP BY STEP MATHEMATICAL CALCULATION INSPECTOR (ACTIVE AT STEP t = 2)     | |
|  +---------------------------+  |                                                                            | |
|                                 | Column Unitary Operation: U^(2) = I_q2 (x) Ry(pi/2)_q1 (x) S_q0            | |
|                                 |                                                                            | |
|                                 | Active Butterfly Equations (How Amplitudes Moved from Step 1 -> Step 2):   | |
|                                 | * |000> & |010> via Ry(pi/2):                                              | |
|                                 |   alpha_000^(2) = cos(pi/4)*(0.500) - sin(pi/4)*(0.500) = 0.0000 (Cancel!) | |
|                                 |   alpha_010^(2) = sin(pi/4)*(0.500) + cos(pi/4)*(0.500) = 0.7071           | |
|                                 | * |011> via S = diag(1, e^(i*pi/2)):                                       | |
|                                 |   alpha_011^(2) = e^(i*pi/2) * 0.7071 = 0.0000 + 0.7071i (Phase +90 deg)   | |
|                                 +----------------------------------------------------------------------------+ |
|                                                                                                                |
|  +----------------------------------------------------+  +---------------------------------------------------+ |
|  | STATEVECTOR AMPLITUDE, PROBABILITY & PHASE BARS    |  | PER QUBIT 3D BLOCH SPHERES & ENTANGLEMENT METRICS | |
|  | [Phase Color Wheel Legend: 0=#00F0FF, pi/2=#FF79C6]|  |                                                   | |
|  |                                                    |  |  +-------------+  +-------------+  +-------------+ | |
|  | Ket    Prob %   Amplitude (a+bi)   Phase   Bar     |  |  |  Qubit q0   |  |  Qubit q1   |  |  Qubit q2   | | |
|  | |000>   0.0%    0.000 + 0.000i     0.00    [     ] |  |  |   (Sphere)  |  |   (Sphere)  |  |   (Sphere)  | | |
|  | |001>   0.0%    0.000 + 0.000i     0.00    [     ] |  |  | r=(0,+1,0)  |  | r=(0,0,-1)  |  | r=(0,0,+1)  | | |
|  | |010>  50.0%   +0.707 + 0.000i     0 rad   [=====] |  |  | Purity: 1.0 |  | Purity: 1.0 |  | Purity: 1.0 | | |
|  | |011>  50.0%    0.000 + 0.707i    +pi/2    [=====] |  |  | Entrop: 0.0 |  | Entrop: 0.0 |  | Entrop: 0.0 | | |
|  | |100>   0.0%    0.000 + 0.000i     0.00    [     ] |  |  +-------------+  +-------------+  +-------------+ | |
|  | ...                                                |  |  [Tab: Bloch Spheres] [Tab: 2D Argand Phase Plane]| |
|  +----------------------------------------------------+  |  [Tab: Qiskit Python & OpenQASM 3.0 Code Sync]    | |
|                                                          +---------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------------------+
```

---

### 5.2 Step-by-Step Mathematical Calculation Inspector Drawer
Whenever the user clicks any gate on the canvas or scrubs the timeline cursor to step $t$, the **Calculation Inspector Drawer** renders three synchronized views using KaTeX:
1. **Single-Gate Unitary Matrix Card:** Shows the exact numerical and symbolic matrix of the selected gate (e.g., $R_y(\frac{\pi}{2}) = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & -1 \\ 1 & 1 \end{pmatrix}$).
2. **Active Butterfly Transition Equations:** Lists every basis state pair $(|k_0\rangle, |k_1\rangle)$ whose amplitudes changed between $t-1$ and $t$, color-coding constructive additions in Emerald (`#39D353`), destructive cancellations in Electric Magenta (`#FF79C6`), and pure phase rotations in Golden Sunlight (`#FFD700`).
3. **Dirac Ket Expansion:** Displays the full symbolic Dirac ket equation at step $t$, with a toggle between **Cartesian Form** ($0.7071|010\rangle + 0.7071i|011\rangle$), **Polar Euler Form** ($0.7071 e^{i\cdot 0}|010\rangle + 0.7071 e^{i\pi/2}|011\rangle$), and **Binary vs. Decimal Ket Labels** ($|011\rangle$ vs. $|3\rangle$).

---

### 5.3 Phase Color Wheel & Amplitude Bar Visualizer
Because quantum interference depends critically on relative phase $\phi_k \in (-\pi, \pi]$, every bar in the Statevector Chart encodes **two dimensions simultaneously**:
- **Bar Length / Height:** Proportional to Born probability $P(k) = |\alpha_k|^2$ (or toggleable to magnitude $|\alpha_k|$).
- **Bar Fill Color (Cyclic Quantum Phase Palette):**
  - $\phi = 0\text{ rad}$ ($+1$ Real Positive): Neon Cyan `#00F0FF`
  - $\phi = +\frac{\pi}{2}\text{ rad}$ ($+i$ Imaginary Positive): Electric Magenta `#FF79C6`
  - $\phi = \pm\pi\text{ rad}$ ($-1$ Real Negative): Golden Amber `#FFD700`
  - $\phi = -\frac{\pi}{2}\text{ rad}$ ($-i$ Imaginary Negative): Laser Purple `#BD93F9`
  - Continuous intermediate phases interpolate smoothly around the cyclic phase ring, accompanied by an interactive **2D Argand Complex Plane** plotting each $\alpha_k$ as a vector arrow from the origin $(0,0)$ to $(\text{Re}(\alpha_k), \text{Im}(\alpha_k))$ inside the unit circle.

---

### 5.4 Value-Boosting Features for Platform Attraction

1. **"Load Lunar Patch into Circuit Composer" (Direct Vision Integration):**
   - Users can pick a $2 \times 2$ pixel corner of a lunar crater rim (e.g., intensities $[38, 218, 40, 220]$) and select **Generate FRQI Circuit (3 Qubits)** or **Generate QPIE Circuit (2 Qubits)**.
   - The composer automatically populates the exact $H$, $C^2 R_y(2\theta_i)$, and QHED Hadamard gates on the canvas. Stepping from $t = 0$ to $t = M$ visually proves how pixel intensities become rotation angles and how the final Hadamard gate cancels flat regions while lighting up the crater rim!
2. **Bidirectional Qiskit Python & OpenQASM 3.0 Code Sync:**
   - Every drag-and-drop action immediately updates an editable **Qiskit Python** and **OpenQASM 3.0** code pane.
   - Conversely, pasting or editing `qc.h(0); qc.cx(0, 1); qc.rz(np.pi/4, 1)` in the code editor parses the AST and updates the visual circuit grid and statevector timeline instantly.
3. **One-Click Transpiler & Gate Simplifier ("Optimize Circuit"):**
   - Calls FastAPI `POST /api/v1/composer/transpile` (running `qiskit.compiler.transpile(..., optimization_level=3)`) to cancel redundant gates, decompose $CCX$ Toffoli gates into elementary $CX + T/T^\dagger + H$ hardware basis gates, and display a side-by-side comparison of **Original Depth vs. Transpiled Hardware Depth**.
4. **NISQ Noise & Decoherence Simulator Toggle:**
   - Allows users to switch from `Ideal Statevector` to `Simulated Superconducting QPU (Depolarizing + T1/T2 Noise)`. Shows how deep circuits experience amplitude damping and phase decoherence over time, educating users on why compact encodings like QPIE ($6$ qubits) and shallow QHED circuits outperform deep $14$-qubit NEQR subtractor networks on near-term quantum hardware.
5. **Export Interactive Circuit Snapshot (SVG / LaTeX Quantikz / JSON):**
   - One-click export of the circuit diagram to publication-grade **LaTeX `quantikz` code**, high-DPI **SVG**, or shareable URL state.

---

## 6. Hybrid Client-Server Simulation Architecture & FastAPI Contracts

### 6.1 Directory Structure
```
frontend/src/features/composer/
├── components/
│   ├── CircuitGridCanvas.tsx           # Drag-and-drop 1-to-8 qubit wire grid & laser time scrubber
│   ├── GatePaletteSidebar.tsx          # Categorized gates, angle popover & QIP macro blocks
│   ├── MathCalculationInspector.tsx    # KaTeX butterfly equations & unitary matrix drawer
│   ├── BlochSphereArray.tsx            # 1-to-8 reduced density matrix 3D Bloch spheres
│   ├── StatevectorPhaseChart.tsx       # 2^n probability bars + cyclic phase wheel + Argand plane
│   ├── EntanglementChordGraph.tsx      # Pairwise mutual information I(qa : qb) visualizer
│   └── QiskitCodeSyncDrawer.tsx        # Bidirectional Qiskit Python & OpenQASM 3.0 editor
├── engine/
│   ├── tensorSimulator.worker.ts       # Zero-latency TypeScript Web Worker statevector engine
│   ├── densityMatrix.ts                # Partial trace, Bloch vector & von Neumann entropy math
│   └── openqasmParser.ts               # Bidirectional AST converter for Qiskit / OpenQASM 3.0
└── presets/
    └── famousCircuits.ts               # Bell, GHZ, QFT, FRQI 4px, QPIE 4px, NEQR Subtractor

backend/app/api/v1/
└── routes_composer.py                  # FastAPI Qiskit Aer transpilation, noise & shot simulation
```

### 6.2 FastAPI Endpoint Contracts (`backend/app/api/v1/routes_composer.py`)

#### Endpoint 1: `POST /api/v1/composer/simulate`
Executes full Qiskit Aer statevector, density matrix (with optional NISQ noise model), and finite-shot QASM sampling across all time steps $t = 0 \dots M$.

**Request Schema (`application/json`):**
```json
{
  "num_qubits": 3,
  "initial_states": ["|0>", "|0>", "|0>"],
  "shots": 4096,
  "noise_model": {
    "enabled": false,
    "single_qubit_depolarizing_error": 0.001,
    "two_qubit_depolarizing_error": 0.01
  },
  "steps": [
    {
      "step_index": 1,
      "gates": [
        { "gate": "H", "targets": [0], "controls": [], "anti_controls": [], "params": [] },
        { "gate": "H", "targets": [1], "controls": [], "anti_controls": [], "params": [] }
      ]
    },
    {
      "step_index": 2,
      "gates": [
        { "gate": "P", "targets": [0], "controls": [], "anti_controls": [], "params": [1.57079632679] },
        { "gate": "RY", "targets": [1], "controls": [], "anti_controls": [], "params": [1.57079632679] }
      ]
    },
    {
      "step_index": 3,
      "gates": [
        { "gate": "CCX", "targets": [2], "controls": [0, 1], "anti_controls": [], "params": [] }
      ]
    }
  ]
}
```

**Response Schema (`application/json`):**
```json
{
  "num_qubits": 3,
  "hilbert_dimension": 8,
  "circuit_metrics": {
    "total_steps": 3,
    "total_gates": 5,
    "single_qubit_gates": 4,
    "multi_qubit_gates": 1,
    "transpiled_cx_count": 6
  },
  "qasm3_code": "OPENQASM 3.0;\ninclude \"stdgates.inc\";\nqubit[3] q;\nh q[0];\nh q[1];\np(pi/2) q[0];\nry(pi/2) q[1];\nccx q[0], q[1], q[2];",
  "qiskit_python_code": "from qiskit import QuantumCircuit\nimport numpy as np\n\nqc = QuantumCircuit(3)\nqc.h(0)\nqc.h(1)\nqc.p(np.pi / 2, 0)\nqc.ry(np.pi / 2, 1)\nqc.ccx(0, 1, 2)",
  "timeline": [
    {
      "step_index": 2,
      "active_latex_summary": "U^{(2)} = I_{q_2} \\otimes R_y(\\pi/2)_{q_1} \\otimes P(\\pi/2)_{q_0}",
      "statevector": [
        { "index": 0, "ket": "000", "re": 0.0, "im": 0.0, "mag": 0.0, "prob": 0.0, "phase_rad": 0.0 },
        { "index": 2, "ket": "010", "re": 0.70710678, "im": 0.0, "mag": 0.70710678, "prob": 0.5, "phase_rad": 0.0 },
        { "index": 3, "ket": "011", "re": 0.0, "im": 0.70710678, "mag": 0.70710678, "prob": 0.5, "phase_rad": 1.57079633 }
      ],
      "bloch_vectors": [
        { "qubit": 0, "rx": 0.0, "ry": 1.0, "rz": 0.0, "purity": 1.0, "entropy_bits": 0.0 },
        { "qubit": 1, "rx": 0.0, "ry": 0.0, "rz": -1.0, "purity": 1.0, "entropy_bits": 0.0 },
        { "qubit": 2, "rx": 0.0, "ry": 0.0, "rz": 1.0, "purity": 1.0, "entropy_bits": 0.0 }
      ],
      "butterfly_transitions": [
        {
          "pair_kets": ["000", "010"],
          "gate_applied": "RY(pi/2) on q1",
          "equation_latex": "\\alpha_{010}^{(2)} = \\sin(\\pi/4)(0.5) + \\cos(\\pi/4)(0.5) = 0.7071",
          "effect_type": "CONSTRUCTIVE_INTERFERENCE"
        }
      ]
    }
  ],
  "shot_counts": {
    "010": 2054,
    "111": 2042
  }
}
```

#### Endpoint 2: `POST /api/v1/composer/from-image-patch`
Converts a user-selected $2 \times 2$ or $4 \times 4$ lunar pixel patch into a ready-to-step composer circuit (`FRQI_QHED`, `QPIE_QHED`, or `NEQR_GRADIENT`).

---

## 7. Verification Suite, Mathematical Invariants & Definition of Done

> **Skill Triggers:** `webapp-testing` (`playwright` MCP), `test-driven-development`, `chrome-devtools` MCP, `security-reviewer`.

### 7.1 Automated Mathematical Invariant Tests (`vitest` & `pytest`)
1. **Unitarity & Probability Conservation Invariant:** For every gate in the library and every qubit count $n \in \{1, \dots, 8\}$ at every step $t$:
   $$\left| \sum_{k=0}^{2^n - 1} \left|\alpha_k^{(t)}\right|^2 - 1.0 \right| < 10^{-12}$$
2. **Client-Server Statevector Parity:** Assert that the TypeScript Web Worker tensor engine and the FastAPI Qiskit Aer `Statevector.from_instruction(qc)` match to within $< 10^{-10}$ $L_2$ norm across all $1$-to-$8$ qubit preset circuits (Bell, $8$-qubit GHZ, $4$-qubit QFT, $3$-qubit FRQI-QHED, and Toffoli cascades).
3. **Reduced Density Matrix & Entanglement Invariant:**
   - On a separable state $|\psi\rangle = |+\rangle \otimes |1\rangle \otimes |0\rangle$, assert $\|\vec{r}_q\| = 1.0$ and $S(\rho_q) = 0.0$ for all qubits.
   - On an $n$-qubit GHZ state $\frac{1}{\sqrt{2}}(|0\rangle^{\otimes n} + |1\rangle^{\otimes n})$ for $n = 8$, assert $\|\vec{r}_q\| = 0.0$, $\mathcal{P}_q = 0.5$, and $S(\rho_q) = 1.0\text{ bit}$ for all $8$ qubits.

### 7.2 Mandatory Antigravity Agent Definition of Done Checklist
- [ ] **AST & Dependency Graph Updated:** `graphify .` and `code-review-graph build` index all `/composer` components, the Web Worker tensor engine, and `/api/v1/composer/*` routes.
- [ ] **Zero-Hyphen UI Copy Verified:** Playwright DOM text walker confirms zero `-` characters appear in rendered UI headings, buttons, tabs, or badges on `/composer`.
- [ ] **Strict LaTeX Math Rendering:** All matrices, Dirac kets, angles, and butterfly equations render via KaTeX with zero Unicode math symbols in raw prose.
- [ ] **60 FPS Scrubber & Drag-and-Drop Responsiveness:** `chrome-devtools` MCP performance trace confirms dragging gates and scrubbing across an $8$-qubit ($256$-state) circuit executes in $< 4\text{ ms}$ per frame with zero main-thread blocking.