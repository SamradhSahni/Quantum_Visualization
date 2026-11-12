
# Production-Grade Enhancement Blueprint: Quantum & Classical Edge Detection (All 6 Techniques)

> [!IMPORTANT]
> **Executive Engineering Summary:** This blueprint audits, debugs, and upgrades the architectural roadmap for the 6-method Quantum & Classical Edge Detection platform across [`algorithms.py`](file:///d:/Quantum_Edge_FRQI/backend/app/core/algorithms.py), [`metrics.py`](file:///d:/Quantum_Edge_FRQI/backend/app/core/metrics.py), [`frqi_qhed.py`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/frqi_qhed.py), [`qpie_qhed.py`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/qpie_qhed.py), [`neqr_gradient.py`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/neqr_gradient.py), [`halo_tiler.py`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/halo_tiler.py), [`StudioPage`](file:///d:/Quantum_Edge_FRQI/frontend/app/studio/page.tsx), [`UnifiedComparisonMatrix.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/UnifiedComparisonMatrix.tsx), [`ParallelQuantumViewer.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/ParallelQuantumViewer.tsx), [`PatchSandbox.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/architectures/PatchSandbox.tsx), and [`BenchmarkPage`](file:///d:/Quantum_Edge_FRQI/frontend/app/benchmark/page.tsx).

---

## 1. Critical Audit & Bug Resolution in the Original Draft

Before implementing new UI features, **five foundational bugs and architectural bottlenecks** in both the existing codebase and the initial enhancement draft must be corrected so that the mathematics, quantum physics, and browser performance are scientifically and operationally sound.

### 1.1 Bug Fix #1: FRQI-QHED Hilbert-Space Dilution ($1/32$ Factor), Color-Basis Marginalization, and Dual-Pass Completeness
* **The Flaw in Code & Draft:**
  1. [`run_frqi_qhed`](file:///d:/Quantum_Edge_FRQI/backend/app/core/algorithms.py#L158-L160) computes $2\sin(|\Delta\theta|/2)$ (amplitude), whereas [`PatchSandbox.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/architectures/PatchSandbox.tsx#L138-L139) computes $2\sin^2(|\Delta\theta|/2)$ (rescaled probability).
  2. In the initial draft, the shot-sampling proposal modeled each pixel independently as $k \sim \operatorname{Binomial}(S, P_{\text{edge}})$ with $P_{\text{edge}} = 2\sin^2(|\Delta\theta|/2)$. **This violates quantum mechanics:** in an $8 \times 8$ patch ($N = 64$ pixels, $2n = 6$ address qubits + $1$ color qubit = $7$ qubits), the uniform superposition prefix $\frac{1}{\sqrt{64}} = \frac{1}{8}$ dilutes every pixel's physical measurement probability by $\frac{1}{64}$.
  3. Furthermore, after the Hadamard gate on $q_0$, the odd-LSB difference branch $|q_0 = 1\rangle$ splits edge information across **both** computational states of the color qubit ($|0\rangle_c$ and $|1\rangle_c$):
     $$|\psi_{\text{diff}}(2k+1)\rangle = \frac{1}{8\sqrt{2}}\Big[(\cos\theta_{2k} - \cos\theta_{2k+1})|0\rangle_c + (\sin\theta_{2k} - \sin\theta_{2k+1})|1\rangle_c\Big]|2k+1\rangle$$
     Summing the Born probabilities of $(c=0, 2k+1)$ and $(c=1, 2k+1)$ via trig identity $(\cos\theta_A - \cos\theta_B)^2 + (\sin\theta_A - \sin\theta_B)^2 = 4\sin^2\!\left(\frac{\theta_A - \theta_B}{2}\right)$ yields the **exact physical circuit probability**:
     $$P_{\text{circuit}}(2k+1) = P(c{=}0, 2k{+}1) + P(c{=}1, 2k{+}1) = \frac{1}{128} \cdot 4\sin^2\!\left(\frac{\theta_{2k} - \theta_{2k+1}}{2}\right) = \frac{1}{32}\sin^2\!\left(\frac{\Delta\theta}{2}\right)$$
  4. **Missing Even/Odd Pass in FRQI:** Just like QPIE, a single Hadamard on $q_0$ only compares disjoint pairs $(0,1), (2,3), \dots, (62,63)$. Without a second circuit pass preceded by the cyclic decrement unitary $D_{64}$, half of the spatial boundaries $(1,2), (3,4), \dots$ are lost.
* **Production Fix:**
  * Define two distinct, explicitly labeled quantities in backend and UI:
    1. **Physical Circuit Born Probability:** $P_{\text{circuit}}(k) = \frac{1}{32}\sin^2\!\left(\frac{\Delta\theta_k}{2}\right) \in \left[0, \frac{1}{64}\right]$ (since $\Delta\theta \in [0, \pi/2] \implies \sin^2(\Delta\theta/2) \le \frac{1}{2}$).
    2. **Normalized Local Edge Response:** $\tilde{P}_{\text{edge}}(k) = 64 \cdot P_{\text{circuit}}(k) = 2\sin^2\!\left(\frac{\Delta\theta_k}{2}\right) \in [0, 1]$.
  * Model finite shots $S$ using **true patch-wide Multinomial sampling** across the $128$ basis states per pass (or specify $S_{\text{eff}} = S / 32$ effective shots per pixel pair) so users observe genuine Hilbert-space shot starvation at low shot counts.
  * Enforce the **4-Pass Complete Spatial Reconstruction** ($X$-Even, $X$-Odd via $D_{64}$, $Y$-Even, $Y$-Odd via transpose + $D_{64}$) identically across both FRQI-QHED and QPIE-QHED.

### 1.2 Bug Fix #2: QPIE-QHED Zero-Norm Singularity & Radiometric Shot-Noise Amplification
* **The Flaw in Code & Draft:**
  1. In QPIE-QHED, the patch L2 norm is $\gamma_p = \sqrt{\sum_{i=0}^{63} I_i^2}$. In deeply shadowed lunar crater floors where $I_i = 0$ across an $8 \times 8$ tile, $\gamma_p = 0$, causing division-by-zero (`NaN`) during state preparation $|\psi_p\rangle = \frac{1}{\gamma_p}\sum I_i |i\rangle$.
  2. When reconstructing the radiometric gradient via $\nabla_x = \frac{\sqrt{2}\,\gamma_p}{255}\sqrt{\hat{P}}$, any finite-shot fluctuation $\hat{P} = \frac{\text{counts}}{S}$ in a bright highland patch (where $\gamma_p \approx 8 \times 255 = 2040$) gets multiplied by $\gamma_p$. A single stray measurement shot in a bright flat patch produces a massive false edge spike of $\frac{\sqrt{2}(2040)}{255\sqrt{S}} \approx \frac{11.31}{\sqrt{S}}$.
* **Production Fix:**
  * Introduce a numerically stable norm floor $\gamma_p^{\text{safe}} = \max(\gamma_p, \epsilon_{\text{norm}})$ with $\epsilon_{\text{norm}} = 10^{-6}$, short-circuited by [`HaloTiler.is_flat_patch`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/halo_tiler.py#L47).
  * Expose the **Radiometric Shot-Noise Amplification Law** ($\sigma_{\nabla} \propto \frac{\gamma_p}{\sqrt{S}}$) in the QPIE formula inspector to explain why QPIE exhibits higher speckle noise in sunlit lunar highlands than FRQI under finite shots.

### 1.3 Bug Fix #3: NEQR Qubit Count Discrepancy (`14` Storage Qubits vs. `24` Active Subtractor Qubits)
* **The Flaw in Code & Draft:**
  * The draft labels NEQR-Gradient as a `14-Qubit` circuit while depicting a Quantum Full Subtractor (QFS) computing $d_k = a_k \oplus b_k \oplus b_{\text{in}}$.
  * **Quantum Architecture Reality:** A single NEQR state $|\Psi_{\text{NEQR}}\rangle = \frac{1}{8}\sum_{y,x} |c_7\dots c_0\rangle \otimes |y x\rangle$ requires $2n + q = 6 + 8 = 14$ qubits to **store** one image patch. However, because intensity bits $|c_7\dots c_0\rangle$ are computational basis states (orthogonal for different intensities, $\langle I_A | I_B \rangle = \delta_{I_A, I_B}$), a Hadamard gate on $q_0$ cannot subtract them. Performing coherent binary subtraction $|I_A - I_B|$ requires loading both neighbor intensities into **two parallel $q$-bit operand registers** ($|A\rangle$ and $|B\rangle$) plus $2$ borrow/sign ancilla qubits:
    $$Q_{\text{active}}(n, q) = 2n + 2q + 2 = 6 + 2(8) + 2 = 24 \text{ qubits (at } q=8\text{ bits)}$$
* **Production Fix:**

  * Explicitly distinguish **State Encoding Width** ($2n + q = 14$ qubits) from **Coherent QFS Execution Width** ($2n + 2q + 2 = 24$ qubits for $q=8$, scaling down to $6 + 2(2) + 2 = 12$ qubits at $q=2$).
  * Because simulating a 24-qubit statevector ($2^{24}$ complex amplitudes = $256\text{ MB}$ per tile) across $7,396$ tiles would crash the backend, implement a **Hybrid Dual-Execution Engine**:
    1. **Full-Image Studio Sweep (`algorithms.py`):** Vectorized bit-sliced Boolean array emulator in NumPy executing exact $q$-bit ripple-borrow logic (`a_k ^ b_k ^ b_in`) with exact gate-level Pauli-X bit-flip noise injection in $< 15\text{ ms}$.
    2. **Single-Pair Patch Sandbox (`neqr_gradient.py`):** Exact gate-level QFS circuit trace on the $2q + 2$ arithmetic sub-register for the user-selected pixel pair $(A, B)$.

### 1.4 Bug Fix #4: Otsu Thresholding Failure on Heavy-Tailed Lunar Edge Histograms & Missing Thinning Parity
* **The Flaw in Code & Draft:**
  1. Standard Otsu thresholding assumes a **bimodal histogram**. Real lunar edge magnitude maps are **unimodal and heavy-tailed** ($>88\%$ of pixels lie near $0$ in flat regolith/maria, with a thin exponential tail of crater rims). Standard Otsu places the threshold $\tau^*$ inside the background noise hump, over-saturating binary edge maps.
  2. Comparing Canny against raw FRQI, QPIE, NEQR, Sobel, and Robinson on Pratt's Figure of Merit (PFOM) is structurally biased because **only Canny includes Non-Maximum Suppression (NMS)** ($1\text{-px}$ ridge thinning), and PFOM heavily penalizes $2\text{--}3\text{ px}$ thick edges even when localization is perfect.
* **Production Fix:**
  * Upgrade thresholding to support three selectable modes: **Standard Otsu**, **High-Gradient Percentile / Unimodal Triangle (Rosin)**, and **Manual $\tau$ Slider**.
  * Add a global **Post-Detection Non-Maximum Suppression (NMS Thinning) Parity Toggle** across all 6 methods so researchers can benchmark **Raw Gradient Response** vs. **1-Pixel Thinned Ridge Response** on equal footing.

### 1.5 Bug Fix #5: Two-Tier Telemetry & Payload Architecture (Avoiding 30 MB JSON Freezes)
* **The Flaw in Draft:**
  * Streaming 64-element statevectors for every tile plus 5 full-resolution Canny stages and 8 full-resolution Robinson directional images in one initial `/api/studio/analyze` JSON payload generates $>30\text{ MB}$ of base64 strings, causing browser memory throttling and multi-second network lag.
* **Production Fix:**
  * **Tier 1 (Macro Sweep Payload, $< 200\text{ KB}$):** Return the 6 primary edge maps alongside a compact binary/float grid of per-tile scalars (`tile_means`, `tile_stds`, `culled_mask`, `gamma_p`, `max_delta_i` of shape $H_{\text{tiles}} \times W_{\text{tiles}}$).
  * **Tier 2 (Zero-Latency Local Dissector + On-Demand Endpoint):** Compute $8 \times 8$ patch statevectors, Sobel $3 \times 3$ MAC matrices, NEQR 8-bit borrow chains, and Robinson $3 \times 3$ sector convolutions **client-side in a deterministic TypeScript engine (`< 0.4 ms`)** as the cursor moves, while fetching full-resolution intermediate stage layers (e.g., Canny Stage 1–4 or Robinson Sector $k$) lazily only when that tab is opened.

---

## 2. Pillar 1 — Interactive Mathematical Pipeline (Formula DAG & Live Substitution)

Replace all static ASCII strings in [`frqi-qhed/page.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/app/architectures/frqi-qhed/page.tsx), [`ParallelQuantumViewer.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/ParallelQuantumViewer.tsx), and [`PatchSandbox.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/architectures/PatchSandbox.tsx) with a unified, interactive `<FormulaFlowBlock />` powered by `katex`.

### 2.1 Architecture of `<FormulaFlowBlock />`
```
+--------------------------------------------------------------------------------------------------+
| STAGE [1] -> [2] -> [3] -> [4] -> [5] -> [6]                 [Mode: Symbolic + Live Pixel (3,2)] |
+--------------------------------------------------------------------------------------------------+
| SYMBOLIC LAW:                                                                                    |
|   \tilde{P}_{\text{edge}}(A,B) = 64 \cdot \big(P(0, k_{\text{odd}}) + P(1, k_{\text{odd}})\big)   |
|                                = 2 \sin^2\!\left( \frac{|\theta_A - \theta_B|}{2} \right)        |
+--------------------------------------------------------------------------------------------------+
| LIVE NUMERIC EVALUATION (Pixel A=(3,2): I_A=38  <-->  Pixel B=(3,3): I_B=218):                   |
|   \theta_A = 0.2341\text{ rad}, \quad \theta_B = 1.3429\text{ rad}, \quad |\Delta\theta| = 1.1088 |
|   \tilde{P}_{\text{edge}} = 2 \sin^2(0.5544) = 0.5558 \ge \tau (0.2500) \implies \mathbf{EDGE}   |
+--------------------------------------------------------------------------------------------------+
```
* **Bi-Directional Variable Cross-Highlighting:** Wrapping KaTeX sub-expressions in `\htmlData{var="theta_A"}{...}` enables DOM hover listeners. Hovering $\theta_A$ highlights pixel $(y,x)$ on the $8 \times 8$ canvas and pulses the $CR_y(2\theta_i)$ gate in [`FRQICircuitSVG.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/circuits/FRQICircuitSVG.tsx).

### 2.2 Complete, Bug-Free 6-Technique Mathematical Specifications

#### 1. FRQI-QHED ($7$ Qubits: $6$ Position + $1$ Color)
1. **Angular Intensity Mapping:**
   $$\theta_i = \frac{\pi}{2} \cdot \frac{I_i}{255} \in \left[0, \frac{\pi}{2}\right], \qquad i \in \{0, 1, \dots, 63\}$$
2. **FRQI Superposition Encoding ($H^{\otimes 6}$ followed by $64$ Controlled-$R_y(2\theta_i)$ rotations):**
   $$|\Psi_0\rangle = \frac{1}{8} \sum_{i=0}^{63} \big(\cos\theta_i |0\rangle_c + \sin\theta_i |1\rangle_c\big) \otimes |i\rangle_p$$
3. **Dual-Pass Spatial Comparison ($I_{64}$ Even Pass & $D_{64}$ Odd Decrement Pass + Hadamard on $q_0$):**
   * **Pass 1 (Even Pairs $(2k, 2k+1)$):** Apply $I_c \otimes I^{\otimes 5} \otimes H_{q_0}$ directly to $|\Psi_0\rangle$.
   * **Pass 2 (Odd Pairs $(2k+1, 2k+2)$):** Apply cyclic decrement $D_{64}|i\rangle_p = |(i - 1) \bmod 64\rangle_p$ followed by $H_{q_0}$.
   * Resulting odd-LSB difference amplitude for adjacent pair $(A, B)$:
     $$|\psi_{\text{diff}}(A,B)\rangle = \frac{1}{8\sqrt{2}}\Big[(\cos\theta_A - \cos\theta_B)|0\rangle_c + (\sin\theta_A - \sin\theta_B)|1\rangle_c\Big] \otimes |k_{\text{odd}}\rangle_p$$
4. **Marginalized Color Born Probability & Rescaled Contrast:**
   $$P_{\text{circuit}}(A,B) = P(0_c, k_{\text{odd}}) + P(1_c, k_{\text{odd}}) = \frac{1}{32}\sin^2\!\left(\frac{\theta_A - \theta_B}{2}\right)$$
   $$\tilde{P}_x(A,B) = 64 \cdot P_{\text{circuit}}(A,B) = 2\sin^2\!\left(\frac{|\theta_A - \theta_B|}{2}\right) \in [0, 1]$$
5. **2D Non-Linear Magnitude Fusion:**
   $$E_{\text{FRQI}}(y,x) = \min\!\left(1, \sqrt{\tilde{P}_x(y,x)^2 + \tilde{P}_y(y,x)^2}\right)$$

#### 2. QPIE-QHED ($6$ Qubits: Pure Amplitude Encoding)
1. **Stabilized Patch L2 Norm & State Preparation:**
   $$\gamma_p = \sqrt{\sum_{i=0}^{63} I_i^2}, \qquad \gamma_p^{\text{safe}} = \max(\gamma_p, 10^{-6}), \qquad |\psi_p\rangle = \sum_{i=0}^{63} \frac{I_i}{\gamma_p^{\text{safe}}} |i\rangle$$
2. **Even & Odd Interleaved Hadamard Interference ($H$ on $q_0$ before and after $D_{64}$):**
   $$\alpha_{\text{diff}}(A,B) = \frac{I_A - I_B}{\sqrt{2}\,\gamma_p^{\text{safe}}}, \qquad P_{\text{QPIE}}(A,B) = |\alpha_{\text{diff}}(A,B)|^2 = \frac{(I_A - I_B)^2}{2(\gamma_p^{\text{safe}})^2}$$
3. **Radiometric Norm Restoration (Eliminating Patch Brightness Collapse):**
   $$\nabla_x(y,x) = \frac{\sqrt{2}\,\gamma_p^{\text{safe}}}{255}\sqrt{P_{\text{QPIE}, x}(y,x)} = \frac{|I_{y,x} - I_{y,x+1}|}{255}$$
4. **2D Euclidean Gradient Magnitude:**
   $$E_{\text{QPIE}}(y,x) = \min\!\left(1, \sqrt{\nabla_x(y,x)^2 + \nabla_y(y,x)^2}\right)$$

#### 3. NEQR-Gradient ($14$ Storage Qubits $\to 2n + 2q + 2$ Active QFS Qubits)
1. **Quantized $q$-Bit Decomposition ($q \in \{2, \dots, 8\}$):**
   $$I_{y,x}^{(q)} = \left\lfloor \frac{I_{y,x}}{2^{8-q}} \right\rfloor = \sum_{k=0}^{q-1} c_{y,x}^{(k)} 2^k, \qquad c_{y,x}^{(k)} \in \{0, 1\}$$
2. **Reversible Ripple-Borrow Quantum Full Subtractor (QFS) Cascade ($k = 0 \dots q-1$):**
   $$d_k = a_k \oplus b_k \oplus b_{\text{in}}^{(k)}, \qquad b_{\text{out}}^{(k)} = (\bar{a}_k \cdot b_k) \oplus \Big(\overline{(a_k \oplus b_k)} \cdot b_{\text{in}}^{(k)}\Big), \quad b_{\text{in}}^{(0)} = 0$$
3. **Sign-Borrow Controlled Two's-Complement Absolute Difference:**
   * Let $s = b_{\text{out}}^{(q-1)} \in \{0, 1\}$ denote the MSB underflow borrow flag ($s = 1 \iff I_A^{(q)} < I_B^{(q)}$).
   * Apply CNOT array controlled by $s$ to invert $d_k \leftarrow d_k \oplus s$, followed by a controlled increment $+s$:
     $$|\Delta I^{(q)}| = \left| I_A^{(q)} - I_B^{(q)} \right| = (d \oplus s^{\otimes q}) + s$$
4. **Normalized Orthogonal Gradient Merge:**
   $$E_{\text{NEQR}}(y,x) = \frac{1}{2^q - 1}\sqrt{\left|\Delta_x I^{(q)}(y,x)\right|^2 + \left|\Delta_y I^{(q)}(y,x)\right|^2}$$

#### 4. Classical Sobel $3 \times 3$ Discrete Operator ($0$ Qubits)
1. **Separable Smoothing + Central Difference Kernels:**
   $$K_x = \begin{bmatrix} -1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1 \end{bmatrix}, \qquad K_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ +1 & +2 & +1 \end{bmatrix}$$
2. **2D Convolution, Magnitude, and Azimuthal Phase:**
   $$G_x = K_x * I, \qquad G_y = K_y * I, \qquad G = \sqrt{G_x^2 + G_y^2}, \qquad \phi = \operatorname{atan2}(G_y, G_x)$$

#### 5. Classical Canny 5-Stage Analytic Pipeline ($0$ Qubits)
1. **Isotropic Gaussian Filtering:**
   $$G_\sigma(u,v) = \frac{1}{2\pi\sigma^2}\exp\!\left(-\frac{u^2 + v^2}{2\sigma^2}\right), \qquad I_\sigma = G_\sigma * I$$
2. **Gradient Vector & $4$-Sector Angle Quantization:**
   $$\theta_q(y,x) = \operatorname{round}\!\left(\frac{\operatorname{atan2}(G_y, G_x)}{\pi / 4}\right) \cdot 45^\circ \bmod 180^\circ \in \{0^\circ, 45^\circ, 90^\circ, 135^\circ\}$$
3. **Non-Maximum Suppression (NMS Ridge Thinning):**
   $$G_{\text{NMS}}(y,x) = \begin{cases} G(y,x) & \text{if } G(y,x) \ge G(y_+, x_+) \text{ and } G(y,x) \ge G(y_-, x_-) \\ 0 & \text{otherwise} \end{cases}$$
4. **Double Thresholding & Breadth-First Hysteresis Graph Connectivity:**
   $$E_{\text{Canny}}(y,x) = 1 \iff G_{\text{NMS}}(y,x) \ge T_{\text{high}} \;\lor\; \Big(G_{\text{NMS}}(y,x) \in [T_{\text{low}}, T_{\text{high}}) \;\land\; \exists \text{ 8-connected path to a strong pixel}\Big)$$

#### 6. Classical Robinson $8$-Compass Template Filter ($0$ Qubits)
1. **Eight $45^\circ$-Steered $3 \times 3$ Masks ($M_k$ for $k \in \{0\text{ (N)}, 1\text{ (NW)}, \dots, 7\text{ (NE)}\}$):**
   $$M_0 = \begin{bmatrix} -1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1 \end{bmatrix}, \quad M_1 = \begin{bmatrix} 0 & +1 & +2 \\ -1 & 0 & +1 \\ -2 & -1 & 0 \end{bmatrix}, \quad \dots, \quad M_k = \operatorname{Rotate}_{45^\circ k}(M_0)$$
2. **Maximum Directional Envelope & Winning Solar Aspect Angle:**
   $$E_{\text{Robinson}}(y,x) = \max_{k \in \{0 \dots 7\}} |M_k * I|(y,x), \qquad \phi^*(y,x) = 45^\circ \cdot \arg\max_{k \in \{0 \dots 7\}} (M_k * I)(y,x)$$

---

## 3. Pillar 2 — Deep Per-Technique Interactive Dissectors

### 3.1 FRQI-QHED Dissector Upgrades
* **Interactive Dual-Vector Bloch Sphere & Interference Chord Widget:**
  * Render an SVG unit circle in the XZ-plane ($|0\rangle$ at top pole, $|1\rangle$ at bottom pole) displaying state vectors $|c_A\rangle = \cos\theta_A|0\rangle + \sin\theta_A|1\rangle$ (at polar angle $2\theta_A$) and $|c_B\rangle$ (at polar angle $2\theta_B$).
  * Draw the Euclidean chord connecting the two Bloch vectors: its length is $2\sin(|\theta_A - \theta_B|/2)$ (interference amplitude), and its squared length divided by $2$ equals $\tilde{P}_{\text{edge}} = 2\sin^2(|\Delta\theta|/2)$.
* **Non-Linearity Transfer Curve Overlay:**
  * Plot $\Delta I \in [0, 255]$ vs. normalized response $f(\Delta I) \in [0, 1]$ showing FRQI's S-curve $2\sin^2\!\left(\frac{\pi \Delta I}{1020}\right)$ against QPIE's linear ramp $\frac{\Delta I}{255}$ and NEQR's staircase step function. Highlight the **Sub-Threshold Noise Suppression Zone** ($\Delta I < 18$, where $\sin^2$ suppresses low-amplitude regolith grain noise by $>65\%$ compared to linear operators).
* **HaloTiler Boundary Artifact A/B Live Toggle:**
  * Add a toggle in Studio switching between **Raw $8 \times 8$ Tiling** (showing false periodic wrap-around grid seams where $D_{64}|63\rangle = |0\rangle$ diffs right border $x=7$ against left border $x=0$) and **Halo-Padded $6 \times 6$ Core Tiling** ($1\text{-px}$ overlapping border discarded after measurement).

### 3.2 QPIE-QHED Dissector Upgrades
* **64-State Quantum Amplitude & Probability Spectrum Analyzer:**
  * Interactive 64-bar chart inside [`ParallelQuantumViewer.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/ParallelQuantumViewer.tsx) with a 3-stage state switcher:
    1. **Stage A (Initial QPIE Encoding):** $\alpha_i = I_i / \gamma_p^{\text{safe}}$ across $i \in [0, 63]$.
    2. **Stage B (Post-Hadamard Interference):** Even indices $2k$ carry local sums $\frac{I_{2k}+I_{2k+1}}{\sqrt{2}\gamma_p^{\text{safe}}}$ (low-pass approximation); odd indices $2k+1$ carry local differences $\frac{I_{2k}-I_{2k+1}}{\sqrt{2}\gamma_p^{\text{safe}}}$ (high-pass detail).
    3. **Stage C (Even + Odd Pass Interleave):** Shows how Pass 1 ($I_{64}$) and Pass 2 ($D_{64}$) interleave to reconstruct all $64$ pixel transitions without checkerboard gaps.
* **Photometric Norm ($\gamma_p$) Ablation Preview:**
  * Split micro-preview showing **Un-rescaled QPIE** (where a tiny $2\text{-gray-level}$ ripple in a dark crater floor appears falsely bright because $\gamma_p$ is tiny) vs. **$\gamma_p$-Restored QPIE** (where global radiometric consistency is preserved).

### 3.3 NEQR-Gradient Dissector Upgrades
* **Interactive $8$-Bitplane Slicer & Bit-Depth Quantizer ($q \in \{2 \dots 8\}$):**
  * Display all 8 binary bitplanes ($c_7$ MSB down to $c_0$ LSB) of the active lunar patch.
  * Allow toggling bit depth $q$ from $8\text{ bits}$ ($24\text{ active qubits}$) down to $2\text{ bits}$ ($12\text{ active qubits}$), dynamically updating:
    * Active Qubit Count: $2n + 2q + 2$
    * Toffoli (CCX) Gate Count per Pass: $2q$
    * CNOT (CX) Gate Count per Pass: $6q + 2$
    * Visual quantization contour artifacts (false step edges on smooth crater slopes when $q \le 4$).
* **Live Ripple-Borrow Waterfall Table:**
  * For the selected pixel pair $(I_A, I_B)$, render an 8-column binary arithmetic table showing $a_k$, $b_k$, incoming borrow $b_{\text{in}}^{(k)}$, raw difference bit $d_k$, outgoing borrow $b_{\text{out}}^{(k)}$, and 2's-complement magnitude bit $|I_A - I_B|_k$, synchronized with gate highlights in [`NEQRCircuitSVG.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/circuits/NEQRCircuitSVG.tsx).
* **Pauli-X Bitplane Error Injection:**
  * Allow injecting a simulated depolarizing bit-flip error at specific bitplane index $k \in [0, 7]$ to demonstrate why an uncorrected error on MSB $|c_7\rangle$ creates a catastrophic $\pm 128$ intensity spike, motivating quantum error mitigation on MSBs.

### 3.4 Classical Baselines (Sobel, Canny, Robinson) Visual Dissectors
* **Sobel $3 \times 3$ Multiply-Accumulate (MAC) Inspector:**
  * Hovering any cell in the $8 \times 8$ sandbox overlays the $3 \times 3$ neighborhood with live products $w_{u,v} \cdot I(y+u, x+v)$ for both $K_x$ and $K_y$, plus viewport tabs for $|G_x|$, $|G_y|$, and HSV phase angle $\phi = \operatorname{atan2}(G_y, G_x)$.
* **Canny 5-Stage Progressive Pipeline Scrubber:**
  * Interactive 5-step horizontal stepper inside the Canny card/inspector:
    1. **Stage 1:** Gaussian Smoothed $I_\sigma$ (live $\sigma \in [0.5, 3.5]$ control).
    2. **Stage 2:** Raw Gradient Magnitude $G$ & 4-color quantized direction map ($0^\circ, 45^\circ, 90^\circ, 135^\circ$).
    3. **Stage 3:** Non-Maximum Suppression (toggle before/after ridge thinning).
    4. **Stage 4:** Double-Threshold Classification Map (**Strong** $\ge T_{\text{high}}$ in `#00F5D4`, **Weak** $\in [T_{\text{low}}, T_{\text{high}})$ in `#F59E0B`, **Suppressed** in `#090D16`).
    5. **Stage 5:** Hysteresis Connected-Component Promotion (highlighting weak edges rescued by touching strong rims).
* **Robinson $8$-Compass Polar Rose & Solar Incidence Analyzer:**
  * Render an interactive 8-sector polar radar rose (`N, NE, E, SE, S, SW, W, NW`) plotting total directional edge energy $E_k = \sum_{y,x} |(M_k * I)(y,x)|$.
  * Clicking any compass wedge isolates that single $3 \times 3$ directional mask output, enabling geomorphological analysis of lunar crater rims relative to the solar illumination azimuth.

---

## 4. Pillar 3 — Studio & Benchmark Analytical Laboratory Upgrades

### 4.1 Synchronized Split-Screen Curtain & 6-Way Pixel Loupe
* **A/B Split Curtain Comparator:** Select any two detectors (e.g., `FRQI-QHED` vs. `Canny 5-Stage`) on a shared pan-and-zoom canvas with a draggable vertical/horizontal divider and a real-time **Difference Mode (`|Method_A - Method_B|`)**.
* **6-Way Synchronized $8 \times 8$ Numeric Loupe:** Moving the cursor across the main `QuantumCanvas` updates a synchronized $8 \times 8$ magnified grid across all 6 detector cards simultaneously, printing exact pixel probabilities/magnitudes inside each cell.

### 4.2 1D Spatial Transect Cross-Section Profiler (FWHM & Localization)
* Users draw a 1D line segment $(y_0, x_0) \to (y_1, x_1)$ across any crater rim on the canvas.
* Render a synchronized multi-series SVG waveform directly below the canvas plotting:
  * Raw Lunar Intensity $I(s)$ on the secondary axis.
  * Edge response curves $E_{\text{FRQI}}(s), E_{\text{QPIE}}(s), E_{\text{NEQR}}(s), E_{\text{Sobel}}(s), E_{\text{Canny}}(s), E_{\text{Robinson}}(s)$ on the primary axis.
  * **Automated Transect Metrics:** Compute and badge **Peak Center Offset ($\Delta s^*$ in px)**, **Full-Width at Half-Maximum (FWHM ridge thickness in px)**, and **Peak-to-Sidelobe Ratio (PSR)** along the drawn profile.

### 4.3 Consensus, Disagreement & Variance-Culling Heatmaps
* **Tri-Color Consensus Map:**
  * **Emerald (`#10B981`):** High-confidence edges detected by both Quantum ($3/3$) and Classical ($3/3$) ensembles.
  * **Cyan (`#06B6D4`):** **Quantum-Exclusive Detections** (low-contrast shadowed crater floor rims captured by QPIE/FRQI where Canny hysteresis breaks).
  * **Rose (`#F43F5E`):** **Classical-Exclusive Detections** (typically diagonal thickening in Sobel/Robinson or texture fragments).
* **`HaloTiler` Variance-Culling Overlay:**
  * Translucent overlay on `QuantumCanvas` coloring tiles bypassed by the $O(1)$ variance gate ($\sigma_{\text{tile}}^2 < \tau_{\text{var}}$) in muted indigo vs. active quantum-evaluated tiles in neon cyan, paired with a live hardware telemetry badge:
    $$\text{Circuits Executed: } N_{\text{active}} / N_{\text{total}} \quad \Big(\text{Compute Saved: } \frac{N_{\text{culled}}}{N_{\text{total}}} \times 100\%\Big)$$

---

## 5. Pillar 4 — Rigorous Scientific Benchmarking & NISQ Resource Modeling

Replace heuristic metrics in [`metrics.py`](file:///d:/Quantum_Edge_FRQI/backend/app/core/metrics.py) with a dual-mode scientific evaluation suite: **Mode A (Exact Ground-Truth Reference Metrics)** for parametric lunar presets (`synthetic_rim_512`, `diagonal_ray`, `concentric_craters`) and **Mode B (Intrinsic Structural & Perturbation Stability Metrics)** for arbitrary user uploads.

### 5.1 Exact Mathematical Formulations for [`metrics.py`](file:///d:/Quantum_Edge_FRQI/backend/app/core/metrics.py)

1. **Exact Euclidean Distance-Transform Pratt's Figure of Merit (PFOM):**
   * Given binary detected edge set $E_{\text{det}}$ ($N_D = |E_{\text{det}}|$) and ground-truth edge set $E_{\text{GT}}$ ($N_I = |E_{\text{GT}}|$), compute the exact Euclidean Distance Transform $D_{\text{GT}}(y,x) = \min_{(y',x') \in E_{\text{GT}}} \sqrt{(y-y')^2 + (x-x')^2}$ via `cv2.distanceTransform`:
     $$\text{PFOM} = \frac{1}{\max(N_I, N_D)} \sum_{p \in E_{\text{det}}} \frac{1}{1 + \alpha \, D_{\text{GT}}(p)^2}, \qquad \alpha = \frac{1}{9}$$
2. **Symmetric Hausdorff Distance ($d_H$) & Dice / $F_1$ Within $1\text{-px}$ Tolerance:**
   $$d_H(E_{\text{det}}, E_{\text{GT}}) = \max\!\left( \max_{p \in E_{\text{det}}} D_{\text{GT}}(p), \; \max_{q \in E_{\text{GT}}} D_{\text{det}}(q) \right)$$
   $$F_1^{(\delta \le 1)} = \frac{2 \cdot \text{Prec}_{\le 1} \cdot \text{Rec}_{\le 1}}{\text{Prec}_{\le 1} + \text{Rec}_{\le 1}}, \quad \text{where } \text{Prec}_{\le 1} = \frac{|\{p \in E_{\text{det}} : D_{\text{GT}}(p) \le \sqrt{2}\}|}{N_D}$$
3. **Reference-Free Ridge Thinness & Topological Continuity (For User Uploads):**
   * **Thinness Ratio ($\mathcal{T} \in [0, 1]$):** Ratio of morphological $1\text{-px}$ skeleton pixels (`skimage.morphology.skeletonize` or Zhang-Suen thinning) to total binary edge pixels:
     $$\mathcal{T} = \frac{|\operatorname{Skeleton}(E_{\text{det}})|}{\max(1, |E_{\text{det}}|)}$$
   * **Perturbation Stability Index ($\mathcal{S}_{\sigma}$):** Cosine similarity / PFOM agreement between edge map on clean upload $I$ and noisy perturbation $I + \mathcal{N}(0, \sigma^2)$.

### 5.2 NISQ Hardware Resource & Decoherence Fidelity Model
Add a dynamic resource scaling calculator in [`BenchmarkPage`](file:///d:/Quantum_Edge_FRQI/frontend/app/benchmark/page.tsx) comparing full-frame vs. `HaloTiler` $8 \times 8$ execution across resolutions $M \times M \in \{8^2, 64^2, 256^2, 512^2\}$:

| Architecture | Qubits ($8 \times 8$ Patch) | Qubits ($M \times M$ Full Frame) | 2-Qubit (CNOT) Depth per Patch | Passes per Tile ($X,Y$ Even/Odd) | Estimated NISQ Fidelity ($\epsilon_{2Q}=10^{-3}$) |
|---|---|---|---|---|---|
| **FRQI-QHED** | $7$ | $2\log_2 M + 1$ | $\mathcal{O}(2^{2n}) \approx 128$ (dense) / $\le 36$ (sparse) | $4$ | $88.2\% \text{ -- } 96.4\%$ |
| **QPIE-QHED** | $6$ | $2\log_2 M$ | $\mathcal{O}(2^{2n}) \approx 64$ (state prep + $D_{64}$) | $4$ | $93.8\% \text{ -- } 97.9\%$ |
| **NEQR-Gradient ($q=8$)** | $14$ (store) / $24$ (QFS) | $2\log_2 M + 2q + 2$ | $\mathcal{O}(q \cdot 2^{2n}) + 34q$ (QFS cascade) | $2$ ($X, Y$) | $61.4\%$ (deep Toffoli chain) |
| **NEQR-Gradient ($q=4$)** | $10$ (store) / $16$ (QFS) | $2\log_2 M + 10$ | $\mathcal{O}(4 \cdot 2^{2n}) + 136$ | $2$ ($X, Y$) | $79.8\%$ |

---

## 6. Concrete API Contracts & Data Schemas

### 6.1 Backend Pydantic v2 Schema (`backend/app/schemas/studio.py`)
```python
from pydantic import BaseModel, Field
from typing import Dict, List, Literal, Optional

class QuantumLabConfig(BaseModel):
    shots: Optional[int] = Field(default=None, description="None = infinite statevector; int (64..8192) = multinomial shot sampling")
    shot_mode: Literal["multinomial_patch", "binomial_local"] = "multinomial_patch"
    neqr_bit_depth: int = Field(default=8, ge=2, le=8)
    neqr_bitflip_prob: float = Field(default=0.0, ge=0.0, le=0.2)
    halo_padding_enabled: bool = True
    variance_cull_threshold: float = Field(default=12.0, ge=0.0, le=200.0)
    post_nms_thinning: bool = False
    threshold_mode: Literal["otsu", "rosin_triangle", "manual"] = "rosin_triangle"
    manual_threshold: float = Field(default=0.25, ge=0.01, le=0.99)
    noise_gaussian_sigma: float = Field(default=0.0, ge=0.0, le=35.0)
    canny_sigma: float = Field(default=1.4, ge=0.5, le=4.0)
    canny_low: float = Field(default=30.0, ge=5.0, le=200.0)
    canny_high: float = Field(default=90.0, ge=15.0, le=250.0)

class TileTelemetryGrid(BaseModel):
    grid_rows: int
    grid_cols: int
    core_stride: int = 6
    patch_size: int = 8
    total_tiles: int
    culled_tiles: int
    compute_saved_pct: float
    # Flattened row-major arrays (length = grid_rows * grid_cols) for <50KB transfer
    culled_mask: List[int]
    tile_means: List[float]
    tile_stds: List[float]
    tile_gamma_p: List[float]
    tile_max_delta_i: List[int]

class MethodMetricBundle(BaseModel):
    pfom_exact: Optional[float] = None
    f1_within_1px: Optional[float] = None
    hausdorff_px: Optional[float] = None
    thinness_ratio: float
    cnr: float
    otsu_threshold: float
    execution_ms: float
    active_qubits: int
    cnot_depth_per_tile: int
    histogram_bins: List[float]  # 32 normalized density bins in [0, 1]
```

### 6.2 Reference Backend Implementation Fixes (`backend/app/core/algorithms.py`)
```python
import numpy as np
import cv2
from typing import Optional, Tuple

def compute_frqi_qhed_tile(
    patch_8x8: np.ndarray,
    shots: Optional[int] = None,
    shot_mode: str = "multinomial_patch",
    rng: Optional[np.random.Generator] = None,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Executes 4-pass FRQI-QHED (X-even, X-odd, Y-even, Y-odd) on an 8x8 patch.
    Unifies physical circuit Born probability P_circuit = (1/32) * sin^2(d_theta / 2)
    and rescaled contrast response P_edge = 64 * P_circuit = 2 * sin^2(d_theta / 2).
    """
    if rng is None:
        rng = np.random.default_rng()

    theta = (np.pi / 2.0) * (patch_8x8.astype(np.float64) / 255.0)

    # Exact horizontal and vertical angular differences (with cyclic wrap for 8x8 register)
    dtheta_x = np.abs(theta - np.roll(theta, shift=-1, axis=1))
    dtheta_y = np.abs(theta - np.roll(theta, shift=-1, axis=0))

    # Physical circuit probability per pair (summing |0>_c and |1>_c in odd-LSB subspace)
    p_circuit_x = (1.0 / 32.0) * (np.sin(dtheta_x / 2.0) ** 2)
    p_circuit_y = (1.0 / 32.0) * (np.sin(dtheta_y / 2.0) ** 2)

    if shots is not None and shots > 0:
        if shot_mode == "multinomial_patch":
            # Split 64 transitions into Even pass (32 pairs) and Odd D_64 pass (32 pairs)
            for p_mat in (p_circuit_x, p_circuit_y):
                for parity in (0, 1):
                    probs_pass = p_mat[:, parity::2].ravel()
                    p_rem = max(0.0, 1.0 - float(np.sum(probs_pass)))
                    dist = np.append(probs_pass, p_rem)
                    dist /= np.sum(dist)
                    counts = rng.multinomial(shots, dist)[:-1]
                    p_mat[:, parity::2] = (counts / float(shots)).reshape(8, 4)
        else:
            # Pedagogical per-pair binomial mode
            p_edge_x_ideal = np.clip(64.0 * p_circuit_x, 0.0, 1.0)
            p_edge_y_ideal = np.clip(64.0 * p_circuit_y, 0.0, 1.0)
            p_circuit_x = (rng.binomial(shots, p_edge_x_ideal) / float(shots)) / 64.0
            p_circuit_y = (rng.binomial(shots, p_edge_y_ideal) / float(shots)) / 64.0

    # Rescale by Hilbert-space dimension N=64 to recover [0, 1] local edge probability
    p_edge_x = np.clip(64.0 * p_circuit_x, 0.0, 1.0)
    p_edge_y = np.clip(64.0 * p_circuit_y, 0.0, 1.0)
    edge_mag = np.clip(np.sqrt(p_edge_x ** 2 + p_edge_y ** 2), 0.0, 1.0)
    return edge_mag, theta


def run_neqr_qfs_vectorized(
    image: np.ndarray,
    bit_depth: int = 8,
    bitflip_prob: float = 0.0,
    rng: Optional[np.random.Generator] = None,
) -> np.ndarray:
    """
    True reversible Quantum Full Subtractor (QFS) bit-plane cascade across X and Y
    replacing the legacy cv2.Sobel approximation.
    """
    if rng is None:
        rng = np.random.default_rng()

    shift_bits = 8 - bit_depth
    quant = (image.astype(np.uint16) >> shift_bits)
    max_val = float((1 << bit_depth) - 1)

    def qfs_directional_pass(arr_a: np.ndarray, arr_b: np.ndarray) -> np.ndarray:
        h, w = arr_a.shape
        b_in = np.zeros((h, w), dtype=np.uint16)
        diff_bits = np.zeros((h, w, bit_depth), dtype=np.uint16)

        for k in range(bit_depth):
            a_k = (arr_a >> k) & 1
            b_k = (arr_b >> k) & 1

            # Optional NISQ Pauli-X gate bit-flip channel on color register qubits
            if bitflip_prob > 0.0:
                a_k = a_k ^ (rng.random((h, w)) < bitflip_prob).astype(np.uint16)
                b_k = b_k ^ (rng.random((h, w)) < bitflip_prob).astype(np.uint16)

            # QFS Boolean equations: d_k = a_k ^ b_k ^ b_in
            a_xor_b = a_k ^ b_k
            d_k = a_xor_b ^ b_in
            b_out = ((1 - a_k) & b_k) ^ ((1 - a_xor_b) & b_in)

            diff_bits[:, :, k] = d_k
            b_in = b_out

        # Sign borrow s = MSB b_out triggers controlled two's-complement |A - B|
        sign_borrow = b_in
        abs_diff = np.zeros((h, w), dtype=np.uint16)
        carry = sign_borrow.copy()

        for k in range(bit_depth):
            inv_d = diff_bits[:, :, k] ^ sign_borrow
            bit_val = inv_d ^ carry
            carry = inv_d & carry
            abs_diff |= (bit_val << k)

        return abs_diff.astype(np.float32)

    gx = qfs_directional_pass(quant, np.roll(quant, shift=-1, axis=1))
    gy = qfs_directional_pass(quant, np.roll(quant, shift=-1, axis=0))
    gx[:, -1] = 0.0
    gy[-1, :] = 0.0

    mag = np.sqrt(gx ** 2 + gy ** 2) / (max_val * np.sqrt(2.0))
    return np.clip(mag, 0.0, 1.0)
```

---

## 7. Phased Implementation Roadmap & Acceptance Checklist

| Phase | Milestone | Key Files Created / Modified | Acceptance Verification Criteria |
|---|---|---|---|
| **Phase 1: Backend Mathematical Truth & Telemetry** | 1. Fix FRQI $1/32$ physical vs. rescaled probability & 4-pass interleave.<br>2. Stabilize QPIE $\gamma_p^{\text{safe}}$ & shot-noise scaling.<br>3. Replace `cv2.Sobel` in NEQR with exact $q$-bit QFS cascade.<br>4. Add exact Euclidean Distance-Transform PFOM, Rosin thresholding, and optional NMS parity.<br>5. Emit compact `TileTelemetryGrid` from `/api/studio/analyze`. | [`algorithms.py`](file:///d:/Quantum_Edge_FRQI/backend/app/core/algorithms.py)<br>[`frqi_qhed.py`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/frqi_qhed.py)<br>[`qpie_qhed.py`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/qpie_qhed.py)<br>[`neqr_gradient.py`](file:///d:/Quantum_Edge_FRQI/backend/app/quantum/neqr_gradient.py)<br>[`metrics.py`](file:///d:/Quantum_Edge_FRQI/backend/app/core/metrics.py)<br>[`routes_studio.py`](file:///d:/Quantum_Edge_FRQI/backend/app/api/routes_studio.py) | - `pytest` verifies FRQI, QPIE, and NEQR patch outputs match analytical expressions to $< 10^{-7}$ at `shots=None`.<br>- Zero `Math.sin` synthetic HUD telemetry remains in [`StudioPage`](file:///d:/Quantum_Edge_FRQI/frontend/app/studio/page.tsx).<br>- Initial `/api/studio/analyze` JSON payload stays $< 250\text{ KB}$ for $512 \times 512$ inputs. |
| **Phase 2: KaTeX Formula DAG & Per-Method Dissectors** | 1. Install `katex` and build `<FormulaFlowBlock />` with symbolic + live numeric substitution.<br>2. Add FRQI Bloch sphere chord widget.<br>3. Add QPIE 64-bar state spectrum.<br>4. Add NEQR 8-bitplane slicer & QFS borrow table.<br>5. Add Sobel $3\times 3$ MAC spotlight, Canny 5-stage scrubber, and Robinson 8-sector polar compass rose. | [`package.json`](file:///d:/Quantum_Edge_FRQI/frontend/package.json)<br>`FormulaFlowBlock.tsx`<br>[`ParallelQuantumViewer.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/ParallelQuantumViewer.tsx)<br>[`PatchSandbox.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/architectures/PatchSandbox.tsx)<br>[`frqi-qhed/page.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/app/architectures/frqi-qhed/page.tsx) | - Every formula renders via KaTeX with zero raw ASCII math strings.<br>- Clicking any pixel pair $(A,B)$ updates all 6 mathematical derivation chains and circuit gate annotations in $< 16\text{ ms}$ ($60\text{ FPS}$). |
| **Phase 3: Multi-Method Visual Arena & Benchmark Plots** | 1. Build A/B split-curtain comparator & 6-way synchronized $8 \times 8$ loupe.<br>2. Add 1D transect cross-section waveform profiler with FWHM readout.<br>3. Build `LiveEdgeParameterLab` control dock.<br>4. Add 6-axis radar footprint, confidence histogram, and noise-degradation curves in [`BenchmarkPage`](file:///d:/Quantum_Edge_FRQI/frontend/app/benchmark/page.tsx). | [`UnifiedComparisonMatrix.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/UnifiedComparisonMatrix.tsx)<br>[`QuantumCanvas.tsx`](file:///d:/Quantum_Edge_FRQI/frontend/components/studio/QuantumCanvas.tsx)<br>`TransectProfiler.tsx`<br>[`BenchmarkPage`](file:///d:/Quantum_Edge_FRQI/frontend/app/benchmark/page.tsx) | - Dragging the 1D transect line updates the 6-method waveform and FWHM metrics at $60\text{ FPS}$.<br>- Toggling `HaloTiler` padding and variance culling visually updates tile seams and compute-saved telemetry live. |