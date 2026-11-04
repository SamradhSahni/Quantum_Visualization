"""
Separate Method Scorecards, Formulas & Automated Diagnostic Interpretations
Generates individual evaluation tabs for each method (Sobel, Canny, Robinson, QPIE, FRQI, NEQR)
with intrinsic statistics, ground truth accuracy metrics, expandable confusion matrices,
computational resource breakdown, automated plain-English interpretations, and a unified benchmark table.
"""
import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import cv2

def generate_automated_interpretation(method_name, coverage_pct, eval_res, robinson_eval):
    """
    Produces dynamic, plain-English diagnostic interpretation based on actual numbers.
    """
    interp_lines = []

    # 1. Coverage vs. Selectivity
    if coverage_pct < 12.0:
        interp_lines.append(f"**Conservative & High Selectivity:** At {coverage_pct:.1f}% edge coverage, {method_name} produces clean, thin boundaries, minimizing spurious texture noise through destructive cancellation.")
    elif coverage_pct > 22.0:
        interp_lines.append(f"**Broad Boundary Response:** At {coverage_pct:.1f}% edge coverage, {method_name} detects thick or textured edge bands, capturing subtle lighting transitions as well as sharp crater rims.")
    else:
        interp_lines.append(f"**Balanced Edge Density:** At {coverage_pct:.1f}% edge coverage, this method balances rim delineation with background suppression.")

    # 2. Tolerance Jump Analysis
    if eval_res is not None:
        f1_exact = eval_res['f1_exact']
        f1_2px = eval_res['f1_2px']
        diff = f1_2px - f1_exact
        if diff >= 0.15:
            interp_lines.append(f"**Significant Spatial Tolerance Jump (+{diff:.2f}):** The F1 score rises sharply from exact ({f1_exact:.3f}) to 2-pixel tolerance ({f1_2px:.3f}). This confirms the algorithm accurately localized the crater rim, but discrete patch quantization or diffuse regolith shadowing shifted the detected boundary by 1–2 pixels.")
        else:
            interp_lines.append(f"**Precise Pixel Alignment:** The modest difference (+{diff:.2f}) between exact and 2-pixel F1 indicates sharp, well-aligned boundary matching.")

    # 3. Robinson Referee Diagnostic (Quantum vs. Image Level)
    if 'QHED' in method_name and robinson_eval is not None and eval_res is not None:
        q_f1 = eval_res['f1_2px']
        rob_f1 = robinson_eval['f1_2px']
        if rob_f1 > q_f1 + 0.12:
            interp_lines.append(f"**Robinson Referee — Quantum-Specific Directional Sensitivity:** Robinson achieves F1 = {rob_f1:.3f} while {method_name} achieves F1 = {q_f1:.3f}. Because Robinson's 8-directional compass captures diagonal rims easily, this gap is quantum-specific: axis-aligned H/V quantum Hadamard passes struggle on non-orthogonal curves.")
        elif rob_f1 < 0.25 and q_f1 < 0.25:
            interp_lines.append(f"**Robinson Referee — Image-Level Difficulty:** Both Robinson (F1 = {rob_f1:.3f}) and {method_name} (F1 = {q_f1:.3f}) struggle on this patch, diagnosing an inherently low-contrast or noisy crater rim rather than a quantum circuit defect.")
        else:
            interp_lines.append(f"**Competitive Alignment:** {method_name} (F1 = {q_f1:.3f}) closely tracks the classical Robinson baseline (F1 = {rob_f1:.3f}).")

    return "<br><br>".join(interp_lines)


