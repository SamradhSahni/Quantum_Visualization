"""
Deep-Dive Quantum Edge Detection Pipeline Component
Step-by-step visual progression and live mathematical calculations for:
5A. Quantum State Preparation & Qubit Allocation Math (QPIE, FRQI, NEQR)
5B. Live Quantum Circuit & Gate Trace Visualization (Interactive SVG gate stepper,
    Matplotlib Qiskit circuit diagram, and gate-by-gate sequence breakdown)
5C. Quantum Edge Operation, Hadamard Interference, Measurement Histogram,
    Reconstructed Continuous Confidence Map, Threshold Sweep, and Binary Edge Map.
"""
import streamlit as st
import streamlit.components.v1 as components
import numpy as np
import math
import json
import re
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd
import cv2

ROOT_DIR = Path(__file__).resolve().parents[2]


def get_gate_semantic_description(name, qubits, params):
    """Returns plain-English physical meaning for each quantum gate in edge detection."""
    name_lower = name.lower()
    if 'init' in name_lower:
        return "Initializes state amplitudes / angles to represent pixel grayscale intensities"
    if name_lower == 'barrier':
        return "Circuit synchronization barrier (prevents compiler gate reordering)"
    if name_lower == 'h':
        return f"Hadamard gate on q{qubits[0]}: creates superposition & calculates amplitude difference (interference)"
    if name_lower == 'x':
        return f"Pauli-X NOT gate on q{qubits[0]}: inverts coordinate parity for boundary pair alignment"
    if name_lower == 'cx':
        return f"Controlled-NOT gate (q{qubits[0]} → q{qubits[1]}): cyclic coordinate shift for neighboring pixel comparison"
    if name_lower in ['ccx', 'mcx']:
        ctrls = ', '.join([f"q{q}" for q in qubits[:-1]])
        tgt = f"q{qubits[-1]}"
        return f"Multi-controlled NOT ({ctrls} → {tgt}): higher-order carry bit shift across row/col registers"
    if name_lower == 'measure':
        return f"Measurement of qubit(s) in computational basis (destroys superposition, returns bitstring)"
    if name_lower == 'ry':
        ang = params[0] if params else 0.0
        return f"Y-axis rotation on q{qubits[0]} by {ang:.3f} rad: encodes intensity into qubit angle"
    return f"Quantum operation {name} on qubits {qubits}"


from dashboard.components.circuit_visualizer_html import get_quantum_circuit_stepper_html

def render_gate_trace_stepper(image):
    """
    Renders the live interactive SVG circuit diagram and gate-by-gate stepper
    directly inside Streamlit with vibrant high-contrast dark theme and moving glowing cursor.
    """
    try:
        # Resize current image to 8x8 for the 6-qubit (64-pixel) interactive stepper
        h, w = image.shape
        if h != 8 or w != 8:
            patch_8x8 = cv2.resize(image, (8, 8), interpolation=cv2.INTER_AREA)
        else:
            patch_8x8 = image

        pixel_list = [int(v) for v in patch_8x8.flatten()]
        full_html = get_quantum_circuit_stepper_html(pixel_list)
        components.html(full_html, height=720, scrolling=True)
    except Exception as e:
        st.error(f"Error rendering interactive gate stepper: {e}")


def render_qiskit_circuit_diagram(qc):
    """Renders Qiskit QuantumCircuit using Matplotlib with dark theme, plus ASCII text fallback."""
    try:
        fig = qc.draw(
            output='mpl',
            style={
                'backgroundcolor': '#0d1117',
                'textcolor': '#e6edf3',
                'linecolor': '#58a6ff',
                'gatefacecolor': '#1f6feb',
                'gateedgecolor': '#58a6ff',
                'gatetextcolor': '#ffffff'
            }
        )
        st.pyplot(fig)
        plt.close(fig)
    except Exception:
        # Fallback to text drawing
        st.code(qc.draw(output='text'), language='text')


