"""
Deep-Dive Classical Edge Detection Pipeline Component
Equal depth and transparency to Quantum:
4A. Sobel: 4-image visual progression + matrix multiplication at (x, y)
4B. Canny: 5-stage visual progression + NMS & Hysteresis math at (x, y)
4C. Robinson: 2x4 directional response grid + Dominant direction color map + response bar chart at (x, y)
"""
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def render_classical_inspector(sobel_data, canny_data, robinson_data, x, y, submat):
    """
    Renders deep-dive intermediate visualizations and live formulas for Sobel, Canny, and Robinson.
    """
    st.markdown("### 4. Deep-Dive Classical Edge Detection Pipeline")
    tab_sobel, tab_canny, tab_robinson = st.tabs([
        "4A. Sobel Gradient Operator",
        "4B. Canny 5-Stage Detector",
        "4C. Robinson 8-Direction Compass"
    ])

    # =========================================================================
    # 4A. Sobel Operator Breakdown
    # =========================================================================
    with tab_sobel:
        st.markdown("#### Sobel Intermediate Visual Progression Strip")
        c1, c2, c3, c4 = st.columns(4)

        with c1:
            st.markdown("**1. Horizontal $|G_x|$**")
            f1, a1 = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            f1.patch.set_facecolor('#0d1117')
            a1.imshow(np.abs(sobel_data['gx']), cmap='viridis')
            a1.axis('off')
            st.pyplot(f1)
            plt.close(f1)

        with c2:
            st.markdown("**2. Vertical $|G_y|$**")
            f2, a2 = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            f2.patch.set_facecolor('#0d1117')
            a2.imshow(np.abs(sobel_data['gy']), cmap='viridis')
            a2.axis('off')
            st.pyplot(f2)
            plt.close(f2)

        with c3:
            st.markdown("**3. Magnitude $G = \\sqrt{G_x^2 + G_y^2}$**")
            f3, a3 = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            f3.patch.set_facecolor('#0d1117')
            a3.imshow(sobel_data['magnitude_norm'], cmap='magma')
            a3.axis('off')
            st.pyplot(f3)
            plt.close(f3)

        with c4:
            st.markdown(f"**4. Binary Edges ($G \\ge {sobel_data['threshold']:.2f}$)**")
            f4, a4 = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            f4.patch.set_facecolor('#0d1117')
            a4.imshow(sobel_data['binary'], cmap='gray', vmin=0, vmax=1)
            a4.axis('off')
            st.pyplot(f4)
            plt.close(f4)

        st.markdown(f"#### Behind-the-Scenes Sobel Matrix Convolution Math at $(x={x}, y={y})$")
        col_m1, col_m2 = st.columns(2)

        with col_m1:
            st.markdown("**Neighborhood Submatrix $A$ and Sobel Kernels $K_x, K_y$:**")
            st.latex(r"K_x = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}, \quad K_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}")
            st.markdown(f"Actual $3\\times 3$ values around $({x}, {y})$:")
            st.latex(rf"\begin{{bmatrix}} {submat[0,0]:.1f} & {submat[0,1]:.1f} & {submat[0,2]:.1f} \\ {submat[1,0]:.1f} & {submat[1,1]:.1f} & {submat[1,2]:.1f} \\ {submat[2,0]:.1f} & {submat[2,1]:.1f} & {submat[2,2]:.1f} \end{bmatrix}")

        with col_m2:
            st.markdown("**Live Element-Wise Convolution Product & Angle:**")
            kx = sobel_data['kx']
            ky = sobel_data['ky']
            gx_calc = np.sum(submat * kx)
            gy_calc = np.sum(submat * ky)
            mag_calc = np.sqrt(gx_calc**2 + gy_calc**2)
            angle_calc_rad = np.arctan2(gy_calc, gx_calc)
            angle_calc_deg = np.rad2deg(angle_calc_rad)

            st.latex(rf"G_x({x},{y}) = A * K_x = {gx_calc:.2f}")
            st.latex(rf"G_y({x},{y}) = A * K_y = {gy_calc:.2f}")
            st.latex(rf"G({x},{y}) = \sqrt{{{gx_calc:.2f}^2 + {gy_calc:.2f}^2}} = {mag_calc:.2f}")
            st.latex(rf"\Theta({x},{y}) = \text{{atan2}}({gy_calc:.2f}, {gx_calc:.2f}) = {angle_calc_deg:.1f}^\circ")

    # =========================================================================
    # 4B. Canny Edge Detector Breakdown
    # =========================================================================
    with tab_canny:
        st.markdown("#### Canny 5-Stage Intermediate Visual Progression Strip")
        c1, c2, c3, c4, c5 = st.columns(5)

        with c1:
            st.markdown("**Stage 1: Gaussian**")
            f1, a1 = plt.subplots(figsize=(2, 2), dpi=100)
            f1.patch.set_facecolor('#0d1117')
            a1.imshow(canny_data['stage1_smoothed'], cmap='gray')
            a1.axis('off')
            st.pyplot(f1)
            plt.close(f1)

        with c2:
            st.markdown("**Stage 2: Quant. Angle**")
            f2, a2 = plt.subplots(figsize=(2, 2), dpi=100)
            f2.patch.set_facecolor('#0d1117')
            a2.imshow(canny_data['stage2_quantized_angle'], cmap='twilight', vmin=0, vmax=180)
            a2.axis('off')
            st.pyplot(f2)
            plt.close(f2)

        with c3:
            st.markdown("**Stage 3: NMS Thinned**")
            f3, a3 = plt.subplots(figsize=(2, 2), dpi=100)
            f3.patch.set_facecolor('#0d1117')
            a3.imshow(canny_data['stage3_nms'], cmap='magma')
            a3.axis('off')
            st.pyplot(f3)
            plt.close(f3)

        with c4:
            st.markdown("**Stage 4: Double Thresh**")
            f4, a4 = plt.subplots(figsize=(2, 2), dpi=100)
            f4.patch.set_facecolor('#0d1117')
            # 0=black, 1=yellow (weak), 2=green (strong)
            a4.imshow(canny_data['stage4_double_th'], cmap='Accent', vmin=0, vmax=2)
            a4.axis('off')
            st.pyplot(f4)
            plt.close(f4)

        with c5:
            st.markdown("**Stage 5: Hysteresis**")
            f5, a5 = plt.subplots(figsize=(2, 2), dpi=100)
            f5.patch.set_facecolor('#0d1117')
            a5.imshow(canny_data['stage5_binary'], cmap='gray', vmin=0, vmax=1)
            a5.axis('off')
            st.pyplot(f5)
            plt.close(f5)

        st.markdown(f"#### Behind-the-Scenes Canny NMS & Hysteresis Math at $(x={x}, y={y})$")
        col_c1, col_c2 = st.columns(2)

        with col_c1:
            q_dir = canny_data['stage2_quantized_angle'][y, x]
            mag_val = canny_data['stage2_magnitude'][y, x]
            nms_val = canny_data['stage3_nms'][y, x]
            is_kept = nms_val > 0
            st.markdown(f"""
            **Non-Maximum Suppression (NMS) Evaluation:**
            - Gradient Magnitude $G({x}, {y}) = {mag_val:.1f}$
            - Quantized Normal Angle: **{q_dir}°**
            - Comparison along normal direction ({q_dir}°):
              - *Condition:* $G(x,y) \\ge G(x_+, y_+) \\text{{ and }} G(x,y) \\ge G(x_-, y_-)$
              - *Result:* **{'PASSED (Local Maximum Kept)' if is_kept else 'FAILED (Suppressed to 0)'}**
            """)

        with col_c2:
            low_th = canny_data['low_th']
            high_th = canny_data['high_th']
            th_status = canny_data['stage4_double_th'][y, x]
            status_text = "Strong Edge (> High Thresh)" if th_status == 2 else ("Weak Edge (Between Threshs)" if th_status == 1 else "Suppressed (< Low Thresh)")
            final_bin = canny_data['stage5_binary'][y, x]

            st.markdown(f"""
            **Double Threshold & Hysteresis Tracking:**
            - Lower Threshold $T_{{\\text{{low}}}} = {low_th}$, Upper Threshold $T_{{\\text{{high}}}} = {high_th}$
            - NMS Value: `{nms_val:.1f}`
            - Classification: **{status_text}**
            - Hysteresis Connectivity Result: **{'Edge Pixel (1)' if final_bin else 'Non-Edge (0)'}**
            """)

    # =========================================================================
    # 4C. Robinson Compass Operator Breakdown
    # =========================================================================
    with tab_robinson:
        st.markdown("#### Robinson 8-Directional Response Maps $2\\times 4$ Grid")
        dir_keys = robinson_data['dir_keys']
        responses = robinson_data['directional_responses']

        grid_rows = [dir_keys[:4], dir_keys[4:]]
        for row in grid_rows:
            cols = st.columns(4)
            for idx, angle in enumerate(row):
                with cols[idx]:
                    st.caption(f"**Compass: {angle}°**")
                    fig_r, ax_r = plt.subplots(figsize=(2.2, 2.2), dpi=100)
                    fig_r.patch.set_facecolor('#0d1117')
                    ax_r.imshow(responses[angle], cmap='viridis')
                    ax_r.axis('off')
                    st.pyplot(fig_r)
                    plt.close(fig_r)

        st.markdown("#### Dominant Direction Map & Max Magnitude")
        c_dom1, c_dom2, c_dom3 = st.columns(3)
        with c_dom1:
            st.markdown("**Max Edge Magnitude $E(x,y)$**")
            fig_e, ax_e = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            fig_e.patch.set_facecolor('#0d1117')
            ax_e.imshow(robinson_data['magnitude_norm'], cmap='magma')
            ax_e.axis('off')
            st.pyplot(fig_e)
            plt.close(fig_e)

        with c_dom2:
            st.markdown("**Dominant Direction $D(x,y)$ (deg)**")
            fig_d, ax_d = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            fig_d.patch.set_facecolor('#0d1117')
            im_d = ax_d.imshow(robinson_data['dominant_direction'], cmap='twilight', vmin=0, vmax=315)
            ax_d.axis('off')
            st.pyplot(fig_d)
            plt.close(fig_d)

        with c_dom3:
            st.markdown(f"**Binary Edge Map ($E \\ge {robinson_data['threshold']:.2f}$)**")
            fig_b, ax_b = plt.subplots(figsize=(2.5, 2.5), dpi=100)
            fig_b.patch.set_facecolor('#0d1117')
            ax_b.imshow(robinson_data['binary'], cmap='gray', vmin=0, vmax=1)
            ax_b.axis('off')
            st.pyplot(fig_b)
            plt.close(fig_b)

        st.markdown(f"#### Behind-the-Scenes Compass Responses at $(x={x}, y={y})$")
        col_chart, col_rob_math = st.columns([2, 1])

        with col_chart:
            # Bar chart of the 8 responses
            angles_str = [f"{a}°" for a in dir_keys]
            vals = [float(responses[a][y, x]) for a in dir_keys]
            best_dir = robinson_data['dominant_direction'][y, x]
            max_resp = robinson_data['magnitude'][y, x]

            fig_bar, ax_bar = plt.subplots(figsize=(6, 2.5), dpi=120)
            fig_bar.patch.set_facecolor('#0d1117')
            ax_bar.set_facecolor('#0d1117')

            colors = ['#58a6ff' if a != best_dir else '#f85149' for a in dir_keys]
            ax_bar.bar(angles_str, vals, color=colors, edgecolor='#30363d')
            ax_bar.set_ylabel("Response |R_k|", color='#8b9eb0', fontsize=8)
            ax_bar.set_title(f"8 Compass Convolutions at ({x},{y}) — Winning Angle: {best_dir}°", color='#e6edf3', fontsize=9)
            ax_bar.tick_params(colors='#8b9eb0', labelsize=8)
            for s in ax_bar.spines.values():
                s.set_color('#30363d')
            plt.tight_layout()
            st.pyplot(fig_bar)
            plt.close(fig_bar)

        with col_rob_math:
            st.markdown(f"""
            **Robinson Decision Rule:**
            $$E(x,y) = \\max_k |R_k(x,y)| = {max_resp:.2f}$$
            $$D(x,y) = \\arg\\max_k |R_k(x,y)| = {best_dir}^\\circ$$

            The winning direction is **{best_dir}°**, indicating an edge oriented perpendicular to {best_dir}°.
            """)