def render_single_method_card(name, cont_map, bin_mask, original_img, eval_res,
                              resource_info, robinson_eval):
    """
    Renders visual output pair, intrinsic statistics, accuracy metrics,
    computational resources, and plain-English automated diagnostic box.
    """
    h, w = original_img.shape
    total_pixels = h * w
    edge_count = int(np.sum(bin_mask > 0))
    coverage_pct = (edge_count / total_pixels) * 100.0

    # 1. Visual Outputs (3 columns: Continuous, Binary, Overlay)
    st.markdown("##### Visual Outputs")
    col_v1, col_v2, col_v3 = st.columns(3)

    with col_v1:
        st.caption("Continuous Magnitude / Confidence")
        fig1, ax1 = plt.subplots(figsize=(2.6, 2.6), dpi=100)
        fig1.patch.set_facecolor('#0d1117')
        im1 = ax1.imshow(cont_map, cmap='magma', vmin=0, vmax=1)
        ax1.axis('off')
        st.pyplot(fig1)
        plt.close(fig1)

    with col_v2:
        st.caption("Thresholded Binary Mask")
        fig2, ax2 = plt.subplots(figsize=(2.6, 2.6), dpi=100)
        fig2.patch.set_facecolor('#0d1117')
        ax2.imshow(bin_mask, cmap='gray', vmin=0, vmax=1)
        ax2.axis('off')
        st.pyplot(fig2)
        plt.close(fig2)

    with col_v3:
        st.caption("Overlay on Original (Magenta)")
        overlay = cv2.cvtColor(np.clip(original_img, 0, 255).astype(np.uint8), cv2.COLOR_GRAY2RGB)
        overlay[bin_mask > 0] = [255, 0, 180]  # Magenta
        fig3, ax3 = plt.subplots(figsize=(2.6, 2.6), dpi=100)
        fig3.patch.set_facecolor('#0d1117')
        ax3.imshow(overlay)
        ax3.axis('off')
        st.pyplot(fig3)
        plt.close(fig3)

    # 2. Intrinsic Statistics
    st.markdown("##### Intrinsic Edge Statistics (Independent of Ground Truth)")
    m_conf, s_conf = float(np.mean(cont_map)), float(np.std(cont_map))
    c_st1, c_st2, c_st3 = st.columns(3)
    c_st1.metric("Edge Pixel Count", f"{edge_count} px", f"{edge_count}/{total_pixels}")
    c_st2.metric("Image Coverage", f"{coverage_pct:.1f}%")
    c_st3.metric("Mean Strength / Conf", f"{m_conf:.3f} ± {s_conf:.3f}")

    # 3. Ground Truth Accuracy Metrics (If Available)
    if eval_res is not None:
        st.markdown("##### Ground Truth Accuracy Benchmark Scores")
        f1_col1, f1_col2, f1_col3, f1_col4 = st.columns(4)
        f1_col1.metric("Exact Boundary F1", f"{eval_res['f1_exact']:.3f}")
        f1_col2.metric("1-px Tolerance F1", f"{eval_res['f1_1px']:.3f}", f"+{(eval_res['f1_1px'] - eval_res['f1_exact']):.3f}")
        f1_col3.metric("2-px Tolerance F1", f"{eval_res['f1_2px']:.3f}", f"+{(eval_res['f1_2px'] - eval_res['f1_exact']):.3f}")
        f1_col4.metric("IoU (Jaccard)", f"{eval_res['iou']:.3f}")

        acc_col1, acc_col2, acc_col3, acc_col4 = st.columns(4)
        acc_col1.metric("Precision (Exact)", f"{eval_res['precision_exact']:.3f}")
        acc_col2.metric("Recall (Exact)", f"{eval_res['recall_exact']:.3f}")
        acc_col3.metric("Chamfer Distance", f"{eval_res['chamfer']:.2f} px")
        acc_col4.metric("PR-AUC", f"{eval_res['pr_auc']:.3f}")

        # Expandable Confusion Matrix & Formulas
        with st.expander("🔍 View Confusion Matrix & Mathematical Evaluation Formulas"):
            st.markdown(f"""
            **Exact Confusion Matrix (Counts):**
            - True Positives ($TP$): `{eval_res['tp']}`
            - False Positives ($FP$): `{eval_res['fp']}`
            - False Negatives ($FN$): `{eval_res['fn']}`
            - True Negatives ($TN$): `{eval_res['tn']}`
            """)
            st.latex(r"P = \frac{TP}{TP + FP}, \quad R = \frac{TP}{TP + FN}, \quad F_1 = \frac{2PR}{P + R}")
            st.latex(r"\text{IoU} = \frac{TP}{TP + FP + FN}, \quad \text{Chamfer} = \frac{1}{2}\left[\frac{1}{|P|}\sum_{p\in P}\min_{g\in G}\|p-g\| + \frac{1}{|G|}\sum_{g\in G}\min_{p\in P}\|g-p\|\right]")

    # 4. Computational & Hardware Resources
    st.markdown("##### Computational & Hardware Resource Consumption")
    r1, r2, r3, r4 = st.columns(4)
    r1.metric("Total Qubits", f"{resource_info.get('qubits', 0)}")
    r2.metric("Circuit Depth", f"{resource_info.get('depth', 0)}")
    r3.metric("Kernel Time", f"{resource_info.get('kernel_ms', 0.0):.1f} ms")
    r4.metric("E2E Wall-Clock", f"{resource_info.get('e2e_ms', 0.0):.1f} ms")

    # 5. Automated Diagnostic Interpretation
    st.markdown("##### 💡 Automated Diagnostic Interpretation")
    interp_text = generate_automated_interpretation(name, coverage_pct, eval_res, robinson_eval)
    st.info(interp_text)