def render_gate_sequence_table(qc):
    """Extracts step-by-step gate execution sequence into an interactive table."""
    records = []
    for idx, inst in enumerate(qc.data):
        gate_name = inst.operation.name.upper()
        if gate_name == 'BARRIER':
            continue
        try:
            qubit_indices = [qc.find_bit(q).index for q in inst.qubits]
        except Exception:
            qubit_indices = [idx]
        
        target = f"q{qubit_indices[-1]}" if qubit_indices else "-"
        controls = ", ".join([f"q{q}" for q in qubit_indices[:-1]]) if len(qubit_indices) > 1 else "-"
        params = [float(p) for p in inst.operation.params if isinstance(p, (int, float))]
        param_str = ", ".join([f"{p:.3f}" for p in params]) if params else "-"
        role = get_gate_semantic_description(inst.operation.name, qubit_indices, params)

        records.append({
            "Step": len(records) + 1,
            "Gate": gate_name,
            "Target Qubit": target,
            "Controls": controls,
            "Parameter (rad)": param_str,
            "Edge Detection Role": role
        })

    if records:
        df = pd.DataFrame(records)
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("No discrete gates in circuit data.")


def render_quantum_inspector(q_data, image, x, y, submat):
    """
    Renders the quantum state preparation, dynamic qubit allocation formulas,
    live interactive gate visualization, and the 5-stage visual progression.
    """
    st.markdown("### 5. Deep-Dive Quantum Edge Detection Pipeline")

    method_name = q_data['name']
    h, w = image.shape
    col_bits = int(math.log2(w))
    row_bits = int(math.log2(h))
    n_pos = col_bits + row_bits
    N = h * w

    tab_prep, tab_circuit, tab_exec = st.tabs([
        "5A. State Preparation & Qubit Allocation Math",
        f"5B. Live Quantum Circuit & Gate Trace [{method_name}]",
        f"5C. Quantum Interference, Measurement & Thresholding [{method_name}]"
    ])

    # =========================================================================
    # 5A. Quantum State Preparation & Qubit Allocation
    # =========================================================================
    with tab_prep:
        st.markdown("#### Dynamic Qubit Allocation Formulas by Image Resolution")
        st.markdown(f"""
        For a patch of size **{h} &times; {w}** ($N = {N}$ pixels):
        - **Column Coordinate Register:** $n_{{\\text{{col}}}} = \\log_2({w}) = {col_bits}$ qubits
        - **Row Coordinate Register:** $n_{{\\text{{row}}}} = \\log_2({h}) = {row_bits}$ qubits
        - **Total Position Qubits:** $n_{{\\text{{pos}}}} = n_{{\\text{{col}}}} + n_{{\\text{{row}}}} = {n_pos}$ qubits ($2^{{{n_pos}}} = {1 << n_pos}$ basis states)
        """)

        c_qpie, c_frqi, c_neqr = st.columns(3)
        with c_qpie:
            st.markdown("""
            **1. QPIE + QHED**
            - Encodes in **amplitudes**
            - $n_{{\\text{{qubits}}}} = n_{{\\text{{pos}}}} = {}$ qubits
            - Global Normalization: $C = \\sqrt{{\\sum I_i^2}}$
            """.format(n_pos))
            st.latex(r"|\psi\rangle = \frac{1}{C}\sum_{x,y} I(x,y)|x\rangle|y\rangle")

        with c_frqi:
            st.markdown("""
            **2. FRQI + QHED**
            - Encodes in **qubit angle** $\\theta_i$
            - $n_{{\\text{{qubits}}}} = n_{{\\text{{pos}}}} + 1 = {}$ qubits
            - Local normalization: $\\cos^2\\theta + \\sin^2\\theta = 1$
            """.format(n_pos + 1))
            st.latex(r"|I\rangle = \frac{1}{\sqrt{N}}\sum_i |i\rangle (\cos\theta_i|0\rangle + \sin\theta_i|1\rangle)")

        with c_neqr:
            st.markdown("""
            **3. NEQR + Gradient**
            - Encodes in **basis states** $|c_7..c_0\\rangle$
            - $n_{{\\text{{qubits}}}} = n_{{\\text{{pos}}}} + 8 = {}$ qubits
            - Exact binary integer storage
            """.format(n_pos + 8))
            st.latex(r"|Q\rangle = \frac{1}{\sqrt{N}}\sum_{YX} |f(Y,X)\rangle |YX\rangle")

        st.markdown(f"#### Live Pixel Encoding Math at Selected Pixel $(x={x}, y={y})$")
        col_enc1, col_enc2 = st.columns(2)

        # Binary coordinates
        x_bin = format(x, f"0{col_bits}b")
        y_bin = format(y, f"0{row_bits}b")
        pos_bin = y_bin + x_bin
        pos_idx = y * w + x
        val_xy = float(image[y, x])

        with col_enc1:
            st.markdown(f"""
            - **Pixel Coordinates:** $(x={x}, y={y})$
            - **Binary Position State:** $|y\\rangle|x\\rangle = |{y_bin}\\rangle|{x_bin}\\rangle = |{pos_bin}\\rangle$ (Index ${pos_idx}$)
            - **Grayscale Intensity:** $I({x}, {y}) = {val_xy:.1f}$
            """)

            # QPIE math
            norm_c = float(np.linalg.norm(image))
            amp = val_xy / norm_c if norm_c > 0 else 0.0
            st.markdown(f"""
            **QPIE Amplitude Value:**
            - Normalization Factor $C = \\sqrt{{\\sum I^2}} = {norm_c:.2f}$
            - Amplitude: $a_{{{x},{y}}} = \\frac{{{val_xy:.1f}}}{{{norm_c:.2f}}} = {amp:.6f}$
            - Probability: $|a_{{{x},{y}}}|^2 = {amp**2:.6f}$
            """)

        with col_enc2:
            # FRQI math
            theta = (val_xy / 255.0) * (math.pi / 2.0)
            cos_t = math.cos(theta)
            sin_t = math.sin(theta)
            st.markdown(f"""
            **FRQI Angle & Color State:**
            - Angle $\\theta_{{{x},{y}}} = \\frac{{\\pi}}{{2}} \\cdot \\frac{{{val_xy:.1f}}}{{255}} = {theta:.4f}\\text{{ rad}} ({math.degrees(theta):.1f}^\\circ)$
            - Color Qubit State:
              $|c\\rangle = {cos_t:.4f}|0\\rangle + {sin_t:.4f}|1\\rangle$
            - Statevector Component: $\\frac{{1}}{{\\sqrt{{{N}}}}}|{pos_bin}\\rangle \\otimes ({cos_t:.4f}|0\\rangle + {sin_t:.4f}|1\\rangle)$
            """)

            # NEQR math
            int_byte = int(val_xy)
            byte_bin = format(int_byte, "08b")
            st.markdown(f"""
            **NEQR 8-Bit Register State:**
            - Intensity Byte: `{int_byte}` $\\rightarrow |{byte_bin}\\rangle$
            - Multi-Controlled CNOT ($MCX$) gates conditioned on $|{pos_bin}\\rangle$ trigger on qubits where bit is `1`.
            """)

    # =========================================================================
    # 5B. Live Quantum Circuit & Gate Trace Visualization
    # =========================================================================
    with tab_circuit:
        st.markdown(f"#### Interactive Quantum Gate Stepper & Circuit Visualization [{method_name}]")
        st.markdown("""
        Explore gate execution live! Use the interactive controls below to step through individual gates (`Next gate`),
        watch state amplitudes transform across the 64 basis states, run shots accumulation, and interactively toggle passes.
        """)

        # 1. Interactive SVG Gate Stepper Component
        render_gate_trace_stepper(image)

        st.markdown("---")
        st.markdown(f"#### Qiskit Representative Circuit Diagram ({method_name})")

        rep_circuit = q_data.get('representative_circuit', None)
        if rep_circuit is not None:
            col_diag1, col_diag2 = st.columns([3, 1])
            with col_diag2:
                view_mode = st.radio("Circuit View Mode", ["Matplotlib Graphical", "ASCII Unicode Text"], index=0)
            with col_diag1:
                st.caption(f"Circuit name: `{rep_circuit.name}` | Qubits: {rep_circuit.num_qubits} | Depth: {rep_circuit.depth()} | Gates: {len(rep_circuit.data)}")

            if view_mode == "Matplotlib Graphical":
                render_qiskit_circuit_diagram(rep_circuit)
            else:
                st.code(rep_circuit.draw(output='text'), language='text')

            st.markdown("#### Gate-by-Gate Execution Sequence Table")
            render_gate_sequence_table(rep_circuit)
        else:
            st.info("Representative circuit object not provided.")

        st.markdown("---")
        st.markdown("#### 🔬 Quantum Circuit Studio")
        st.markdown("""
        Need to build custom quantum circuits, add or remove gates interactively, or test statevectors?
        Launch our standalone **Quantum Circuit Studio** in a separate browser tab:
        """)
        st.markdown("""
        <a href="circuit-studio/index.html" target="_blank" style="display:inline-block; padding:10px 18px; background:#1f6feb; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:600;">
            🚀 Open Quantum Circuit Studio →
        </a>
        """, unsafe_allow_html=True)

    # =========================================================================
    # 5C. Quantum Interference, Measurement & Thresholding
    # =========================================================================
    with tab_exec:
        st.markdown(f"#### 5-Stage Visual Progression for {method_name}")
        c1, c2, c3, c4, c5 = st.columns(5)

        with c1:
            st.markdown("**1. Resource Summary**")
            st.info(f"""
            **{method_name}**
            - Qubits: {q_data['n_total_qubits']}
            - Depth: {q_data['avg_depth']}
            - Total Gates: {q_data['total_gates']}
            - Shots: {q_data['shots']}
            """)

        with c2:
            st.markdown("**2. Top Measured States**")
            fig_hist, ax_hist = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            fig_hist.patch.set_facecolor('#0d1117')
            ax_hist.set_facecolor('#0d1117')

            counts = q_data['sample_histogram']
            top_items = sorted(counts.items(), key=lambda item: item[1], reverse=True)[:5]
            if top_items:
                keys = [k[-4:] for k, _ in top_items]
                vals = [v for _, v in top_items]
                ax_hist.bar(keys, vals, color='#8957e5', edgecolor='#30363d')
                ax_hist.set_title("Top 5 Bitstrings", color='#e6edf3', fontsize=8)
                ax_hist.tick_params(colors='#8b9eb0', labelsize=7)
                for s in ax_hist.spines.values():
                    s.set_color('#30363d')
            ax_hist.axis('off')
            st.pyplot(fig_hist)
            plt.close(fig_hist)

        with c3:
            st.markdown("**3. Confidence Map**")
            fig_conf, ax_conf = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            fig_conf.patch.set_facecolor('#0d1117')
            im_c = ax_conf.imshow(q_data['confidence_map'], cmap='magma', vmin=0, vmax=1)
            ax_conf.axis('off')
            st.pyplot(fig_conf)
            plt.close(fig_conf)

        with c4:
            st.markdown("**4. Threshold Sweep**")
            fig_sw, ax_sw = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            fig_sw.patch.set_facecolor('#0d1117')
            ax_sw.set_facecolor('#0d1117')
            th_x, cov_y = q_data['threshold_sweep']
            ax_sw.plot(th_x, cov_y, color='#58a6ff', lw=1.5)
            ax_sw.axvline(q_data['threshold'], color='#f85149', linestyle='--', lw=1, label=f"T*={q_data['threshold']:.2f}")
            ax_sw.set_title("Sweep T [0.01-0.99]", color='#e6edf3', fontsize=8)
            ax_sw.tick_params(colors='#8b9eb0', labelsize=7)
            for s in ax_sw.spines.values():
                s.set_color('#30363d')
            st.pyplot(fig_sw)
            plt.close(fig_sw)

        with c5:
            st.markdown(f"**5. Binary ($T^*={q_data['threshold']:.2f}$)**")
            fig_bin, ax_bin = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            fig_bin.patch.set_facecolor('#0d1117')
            ax_bin.imshow(q_data['binary'], cmap='gray', vmin=0, vmax=1)
            ax_bin.axis('off')
            st.pyplot(fig_bin)
            plt.close(fig_bin)

        # Behind-the-scenes Hadamard interference math at (x, y)
        st.markdown(f"#### Behind-the-Scenes Hadamard Interference Math at Pixel $(x={x}, y={y})$")
        col_h1, col_h2 = st.columns(2)

        # Next horizontal neighbor
        next_x = min(w - 1, x + 1)
        val_next = float(image[y, next_x])
        delta_val = abs(val_xy - val_next)

        with col_h1:
            st.markdown(f"""
            **Local Pair Interference Setup:**
            - Current Pixel $(x={x}, y={y})$: $I_a = {val_xy:.1f}$
            - Right Neighbor $(x+1={next_x}, y={y})$: $I_b = {val_next:.1f}$
            - Absolute Intensity Jump: $|I_a - I_b| = {delta_val:.1f}$

            **Hadamard Local Difference Action:**
            $$H|0\\rangle = \\frac{{|0\\rangle + |1\\rangle}}{{\\sqrt{{2}}}}, \\quad H|1\\rangle = \\frac{{|0\\rangle - |1\\rangle}}{{\\sqrt{{2}}}}$$
            The odd-parity component carries difference amplitude $\\frac{{a - b}}{{\\sqrt{{2}}}}$.
            - **Equal Intensities ($I_a = I_b$):** Complete destructive cancellation $\\rightarrow P(\\text{{edge}}) = 0$.
            - **Edge Transition ($I_a \\neq I_b$):** Constructive interference $\\rightarrow P(\\text{{edge}}) \\propto |I_a - I_b|^2$.
            """)

        with col_h2:
            if method_name == 'FRQI-QHED':
                theta_a = (val_xy / 255.0) * (math.pi / 2.0)
                theta_b = (val_next / 255.0) * (math.pi / 2.0)
                d_theta = abs(theta_a - theta_b)
                p_theory = (1.0 - math.cos(d_theta)) / N
                st.markdown(f"""
                **FRQI Inverted Trigonometric Reconstruction:**
                - Angular Jump: $|\\theta_a - \\theta_b| = {d_theta:.4f}$ rad
                - Color-Marginal Probability:
                  $$p = \\frac{{1 - \\cos(\\theta_a - \\theta_b)}}{{N}} = {p_theory:.6f}$$
                - Exact Inversion Formula:
                  $$\\Delta I = \\frac{{1020}}{{\\pi}} \\arcsin\\left(\\sqrt{{\\frac{{N \\cdot p}}{{2}}}}\\right) = {delta_val:.1f}$$
                """)
            elif method_name == 'QPIE-QHED':
                norm_c = float(np.linalg.norm(image))
                amp_a = val_xy / norm_c if norm_c > 0 else 0.0
                amp_b = val_next / norm_c if norm_c > 0 else 0.0
                d_amp = abs(amp_a - amp_b)
                st.markdown(f"""
                **QPIE Amplitude Difference:**
                - $a = {amp_a:.5f}, \\quad b = {amp_b:.5f}$
                - Normalized Difference: $|a - b| = {d_amp:.5f}$
                - Measured Probability at $|1\\rangle$: $\\frac{{|a-b|^2}}{{2}} = {(d_amp**2)/2.0:.6f}$
                """)
            else:
                st.markdown(f"""
                **NEQR Basis-Register Difference:**
                - Basis states $|f(x,y)\\rangle = |{int(val_xy)}\\rangle$ and $|f(x+1,y)\\rangle = |{int(val_next)}\\rangle$
                - Classical forward gradient on measured states: $|{int(val_xy)} - {int(val_next)}| = {int(delta_val)}$
                """)
