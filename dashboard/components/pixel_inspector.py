"""
Interactive Pixel Coordinate Inspector Component
Provides global coordinate selection (x, y) with 3x3 neighborhood bounding-box overlays,
extracts real submatrices, and sets up live arithmetic across Preprocessing, Classical, and Quantum stages.
"""
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def extract_neighborhood_3x3(image, y, x):
    """
    Extracts 3x3 pixel neighborhood around (y, x) with reflection at boundaries.
    """
    h, w = image.shape
    padded = np.pad(image, ((1, 1), (1, 1)), mode='reflect')
    # in padded array, (y, x) is at (y+1, x+1)
    py, px = y + 1, x + 1
    submat = padded[py - 1:py + 2, px - 1:px + 2]
    return submat


def render_pixel_inspector(image, key_prefix="global"):
    """
    Renders the coordinate selector sliders, bounding box visualizer, and 3x3 neighborhood inspector.
    Returns: x (int), y (int), submatrix_3x3 (np.ndarray), center_val (float)
    """
    st.markdown("### 2. Live Pixel Coordinate & Neighborhood Math Inspector")
    st.caption("Select any coordinate $(x, y)$ on the current patch. The exact pixel intensity and its $3\\times 3$ spatial neighborhood are fed live into all mathematical equations below.")

    h, w = image.shape
    c1, c2, c3 = st.columns([1, 1, 2])

    with c1:
        x = st.slider("Column Coordinate (x)", min_value=0, max_value=w - 1, value=min(w // 2, max(0, w - 1)), key=f"{key_prefix}_x")
    with c2:
        y = st.slider("Row Coordinate (y)", min_value=0, max_value=h - 1, value=min(h // 2, max(0, h - 1)), key=f"{key_prefix}_y")

    submat = extract_neighborhood_3x3(image, y, x)
    center_val = float(image[y, x])

    with c3:
        # Display numerical 3x3 neighborhood in styled table
        st.markdown(f"**Target Pixel:** $(x={x}, y={y})$ &nbsp;|&nbsp; **Intensity:** `{center_val:.1f}` / 255")
        st.markdown(f"""
        <table style="width:100%; text-align:center; border-collapse:collapse; font-family:Consolas, monospace; font-size:12px;">
            <tr>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[0,0]:.1f}</td>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[0,1]:.1f}</td>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[0,2]:.1f}</td>
            </tr>
            <tr>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[1,0]:.1f}</td>
                <td style="border:2px solid #58a6ff; padding:6px; background:#1c3d5a; font-weight:bold; color:#58a6ff;">{submat[1,1]:.1f}</td>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[1,2]:.1f}</td>
            </tr>
            <tr>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[2,0]:.1f}</td>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[2,1]:.1f}</td>
                <td style="border:1px solid #334a5e; padding:6px; background:#162330;">{submat[2,2]:.1f}</td>
            </tr>
        </table>
        """, unsafe_allow_html=True)

    # Plot image with highlighted 3x3 bounding box around (x, y)
    fig, ax = plt.subplots(figsize=(4, 4), dpi=120)
    fig.patch.set_facecolor('#0d1117')
    ax.set_facecolor('#0d1117')
    im = ax.imshow(image, cmap='gray', vmin=0, vmax=255, interpolation='nearest')

    # Draw 3x3 bounding box
    rect = patches.Rectangle((x - 1.5, y - 1.5), 3, 3, linewidth=1.5, edgecolor='#388bfd', facecolor='none', linestyle='--')
    ax.add_patch(rect)

    # Draw center dot
    ax.plot(x, y, 'ro', markersize=6, label=f"Pixel ({x},{y})")

    ax.set_title(f"Patch ({h}x{w}) with 3x3 Neighborhood at ({x},{y})", color='#e6edf3', fontsize=10)
    ax.tick_params(colors='#8b9eb0', labelsize=8)
    for spine in ax.spines.values():
        spine.set_color('#30363d')
    plt.tight_layout()

    col_preview, col_desc = st.columns([1.5, 2.5])
    with col_preview:
        st.pyplot(fig)
        plt.close(fig)

    with col_desc:
        st.info(f"""
        **Neighborhood Coordinate Matrix (y, x):**
        - Top Row: $(y-1, x-1)={submat[0,0]:.0f}$, $(y-1, x)={submat[0,1]:.0f}$, $(y-1, x+1)={submat[0,2]:.0f}$
        - Center Row: $(y, x-1)={submat[1,0]:.0f}$, **Target $(y, x)={submat[1,1]:.0f}$**, $(y, x+1)={submat[1,2]:.0f}$
        - Bottom Row: $(y+1, x-1)={submat[2,0]:.0f}$, $(y+1, x)={submat[2,1]:.0f}$, $(y+1, x+1)={submat[2,2]:.0f}$
        """)

    return x, y, submat, center_val
