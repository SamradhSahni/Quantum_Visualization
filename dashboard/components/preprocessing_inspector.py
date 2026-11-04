"""
Preprocessing Visual & Mathematical Inspector Component
Renders the 3-stage horizontal visual progression strip:
1. Raw Input & Crop
2. Controlled Degradation (Noise, Blur, Contrast, Ramp)
3. Enhancement Filter (Normalisation, Gaussian, Median, CLAHE, Gamma)
alongside live formulas and numerical neighborhood calculations.
"""
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def render_preprocessing_inspector(raw_img, degraded_img, deg_diff, deg_formula, deg_info,
                                  enhanced_img, hist_before, hist_after, filter_name,
                                  filter_formula, filter_info, x, y, submat):
    """
    Renders the horizontal progression strip and step-by-step arithmetic for preprocessing.
    """
    st.markdown("### 3. Phase-by-Phase Preprocessing Visual & Mathematical Inspector")

    # Metadata metrics
    h, w = raw_img.shape
    min_v, max_v = float(np.min(raw_img)), float(np.max(raw_img))
    mu, sigma = float(np.mean(raw_img)), float(np.std(raw_img))

    # Stage 1: Visual Strip (3 Horizontal Panels)
    st.markdown("#### Horizontal Preprocessing Progression Strip")
    c1, c2, c3 = st.columns(3)

    with c1:
        st.markdown("**Stage 1: Raw Patch**")
        fig1, ax1 = plt.subplots(figsize=(3, 3), dpi=100)
        fig1.patch.set_facecolor('#0d1117')
        ax1.imshow(raw_img, cmap='gray', vmin=0, vmax=255)
        ax1.set_title(f"Raw ({h}x{w})", color='#e6edf3', fontsize=9)
        ax1.axis('off')
        st.pyplot(fig1)
        plt.close(fig1)
        st.caption(f"Min: {min_v:.0f} | Max: {max_v:.0f} | μ: {mu:.1f} | σ: {sigma:.1f}")

    with c2:
        st.markdown("**Stage 2: Degradation**")
        fig2, ax2 = plt.subplots(figsize=(3, 3), dpi=100)
        fig2.patch.set_facecolor('#0d1117')
        ax2.imshow(degraded_img, cmap='gray', vmin=0, vmax=255)
        ax2.set_title(f"Degraded ({h}x{w})", color='#e6edf3', fontsize=9)
        ax2.axis('off')
        st.pyplot(fig2)
        plt.close(fig2)
        mean_diff = float(np.mean(deg_diff))
        st.caption(f"Diff Heatmap Mean: {mean_diff:.2f}")

    with c3:
        st.markdown(f"**Stage 3: Filter [{filter_name}]**")
        fig3, ax3 = plt.subplots(figsize=(3, 3), dpi=100)
        fig3.patch.set_facecolor('#0d1117')
        ax3.imshow(enhanced_img, cmap='gray', vmin=0, vmax=255)
        ax3.set_title(f"Enhanced ({h}x{w})", color='#e6edf3', fontsize=9)
        ax3.axis('off')
        st.pyplot(fig3)
        plt.close(fig3)
        enh_min, enh_max = float(np.min(enhanced_img)), float(np.max(enhanced_img))
        st.caption(f"Min: {enh_min:.1f} | Max: {enh_max:.1f} | μ: {np.mean(enhanced_img):.1f}")

    # Histogram Comparison (Before vs After Filter)
    st.markdown("#### Intensity Distribution (Before vs After Filter)")
    fig_hist, ax_hist = plt.subplots(figsize=(8, 2.2), dpi=120)
    fig_hist.patch.set_facecolor('#0d1117')
    ax_hist.set_facecolor('#0d1117')
    bins = np.linspace(0, 256, 33)

    ax_hist.bar(bins[:-1], hist_before, width=7.0, alpha=0.5, color='#f85149', label='Before Filter')
    ax_hist.bar(bins[:-1] + 3.0, hist_after, width=7.0, alpha=0.7, color='#3fb950', label='After Filter')
    ax_hist.set_xlabel('Grayscale Intensity [0-255]', color='#8b9eb0', fontsize=8)
    ax_hist.set_ylabel('Pixel Count', color='#8b9eb0', fontsize=8)
    ax_hist.tick_params(colors='#8b9eb0', labelsize=8)
    ax_hist.legend(facecolor='#161b22', edgecolor='#30363d', labelcolor='#e6edf3', fontsize=8)
    for s in ax_hist.spines.values():
        s.set_color('#30363d')
    plt.tight_layout()
    st.pyplot(fig_hist)
    plt.close(fig_hist)

    # Step-by-Step Live Arithmetic at (x, y)
    st.markdown(f"#### Live Behind-the-Scenes Math at Selected Pixel $(x={x}, y={y})$")
    col_deg_math, col_enh_math = st.columns(2)

    with col_deg_math:
        st.markdown("**Degradation Step Calculation:**")
        st.latex(deg_formula)
        p_raw = float(raw_img[y, x])
        p_deg = float(degraded_img[y, x])
        st.markdown(f"""
        - Raw Input: $I({x}, {y}) = {p_raw:.1f}$
        - Degraded Output: $I_{{\\text{{noisy}}}}({x}, {y}) = {p_deg:.1f}$
        - Difference at this pixel: $\\Delta = |{p_deg:.1f} - {p_raw:.1f}| = {abs(p_deg - p_raw):.1f}$
        """)

    with col_enh_math:
        st.markdown(f"**Filter Step Calculation [{filter_name}]:**")
        st.latex(filter_formula)

        if filter_name == 'Normalisation':
            I_min = filter_info.get('I_min', 0.0)
            I_max = filter_info.get('I_max', 255.0)
            st.markdown(f"""
            - Dynamic Range: $[I_{{\\min}} = {I_min:.1f}, I_{{\\max}} = {I_max:.1f}]$
            - Calculation: $\\frac{{{p_deg:.1f} - {I_min:.1f}}}{{{I_max:.1f} - {I_min:.1f}}} \\times 255 = {float(enhanced_img[y, x]):.1f}$
            """)
        elif filter_name == 'Median Filter':
            sorted_neighbors = sorted(submat.flatten())
            median_val = sorted_neighbors[4]
            st.markdown(f"""
            - Sorted 9 Neighbor Intensities:
            `{', '.join([f'{v:.0f}' for v in sorted_neighbors[:4]])}, **[{median_val:.0f}]**, {', '.join([f'{v:.0f}' for v in sorted_neighbors[5:]])}`
            - 5th Element (Median) chosen: **{median_val:.0f}**
            """)
        elif filter_name == 'Gaussian Smoothing':
            k = filter_info.get('kernel', np.ones((3, 3)) / 9.0)
            w_sum = np.sum(submat * k)
            st.markdown(f"""
            - Gaussian Kernel Weighted Convolution Sum:
            $\\sum_{{u,v}} I(x+u, y+v) \\cdot K(u,v) = {w_sum:.1f}$
            """)
        elif filter_name == 'Gamma Correction':
            gamma = filter_info.get('gamma', 1.0)
            inv_gamma = filter_info.get('inv_gamma', 1.0)
            st.markdown(f"""
            - Formula: $255 \\times \\left(\\frac{{{p_deg:.1f}}}{{255}}\\right)^{{1/{gamma:.2f}}} = {float(enhanced_img[y,x]):.1f}$
            """)
        else:
            st.markdown(f"Output remains unadjusted: $I({x}, {y}) = {float(enhanced_img[y,x]):.1f}$")