def render_method_scorecards(all_methods_data, original_img, gt_mask):
    """
    Renders tabs for each method, followed by a Unified Comparative Benchmark Table.
    """
    st.markdown("### 6. Separate Method Scorecards & Automated Diagnostic Interpretations")

    # First evaluate all methods against ground truth (if available)
    eval_results = {}
    for name, data in all_methods_data.items():
        if gt_mask is not None:
            from dashboard.components.math_helpers import evaluate_predictions
            eval_results[name] = evaluate_predictions(data['binary'], gt_mask, data['confidence_map'])
        else:
            eval_results[name] = None

    robinson_eval = eval_results.get('Robinson Compass')

    # Individual method tabs
    method_keys = list(all_methods_data.keys())
    tabs = st.tabs([f"📊 {m}" for m in method_keys])

    for idx, name in enumerate(method_keys):
        with tabs[idx]:
            data = all_methods_data[name]
            res_info = {
                'qubits': data.get('n_total_qubits', 0),
                'depth': data.get('avg_depth', 0),
                'kernel_ms': data.get('kernel_time_ms', 0.0),
                'e2e_ms': data.get('e2e_time_ms', 0.0)
            }
            render_single_method_card(
                name=name,
                cont_map=data['confidence_map'],
                bin_mask=data['binary'],
                original_img=original_img,
                eval_res=eval_results[name],
                resource_info=res_info,
                robinson_eval=robinson_eval
            )

    # Unified Comparative Benchmark Table
    st.markdown("#### 🏆 Unified Comparative Benchmark Table")
    rows = []
    for name in method_keys:
        d = all_methods_data[name]
        e = eval_results[name]
        edge_px = int(np.sum(d['binary'] > 0))
        cov = (edge_px / d['binary'].size) * 100.0

        row = {
            'Method': name,
            'Qubits': d.get('n_total_qubits', 0),
            'Coverage (%)': f"{cov:.1f}%",
            'E2E Time (ms)': f"{d.get('e2e_time_ms', 0.0):.1f}"
        }
        if e is not None:
            row.update({
                'Exact F1': f"{e['f1_exact']:.3f}",
                '1-px Tol F1': f"{e['f1_1px']:.3f}",
                '2-px Tol F1': f"{e['f1_2px']:.3f}",
                'Precision': f"{e['precision_exact']:.3f}",
                'Recall': f"{e['recall_exact']:.3f}",
                'IoU': f"{e['iou']:.3f}",
                'Chamfer (px)': f"{e['chamfer']:.2f}"
            })
        rows.append(row)

    df_benchmark = pd.DataFrame(rows)
    st.dataframe(df_benchmark, use_container_width=True, hide_index=True)
