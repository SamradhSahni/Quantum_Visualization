"""
Dedicated Section Component:
Live Quantum Gate Execution & Pixel-by-Pixel Image Reconstruction Engine
Demonstrates FRQI-QHED quantum edge detection live on the uploaded / active image patch.
Shows:
1. Real-time SVG quantum circuit with glowing gate execution cursor
2. Pixel-by-pixel image building animation where pixels illuminate as gates evaluate interference
3. Live telemetry HUD with active basis state |y>|x>, amplitude jumps, and edge probabilities
4. Qiskit representative circuit diagram (MPL & ASCII)
5. Gate-by-gate sequence breakdown table with quantum physical role descriptions
"""
import streamlit as st
import streamlit.components.v1 as components
import numpy as np
import cv2
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

from dashboard.components.circuit_visualizer_html import get_quantum_circuit_stepper_html

ROOT_DIR = Path(__file__).resolve().parents[2]


def render_live_quantum_reconstruction_section(image, q_data):
    """
    Renders the dedicated section for Live Quantum Gate Execution & Pixel-by-Pixel Image Reconstruction.
    """
    st.markdown("## ⚛️ Live Quantum Gate Execution & Pixel-by-Pixel Reconstruction Engine")
    st.markdown("""
    Watch **FRQI-QHED Quantum Edge Detection** execute live on your active image patch! 
    As the quantum circuit executes its **State Preparation**, **Cyclic Coordinate Shift ($MCX/CX$)**, 
    and **Hadamard Interference ($H$)** gates, watch the quantum edge image **materialize pixel-by-pixel** 
    as each computational basis state $|y\\rangle|x\\rangle$ is resolved.
    """)

    # Resize active image to 8x8 for the 6-qubit (64-pixel) live circuit stepper
    h, w = image.shape
    if h != 8 or w != 8:
        patch_8x8 = cv2.resize(image, (8, 8), interpolation=cv2.INTER_AREA)
    else:
        patch_8x8 = image

    pixel_list = [int(v) for v in patch_8x8.flatten()]

    # 1. Embed the Interactive Pixel-by-Pixel Reconstruction HTML Canvas
    html_content = get_quantum_circuit_stepper_html(pixel_list)
    components.html(html_content, height=820, scrolling=True)

    # 2. Detailed Technical Breakdown & Qiskit Circuit Diagram
    st.markdown("### 📋 Qiskit Representative Circuit Diagram & Gate Execution Breakdown")
    
    rep_circuit = q_data.get('representative_circuit', None)
    method_name = q_data.get('name', 'FRQI-QHED')

    if rep_circuit is not None:
        col_c1, col_c2 = st.columns([3, 1])
        with col_c2:
            view_mode = st.radio("Circuit View Mode", ["Matplotlib Graphical", "ASCII Unicode Text"], index=0, key="stepper_view_mode")
        with col_c1:
            st.caption(f"Circuit: `{rep_circuit.name}` | Qubits: {rep_circuit.num_qubits} | Depth: {rep_circuit.depth()} | Total Operations: {len(rep_circuit.data)}")

        if view_mode == "Matplotlib Graphical":
            try:
                fig = rep_circuit.draw(
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
                st.code(rep_circuit.draw(output='text'), language='text')
        else:
            st.code(rep_circuit.draw(output='text'), language='text')

        # Gate execution sequence table
        with st.expander("🔍 View Gate-by-Gate Execution Sequence & Physical Algorithm Roles", expanded=False):
            records = []
            for idx, inst in enumerate(rep_circuit.data):
                gate_name = inst.operation.name.upper()
                if gate_name == 'BARRIER':
                    continue
                try:
                    qubit_indices = [rep_circuit.find_bit(q).index for q in inst.qubits]
                except Exception:
                    qubit_indices = [idx]

                target = f"q{qubit_indices[-1]}" if qubit_indices else "-"
                controls = ", ".join([f"q{q}" for q in qubit_indices[:-1]]) if len(qubit_indices) > 1 else "-"
                params = [float(p) for p in inst.operation.params if isinstance(p, (int, float))]
                param_str = ", ".join([f"{p:.3f}" for p in params]) if params else "-"

                # Semantic physical role in edge detection
                g_low = gate_name.lower()
                if 'init' in g_low:
                    role = "Initializes orthogonal state amplitudes / rotation angles from image pixels"
                elif g_low == 'h':
                    role = f"Hadamard gate on q{qubit_indices[0]}: creates superposition & calculates amplitude difference (interference)"
                elif g_low in ['cx', 'ccx', 'mcx']:
                    role = f"Controlled coordinate shift ({controls} → {target}): cyclic boundary neighbor alignment"
                elif g_low == 'x':
                    role = f"Pauli-X NOT on q{qubit_indices[0]}: parity bit inversion for shifted pair pass"
                elif g_low == 'measure':
                    role = "Measures qubit in computational basis (destroys superposition, returns bitstring)"
                else:
                    role = f"Quantum operation {gate_name}"

                records.append({
                    "Step": len(records) + 1,
                    "Gate": gate_name,
                    "Target Qubit": target,
                    "Controls": controls,
                    "Parameter (rad)": param_str,
                    "Physical Role in QHED Edge Detection": role
                })

            if records:
                df_seq = pd.DataFrame(records)
                st.dataframe(df_seq, use_container_width=True, hide_index=True)
