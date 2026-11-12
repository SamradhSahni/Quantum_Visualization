# Master Study Material & Interactive Documentation Specification: FRQI QHED, QPIE QHED, and NEQR Gradient

> **Document Version:** 3.0.0 (Complete Academic Study Material & Interactive Engineering Blueprint)  
> **Target Routes:** `/architectures`, `/architectures/frqi-qhed`, `/architectures/qpie-qhed`, `/architectures/neqr-gradient`  
> **Target Stack:** Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS v4, KaTeX, SVG/Canvas Interactive Sandboxes) + FastAPI (Async Python 3.12, Qiskit Aer 1.15+, NumPy)  
> **Agent Directive Compliance:** Strict adherence to `antigravity_master_skills_manifest_router.md` and `SKILL.md` (`design-system/MASTER.md`)

---

## Table of Contents
0. [Antigravity IDE Autonomous Execution Protocol & Skill Routing](#0-antigravity-ide-autonomous-execution-protocol--skill-routing)
1. [Foundations of Quantum Image Processing (QIP): Complete Study Material](#1-foundations-of-quantum-image-processing-qip-complete-study-material)
   - [1.1 Why Quantum Image Processing? Classical vs. Quantum Paradigm](#11-why-quantum-image-processing-classical-vs-quantum-paradigm)
   - [1.2 The Three Stages of Every Quantum Vision Pipeline](#12-the-three-stages-of-every-quantum-vision-pipeline)
   - [1.3 Master Taxonomic Comparison: FRQI vs. QPIE vs. NEQR](#13-master-taxonomic-comparison-frqi-vs-qpie-vs-neqr)
2. [Module 1: FRQI + QHED (`/architectures/frqi-qhed`) — Complete Study Material & Page Spec](#2-module-1-frqi--qhed-architecturesfrqi-qhed--complete-study-material--page-spec)
   - [2.1 Conceptual Foundations & Physical Intuition](#21-conceptual-foundations--physical-intuition)
   - [2.2 Complete Mathematical Formulation & Step-by-Step Derivations](#22-complete-mathematical-formulation--step-by-step-derivations)
   - [2.3 Horizontal & Vertical Pass Quantum Circuits & Gate Roles](#23-horizontal--vertical-pass-quantum-circuits--gate-roles)
   - [2.4 Step-by-Step Data Passing Walkthrough (Concrete Numerical Trace)](#24-step-by-step-data-passing-walkthrough-concrete-numerical-trace)
   - [2.5 Interactive Visualizations & How Results Change with Parameters](#25-interactive-visualizations--how-results-change-with-parameters)
   - [2.6 Capabilities, Advantages, Disadvantages & Planetary Applications](#26-capabilities-advantages-disadvantages--planetary-applications)
3. [Module 2: QPIE + QHED (`/architectures/qpie-qhed`) — Complete Study Material & Page Spec](#3-module-2-qpie--qhed-architecturesqpie-qhed--complete-study-material--page-spec)
   - [3.1 Conceptual Foundations & Physical Intuition](#31-conceptual-foundations--physical-intuition)
   - [3.2 Complete Mathematical Formulation & Step-by-Step Derivations](#32-complete-mathematical-formulation--step-by-step-derivations)
   - [3.3 Horizontal & Vertical Pass Quantum Circuits & Gate Roles](#33-horizontal--vertical-pass-quantum-circuits--gate-roles)
   - [3.4 Step-by-Step Data Passing Walkthrough (Concrete Numerical Trace)](#34-step-by-step-data-passing-walkthrough-concrete-numerical-trace)
   - [3.5 Interactive Visualizations & How Results Change with Parameters](#35-interactive-visualizations--how-results-change-with-parameters)
   - [3.6 Capabilities, Advantages, Disadvantages & Planetary Applications](#36-capabilities-advantages-disadvantages--planetary-applications)
4. [Module 3: NEQR + Quantum Gradient (`/architectures/neqr-gradient`) — Complete Study Material & Page Spec](#4-module-3-neqr--quantum-gradient-architecturesneqr-gradient--complete-study-material--page-spec)
   - [4.1 Conceptual Foundations & Physical Intuition](#41-conceptual-foundations--physical-intuition)
   - [4.2 Complete Mathematical Formulation & Step-by-Step Derivations](#42-complete-mathematical-formulation--step-by-step-derivations)
   - [4.3 Horizontal & Vertical Pass Quantum Circuits & Subtractor Networks](#43-horizontal--vertical-pass-quantum-circuits--subtractor-networks)
   - [4.4 Step-by-Step Data Passing Walkthrough (Concrete Binary Trace)](#44-step-by-step-data-passing-walkthrough-concrete-binary-trace)
   - [4.5 Interactive Visualizations & How Results Change with Parameters](#45-interactive-visualizations--how-results-change-with-parameters)
   - [4.6 Capabilities, Advantages, Disadvantages & Planetary Applications](#46-capabilities-advantages-disadvantages--planetary-applications)
5. [Interactive Documentation Page Architecture, Wireframes & API Contracts](#5-interactive-documentation-page-architecture-wireframes--api-contracts)
6. [Curated Academic Reading List, Seminal Literature & Agent Verification Gate](#6-curated-academic-reading-list-seminal-literature--agent-verification-gate)

---

## 0. Antigravity IDE Autonomous Execution Protocol & Skill Routing

> **MANDATORY AGENT DIRECTIVE:**  
> When implementing the three interactive documentation pages (`/architectures/frqi-qhed`, `/architectures/qpie-qhed`, `/architectures/neqr-gradient`) and their supporting interactive patch-simulation endpoints, the Google Antigravity agent (`agy`) **MUST** follow `antigravity_master_skills_manifest_router.md` and `SKILL.md`.

### 0.1 Required Skills & MCP Servers for the Documentation & Study Suite

| Execution Layer | Classification | Required Antigravity Skills | Required Free MCP Servers |
| :--- | :--- | :--- | :--- |
| **AST Indexing, Planning & TDD** | `[MANDATORY]` | `graphify`, `superpowers` (`/brainstorming`, `/write-plan`), `code-review-graph`, `context-mode`, `caveman`, `systematic-debugging` | `context7`, `deepwiki`, `sequential-thinking` |
| **Design System & Interactive UI** | `[MANDATORY]` | `ui-ux-pro-max`, `frontend-design`, `react-best-practices`, `web-design-guidelines`, `vercel-optimize`, `typescript-pro` | `context7`, `shadcn`, `chrome-devtools`, `playwright` |
| **Quantum Simulation Sandbox API** | `[MANDATORY]` | `fastapi-expert`, `modern-python`, `api-designer`, `security-reviewer`, `static-analysis` | `context7`, `deepwiki`, `fetch` |
| **End-to-End Browser & Math QA** | `[MANDATORY]` | `webapp-testing` (Playwright E2E), `test-driven-development` | `playwright`, `chrome-devtools` (Lighthouse) |

### 0.2 Strict `SKILL.md` & `ui-ux-pro-max` Design Rules for Documentation Pages
1. **Typography:**
   - Headings and prose must use `Geist` (or `Manrope`).
   - All qubit registers (`q0..q5`, `c0..c7`), ket vectors ($|\psi\rangle$), rotation angles ($\theta_i$), binary bitstrings, and probabilities must use `Geist Mono` (`Caption 1`, `Caption 3`, `Caption 4`).
   - **No Italics in UI Chrome:** All UI text, navigation tabs, badges, and buttons must have `font-style: normal`. Mathematical equations rendered via KaTeX follow standard mathematical typesetting.
   - **Zero Hyphens in Visible UI Labels:** Never render a hyphen (`-`) in any heading, button, tab, badge, or prose label. Render `FRQI QHED`, `QPIE QHED`, `NEQR Gradient`, `Two Qubit Gate`, `Eight Bit Grayscale`, `Signal to Noise Ratio`, and `Step by Step Data Flow`.
2. **Flat Dark Surface Hierarchy:**
   - Base Page Canvas: `#000000`
   - Documentation Content Container / Interactive Sandbox Well: `#181818`
   - Elevated Formula Card / Circuit Board / Parameter Control Card: `#1F1F1F`
   - Interactive Hover / Active Slider Well: `#272727`
   - Border Stroke: Full 4-sided `1px solid #313131` (never single-sided `border-b` or `border-t` dividers; separate sections using `Spacing-600` ($48\text{px}$) or `Spacing-800` ($80\text{px}$) vertical whitespace).
3. **Concentric Nested Radius Formula:**
   $$\text{R}_{\text{inner}} = \max\left(4\text{px}, \text{R}_{\text{outer}} - \text{Gap}\right)$$
   An outer documentation card with `rounded-2xl` ($16\text{px}$) and `p-2` ($8\text{px}$ gap) must house inner interactive circuit canvases with `rounded-lg` ($8\text{px}$).

---

## 1. Foundations of Quantum Image Processing (QIP): Complete Study Material

*This section provides the foundational educational text to be displayed on the `/architectures` overview page and introductory drawers across the platform.*

### 1.1 Why Quantum Image Processing? Classical vs. Quantum Paradigm

#### The Classical Spatial Convolution Bottleneck
In classical computer vision, a digital grayscale image of resolution $N = 2^n \times 2^n$ pixels is stored in random-access memory as a discrete two-dimensional matrix $\mathbf{I} \in \{0, 1, \dots, 255\}^{2^n \times 2^n}$. Classical edge detection operators—such as the Sobel $3 \times 3$ gradient, Robinson $8$-directional compass masks, or the Canny $5$-stage pipeline—must iterate over every pixel coordinate $(Y, X)$ and compute weighted linear combinations of its local neighborhood:
$$G(Y, X) = \sum_{u=-k}^{k} \sum_{v=-k}^{k} K(u, v) \cdot I(Y + u, X + v)$$
This imposes two fundamental limitations on planetary remote sensing imagery (such as Lunar Reconnaissance Orbiter Wide Angle Camera GeoTIFFs):
1. **Linear Computational Complexity $\mathcal{O}(2^{2n})$:** Every pixel must be fetched and convolved sequentially or across bounded SIMD cores. For an image of $2^n \times 2^n$ pixels, classical convolution requires at least $\mathcal{O}(2^{2n})$ arithmetic operations.
2. **Spatial Kernel Blur & Noise Amplification:** Finite $3 \times 3$ or $5 \times 5$ Gaussian and derivative kernels smear sharp, single-pixel geological fracture lines into $2\text{ to }3\text{ pixel}$ wide bands while amplifying high-frequency sensor shot noise across low-contrast lunar mare basins.

#### The Quantum Hilbert Space Advantage
Quantum Image Processing (QIP) maps the entire $2^n \times 2^n$ pixel array into a coherent quantum state $|\psi\rangle$ residing in a complex Hilbert space $\mathcal{H}$. Because $k$ qubits span a $2^k$-dimensional complex vector space $\mathcal{H} = (\mathbb{C}^2)^{\otimes k}$, an image containing $2^{2n}$ pixels requires only **$2n$ position qubits** to index every coordinate simultaneously in quantum superposition:
$$|Y\rangle |X\rangle = \frac{1}{2^n} \sum_{Y=0}^{2^n-1} \sum_{X=0}^{2^n-1} |y_{n-1}\dots y_0\rangle \otimes |x_{n-1}\dots x_0\rangle$$
For an $8 \times 8$ patch ($64$ pixels), $n = 3$, requiring only $2n = 6$ position qubits. For a full $512 \times 512$ image ($262,144$ pixels), $n = 9$, requiring only $2n = 18$ position qubits!

Once the image is encoded into $|\psi\rangle$, a **single unitary gate** (such as a Hadamard gate $H$ acting on a single least-significant position qubit) operates on **all $2^{2n}$ pixel pairs simultaneously** through quantum parallelism. Whilst quantum state preparation of arbitrary classical data requires $\mathcal{O}(2^{2n})$ gates, the **edge extraction stage itself** achieves an exponential speedup—reducing spatial gradient computation from $\mathcal{O}(2^{2n})$ classical operations down to $\mathcal{O}(1)$ Hadamard interference depth or $\mathcal{O}(\text{poly}(n))$ cyclic coordinate shift gates.

---

### 1.2 The Three Stages of Every Quantum Vision Pipeline

Every quantum edge detection architecture on this platform executes three distinct physical stages:

```
+---------------------------------------------------------------------------------------------------+
|                           THE THREE STAGES OF QUANTUM IMAGE PROCESSING                            |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  STAGE 1: STATE PREPARATION          STAGE 2: UNITARY INTERFERENCE       STAGE 3: MEASUREMENT     |
|  (Classical -> Quantum Encoding)     (Parallel Spatial Differentiation)  (Born Rule Reconstruction)|
|                                                                                                   |
|  Raw Patch I(Y,X) in [0, 255]        Horizontal & Vertical Passes        Shot Sampling / Collapse |
|         |                                   |                                   |                 |
|         +--> FRQI: Angle theta_i            +--> Even Pair Hadamard (H)         +--> P(edge) Map  |
|         |    (7 Qubits: 6 Pos + 1 Color)    |    Interferes (2k, 2k+1)          |    Thresholding |
|         |                                   |                                   |                 |
|         +--> QPIE: Amplitude alpha_i        +--> Odd Pair Shift (D_8) + H       +--> 10x10 Halo   |
|         |    (6 Qubits: Pure Statevector)   |    Interferes (2k+1, 2k+2)        |    Stitching    |
|         |                                   |                                   |                 |
|         +--> NEQR: 8-Bit Basis |c7..c0>     +--> Quantum Subtractor (U_sub)     +--> Exact Binary |
|              (14 Qubits: 6 Pos + 8 Gray)         Exact Basis Difference              Gradient Map |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

1. **Stage 1 — Quantum Image Representation (Encoding):** Translates classical pixel coordinates $(Y, X)$ and intensities $I(Y, X)$ into a normalized quantum statevector. The three canonical representations—**FRQI** (Phase Angle), **QPIE** (Probability Amplitude), and **NEQR** (Computational Basis)—differ fundamentally in how they trade qubit count against circuit depth and intensity precision.
2. **Stage 2 — Quantum Unitary Spatial Differentiation:** Computes horizontal ($\Delta_X$) and vertical ($\Delta_Y$) pixel differences across all coordinates in superposition.
   - In **QHED** (used by FRQI and QPIE), a Hadamard gate $H$ interferes adjacent probability amplitudes, causing identical neighboring pixels to cancel destructively ($\alpha_a - \alpha_b = 0$) and sharp edges to reinforce constructively.
   - In **Quantum Gradient** (used by NEQR), a reversible quantum ripple-borrow subtractor circuit computes the exact binary difference $|f(Y,X) - f(Y,X+1)|$ directly in the grayscale basis register.
3. **Stage 3 — Projective Measurement & Halo-Padded Reconstruction:** Measuring the quantum register collapses the superposition according to the Born rule $P(k) = |\langle k | \psi_{\text{out}} \rangle|^2$. By combining horizontal and vertical passes across $10 \times 10$ halo-padded windows, the platform reconstructs a seam-free $512 \times 512$ edge map.

---

### 1.3 Master Taxonomic Comparison: FRQI vs. QPIE vs. NEQR

| Architectural Dimension | FRQI + QHED (`frqi-qhed`) | QPIE + QHED (`qpie-qhed`) | NEQR + Quantum Gradient (`neqr-gradient`) |
| :--- | :--- | :--- | :--- |
| **Full Name** | Flexible Representation of Quantum Images + Quantum Hadamard Edge Detection | Quantum Probability Image Encoding + Quantum Hadamard Edge Detection | Novel Enhanced Quantum Representation + Quantum Arithmetic Gradient |
| **Seminal Authors** | Le, Dong & Hirota ($2011$) + Yao et al. ($2017$) | Yao et al. ($2017$) | Zhang, Lu, Gao & Wang ($2013$) |
| **Intensity Encoding Mechanism** | Single-qubit polar rotation angle $\theta_i \in [0, \frac{\pi}{2}]$ on $|c\rangle$ | Normalized statevector amplitude $\alpha_i = \frac{I_i}{\|\mathbf{I}\|_2}$ | $q$-bit binary computational basis state $\|c_{q-1}\dots c_0\rangle$ |
| **Qubit Formula ($2^n \times 2^n$ Image)** | $2n + 1$ qubits | $2n$ qubits | $2n + q$ qubits ($q=8$ for $8$-bit grayscale) |
| **Qubits for $8 \times 8$ Patch ($n=3$)** | **$7$ Qubits** ($6$ position + $1$ color) | **$6$ Qubits** ($6$ position + $0$ auxiliary) | **$14$ Qubits** ($6$ position + $8$ grayscale) |
| **Qubits for $512 \times 512$ Image ($n=9$)** | $19$ Qubits | $18$ Qubits | $26$ Qubits |
| **State Preparation Complexity** | $\mathcal{O}(2^{4n})$ naive; $\mathcal{O}(2^{2n})$ with Gray-code $CR_y$ | $\mathcal{O}(2^{2n})$ uniformly controlled rotations | $\mathcal{O}(q \cdot n \cdot 2^{2n})$ multi-controlled $C^{2n}X$ gates |
| **Edge Extraction Mechanism** | Trigonometric phase interference via Hadamard $H$ and Decrement $D_{2^n}$ | Linear amplitude interference via Hadamard $H$ and Decrement $D_{2^n}$ | Digital binary subtraction via Quantum Ripple-Borrow Subtractor $U_{\text{sub}}$ |
| **Edge Detection Gate Complexity** | $\mathcal{O}(\text{poly}(n))$ for shift + $\mathcal{O}(1)$ for $H$ | $\mathcal{O}(\text{poly}(n))$ for shift + $\mathcal{O}(1)$ for $H$ | $\mathcal{O}(q + n)$ Toffoli/CNOT arithmetic depth |
| **Analytical Edge Response** | $P_{\text{edge}} \propto 2\sin^2\left(\frac{\theta_a - \theta_b}{2}\right)$ | $P_{\text{edge}} \propto \frac{(I_a - I_b)^2}{2\|\mathbf{I}\|_2^2}$ | $\|\Delta I\| = \|I_a - I_b\|$ (Exact $8$-bit integer) |
| **Intensity Retrieval Accuracy** | Probabilistic (requires multiple shots to estimate $\sin^2\theta_i$) | Probabilistic (requires shots proportional to $\|\mathbf{I}\|_2^2$) | **Deterministic & Exact** ($100\%$ accurate in $1$ ideal basis readout) |
| **Contrast Normalization Behavior** | Absolute per-pixel mapping ($\theta_i$ independent of other pixels) | Global patch $L_2$ normalization (sensitive to total patch brightness) | Exact digital bit-level invariance (zero normalization distortion) |
| **Primary Planetary Strength** | Superior noise suppression in flat basins via $\sin^2(\Delta\theta/2)$ nonlinearity | Minimum qubit footprint ($6$ qubits); ultra-fast statevector simulation | Zero phase compression error; exact digital radiometric gradient |
| **Primary Limitation** | Trigonometric compression near $\theta \to \frac{\pi}{2}$; shot variance | Dark patches with low $\|\mathbf{I}\|_2$ require $\epsilon$-regularization | Highest qubit count ($14$ qubits per patch; $2^{14} = 16,384$ basis states) |

---

## 2. Module 1: FRQI + QHED (`/architectures/frqi-qhed`) — Complete Study Material & Page Spec

### 2.1 Conceptual Foundations & Physical Intuition
Proposed by Phuc Q. Le, Fangyan Dong, and Kaoru Hirota in $2011$, the **Flexible Representation of Quantum Images (FRQI)** mimics human retinotopic vision by separating **where** a pixel is located from **how bright** it is:
1. **The Coordinate Grid ($2n$ Position Qubits):** Six qubits ($q_5, q_4, q_3$ for the vertical row $Y \in \{0..7\}$ and $q_2, q_1, q_0$ for the horizontal column $X \in \{0..7\}$) form a uniform quantum superposition over all $64$ pixel locations of an $8 \times 8$ patch.
2. **The Bloch Sphere Intensity Pointer ($1$ Color Qubit $|c\rangle$):** A single additional qubit $|c\rangle$ acts as an analog intensity dial. Every pixel $(Y, X)$ is entangled with its own private rotation angle $\theta_{Y,X} \in [0, \frac{\pi}{2}]$ on $|c\rangle$:
   - A pitch-black crater shadow ($I = 0$) leaves the color qubit at the North Pole of the Bloch sphere: $\theta = 0 \implies \cos(0)|0\rangle + \sin(0)|1\rangle = |0\rangle$.
   - A brilliant sunlit crater rim ($I = 255$) rotates the color qubit to the South Pole: $\theta = \frac{\pi}{2} \implies \cos\left(\frac{\pi}{2}\right)|0\rangle + \sin\left(\frac{\pi}{2}\right)|1\rangle = |1\rangle$.
   - A mid-gray lunar regolith pixel ($I = 127.5$) rotates the color qubit to the equator: $\theta = \frac{\pi}{4} \implies \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$.

When combined with **Quantum Hadamard Edge Detection (QHED)**, a single Hadamard gate $H$ is applied to the least-significant position qubit ($q_0$ for horizontal edges, $q_3$ for vertical edges). Because the Hadamard gate maps $|0\rangle \to \frac{|0\rangle + |1\rangle}{\sqrt{2}}$ and $|1\rangle \to \frac{|0\rangle - |1\rangle}{\sqrt{2}}$, it physically forces the color state of pixel $a$ and the color state of its neighbor $b$ to **interfere**:
- **Destructive Interference (Flat Terrain):** If pixel $a$ and neighbor $b$ have identical brightness ($\theta_a = \theta_b$), their difference amplitude vanishes completely ($\cos\theta_a - \cos\theta_b = 0$ and $\sin\theta_a - \sin\theta_b = 0$). No edge probability is generated.
- **Constructive Interference (Crater Rim Boundary):** If pixel $a$ is dark ($\theta_a \approx 0$) and neighbor $b$ is bright ($\theta_b \approx \frac{\pi}{2}$), their phase angle difference $|\theta_a - \theta_b|$ is large, producing a high probability of measuring $|q_0 = 1\rangle$.

---

### 2.2 Complete Mathematical Formulation & Step-by-Step Derivations

#### Step 1: Angle Mapping & Initial Ground State
Given an $8 \times 8$ patch ($n = 3$, $N = 2^{2n} = 64$ pixels) with $8$-bit grayscale intensities $I_i \in [0, 255]$ indexed in raster order $i = 8Y + X \in \{0, 1, \dots, 63\}$, convert each intensity into a polar angle $\theta_i$:
$$\theta_i = \frac{\pi}{2} \cdot \frac{I_i}{255}, \quad \theta_i \in \left[0, \frac{\pi}{2}\right]$$
The $7$-qubit register starts in the all-zero ground state:
$$|\psi_0\rangle = |0\rangle_c \otimes |000000\rangle_{YX} = |0\rangle^{\otimes 7}$$

#### Step 2: Uniform Superposition via Hadamard Layer
Applying a tensor product of $6$ Hadamard gates $\mathcal{H}_{\text{pos}} = I_c \otimes H^{\otimes 6}$ to the position register creates an equal superposition of all $64$ pixel coordinates:
$$|\psi_1\rangle = (I_c \otimes H^{\otimes 6}) |\psi_0\rangle = \frac{1}{2^3} |0\rangle_c \otimes \sum_{i=0}^{63} |i\rangle_{YX} = \frac{1}{8} \sum_{i=0}^{63} |0\rangle_c \otimes |i\rangle_{YX}$$

#### Step 3: Controlled Rotation Entanglement ($\mathcal{R}_{\text{FRQI}}$)
For each pixel index $i \in \{0, \dots, 63\}$, construct a $6$-quit controlled $Y$-rotation operator $C^6 R_y(2\theta_i)$ that rotates the color qubit $|c\rangle$ by $2\theta_i$ around the Bloch $Y$-axis if and only if the position register equals $|i\rangle$:
$$R_y(2\theta_i) = \begin{pmatrix} \cos\theta_i & -\sin\theta_i \\ \sin\theta_i & \cos\theta_i \end{pmatrix}$$
$$U_i = I_c \otimes \sum_{j \ne i} |j\rangle\langle j| + R_y(2\theta_i) \otimes |i\rangle\langle i|$$
Applying the product $\mathcal{R}_{\text{FRQI}} = \prod_{i=0}^{63} U_i$ to $|\psi_1\rangle$ yields the canonical **FRQI Quantum State**:
$$|\psi_{\text{FRQI}}\rangle = \frac{1}{8} \sum_{i=0}^{63} \left( \cos\theta_i |0\rangle_c + \sin\theta_i |1\rangle_c \right) \otimes |i\rangle_{YX}$$
Expanding the statevector explicitly shows paired adjacent pixels $(2k, 2k+1)$:
$$|\psi_{\text{FRQI}}\rangle = \frac{1}{8} \begin{pmatrix} \cos\theta_0 \\ \sin\theta_0 \\ \cos\theta_1 \\ \sin\theta_1 \\ \vdots \\ \cos\theta_{63} \\ \sin\theta_{63} \end{pmatrix} \in \mathbb{C}^{128}$$

#### Step 4: Horizontal Even-Pair Hadamard Interference (Pass 1)
To compute the horizontal gradient between even-indexed columns $2k$ (where $q_0 = 0$) and odd-indexed columns $2k+1$ (where $q_0 = 1$), apply a single Hadamard gate $H$ to the least-significant column qubit $q_0$:
$$H = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$
Let $a = 2k$ (where $|i\rangle = |k\rangle_{q_5..q_1}|0\rangle_{q_0}$) and $b = 2k+1$ (where $|i\rangle = |k\rangle_{q_5..q_1}|1\rangle_{q_0}$). Before the Hadamard gate on $q_0$, the two-pixel subspace for pair $k \in \{0, \dots, 31\}$ is:
$$|\psi_{\text{pair}}^{(k)}\rangle = \frac{1}{8} |k\rangle_{q_5..q_1} \otimes \left[ \left(\cos\theta_a |0\rangle_c + \sin\theta_a |1\rangle_c\right)|0\rangle_{q_0} + \left(\cos\theta_b |0\rangle_c + \sin\theta_b |1\rangle_c\right)|1\rangle_{q_0} \right]$$
Applying $H$ to $|q_0\rangle$ substitutes $|0\rangle_{q_0} \to \frac{|0\rangle_{q_0} + |1\rangle_{q_0}}{\sqrt{2}}$ and $|1\rangle_{q_0} \to \frac{|0\rangle_{q_0} - |1\rangle_{q_0}}{\sqrt{2}}$:
$$(I \otimes H)|\psi_{\text{pair}}^{(k)}\rangle = \frac{1}{8\sqrt{2}} |k\rangle_{q_5..q_1} \otimes \Bigg\{ \Big[ (\cos\theta_a + \cos\theta_b)|0\rangle_c + (\sin\theta_a + \sin\theta_b)|1\rangle_c \Big] |0\rangle_{q_0} + \Big[ (\cos\theta_a - \cos\theta_b)|0\rangle_c + (\sin\theta_a - \sin\theta_b)|1\rangle_c \Big] |1\rangle_{q_0} \Bigg\}$$
Notice the structure of the output state:
- The $|q_0 = 0\rangle$ branch stores the **spatial average (low-pass sum)** of the two neighboring pixels.
- The $|q_0 = 1\rangle$ branch stores the **spatial derivative (high-pass difference)** of the two neighboring pixels!

#### Step 5: Exact Trigonometric Derivation of Born Edge Probability
When we measure the quantum register in the computational basis and post-select outcomes where the least-significant qubit collapses to $|q_0 = 1\rangle$, the total probability of measuring pair $k$ in the difference state (summing over both color basis states $|c = 0\rangle$ and $|c = 1\rangle$) is:
$$P_{\text{raw}}(k, q_0=1) = \left| \frac{\cos\theta_a - \cos\theta_b}{8\sqrt{2}} \right|^2 + \left| \frac{\sin\theta_a - \sin\theta_b}{8\sqrt{2}} \right|^2$$
Factoring out the normalization constant $\frac{1}{128}$:
$$P_{\text{raw}}(k, q_0=1) = \frac{1}{128} \left[ (\cos\theta_a - \cos\theta_b)^2 + (\sin\theta_a - \sin\theta_b)^2 \right]$$
Expanding the squares using $\cos^2\theta + \sin^2\theta = 1$ and the cosine difference identity $\cos\theta_a\cos\theta_b + \sin\theta_a\sin\theta_b = \cos(\theta_a - \theta_b)$:
$$(\cos\theta_a - \cos\theta_b)^2 + (\sin\theta_a - \sin\theta_b)^2 = (\cos^2\theta_a + \sin^2\theta_a) + (\cos^2\theta_b + \sin^2\theta_b) - 2(\cos\theta_a\cos\theta_b + \sin\theta_a\sin\theta_b)$$
$$= 2 - 2\cos(\theta_a - \theta_b) = 4\sin^2\left(\frac{\theta_a - \theta_b}{2}\right)$$
Substituting back and multiplying by the $2^{2n} = 64$ patch scaling factor gives the normalized **FRQI-QHED Edge Confidence** for boundary $(a, b)$:
$$P_{\text{edge}}(a, b) = 64 \cdot P_{\text{raw}}(k, q_0=1) = 2\sin^2\left(\frac{|\theta_a - \theta_b|}{2}\right) \in [0, 1]$$
Since $\theta_a, \theta_b \in [0, \frac{\pi}{2}]$, the maximum possible angle difference is $|\theta_a - \theta_b| = \frac{\pi}{2}$, yielding a maximum normalized edge probability of $2\sin^2(\frac{\pi}{4}) = 2 \cdot \left(\frac{1}{\sqrt{2}}\right)^2 = 1.0$.

#### Step 6: Horizontal Odd-Pair Pass via Quantum Decrement Unitary $D_8$ (Pass 2)
Pass 1 only compares even pairs $(0,1), (2,3), (4,5), (6,7)$, leaving odd boundaries $(1,2), (3,4), (5,6)$ unmeasured. In Pass 2, before applying the Hadamard gate on $q_0$, we apply the $3$-qubit **Cyclic Amplitude Permutation (Decrement) Unitary** $D_8$ to the column register $(q_2, q_1, q_0)$:
$$D_8 |x\rangle = |(x - 1) \bmod 8\rangle = \begin{pmatrix} 0 & 1 & 0 & 0 & \dots & 0 \\ 0 & 0 & 1 & 0 & \dots & 0 \\ \vdots & \vdots & \vdots & \ddots & \vdots & \vdots \\ 1 & 0 & 0 & 0 & \dots & 0 \end{pmatrix}_{8 \times 8}$$
This shifts pixel $1 \to 0$, pixel $2 \to 1$, pixel $3 \to 2$, etc., placing all odd boundaries $(1,2), (3,4), (5,6)$ into the even-pair slots $(0,1), (2,3), (4,5)$ so the Hadamard gate on $q_0$ interferes them identically!

#### Step 7: Vertical Even & Odd Passes (Passes 3 & 4) and 2D Gradient Fusion
Repeating the exact same procedure on the row register $(q_5, q_4, q_3)$—applying $H$ to the row LSB qubit $q_3$ for Vertical Even pairs (Pass 3) and applying $D_8$ on $(q_5, q_4, q_3)$ followed by $H$ on $q_3$ for Vertical Odd pairs (Pass 4)—yields the vertical gradient probability $P_y(Y, X)$. The final 2D edge confidence at coordinate $(Y, X)$ is fused via the Euclidean magnitude norm:
$$C_{\text{FRQI}}(Y, X) = \min\left(1.0, \sqrt{P_x(Y, X)^2 + P_y(Y, X)^2}\right)$$

---

### 2.3 Horizontal & Vertical Pass Quantum Circuits & Gate Roles

#### Circuit A: FRQI-QHED Horizontal Pass (`q0, q1, q2` Column Interference)
```
=====================================================================================================
FRQI QHED HORIZONTAL PASS CIRCUIT (7 QUBITS: 6 POSITION + 1 COLOR QUBIT)
=====================================================================================================
Wire         Stage 0: Init   Stage 1: Superpos   Stage 2: FRQI Entangle   Stage 3: Shift D8   Stage 4: QHED   Stage 5: Readout
-----------------------------------------------------------------------------------------------------
q0 (col 0):  |0> -------------[ H ]---------------o---------o--------------[ X ]---o---o-------[ H ]-----------[ M ] (Diff Bit)
                                                  |         |                      |   |
q1 (col 1):  |0> -------------[ H ]---------------o---------o----------------------(+)--o-------[   ]-----------[ M ] (Col 1)
                                                  |         |                          |
q2 (col 2):  |0> -------------[ H ]---------------o---------o--------------------------(+)------[   ]-----------[ M ] (Col 2)
                                                  |         |
q3 (row 0):  |0> -------------[ H ]---------------o---------o-----------------------------------[   ]-----------[ M ] (Row 0)
                                                  |         |
q4 (row 1):  |0> -------------[ H ]---------------o---------o-----------------------------------[   ]-----------[ M ] (Row 1)
                                                  |         |
q5 (row 2):  |0> -------------[ H ]---------------o---------o-----------------------------------[   ]-----------[ M ] (Row 2)
                                                  |         |
|c> (color): |0> -------------[ I ]--------------[Ry(2t_0)]-[Ry(2t_63)]-------------------------[   ]-----------[ M ] (Phase |c>)
=====================================================================================================
Note: Stage 3 (Ripple-Carry Decrement D8: X on q0 -> CX(q0,q1) -> CCX(q0,q1,q2)) is bypassed on Pass 1
      (Even Pairs) and active on Pass 2 (Odd Pairs).
```

#### Circuit B: FRQI-QHED Vertical Pass (`q3, q4, q5` Row Interference)
```
=====================================================================================================
FRQI QHED VERTICAL PASS CIRCUIT (7 QUBITS: 6 POSITION + 1 COLOR QUBIT)
=====================================================================================================
Wire         Stage 0: Init   Stage 1: Superpos   Stage 2: FRQI Entangle   Stage 3: Shift D8   Stage 4: QHED   Stage 5: Readout
-----------------------------------------------------------------------------------------------------
q0 (col 0):  |0> -------------[ H ]---------------o---------o-----------------------------------[   ]-----------[ M ] (Col 0)
                                                  |         |
q1 (col 1):  |0> -------------[ H ]---------------o---------o-----------------------------------[   ]-----------[ M ] (Col 1)
                                                  |         |
q2 (col 2):  |0> -------------[ H ]---------------o---------o-----------------------------------[   ]-----------[ M ] (Col 2)
                                                  |         |
q3 (row 0):  |0> -------------[ H ]---------------o---------o--------------[ X ]---o---o-------[ H ]-----------[ M ] (Diff Bit)
                                                  |         |                      |   |
q4 (row 1):  |0> -------------[ H ]---------------o---------o----------------------(+)--o-------[   ]-----------[ M ] (Row 1)
                                                  |         |                          |
q5 (row 2):  |0> -------------[ H ]---------------o---------o--------------------------(+)------[   ]-----------[ M ] (Row 2)
                                                  |         |
|c> (color): |0> -------------[ I ]--------------[Ry(2t_0)]-[Ry(2t_63)]-------------------------[   ]-----------[ M ] (Phase |c>)
=====================================================================================================
Note: In the Vertical Pass, the Ripple-Carry Decrement D8 and Hadamard interference gate [H] move to
      the Row Register (q3, q4, q5), interfering (Y, X) with (Y+1, X) across all columns in parallel!
```

#### Physical Role of Every Gate in FRQI-QHED
1. **`H` on `q0..q5` (Stage 1):** Creates a $64$-state uniform coordinate grid so all pixels are processed simultaneously.
2. **`C6-Ry(2*theta_i)` on `|c>` (Stage 2):** Rotates the color qubit by $2\theta_i$ for coordinate $|i\rangle$. Using Gray-code ordering of basis states, adjacent $C^6 R_y$ gates share $5$ identical control bits, allowing pairs of multi-controlled rotations to cancel into compact CNOT + single-qubit $R_y$ ladders.
3. **`X(q0) -> CX(q0,q1) -> CCX(q0,q1,q2)` (Stage 3 Decrement $D_8$):** Implements modular subtraction $|x\rangle \to |(x-1) \bmod 8\rangle$ in quantum hardware without classical memory movement.
4. **`H` on `q0` or `q3` (Stage 4 QHED):** The core quantum interferometer. Combines even/odd amplitude pairs into sum ($|0\rangle$) and difference ($|1\rangle$) subspaces.

---

### 2.4 Step-by-Step Data Passing Walkthrough (Concrete Numerical Trace)

*This interactive walkthrough widget appears on `/architectures/frqi-qhed`, allowing users to inspect how two real lunar pixels travel through every gate.*

Suppose the active $8 \times 8$ patch straddles a sharp lunar crater rim at row $Y = 3$:
- **Pixel A** at $(Y=3, X=2)$ is inside the shadowed crater floor: $I_a = 38$.
- **Pixel B** at $(Y=3, X=3)$ is on the sunlit crater rim: $I_b = 218$.
- **Pixel C** at $(Y=3, X=4)$ is also on the sunlit rim: $I_c = 220$.

| Pipeline Step | Mathematical Operation | Pixel Pair $(A, B)$: Rim Edge ($38$ vs. $218$) | Pixel Pair $(B, C)$: Flat Rim ($218$ vs. $220$) |
| :--- | :--- | :--- | :--- |
| **1. Raw Input Intensity** | $I \in [0, 255]$ | $I_a = 38, \quad I_b = 218$ | $I_b = 218, \quad I_c = 220$ |
| **2. Binary Coordinate Ket** | $\|Y\rangle\|X\rangle = \|q_5 q_4 q_3\rangle \|q_2 q_1 q_0\rangle$ | $A: \|011\rangle\|010\rangle, \quad B: \|011\rangle\|011\rangle$ | $B: \|011\rangle\|011\rangle, \quad C: \|011\rangle\|100\rangle$ |
| **3. FRQI Angle Mapping** | $\theta = \frac{\pi}{2} \cdot \frac{I}{255}\text{ rad}$ | $\theta_a = 0.2341\text{ rad}, \quad \theta_b = 1.3429\text{ rad}$ | $\theta_b = 1.3429\text{ rad}, \quad \theta_c = 1.3552\text{ rad}$ |
| **4. Color State Preparation** | $\cos\theta\|0\rangle_c + \sin\theta\|1\rangle_c$ | $A: 0.9727\|0\rangle + 0.2320\|1\rangle$<br>$B: 0.2259\|0\rangle + 0.9741\|1\rangle$ | $B: 0.2259\|0\rangle + 0.9741\|1\rangle$<br>$C: 0.2139\|0\rangle + 0.9768\|1\rangle$ |
| **5. Pass Selection & Shift** | Even Pass ($A,B$) vs. Odd Pass $D_8$ ($B,C$) | Pass 1 (Even): $q_0 \in \{0, 1\}$ directly | Pass 2 (Odd): $D_8$ shifts $\|011\rangle \to \|010\rangle$, $\|100\rangle \to \|011\rangle$ |
| **6. Hadamard Diff Amplitude** | $\Delta_{\cos} = \frac{\cos\theta_1 - \cos\theta_2}{\sqrt{2}}$<br>$\Delta_{\sin} = \frac{\sin\theta_1 - \sin\theta_2}{\sqrt{2}}$ | $\Delta_{\cos} = \frac{0.9727 - 0.2259}{1.4142} = +0.5281$<br>$\Delta_{\sin} = \frac{0.2320 - 0.9741}{1.4142} = -0.5247$ | $\Delta_{\cos} = \frac{0.2259 - 0.2139}{1.4142} = +0.0085$<br>$\Delta_{\sin} = \frac{0.9741 - 0.9768}{1.4142} = -0.0019$ |
| **7. Born Edge Probability** | $P_x = \Delta_{\cos}^2 + \Delta_{\sin}^2 = 2\sin^2\left(\frac{\Delta\theta}{2}\right)$ | $P_x = (0.5281)^2 + (-0.5247)^2 = \mathbf{0.5542}$ | $P_x = (0.0085)^2 + (-0.0019)^2 = \mathbf{0.000076}$ |
| **8. Threshold Verdict ($\tau = 0.25$)** | $P_x \ge \tau \implies \text{Edge Pixel}$ | **STRONG EDGE DETECTED ($0.5542 \ge 0.25$)** | **DESTRUCTIVE CANCELLATION ($0.000076 \approx 0$)** |

---

### 2.5 Interactive Visualizations & How Results Change with Parameters

On `/architectures/frqi-qhed`, users can manipulate four live interactive sliders to observe how the quantum circuit output adapts to specific scientific needs:

1. **Quantum Shot Count ($S \in \{256, 1024, 4096, 16384, \text{Statevector } \infty\}$):**
   - **Mathematical Effect:** When executing on finite-shot QASM hardware or shot-based `AerSimulator`, each basis state probability $P_i$ is estimated from multinomial counts $N_i \sim \text{Binomial}(S, P_{\text{raw}, i})$ with standard error:
     $$\sigma_{P} = \sqrt{\frac{P_{\text{edge}}(1 - P_{\text{edge}})}{S_{\text{effective}}}}$$
   - **How Results Change:** At $S = 256$ shots, quantum projection noise ("speckle grain") appears in low-contrast regions. Increasing to $S = 4096$ or $S = 16384$ smooths the probability distribution toward the noiseless statevector limit, isolating ultra-faint secondary crater rays.
2. **Phase Scaling Gain ($\alpha \in [0.5, 2.0]$ in $\theta_i = \min(\frac{\pi}{2}, \alpha \frac{\pi}{2}\frac{I_i}{255})$):**
   - **Mathematical Effect:** Stretches the angular separation $\Delta\theta$ for low-albedo lunar regions (such as permanently shadowed polar craters where $I_i \in [5, 45]$).
   - **How Results Change:** Setting $\alpha = 1.8$ expands tiny intensity differences ($\Delta I = 15$) into large Bloch sphere rotations ($\Delta\theta = 0.27\text{ rad}$), revealing hidden interior floor fractures that standard classical Sobel filters miss completely.
3. **Decision Threshold ($\tau \in [0.05, 0.80]$):**
   - **How Results Change:** Lowering $\tau \to 0.12$ captures subtle regolith texture boundaries and ejecta blankets; raising $\tau \to 0.45$ isolates only the steepest primary impact crater rims at $1$-pixel thinness.
4. **Boundary Halo Mode (`Cyclic 8x8 Naive` vs. `10x10 Halo Padded`):**
   - **How Results Change:** Toggling to `Cyclic 8x8 Naive` visually demonstrates the false $8\text{-pixel}$ grid seams caused by $D_8$ wrapping $|7\rangle \to |0\rangle$. Switching to `10x10 Halo Padded` immediately eliminates every seam across the reconstructed tile.

---

### 2.6 Capabilities, Advantages, Disadvantages & Planetary Applications

#### Key Advantages
- **Non-Linear Sinusoidal Noise Suppression:** Because $P_{\text{edge}} = 2\sin^2(\Delta\theta / 2) \approx \frac{(\Delta\theta)^2}{2}$ for small $\Delta\theta$, tiny thermal sensor fluctuations ($\Delta I \le 3$) are quadratically suppressed toward zero, yielding cleaner interiors than linear spatial kernels.
- **Minimal Auxiliary Qubit Overhead:** Requires only **one** additional qubit ($|c\rangle$) regardless of image resolution ($7$ qubits for $8 \times 8$; $19$ qubits for $512 \times 512$).
- **Absolute Radiometric Mapping:** Each pixel's rotation angle $\theta_i$ depends solely on its own intensity $I_i$, making FRQI immune to global brightness shifts elsewhere in the patch.

#### Disadvantages & Engineering Trade-offs
- **State Preparation Depth:** Preparing $64$ independent angles requires up to $64$ multi-controlled $R_y$ rotations ($\mathcal{O}(2^{2n})$ depth), which on near-term NISQ hardware incurs two-qubit gate decoherence unless compiled with Gray-code cancellation or executed on parameterized statevector workers.
- **Trigonometric Saturation at Extreme Contrast:** Because $\sin(\Delta\theta / 2)$ flattens near $\Delta\theta \to \frac{\pi}{2}$, differences between $I=200$ and $I=255$ are slightly compressed compared to mid-range transitions.

---

## 3. Module 2: QPIE + QHED (`/architectures/qpie-qhed`) — Complete Study Material & Page Spec

### 3.1 Conceptual Foundations & Physical Intuition
Introduced by Xi-Wei Yao et al. in $2017$ (*Quantum Image Processing and Its Application to Edge Detection: Theory and Experiment*), **Quantum Probability Image Encoding (QPIE)** asks a bold question: *Can we eliminate the color qubit $|c\rangle$ entirely and store pixel intensities directly in the complex probability amplitudes of the position register itself?*

In QPIE, an $8 \times 8$ image patch ($64$ pixels) is treated as a $64$-dimensional classical vector $\mathbf{I} = [I_0, I_1, \dots, I_{63}]^T$. By normalizing this vector by its Euclidean $L_2$ norm $\|\mathbf{I}\|_2$, the normalized pixel values satisfy the quantum unit-probability condition $\sum_{i=0}^{63} |\alpha_i|^2 = 1$ and can be loaded directly as the amplitudes of a **$6$-qubit register** ($q_5 q_4 q_3 q_2 q_1 q_0$).
- **Zero Auxiliary Qubits:** QPIE uses $6$ qubits instead of FRQI's $7$ qubits (cutting the Hilbert space dimension in half from $128$ to $64$) and instead of NEQR's $14$ qubits (cutting the Hilbert space dimension by $256\times$ from $16,384$ down to $64$!).
- **Direct Linear Difference:** When the Hadamard gate $H$ is applied to $q_0$, the interference amplitude is directly proportional to the exact linear intensity difference $\frac{I_a - I_b}{\sqrt{2}\|\mathbf{I}\|_2}$ without any trigonometric sine/cosine compression.

---

### 3.2 Complete Mathematical Formulation & Step-by-Step Derivations

#### Step 1: $L_2$ Energy Normalization & Regularization
Given an $8 \times 8$ patch with pixel intensities $I_i \in [0, 255]$ for $i = 8Y + X \in \{0, \dots, 63\}$, compute the regularized $L_2$ Euclidean norm:
$$\|\mathbf{I}\|_2 = \sqrt{\sum_{i=0}^{63} I_i^2 + \epsilon}, \quad \epsilon = 10^{-8}$$
where $\epsilon$ prevents division by zero in completely dark lunar shadow patches ($I_i = 0 \,\,\forall i$). Define the normalized probability amplitudes:
$$\alpha_i = \frac{I_i}{\|\mathbf{I}\|_2} \implies \sum_{i=0}^{63} |\alpha_i|^2 = 1$$

#### Step 2: QPIE State Preparation ($\mathcal{U}_{\text{QPIE}}$)
Prepare the $6$-qubit position register $|YX\rangle = |q_5 q_4 q_3 q_2 q_1 q_0\rangle$ in the **QPIE Quantum State** via recursive Mottonen / Shende-Bullock-Markov uniformly controlled $R_y$ multiplexing:
$$|\psi_{\text{QPIE}}\rangle = \mathcal{U}_{\text{QPIE}} |0\rangle^{\otimes 6} = \sum_{i=0}^{63} \alpha_i |i\rangle = \sum_{Y=0}^{7} \sum_{X=0}^{7} \alpha_{8Y+X} |Y\rangle_{q_5 q_4 q_3} \otimes |X\rangle_{q_2 q_1 q_0}$$

#### Step 3: Horizontal Even-Pair Hadamard Interference (Pass 1)
Apply a single Hadamard gate $H$ to the least-significant column qubit $q_0$ ($U_{\text{even}} = I^{\otimes 5} \otimes H$):
$$(I^{\otimes 5} \otimes H) |\psi_{\text{QPIE}}\rangle = \frac{1}{\sqrt{2}} \sum_{k=0}^{31} |k\rangle_{q_5..q_1} \otimes \Big[ (\alpha_{2k} + \alpha_{2k+1})|0\rangle_{q_0} + (\alpha_{2k} - \alpha_{2k+1})|1\rangle_{q_0} \Big]$$
Writing this in matrix form shows the block-diagonal Hadamard butterfly acting on every adjacent pair of amplitudes simultaneously:
$$(I^{\otimes 5} \otimes H) \begin{pmatrix} \alpha_0 \\ \alpha_1 \\ \alpha_2 \\ \alpha_3 \\ \vdots \\ \alpha_{62} \\ \alpha_{63} \end{pmatrix} = \frac{1}{\sqrt{2}} \begin{pmatrix} \alpha_0 + \alpha_1 \\ \alpha_0 - \alpha_1 \\ \alpha_2 + \alpha_3 \\ \alpha_2 - \alpha_3 \\ \vdots \\ \alpha_{62} + \alpha_{63} \\ \alpha_{62} - \alpha_{63} \end{pmatrix}$$

#### Step 4: Horizontal Odd-Pair Decrement Shift $D_8$ + Hadamard (Pass 2)
To obtain gradients across odd column boundaries $(2k+1, 2k+2)$, apply the $3$-qubit decrement gate $D_8$ to the column register $(q_2, q_1, q_0)$ before applying $H$ on $q_0$:
$$|\psi_{\text{shifted}}\rangle = (I^{\otimes 3} \otimes D_8) |\psi_{\text{QPIE}}\rangle = [\alpha_1, \alpha_2, \alpha_3, \dots, \alpha_{63}, \alpha_0]^T$$
$$(I^{\otimes 5} \otimes H)(I^{\otimes 3} \otimes D_8)|\psi_{\text{QPIE}}\rangle = \frac{1}{\sqrt{2}} \begin{pmatrix} \alpha_1 + \alpha_2 \\ \alpha_1 - \alpha_2 \\ \alpha_3 + \alpha_4 \\ \alpha_3 - \alpha_4 \\ \vdots \\ \alpha_{63} + \alpha_0 \\ \alpha_{63} - \alpha_0 \end{pmatrix}$$

#### Step 5: Born Measurement & Global Norm Restoration (Crucial Fix)
Measuring the state in the computational basis and post-selecting $|q_0 = 1\rangle$ yields the raw measurement probability for boundary $(a, b)$:
$$P_{\text{raw}}(a, b) = \left| \frac{\alpha_a - \alpha_b}{\sqrt{2}} \right|^2 = \frac{(I_a - I_b)^2}{2 \|\mathbf{I}\|_2^2}$$
**Critical Radiometric Restoration:** Notice that $P_{\text{raw}}(a,b)$ is divided by the patch energy $\|\mathbf{I}\|_2^2$. If a patch is very dark (e.g., $I \in [5, 15]$), $\|\mathbf{I}\|_2$ is small, which would artificially inflate $P_{\text{raw}}$ compared to a bright sunlit patch! To guarantee uniform contrast across all $4,096$ patches of a $512 \times 512$ image, the platform restores the global radiometric scale via:
$$G_x(Y, X) = \frac{\sqrt{2 \cdot P_{\text{raw}, x}(Y, X)} \cdot \|\mathbf{I}\|_2}{255} = \frac{|I(Y, X) - I(Y, X+1)|}{255} \in [0, 1]$$
Combining horizontal and vertical passes yields the normalized QPIE edge confidence:
$$C_{\text{QPIE}}(Y, X) = \min\left(1.0, \sqrt{G_x(Y, X)^2 + G_y(Y, X)^2}\right)$$

---

### 3.3 Horizontal & Vertical Pass Quantum Circuits & Gate Roles

#### Circuit A: QPIE-QHED Horizontal Pass (6 Qubits — Zero Auxiliary Qubits)
```
=====================================================================================================
QPIE QHED HORIZONTAL PASS CIRCUIT (6 QUBITS: PURE AMPLITUDE ENCODING)
=====================================================================================================
Wire         Stage 0: Init   Stage 1: Amplitude Tree (U_QPIE)     Stage 2: Col Shift D8   Stage 3: QHED   Stage 4: Readout
-----------------------------------------------------------------------------------------------------
q0 (col 0):  |0> -------------[                              ]-----[ X ]---o---o-----------[ H ]-----------[ M ] (LSB Diff)
                              [  Mottonen / SBM Multiplexed  ]             |   |
q1 (col 1):  |0> -------------[  Uniformly Controlled Ry     ]------------(+)--o-----------[   ]-----------[ M ] (Col 1)
                              [  Amplitude Preparation Tree  ]                 |
q2 (col 2):  |0> -------------[  |psi> = sum(alpha_i |i>)    ]----------------(+)----------[   ]-----------[ M ] (Col 2)
                              [                              ]
q3 (row 0):  |0> -------------[  64 Pixel Amplitudes Loaded  ]-----------------------------[   ]-----------[ M ] (Row 0)
                              [  into 6-Qubit Statevector    ]
q4 (row 1):  |0> -------------[                              ]-----------------------------[   ]-----------[ M ] (Row 1)
                              [                              ]
q5 (row 2):  |0> -------------[                              ]-----------------------------[   ]-----------[ M ] (Row 2)
=====================================================================================================
```

#### Circuit B: QPIE-QHED Vertical Pass (6 Qubits — Row Register Interference)
```
=====================================================================================================
QPIE QHED VERTICAL PASS CIRCUIT (6 QUBITS: ROW REGISTER SHIFT & HADAMARD)
=====================================================================================================
Wire         Stage 0: Init   Stage 1: Amplitude Tree (U_QPIE)     Stage 2: Row Shift D8   Stage 3: QHED   Stage 4: Readout
-----------------------------------------------------------------------------------------------------
q0 (col 0):  |0> -------------[                              ]-----------------------------[   ]-----------[ M ] (Col 0)
                              [  Mottonen / SBM Multiplexed  ]
q1 (col 1):  |0> -------------[  Uniformly Controlled Ry     ]-----------------------------[   ]-----------[ M ] (Col 1)
                              [  Amplitude Preparation Tree  ]
q2 (col 2):  |0> -------------[  |psi> = sum(alpha_i |i>)    ]-----------------------------[   ]-----------[ M ] (Col 2)
                              [                              ]
q3 (row 0):  |0> -------------[  64 Pixel Amplitudes Loaded  ]-----[ X ]---o---o-----------[ H ]-----------[ M ] (Row Diff)
                              [  into 6-Qubit Statevector    ]             |   |
q4 (row 1):  |0> -------------[                              ]------------(+)--o-----------[   ]-----------[ M ] (Row 1)
                              [                              ]                 |
q5 (row 2):  |0> -------------[                              ]----------------(+)----------[   ]-----------[ M ] (Row 2)
=====================================================================================================
Note: Applying H to q3 interferes basis states |y2 y1 0 x2 x1 x0> and |y2 y1 1 x2 x1 x0>, which
      correspond to vertically adjacent pixels (Y, X) and (Y+1, X) separated by stride 8 in memory!
```

---

### 3.4 Step-by-Step Data Passing Walkthrough (Concrete Numerical Trace)

Consider the same $8 \times 8$ lunar crater patch where the total patch $L_2$ norm across all $64$ pixels is $\|\mathbf{I}\|_2 = 1120.0$:
- **Pixel A** at $(Y=3, X=2)$: $I_a = 38$
- **Pixel B** at $(Y=3, X=3)$: $I_b = 218$
- **Pixel C** at $(Y=3, X=4)$: $I_c = 220$

| Pipeline Step | Mathematical Operation | Pixel Pair $(A, B)$: Rim Edge ($38$ vs. $218$) | Pixel Pair $(B, C)$: Flat Rim ($218$ vs. $220$) |
| :--- | :--- | :--- | :--- |
| **1. Raw Input Intensity** | $I \in [0, 255]$, $\|\mathbf{I}\|_2 = 1120.0$ | $I_a = 38, \quad I_b = 218$ | $I_b = 218, \quad I_c = 220$ |
| **2. Amplitude Encoding** | $\alpha_i = \frac{I_i}{\|\mathbf{I}\|_2}$ | $\alpha_a = \frac{38}{1120} = 0.03393$<br>$\alpha_b = \frac{218}{1120} = 0.19464$ | $\alpha_b = 0.19464$<br>$\alpha_c = \frac{220}{1120} = 0.19643$ |
| **3. Hadamard Sum Branch ($\|q_0=0\rangle$)** | $\alpha_{\text{sum}} = \frac{\alpha_1 + \alpha_2}{\sqrt{2}}$ | $\frac{0.03393 + 0.19464}{1.4142} = +0.16162$ | $\frac{0.19464 + 0.19643}{1.4142} = +0.27653$ |
| **4. Hadamard Diff Branch ($\|q_0=1\rangle$)** | $\alpha_{\text{diff}} = \frac{\alpha_1 - \alpha_2}{\sqrt{2}}$ | $\frac{0.03393 - 0.19464}{1.4142} = -0.11364$ | $\frac{0.19464 - 0.19643}{1.4142} = -0.00126$ |
| **5. Raw Born Probability** | $P_{\text{raw}} = \|\alpha_{\text{diff}}\|^2$ | $P_{\text{raw}} = (-0.11364)^2 = \mathbf{0.012914}$ | $P_{\text{raw}} = (-0.00126)^2 = \mathbf{0.0000016}$ |
| **6. Norm-Restored Gradient** | $G_x = \frac{\sqrt{2 P_{\text{raw}}} \cdot \|\mathbf{I}\|_2}{255}$ | $G_x = \frac{180}{255} = \mathbf{0.7059}$ | $G_x = \frac{2}{255} = \mathbf{0.0078}$ |
| **7. Threshold Verdict ($\tau = 0.25$)** | $G_x \ge \tau \implies \text{Edge Pixel}$ | **STRONG EDGE DETECTED ($0.7059 \ge 0.25$)** | **DESTRUCTIVE CANCELLATION ($0.0078 < 0.25$)** |

---

### 3.5 Interactive Visualizations & How Results Change with Parameters

On `/architectures/qpie-qhed`, users can interactively adjust three QPIE-specific parameters:
1. **Shadow Norm Floor ($\epsilon_{\text{floor}} \in [1.0, 500.0]$ in $\|\mathbf{I}\|_{\text{reg}} = \sqrt{\|\mathbf{I}\|_2^2 + \epsilon_{\text{floor}}^2}$):**
   - **How Results Change:** In permanently shadowed lunar craters where almost all pixels are near zero ($I \le 8$), a tiny $\|\mathbf{I}\|_2$ makes QPIE hyper-sensitive to $1\text{-count}$ dark current noise under finite shots. Raising $\epsilon_{\text{floor}} \to 250$ stabilizes the denominator and suppresses shadow speckle.
2. **Amplitude Exponent ($\gamma \in [0.5, 2.0]$ in $\alpha_i \propto I_i^\gamma$):**
   - **How Results Change:** Setting $\gamma < 1.0$ (e.g., $\gamma = 0.6$) compresses bright highland glare and boosts faint shadowed crater walls before Hadamard interference; setting $\gamma > 1.0$ (e.g., $\gamma = 1.5$) suppresses mid-tone regolith texture and isolates only specular rim crests.
3. **Readout Mode (`Raw Born Probability |\alpha_diff|^2` vs. `L2 Norm Restored Gradient`):**
   - **How Results Change:** Lets researchers visually compare unnormalized Born probabilities (where dark patches appear artificially bright and bright patches appear dim) against the $L_2$ norm-restored physical gradient.

---

### 3.6 Capabilities, Advantages, Disadvantages & Planetary Applications

#### Key Advantages
- **Maximum Qubit Efficiency:** Uses the theoretical minimum number of qubits ($2n = 6$ qubits for $8 \times 8$; $18$ qubits for $512 \times 512$), enabling $2\times$ faster classical statevector simulation than FRQI and $256\times$ faster simulation than NEQR.
- **Exact Linear Difference Response:** Free of trigonometric $\sin(\Delta\theta/2)$ compression, preserving linear proportionality $|I_a - I_b|$ across the entire $[0, 255]$ dynamic range.

#### Disadvantages & Engineering Trade-offs
- **Global $L_2$ Coupling Under Finite Shots:** Because each pixel's amplitude is divided by $\|\mathbf{I}\|_2$, a patch containing many bright pixels has a large $\|\mathbf{I}\|_2$, reducing the per-pixel measurement probability $P_{\text{raw}}$ and requiring higher shot counts $S$ to maintain high signal-to-noise ratio.

---

## 4. Module 3: NEQR + Quantum Gradient (`/architectures/neqr-gradient`) — Complete Study Material & Page Spec

### 4.1 Conceptual Foundations & Physical Intuition
Published by Yi Zhang, Kai Lu, Yinghui Gao, and Mo Wang in $2013$, the **Novel Enhanced Quantum Representation (NEQR)** resolves the two main drawbacks of analog quantum representations (FRQI and QPIE): probabilistic intensity readout and trigonometric/normalization distortion.

Instead of encoding brightness into a continuous rotation angle $\theta_i$ or a continuous probability amplitude $\alpha_i$, **NEQR encodes the exact $8$-bit binary integer of every pixel into the computational basis state of an $8$-qubit grayscale register** $|c_7 c_6 c_5 c_4 c_3 c_2 c_1 c_0\rangle$:
- For an $8 \times 8$ patch, NEQR allocates **$6$ position qubits** ($|Y\rangle|X\rangle$) plus **$8$ grayscale basis qubits** ($|c_7\dots c_0\rangle$), totaling **$14$ qubits**.
- If pixel $(Y=3, X=2)$ has intensity $I = 142$, its binary representation is $10001110_2$. In the NEQR superposition, the basis state $|Y=011, X=010\rangle$ is entangled with the exact basis ket $|10001110\rangle_c$.
- Because pixel values are stored as digital quantum bits ($|0\rangle$ and $|1\rangle$), we can execute **exact reversible quantum digital arithmetic**—specifically a **Quantum Ripple-Borrow Subtractor ($U_{\text{sub}}$)**—to subtract neighboring pixel registers in superposition with zero analog approximation error!

---

### 4.2 Complete Mathematical Formulation & Step-by-Step Derivations

#### Step 1: Binary Basis Decomposition & 14-Qubit Ground State
For an $8 \times 8$ patch ($n = 3$) with $q = 8$-bit grayscale intensities $f(Y, X) \in \{0, 1, \dots, 255\}$, express each intensity in binary:
$$f(Y, X) = \sum_{k=0}^{7} c_k(Y, X) \cdot 2^k, \quad c_k(Y, X) \in \{0, 1\}$$
Initialize the $14$-qubit register ($8$ color qubits + $6$ position qubits) in the ground state and apply $H^{\otimes 6}$ to the position qubits:
$$|\psi_1\rangle = (I^{\otimes 8} \otimes H^{\otimes 6}) |0\rangle^{\otimes 8} |0\rangle^{\otimes 6} = \frac{1}{8} \sum_{Y=0}^{7} \sum_{X=0}^{7} |00000000\rangle_c \otimes |Y\rangle |X\rangle$$

#### Step 2: Digital Basis Entanglement via Multi-Controlled NOT ($\Omega_{Y,X}$)
For each coordinate $(Y, X)$, define the bit-setting operator $\Omega_{Y,X}$ as a tensor product of CNOT/Toffoli gates controlled on the $6$-qubit position state $|Y\rangle|X\rangle$ that flips color qubit $|c_k\rangle$ from $|0\rangle \to |1\rangle$ if and only if the $k$-th bit of $f(Y, X)$ is $1$:
$$\Omega_{Y,X} |00000000\rangle_c = \bigotimes_{k=0}^{7} X^{c_k(Y,X)} |0\rangle = |c_7 c_6 c_5 c_4 c_3 c_2 c_1 c_0\rangle_c = |f(Y, X)\rangle_c$$
Applying $\mathcal{U}_{\text{NEQR}} = \prod_{Y=0}^{7}\prod_{X=0}^{7} \left( I_c \otimes \sum_{(y,x)\ne(Y,X)} |y,x\rangle\langle y,x| + \Omega_{Y,X} \otimes |Y,X\rangle\langle Y,X| \right)$ yields the **NEQR Quantum State**:
$$|\psi_{\text{NEQR}}\rangle = \frac{1}{8} \sum_{Y=0}^{7} \sum_{X=0}^{7} |f(Y, X)\rangle_c \otimes |Y\rangle |X\rangle$$

#### Step 3: Coordinate Shift & Neighbor Alignment
To compute the horizontal gradient $\Delta_X f(Y, X) = |f(Y, X) - f(Y, X+1)|$, align the intensity register of coordinate $(Y, X)$ with the shifted intensity register of coordinate $(Y, X+1)$ prepared via the cyclic shift unitary $U_{X+1}|Y\rangle|X\rangle = |Y\rangle|(X+1)\bmod 8\rangle$:
$$|\psi_{\text{aligned}}\rangle = \frac{1}{8} \sum_{Y=0}^{7} \sum_{X=0}^{7} |f(Y, X)\rangle_A \otimes |f(Y, X+1)\rangle_B \otimes |Y\rangle |X\rangle$$

#### Step 4: Quantum Ripple-Borrow Subtractor ($U_{\text{sub}}$) & Magnitude Extraction
A reversible $8$-bit **Quantum Ripple-Borrow Subtractor** cascades $8$ Quantum Full-Subtractor (QFS) stages from $k = 0$ (LSB) to $k = 7$ (MSB). At each bit stage $k$, given minuend bit $a_k$, subtrahend bit $b_k$, and incoming borrow bit $b_{\text{in}, k}$ (with $b_{\text{in}, 0} = 0$), the difference bit $d_k$ and outgoing borrow bit $b_{\text{out}, k}$ obey the exact Boolean equations over $\text{GF}(2)$:
$$d_k = a_k \oplus b_k \oplus b_{\text{in}, k}$$
$$b_{\text{out}, k} = (\overline{a_k} \cdot b_k) \oplus (\overline{a_k \oplus b_k} \cdot b_{\text{in}, k})$$
- If $f(Y, X) \ge f(Y, X+1)$, the final MSB borrow bit is $b_{\text{out}, 7} = 0$, and the output register directly holds the positive difference $D = f(Y, X) - f(Y, X+1)$.
- If $f(Y, X) < f(Y, X+1)$, the final MSB borrow bit is $b_{\text{out}, 7} = 1$, and the output register holds the $2$'s complement value $256 - |f(Y, X) - f(Y, X+1)|$. Applying a controlled two's-complement negation gated on the sign/borrow qubit $b_{\text{out}, 7}$ yields the exact unsigned absolute difference:
$$U_{\text{abs-sub}} |f(Y, X)\rangle |f(Y, X+1)\rangle = |f(Y, X)\rangle \otimes \big| |f(Y, X) - f(Y, X+1)| \big\rangle$$

#### Step 5: Exact Digital Gradient Fusion
Executing the horizontal subtractor gives the exact $8$-bit integer $|\Delta_X(Y, X)| \in \{0, \dots, 255\}$, and executing the vertical subtractor gives $|\Delta_Y(Y, X)| \in \{0, \dots, 255\}$. The normalized NEQR gradient confidence is:
$$C_{\text{NEQR}}(Y, X) = \min\left(1.0, \frac{\sqrt{\Delta_X(Y, X)^2 + \Delta_Y(Y, X)^2}}{255}\right)$$

---

### 4.3 Horizontal & Vertical Pass Quantum Circuits & Subtractor Networks

#### Circuit A: 14-Qubit NEQR State Preparation + Quantum Gradient Architecture
```
=====================================================================================================
NEQR QUANTUM GRADIENT CIRCUIT (14 QUBITS: 6 POSITION + 8 DIGITAL GRAYSCALE BASIS QUBITS)
=====================================================================================================
Register       Stage 0: Init   Stage 1: Grid   Stage 2: C6-X Basis Prep     Stage 3: Shift & Subtractor   Stage 4: Readout
-----------------------------------------------------------------------------------------------------
q0..q2 (Col):  |000> -----------[ H^3 ]-----------o---------o----------------[ Shift U_X+1 ]---------------[ M ] (Col X)
                                                  |         |                       |
q3..q5 (Row):  |000> -----------[ H^3 ]-----------o---------o----------------[   Identity  ]---------------[ M ] (Row Y)
                                                  |         |                       |
c0 (LSB 2^0):  |0>   ----------------------------(+)--------┼----------------[             ]---------------[ M ] (Diff d0)
c1 (Bit 2^1):  |0>   ----------------------------(+)--------(+)--------------[  8-Bit QFS  ]---------------[ M ] (Diff d1)
c2 (Bit 2^2):  |0>   -----------------------------|---------(+)--------------[  Ripple     ]---------------[ M ] (Diff d2)
...                                               |          |               [  Borrow     ]
c6 (Bit 2^6):  |0>   ----------------------------(+)--------┼----------------[  Subtractor ]---------------[ M ] (Diff d6)
c7 (MSB 2^7):  |0>   -----------------------------|---------(+)--------------[  |f_a - f_b|]---------------[ M ] (Diff d7)
                                              Pixel(0,0)  Pixel(7,7)
=====================================================================================================
```

#### Circuit B: Inside a Single Bit Stage $k$ of the Quantum Ripple-Borrow Subtractor (QFS Cell)
```
=====================================================================================================
QUANTUM FULL SUBTRACTOR (QFS) CELL FOR BIT STAGE k (CNOT + TOFFOLI BORROW PROPAGATION)
=====================================================================================================
b_in,k (Borrow In) : -----------------------o-------------------o----------------------- (Ancilla)
                                            |                   |
a_k (Minuend Bit)  : ---(+)---[ X ]---o-----┼---[ X ]-----------o----------------------- (Restored)
                         |            |     |                   |
b_k (Subtrahend)   : ----o------------o----(+)------------------o----------------------- (d_k = a_k ^ b_k ^ b_in)
                                      |                         |
b_out,k (Borrow Out): |0> -----------(+)-----------------------(+)---------------------- (To Stage k+1)
=====================================================================================================
Logic Verification:
1. First CX(b_k, a_k) computes a_k ^ b_k.
2. First CCX flips b_out,k if (~a_k & b_k) is 1.
3. CX(b_in,k, b_k) writes the final difference bit d_k = a_k ^ b_k ^ b_in,k into the b_k wire.
4. Second CCX flips b_out,k if ~(a_k ^ b_k) & b_in,k is 1, completing exact borrow propagation!
```

---

### 4.4 Step-by-Step Data Passing Walkthrough (Concrete Binary Trace)

Let us trace two adjacent lunar pixels at row $Y = 3$:
- **Pixel A** at $(Y=3, X=2)$ has intensity $I_a = 142 = 10001110_2$.
- **Pixel B** at $(Y=3, X=3)$ has intensity $I_b = 108 = 01101100_2$.

| Bit Index $k$ | Place Value $2^k$ | Minuend Bit $a_k$ ($142$) | Subtrahend Bit $b_k$ ($108$) | Incoming Borrow $b_{\text{in}, k}$ | Difference Bit $d_k = a_k \oplus b_k \oplus b_{\text{in}, k}$ | Outgoing Borrow $b_{\text{out}, k}$ |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| $k = 0$ (LSB) | $1$ | $0$ | $0$ | $0$ | $0 \oplus 0 \oplus 0 = \mathbf{0}$ | $0$ |
| $k = 1$ | $2$ | $1$ | $0$ | $0$ | $1 \oplus 0 \oplus 0 = \mathbf{1}$ | $0$ |
| $k = 2$ | $4$ | $1$ | $1$ | $0$ | $1 \oplus 1 \oplus 0 = \mathbf{0}$ | $0$ |
| $k = 3$ | $8$ | $1$ | $1$ | $0$ | $1 \oplus 1 \oplus 0 = \mathbf{0}$ | $0$ |
| $k = 4$ | $16$ | $0$ | $0$ | $0$ | $0 \oplus 0 \oplus 0 = \mathbf{0}$ | $0$ |
| $k = 5$ | $32$ | $0$ | $1$ | $0$ | $0 \oplus 1 \oplus 0 = \mathbf{1}$ | $1$ (Borrows from $k=6$) |
| $k = 6$ | $64$ | $0$ | $1$ | $1$ | $0 \oplus 1 \oplus 1 = \mathbf{0}$ | $1$ (Borrows from $k=7$) |
| $k = 7$ (MSB) | $128$ | $1$ | $0$ | $1$ | $1 \oplus 0 \oplus 1 = \mathbf{0}$ | $0$ (Sign $= +$) |

- **Quantum Output Register $|d_7 d_6 d_5 d_4 d_3 d_2 d_1 d_0\rangle$:** $|00100010\rangle_2 = 32 + 2 = \mathbf{34}$.
- **Verification:** $142 - 108 = 34$ (100% exact digital arithmetic with zero floating-point, trigonometric, or shot-sampling error!).

---

### 4.5 Interactive Visualizations & How Results Change with Parameters

On `/architectures/neqr-gradient`, users can interactively adjust three digital quantum arithmetic parameters:
1. **Grayscale Bit Depth ($q \in \{2, 4, 6, 8\}$ bits $\implies 8, 10, 12, 14$ Total Qubits):**
   - **Mathematical Effect:** Truncates the $8$-bit pixel intensity to its top $q$ most-significant bits: $f_q(Y, X) = \lfloor f(Y, X) / 2^{8-q} \rfloor$.
   - **How Results Change:** Reducing $q = 8 \to 4$ cuts the total qubit count from $14$ down to $10$ qubits ($16\times$ smaller statevector), creating distinct terraced elevation contours across smooth crater slopes while preserving sharp rim boundaries.
2. **MSB Hardware Comparator Gate (`Full 8-Bit Magnitude` vs. `MSB Carry Threshold |d7 OR d6>`):**
   - **Mathematical Effect:** In hardware implementations, instead of reading all $8$ difference bits, a quantum comparator checks whether any of the top $m$ MSBs ($d_7, d_6, d_5$) are $|1\rangle$ (indicating $|\Delta I| \ge 32, 64,$ or $128$).
   - **How Results Change:** Selecting `MSB Bit d6 (Delta >= 64)` produces a crisp hardware-native binary edge mask using a single ancilla measurement!
3. **Gradient Distance Norm ($L_1$ Manhattan vs. $L_2$ Euclidean vs. $L_\infty$ Chebyshev):**
   - **How Results Change:** $L_1 = |\Delta_X| + |\Delta_Y|$ enhances diagonal crater ejecta rays; $L_2 = \sqrt{\Delta_X^2 + \Delta_Y^2}$ provides isotropic orientation invariance; $L_\infty = \max(|\Delta_X|, |\Delta_Y|)$ mimics hardware-efficient quantum max-comparators.

---

### 4.6 Capabilities, Advantages, Disadvantages & Planetary Applications

#### Key Advantages
- **Deterministic 100% Precision:** Unlike FRQI and QPIE, every basis state in NEQR holds an exact $q$-bit binary number. Measuring a basis state yields the exact integer gradient without shot-noise variance on the intensity value itself.
- **Arbitrary Digital Logical Operations:** Enables bitwise morphological dilation/erosion, bit-plane slicing, exact histogram equalization, and overflow-free arithmetic directly in quantum hardware.

#### Disadvantages & Engineering Trade-offs
- **High Qubit & Gate Footprint:** Requires $2n + q = 14$ qubits for an $8 \times 8$ patch ($16,384$ statevector amplitudes) and deep Toffoli ($C^6 X$ and $CCX$) cascades, resulting in the highest classical simulation latency ($\sim 38\text{ms}$ vs. $18\text{ms}$ for FRQI) and highest NISQ decoherence sensitivity.

---

## 5. Interactive Documentation Page Architecture, Wireframes & API Contracts

### 5.1 Shared Documentation Page Wireframe (`/architectures/[slug]`)

Every one of the three documentation pages (`/architectures/frqi-qhed`, `/architectures/qpie-qhed`, `/architectures/neqr-gradient`) follows this unified, `SKILL.md`-compliant layout:

```
+---------------------------------------------------------------------------------------------------+
|  [Floating Navbar: Quantum Vision | Overview | Architectures (Active) | Studio | Benchmarks]      |
+---------------------------------------------------------------------------------------------------+
|  [Algorithm Sub-Nav Pills: [FRQI QHED (7 Qubits)]  [QPIE QHED (6 Qubits)]  [NEQR Gradient (14 Q)] |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [Badge: QUANTUM ARCHITECTURE ENCYCLOPEDIA & INTERACTIVE SANDBOX]                                 |
|                                                                                                   |
|  HEADLINE (Heading 1, Gradient #FFFFFF -> #9B9B9B, Max Width 680px):                              |
|  FRQI QHED: Flexible Representation and Hadamard Phase Interference                               |
|                                                                                                   |
|  KPI METRIC STRIP (4 Elevated Cards #1F1F1F, 1px #313131, Geist Mono):                            |
|  +-----------------------+ +-----------------------+ +-----------------------+ +----------------+ |
|  | Qubits Per 8x8 Patch  | | Encoding Mechanism    | | Edge Extraction Depth | | Peak Thinness  | |
|  | 7 Qubits (2n + 1)     | | Bloch Angle theta_i   | | O(1) Hadamard Gate    | | 55.6% (1px Rim)| |
|  +-----------------------+ +-----------------------+ +-----------------------+ +----------------+ |
|                                                                                                   |
|  (Spacing-700 [64px] Vertical Gap)                                                                |
|                                                                                                   |
|  SECTION 1: INTERACTIVE HORIZONTAL & VERTICAL CIRCUIT EXPLORER (#181818 Well, Nested Radii)       |
|  +----------------------------------------------------------------------------------------------+ |
|  | [Tab: Horizontal Pass (Col q0..q2)]  [Tab: Vertical Pass (Row q3..q5)]  [Pass: Even | Odd D8]| |
|  |                                                                                              | |
|  |  Interactive SVG Quantum Circuit (Click any gate to inspect its unitary matrix & role):      | |
|  |  q0: |0> ---[H]----o------[X]---o---o---[ H ]---[M]   <-- Active Gate Inspector Drawer       | |
|  |  q1: |0> ---[H]----o-----------(+)--o---[   ]---[M]       Gate: Hadamard Interferometer (H)  | |
|  |  ...                                                      Unitary: 1/sqrt(2) [[1,1],[1,-1]]  | |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  (Spacing-700 [64px] Vertical Gap)                                                                |
|                                                                                                   |
|  SECTION 2: LIVE 8x8 PATCH DATA PASSING & PARAMETER TUNING SANDBOX                                |
|  +----------------------------------------------+ +---------------------------------------------+ |
|  | INTERACTIVE 8x8 PATCH & PARAMETER CONTROLS   | | STEP BY STEP DATA FLOW & OUTPUT PREVIEW     | |
|  |                                              | |                                             | |
|  | Preset: [Crater Rim | Flat Mare | Diagonal]  | | Selected Pair: (3,2) I=38 vs (3,3) I=218    | |
|  | [8x8 Interactive Pixel Grid - Click 2 Cells] | | Step 1: Angle theta_a=0.23, theta_b=1.34    | |
|  |                                              | | Step 2: Amplitudes cos/sin prepared         | |
|  | Sliders (Live 60 FPS Recalculation):         | | Step 3: Hadamard Diff = +0.528, -0.525      | |
|  | * Quantum Shots (S):        [====o===] 4096  | | Step 4: Born Probability P_x = 0.5542       | |
|  | * Phase Gain / Bit Depth:   [===o====] 1.0x  | |                                             | |
|  | * Edge Threshold (tau):     [==o=====] 0.25  | | [Horiz Px Map] [Vert Py Map] [Fused Output] | |
|  | * Halo Seam Removal:        [ON: 10x10 Halo] | | (Live 8x8 -> 64x64 Magnified Previews)      | |
|  +----------------------------------------------+ +---------------------------------------------+ |
|                                                                                                   |
|  (Spacing-700 [64px] Vertical Gap)                                                                |
|                                                                                                   |
|  SECTION 3: COMPLETE MATHEMATICAL DERIVATION (KaTeX Display Blocks in #1F1F1F Cards)              |
|  SECTION 4: ADVANTAGES, DISADVANTAGES & PLANETARY REMOTE SENSING CAPABILITIES                     |
|  SECTION 5: CURATED ACADEMIC READING LIST & SEMINAL PAPERS                                        |
|  [CTA Footer: Test this Algorithm on Full 512x512 Lunar GeoTIFFs in Live Quantum Studio ->]       |
+---------------------------------------------------------------------------------------------------+
```

---

### 5.2 FastAPI Documentation Sandbox API Contract (`POST /api/v1/docs/simulate-patch`)

To power the interactive $8 \times 8$ sandbox on each documentation page with real Qiskit Aer execution (and instant client-side fallback), the backend exposes:

**Request Payload (`application/json`):**
```json
{
  "algorithm": "FRQI_QHED",
  "patch_8x8": [
    [38, 40, 42, 215, 218, 220, 221, 219],
    [39, 41, 44, 212, 219, 222, 220, 218],
    [37, 39, 41, 216, 220, 221, 219, 217],
    [36, 38, 38, 218, 220, 223, 221, 220],
    [35, 37, 40, 214, 217, 219, 218, 216],
    [38, 40, 43, 210, 215, 218, 217, 215],
    [37, 39, 41, 208, 214, 216, 215, 214],
    [36, 38, 40, 205, 212, 215, 214, 212]
  ],
  "inspect_coord": { "row": 3, "col": 2 },
  "parameters": {
    "shots": 4096,
    "threshold": 0.25,
    "phase_gain": 1.0,
    "bit_depth": 8,
    "halo_padding": true,
    "norm_type": "L2"
  }
}
```

**Response Payload (`application/json`):**
```json
{
  "algorithm": "FRQI_QHED",
  "algorithm_display": "FRQI QHED",
  "qubits_used": 7,
  "circuit_depth": 14,
  "execution_time_ms": 1.8,
  "horizontal_even_map": [[...], [...]],
  "horizontal_odd_map": [[...], [...]],
  "horizontal_combined_map": [[...], [...]],
  "vertical_combined_map": [[...], [...]],
  "fused_confidence_map": [[...], [...]],
  "binary_edge_map": [[...], [...]],
  "inspected_pair_trace": {
    "coord_a": [3, 2],
    "coord_b": [3, 3],
    "intensity_a": 38,
    "intensity_b": 218,
    "encoded_a": "theta_a = 0.2341 rad (cos=0.9727, sin=0.2320)",
    "encoded_b": "theta_b = 1.3429 rad (cos=0.2259, sin=0.9741)",
    "hadamard_sum_amplitude": 0.8475,
    "hadamard_diff_amplitude": 0.7444,
    "horiz_edge_prob": 0.5542,
    "vert_edge_prob": 0.0012,
    "fused_confidence": 0.5542,
    "is_edge": true
  }
}
```

---

## 6. Curated Academic Reading List, Seminal Literature & Agent Verification Gate

### 6.1 Primary Academic Literature (To Render in the "Reading Material" Section)
1. **FRQI Seminal Paper:**  
   Le, P. Q., Dong, F., & Hirota, K. ($2011$). *A flexible representation of quantum images for polynomial preparation, image compression, and processing operations.* Quantum Information Processing, $10(1)$, $63\text{--}84$.
2. **NEQR Seminal Paper:**  
   Zhang, Y., Lu, K., Gao, Y., & Wang, M. ($2013$). *NEQR: a novel enhanced quantum representation of digital images.* Quantum Information Processing, $12(8)$, $2833\text{--}2860$.
3. **QPIE & QHED Seminal Paper:**  
   Yao, X. W., Wang, H., Liao, Z., Chen, M. C., Pan, J., Li, J., ... & Suter, D. ($2017$). *Quantum image processing and its application to edge detection: theory and experiment.* Physical Review X, $7(3)$, $031041$.
4. **Quantum Arithmetic & Ripple-Borrow Subtractors:**  
   Thapliyal, H., & Ranganathan, N. ($2010$). *Design of efficient reversible logic-based binary and BCD adder circuits.* ACM Journal on Emerging Technologies in Computing Systems (JETC), $9(3)$, $1\text{--}31$.
5. **Comprehensive Survey of Quantum Image Representations:**  
   Yan, F., Iliyasu, A. M., & Venegas-Andraca, S. E. ($2016$). *A survey of quantum image representations.* Quantum Information Processing, $15(1)$, $1\text{--}35$.
6. **Quantum State Preparation & Mottonen Multiplexing:**  
   Mottonen, M., Vartiainen, J. J., Bergholm, V., & Salomaa, M. M. ($2004$). *Transformation of quantum states using uniformly controlled rotations.* Physical Review Letters, $93(13)$, $130502$.

---

### 6.2 Mandatory Antigravity Agent Definition of Done Checklist
Before marking the three documentation pages complete, the Antigravity agent (`agy`) **MUST** verify:
- [ ] **AST & Dependency Graph Synchronized:** `graphify .` and `code-review-graph build` include `/architectures`, `/architectures/frqi-qhed`, `/architectures/qpie-qhed`, `/architectures/neqr-gradient`, and `POST /api/v1/docs/simulate-patch`.
- [ ] **Zero-Hyphen UI Copy Verified:** Playwright DOM text walker confirms zero `-` characters appear in rendered headings, navigation tabs, badges, or prose across all three pages.
- [ ] **KaTeX Mathematical Rendering:** All inline ($...$) and display ($$...$$) equations render cleanly with zero raw LaTeX syntax leakage or Unicode math character fallbacks.
- [ ] **Horizontal & Vertical Circuit Interactivity:** Clicking between the `Horizontal Pass` and `Vertical Pass` tabs dynamically shifts the active decrement gate $D_8$ and Hadamard gate $H$ between the column register ($q_0, q_1, q_2$) and row register ($q_3, q_4, q_5$), updating the gate inspector drawer and numerical trace in real time.
- [ ] **Live Parameter Sensitivity Sliders:** Adjusting Shot Count ($S$), Phase Gain ($\alpha$), Bit Depth ($q$), Threshold ($\tau$), and Halo Mode updates the $8 \times 8$ horizontal, vertical, and fused edge maps at $60\text{ FPS}$.