"""
System Architecture & Live Data-Flow Tracker Component
Renders the complete research pipeline diagram with dynamic active-node highlighting,
paired with a Live Data Tensor & State Hand-off Strip showing real-time object transformations.
"""
import streamlit as st

def render_architecture_view(dataset_name, patch_shape, filter_name, deg_name,
                            active_classical, active_quantum, q_qubits, q_shots):
    """
    Renders the interactive styled system architecture flow and the data tensor hand-off strip.
    """
    st.markdown("### 1. System Architecture & Live Data-Flow Tracker")

    # CSS styles for high-aesthetic cards and flowchart
    st.markdown("""
    <style>
    .arch-container {
        background: linear-gradient(135deg, #0d131a 0%, #17222f 100%);
        border: 1px solid #2a3c4f;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 25px;
        color: #e6edf3;
    }
    .arch-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #233547;
        padding-bottom: 10px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #8b9eb0;
        font-family: monospace;
    }
    .tensor-strip {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin-top: 15px;
    }
    .tensor-card {
        background: #141e29;
        border: 1px solid #26384a;
        border-radius: 8px;
        padding: 12px 14px;
        transition: transform 0.2s, border-color 0.2s;
    }
    .tensor-card:hover {
        border-color: #388bfd;
        transform: translateY(-2px);
    }
    .tensor-step {
        font-size: 10px;
        color: #58a6ff;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 4px;
    }
    .tensor-name {
        font-size: 13px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 6px;
    }
    .tensor-meta {
        font-family: Consolas, monospace;
        font-size: 11px;
        color: #a5d6ff;
        line-height: 1.5;
    }
    .flow-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        margin-right: 5px;
    }
    .badge-active { background: #238636; color: #fff; }
    .badge-quantum { background: #8957e5; color: #fff; }
    .badge-classical { background: #1f6feb; color: #fff; }
    </style>
    """, unsafe_allow_html=True)

    # Highlight active nodes based on selections
    classical_str = ", ".join(active_classical) if active_classical else "None"
    quantum_str = active_quantum

    st.graphviz_chart(f"""
    digraph G {{
        rankdir=TB;
        bgcolor="transparent";
        node [fontname="Segoe UI, Inter, sans-serif", fontsize=10, shape=box, style="filled,rounded", fontcolor="#ffffff", margin="0.18,0.1"];
        edge [color="#58a6ff", penwidth=1.5, arrowsize=0.7];

        subgraph cluster_input {{
            label="STAGE 1: INPUT & LOADER";
            fontcolor="#8b9eb0";
            fontsize=9;
            color="#2a3c4f";
            style="dashed";
            input_img [label="INPUT IMAGE\\n(Grayscale)", fillcolor="#1f2d3d"];
            loader [label="DATASET / LOADER\\n[{dataset_name}]", fillcolor="#238636", penwidth=2, color="#3fb950"];
            input_img -> loader;
        }}

        subgraph cluster_prep {{
            label="STAGE 2: PREPROCESSING MODULE";
            fontcolor="#8b9eb0";
            fontsize=9;
            color="#2a3c4f";
            style="dashed";
            resize_crop [label="Resize / Crop\\n{patch_shape[0]}x{patch_shape[1]}", fillcolor="#1f2d3d"];
            deg [label="Degradation Injector\\n[{deg_name}]", fillcolor="#9e6a03"];
            filter_node [label="Enhancement Filter\\n[{filter_name}]", fillcolor="#1f6feb", penwidth=2, color="#58a6ff"];
            loader -> resize_crop -> deg -> filter_node;
        }}

        subgraph cluster_classical {{
            label="STAGE 3A: CLASSICAL PIPELINE";
            fontcolor="#8b9eb0";
            fontsize=9;
            color="#1f6feb";
            style="rounded";
            sobel [label="Sobel (3x3)\\n[Gx, Gy]", fillcolor="#1f2d3d"];
            canny [label="Canny 5-Stage\\n[NMS + Hysteresis]", fillcolor="#1f2d3d"];
            robinson [label="Robinson Compass\\n[8-Dir Compass]", fillcolor="#1f2d3d"];
        }}

        subgraph cluster_quantum {{
            label="STAGE 3B: QUANTUM PIPELINE";
            fontcolor="#8b9eb0";
            fontsize=9;
            color="#8957e5";
            style="rounded";
            q_enc [label="Encoding & Prep\\n[{quantum_str}]", fillcolor="#8957e5", penwidth=2, color="#d2a8ff"];
            q_sim [label="AerSimulator\\n[Statevector, {q_shots} shots]", fillcolor="#6e40c9"];
            q_meas [label="Measurement & Inversion\\n[P(edge) -> Confidence]", fillcolor="#553098"];
            q_enc -> q_sim -> q_meas;
        }}

        filter_node -> sobel;
        filter_node -> canny;
        filter_node -> robinson;
        filter_node -> q_enc;

        subgraph cluster_eval {{
            label="STAGE 4: EVALUATION & ANALYSIS";
            fontcolor="#8b9eb0";
            fontsize=9;
            color="#2a3c4f";
            style="dashed";
            gt_comp [label="GROUND TRUTH BENCHMARK\\n(Exact, 1-px, 2-px Tolerance)", fillcolor="#161b22"];
            metrics [label="METRICS & SCORECARDS\\nF1 / Precision / Recall / IoU / Chamfer / PR-AUC", fillcolor="#238636"];
            gt_comp -> metrics;
        }}

        sobel -> gt_comp;
        canny -> gt_comp;
        robinson -> gt_comp;
        q_meas -> gt_comp;
    }}
    """)

    # Live Data Tensor & State Hand-off Strip
    st.markdown("#### Live Data Tensor & State Hand-off Strip")
    st.markdown(f"""
    <div class="tensor-strip">
        <div class="tensor-card">
            <div class="tensor-step">Block 01</div>
            <div class="tensor-name">Raw Input Tensor</div>
            <div class="tensor-meta">
                <b>Shape:</b> ({patch_shape[0]}, {patch_shape[1]})<br>
                <b>Dtype:</b> uint8<br>
                <b>Range:</b> [0, 255]<br>
                <b>Domain:</b> Spatial Domain
            </div>
        </div>
        <div class="tensor-card">
            <div class="tensor-step">Block 02</div>
            <div class="tensor-name">Preprocessed Patch</div>
            <div class="tensor-meta">
                <b>Shape:</b> ({patch_shape[0]}, {patch_shape[1]})<br>
                <b>Filter:</b> {filter_name}<br>
                <b>Dtype:</b> float64<br>
                <b>Range:</b> [0.0, 255.0]
            </div>
        </div>
        <div class="tensor-card">
            <div class="tensor-step">Block 03</div>
            <div class="tensor-name">Classical Convolutions</div>
            <div class="tensor-meta">
                <b>Active:</b> {classical_str}<br>
                <b>Kernels:</b> 3&times;3 Convolutions<br>
                <b>Outputs:</b> Gx, Gy, R_k (k=0..315&deg;)<br>
                <b>Magnitude:</b> Normalized [0, 1]
            </div>
        </div>
        <div class="tensor-card">
            <div class="tensor-step">Block 04</div>
            <div class="tensor-name">Quantum Statevector</div>
            <div class="tensor-meta">
                <b>Active:</b> {quantum_str}<br>
                <b>Register:</b> {q_qubits} Qubits ({2**q_qubits} Basis states)<br>
                <b>Simulator:</b> Aer ({q_shots} shots)<br>
                <b>Output:</b> Continuous Map &isin; [0, 1]
            </div>
        </div>
        <div class="tensor-card">
            <div class="tensor-step">Block 05</div>
            <div class="tensor-name">Binary Edge Masks & Eval</div>
            <div class="tensor-meta">
                <b>Mask Type:</b> Binary uint8 &isin; &#123;0, 1&#125;<br>
                <b>Thresholding:</b> Automated Otsu / Swept T*<br>
                <b>Tolerances:</b> Exact, 1-px, 2-px<br>
                <b>Scorecards:</b> F1, P, R, IoU, Chamfer
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
