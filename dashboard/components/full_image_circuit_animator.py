"""
Spacious, High-Contrast Full-Image Patch-by-Patch Quantum Circuit & Visual Edge Reconstruction Engine
Provides:
1. Panel 1: Big Input Canvas (360x360 px) with animated golden sliding 8x8 ROI window
            + Magnified Active 8x8 Patch Canvas (360x360 px) with live pixel cursor & cell grid
            + Live Mathematical Data-Flow Transmission Bridge (Intensity -> FRQI Angle -> Amplitude diff -> P(edge))
2. Panel 2: Large Standalone Dual Quantum Circuits (Horizontal Pass & Vertical Pass, 175px each, full width)
            with moving laser execution cursors
3. Panel 3: Reconstructed Quantum Edge Canvas (360x360 px) forming pixel-by-pixel live
            + Active 8x8 Patch Edge Map (360x360 px)
            + Live glowing laser scanning crosshair tracking active coordinate on both canvases
"""
import json
import numpy as np

def get_full_image_animator_html(image_2d, patch_size=8, auto_start=True, *args, **kwargs):
    """
    Generates standalone HTML string for full-image patch-by-patch quantum edge detection.
    image_2d: 2D numpy array of shape (H, W), dtype uint8 or float [0, 255]. Supports up to 512x512.
    patch_size: size of quantum patch (default 8 for 6-qubit circuit).
    auto_start: whether the simulation starts building immediately on load.
    """
    h, w = image_2d.shape
    # Ensure dimensions are multiples of patch_size
    pad_h = ((h + patch_size - 1) // patch_size) * patch_size
    pad_w = ((w + patch_size - 1) // patch_size) * patch_size
    if pad_h != h or pad_w != w:
        padded = np.pad(image_2d, ((0, pad_h - h), (0, pad_w - w)), mode='edge')
    else:
        padded = image_2d

    flat_pixels = [int(v) for v in padded.flatten()]
    image_meta = {
        "width": int(pad_w),
        "height": int(pad_h),
        "orig_width": int(w),
        "orig_height": int(h),
        "patch_size": int(patch_size),
        "n_patches_x": int(pad_w // patch_size),
        "n_patches_y": int(pad_h // patch_size),
        "total_patches": int((pad_w // patch_size) * (pad_h // patch_size)),
        "pixels": flat_pixels,
        "auto_start": bool(auto_start)
    }

    meta_json = json.dumps(image_meta)

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spacious Full-Image Quantum Circuit Pipeline</title>
<style>
* {{ box-sizing: border-box; }}
body {{
  margin: 0;
  padding: 16px;
  background-color: #070a0f;
  color: #f0f6fc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
}}
.main-wrapper {{
  max-width: 1180px;
  margin: 0 auto;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
}}
.top-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid #21262d;
  padding-bottom: 16px;
  margin-bottom: 20px;
}}
.top-title {{
  font-size: 22px;
  font-weight: 700;
  color: #58a6ff;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}}
.controls-bar {{
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 20px;
}}
.btn {{
  border: 1px solid #30363d;
  background: #21262d;
  color: #f0f6fc;
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}}
.btn:hover {{
  background: #30363d;
  border-color: #8b949e;
}}
.btn-build {{
  background: linear-gradient(135deg, #8957e5, #a371f7);
  color: #ffffff;
  border-color: #bc8cff;
  box-shadow: 0 0 16px rgba(163, 113, 247, 0.5);
}}
.btn-build:hover {{
  background: linear-gradient(135deg, #a371f7, #bc8cff);
}}
.btn-instant {{
  background: linear-gradient(135deg, #1f6feb, #388bfd);
  color: #ffffff;
  border-color: #58a6ff;
}}
.btn-instant:hover {{
  background: linear-gradient(135deg, #388bfd, #58a6ff);
}}
.form-select {{
  background: #0d1117;
  color: #f0f6fc;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  outline: none;
}}
.hud-strip {{
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 14px 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}}
.hud-item {{
  display: flex;
  flex-direction: column;
  gap: 4px;
}}
.hud-label {{
  font-size: 11px;
  color: #8b9eb0;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 600;
}}
.hud-val {{
  font-size: 15px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
}}
.progress-wrap {{
  width: 100%;
  height: 9px;
  background: #21262d;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 8px;
}}
.progress-fill {{
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #388bfd, #a371f7, #ff79c6);
  transition: width 0.1s ease;
}}

/* Spacious Section Containers */
.section-panel {{
  background: #11151d;
  border: 1px solid #28313e;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 26px;
}}
.section-heading {{
  font-size: 16px;
  font-weight: 700;
  color: #e6edf3;
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}}

/* Two-column side-by-side stage grid */
.two-col-stage {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  justify-items: center;
  align-items: start;
}}
@media (max-width: 860px) {{
  .two-col-stage {{ grid-template-columns: 1fr; }}
}}

.canvas-box-container {{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}}
.canvas-title-badge {{
  font-size: 12px;
  font-weight: 600;
  color: #8b9eb0;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  width: 360px;
}}

.big-canvas-wrap {{
  position: relative;
  width: 360px;
  height: 360px;
  background: #05080e;
  border: 2px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}}
.big-canvas {{
  width: 360px;
  height: 360px;
  image-rendering: pixelated;
  display: block;
}}
.sliding-roi-box {{
  position: absolute;
  border: 3px solid #ffd700;
  box-shadow: 0 0 16px rgba(255, 215, 0, 0.95), inset 0 0 12px rgba(255, 215, 0, 0.4);
  pointer-events: none;
  transition: all 0.12s ease-out;
  background: rgba(255, 215, 0, 0.22);
}}
.laser-crosshair {{
  position: absolute;
  width: 24px;
  height: 24px;
  pointer-events: none;
  transform: translate(-50%, -50%);
  display: none;
  z-index: 10;
}}
.laser-crosshair::before, .laser-crosshair::after {{
  content: '';
  position: absolute;
  background: #ff2a85;
  box-shadow: 0 0 8px #ff2a85;
}}
.laser-crosshair::before {{
  top: 11px; left: 0; width: 24px; height: 2px;
}}
.laser-crosshair::after {{
  top: 0; left: 11px; width: 2px; height: 24px;
}}
.laser-ring {{
  position: absolute;
  top: 4px; left: 4px; width: 16px; height: 16px;
  border: 2px solid #00f0ff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00f0ff;
  animation: pulseLaser 0.6s infinite alternate;
}}
@keyframes pulseLaser {{
  0% {{ transform: scale(0.9); opacity: 0.8; }}
  100% {{ transform: scale(1.2); opacity: 1; }}
}}

.pixel-cursor-cell {{
  position: absolute;
  border: 3px solid #ff79c6;
  box-shadow: 0 0 12px #ff79c6, inset 0 0 8px rgba(255, 121, 198, 0.5);
  pointer-events: none;
  background: rgba(255, 121, 198, 0.3);
  transition: all 0.08s ease-out;
}}

/* Data Flow Transmission Bridge */
.data-flow-strip {{
  background: #0d1117;
  border: 1px solid #30363d;
  border-left: 5px solid #a371f7;
  border-radius: 8px;
  padding: 16px 20px;
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}}
@media (max-width: 900px) {{
  .data-flow-strip {{ grid-template-columns: 1fr 1fr; }}
}}
@media (max-width: 500px) {{
  .data-flow-strip {{ grid-template-columns: 1fr; }}
}}
.flow-step-item {{
  background: #161b22;
  border: 1px solid #21262d;
  padding: 10px 14px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}}
.flow-step-tag {{
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #79c0ff;
  display: flex;
  align-items: center;
  gap: 6px;
}}
.flow-step-math {{
  font-family: 'Consolas', monospace;
  font-size: 12px;
  color: #e6edf3;
}}

/* Panel 2: Large Dual Quantum Circuits */
.circuits-container {{
  display: flex;
  flex-direction: column;
  gap: 18px;
}}
.circuit-card {{
  background: #0d1117;
  border: 1px solid #262c36;
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: inset 0 0 14px rgba(0,0,0,0.4);
}}
.circuit-card-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
}}
.circuit-svg {{
  width: 100%;
  height: 165px;
  display: block;
}}

.footer-info {{
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 14px 18px;
  font-size: 13px;
  color: #8b9eb0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}}
</style>
</head>
<body>

<div class="main-wrapper" id="spacious-quantum-studio">
  <div class="top-header">
    <h2 class="top-title">
      <span>⚛️</span>
      <span>Live Step-by-Step Quantum Edge Reconstruction Studio</span>
    </h2>
    <span style="font-size:13px; color:#8b9eb0;">
      Patch-by-Patch Decomposition &bull; Dual 6-Qubit Interference Circuits &bull; Live Pixel-by-Pixel Assembly
    </span>
  </div>

  <!-- Interactive Controls Bar -->
  <div class="controls-bar">
    <button class="btn btn-build" data-action="run" type="button">▶ Start / Pause Auto-Build</button>
    <button class="btn" data-action="step-pixel" type="button">⏩ Step 1 Pixel</button>
    <button class="btn" data-action="step-patch" type="button">⏭ Step 1 Patch (64 px)</button>
    <button class="btn btn-instant" data-action="instant" type="button">✨ Instant Full Reconstruction</button>
    <button class="btn" data-action="reset" type="button">↺ Reset Canvas</button>

    <label style="display:flex; align-items:center; gap:8px; margin-left:auto; font-size:12px; color:#8b9eb0;">
      Execution Speed:
      <select class="form-select" data-control="speed">
        <option value="120">Slow (120ms)</option>
        <option value="50" selected>Normal (50ms)</option>
        <option value="15">Fast (15ms)</option>
        <option value="3">Hyper (3ms)</option>
      </select>
    </label>
  </div>

  <!-- Real-Time Telemetry HUD -->
  <div class="hud-strip">
    <div class="hud-item">
      <span class="hud-label">Active Patch</span>
      <span class="hud-val" id="hud-patch" style="color:#ffd700;">Patch 1 / 1 [0, 0]</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Active Coordinates</span>
      <span class="hud-val" id="hud-coords" style="color:#58a6ff;">Patch (0, 0) &rarr; Global (0, 0)</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Intensity Hand-off</span>
      <span class="hud-val" id="hud-intensity" style="color:#f0f6fc;">Ia: 0 &bull; Ib: 0 &bull; &Delta;I: 0</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Hadamard Edge Probability</span>
      <span class="hud-val" id="hud-prob" style="color:#ff79c6;">P(edge) = 0.00000</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Reconstruction Progress</span>
      <span class="hud-val" id="hud-progress" style="color:#39d353;">0% (0 / 0 px)</span>
    </div>
    <div class="progress-wrap">
      <div class="progress-fill" id="anim-progress-fill"></div>
    </div>
  </div>

  <!-- PANEL 1: Original Image & Active Patch Deconstruction -->
  <div class="section-panel">
    <div class="section-heading">
      <span style="color:#ffd700;">📸 PANEL 1: Input Image & Active 8×8 Quantum Coordinate Window</span>
      <span style="font-family:monospace; color:#8b9eb0;" id="badge-patch-pos">ROI: [0:8, 0:8]</span>
    </div>

    <div class="two-col-stage">
      <!-- Big Input Canvas -->
      <div class="canvas-box-container">
        <div class="canvas-title-badge">
          <span>Full Image ({pad_w}&times;{pad_h} px)</span>
          <span style="color:#ffd700;">Sliding 8&times;8 Window</span>
        </div>
        <div class="big-canvas-wrap">
          <canvas class="big-canvas" id="canvas-input" width="360" height="360"></canvas>
          <div class="sliding-roi-box" id="sliding-box"></div>
          <div class="laser-crosshair" id="laser-in"><div class="laser-ring"></div></div>
        </div>
      </div>

      <!-- Magnified 8x8 Patch -->
      <div class="canvas-box-container">
        <div class="canvas-title-badge">
          <span>Magnified Active 8&times;8 Patch (45&times; zoom)</span>
          <span style="color:#ff79c6;" id="badge-local-pixel">Pixel (0, 0)</span>
        </div>
        <div class="big-canvas-wrap" style="border-color:#388bfd;">
          <canvas class="big-canvas" id="canvas-patch-in" width="360" height="360"></canvas>
          <div class="pixel-cursor-cell" id="pixel-cursor"></div>
        </div>
      </div>
    </div>

    <!-- Live Mathematical Data Transmission Bridge -->
    <div class="data-flow-strip">
      <div class="flow-step-item">
        <div class="flow-step-tag">Step 1 &bull; Pixel Brightness</div>
        <div class="flow-step-math">
          Active: <b id="flow-px-val" style="color:#58a6ff;">I = 0</b><br>
          Neighbor: <b id="flow-nbr-val" style="color:#79c0ff;">I_nbr = 0</b><br>
          Gradient: <b id="flow-diff-val" style="color:#e6edf3;">&Delta;I = 0</b>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-tag">Step 2 &bull; FRQI Angle Encoding</div>
        <div class="flow-step-math">
          Rotation: <b id="flow-theta-val" style="color:#ffd700;">&theta; = 0.000 rad</b><br>
          Angle: <b id="flow-deg-val" style="color:#ffd700;">0.0&deg;</b><br>
          |c&rang; = cos(&theta;)|0&rang; + sin(&theta;)|1&rang;
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-tag">Step 3 &bull; Hadamard Interference</div>
        <div class="flow-step-math">
          H (col diff): <b id="flow-delta-h" style="color:#ff79c6;">&Delta;a_x = 0.000</b><br>
          H (row diff): <b id="flow-delta-v" style="color:#bc8cff;">&Delta;a_y = 0.000</b><br>
          Constructive: Edges &bull; Flat: &empty;
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-tag">Step 4 &bull; Measurement Collapse</div>
        <div class="flow-step-math">
          Probability: <b id="flow-edge-prob" style="color:#39d353;">P = 0.00000</b><br>
          Quantum Edge: <b id="flow-edge-state" style="color:#39d353;">Resolving...</b><br>
          Basis: <span id="flow-basis-state" style="color:#8b9eb0;">|y&rang;|x&rang;</span>
        </div>
      </div>
    </div>
  </div>

  <!-- PANEL 2: Standalone Dual Quantum Circuits -->
  <div class="section-panel">
    <div class="section-heading">
      <span style="color:#58a6ff;">⚛️ PANEL 2: Standalone Dual 6-Qubit Interference Circuits</span>
      <span style="font-family:monospace; color:#8b9eb0;">Qiskit Aer Emulation Mode</span>
    </div>

    <div class="circuits-container">
      <!-- Circuit A: Horizontal Pass -->
      <div class="circuit-card">
        <div class="circuit-card-header">
          <span style="color:#58a6ff;">Circuit A: Horizontal Pass (q0, q1, q2 Column Shift & Hadamard Interference)</span>
          <span style="color:#79c0ff; font-family:monospace;" id="badge-gate-h">Gate: Ready</span>
        </div>
        <svg class="circuit-svg" id="svg-h" viewBox="0 0 880 155"></svg>
      </div>

      <!-- Circuit B: Vertical Pass -->
      <div class="circuit-card">
        <div class="circuit-card-header">
          <span style="color:#bc8cff;">Circuit B: Vertical Pass (q3, q4, q5 Row Shift & Hadamard Interference)</span>
          <span style="color:#d2a8ff; font-family:monospace;" id="badge-gate-v">Gate: Ready</span>
        </div>
        <svg class="circuit-svg" id="svg-v" viewBox="0 0 880 155"></svg>
      </div>
    </div>
  </div>

  <!-- PANEL 3: Reconstructed Quantum Edge Detection Map -->
  <div class="section-panel">
    <div class="section-heading">
      <span style="color:#ff79c6;">🌟 PANEL 3: Live Reconstructed Quantum Edge Detection Map</span>
      <span style="font-family:monospace; color:#39d353;" id="badge-status-recon">Ready</span>
    </div>

    <div class="two-col-stage">
      <!-- Active Patch Edge Map -->
      <div class="canvas-box-container">
        <div class="canvas-title-badge">
          <span>Active 8&times;8 Patch Quantum Edge Map</span>
          <span style="color:#bc8cff;">Local Probability Map</span>
        </div>
        <div class="big-canvas-wrap" style="border-color:#ff79c6;">
          <canvas class="big-canvas" id="canvas-patch-edge" width="360" height="360"></canvas>
          <div class="pixel-cursor-cell" id="pixel-cursor-edge" style="border-color:#00f0ff;"></div>
        </div>
      </div>

      <!-- Full Assembled Quantum Image Canvas -->
      <div class="canvas-box-container">
        <div class="canvas-title-badge">
          <span>Full Assembled Quantum Edge Map</span>
          <span style="color:#39d353;" id="badge-edge-pct">0% Built</span>
        </div>
        <div class="big-canvas-wrap" style="border-color:#39d353;">
          <canvas class="big-canvas" id="canvas-output" width="360" height="360"></canvas>
          <div class="laser-crosshair" id="laser-out" style="display:block;"><div class="laser-ring"></div></div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-info">
    <span id="footer-text">Simulation engine ready.</span>
    <span style="font-family:monospace; color:#58a6ff;">FRQI Encoding &bull; 6 Qubits/Patch &bull; Parallel Quantum Wave Interference</span>
  </div>
</div>

<script>
(() => {{
  const data = {meta_json};
  const imgW = data.width;
  const imgH = data.height;
  const patchSize = data.patch_size;
  const nPatchesX = data.n_patches_x;
  const nPatchesY = data.n_patches_y;
  const totalPatches = data.total_patches;
  const pixels = data.pixels;
  const autoStart = data.auto_start;

  // DOM Elements
  const canvasIn = document.getElementById('canvas-input');
  const ctxIn = canvasIn.getContext('2d');
  const canvasPatchIn = document.getElementById('canvas-patch-in');
  const ctxPatchIn = canvasPatchIn.getContext('2d');

  const canvasOut = document.getElementById('canvas-output');
  const ctxOut = canvasOut.getContext('2d');
  const canvasPatchEdge = document.getElementById('canvas-patch-edge');
  const ctxPatchEdge = canvasPatchEdge.getContext('2d');

  const slidingBox = document.getElementById('sliding-box');
  const pixelCursor = document.getElementById('pixel-cursor');
  const pixelCursorEdge = document.getElementById('pixel-cursor-edge');
  const laserIn = document.getElementById('laser-in');
  const laserOut = document.getElementById('laser-out');

  // Telemetry HUD
  const hudPatch = document.getElementById('hud-patch');
  const hudCoords = document.getElementById('hud-coords');
  const hudIntensity = document.getElementById('hud-intensity');
  const hudProb = document.getElementById('hud-prob');
  const hudProgress = document.getElementById('hud-progress');
  const progressFill = document.getElementById('anim-progress-fill');
  const badgePatchPos = document.getElementById('badge-patch-pos');
  const badgeStatusRecon = document.getElementById('badge-status-recon');
  const badgeLocalPixel = document.getElementById('badge-local-pixel');
  const badgeEdgePct = document.getElementById('badge-edge-pct');
  const footerText = document.getElementById('footer-text');

  const flowPxVal = document.getElementById('flow-px-val');
  const flowNbrVal = document.getElementById('flow-nbr-val');
  const flowDiffVal = document.getElementById('flow-diff-val');
  const flowThetaVal = document.getElementById('flow-theta-val');
  const flowDegVal = document.getElementById('flow-deg-val');
  const flowDeltaH = document.getElementById('flow-delta-h');
  const flowDeltaV = document.getElementById('flow-delta-v');
  const flowEdgeProb = document.getElementById('flow-edge-prob');
  const flowEdgeState = document.getElementById('flow-edge-state');
  const flowBasisState = document.getElementById('flow-basis-state');

  const badgeGateH = document.getElementById('badge-gate-h');
  const badgeGateV = document.getElementById('badge-gate-v');
  const svgH = document.getElementById('svg-h');
  const svgV = document.getElementById('svg-v');

  // State
  let currentPatchIdx = 0;
  let currentPixelInPatch = 0;
  let running = false;
  let timer = null;
  let speed = 50;
  let gateIdxH = 0;
  let gateIdxV = 0;

  // Buffer: -1 means untouched pending pixel, >= 0 means processed edge value
  const fullEdgeBuffer = new Float32Array(imgW * imgH).fill(-1);
  const patchEdgeBuffer = new Float32Array(64).fill(-1);

  // Pre-calculate global max edge across all patches for consistent contrast normalization
  let globalMaxEdge = 1e-4;
  for (let p = 0; p < totalPatches; p++) {{
    const py = Math.floor(p / nPatchesX) * patchSize;
    const px = (p % nPatchesX) * patchSize;
    const pPix = new Float32Array(64);
    for (let r = 0; r < 8; r++) {{
      for (let c = 0; c < 8; c++) {{
        pPix[r * 8 + c] = pixels[(py + r) * imgW + (px + c)] || 0;
      }}
    }}
    const norm = Math.sqrt(pPix.reduce((s, v) => s + v * v, 0)) || 1.0;
    for (let i = 0; i < 64; i++) {{
      const r = Math.floor(i / 8), c = i % 8;
      const nbrC = (c + 1) % 8;
      const nbrR = (r + 1) % 8;
      const diffH = Math.abs(pPix[r * 8 + c] - pPix[r * 8 + nbrC]) / norm;
      const diffV = Math.abs(pPix[r * 8 + c] - pPix[nbrR * 8 + c]) / norm;
      const pMax = Math.max(diffH * diffH, diffV * diffV);
      if (pMax > globalMaxEdge) globalMaxEdge = pMax;
    }}
  }}

  // Render initial input image onto 360x360 canvas
  function renderInitialInput() {{
    const off = document.createElement('canvas');
    off.width = imgW;
    off.height = imgH;
    const offCtx = off.getContext('2d');
    const imgData = offCtx.createImageData(imgW, imgH);

    for (let i = 0; i < pixels.length; i++) {{
      const val = pixels[i];
      imgData.data[i * 4 + 0] = val;
      imgData.data[i * 4 + 1] = val;
      imgData.data[i * 4 + 2] = val;
      imgData.data[i * 4 + 3] = 255;
    }}
    offCtx.putImageData(imgData, 0, 0);

    ctxIn.imageSmoothingEnabled = false;
    ctxIn.drawImage(off, 0, 0, 360, 360);

    // Initialize output canvas with blueprint grid
    drawOutputCanvas(-1, -1);
  }}

  // Draw Large Dual SVG Circuits
  function drawCircuits(activeH = 0, activeV = 0) {{
    const hGates = [
      {{ name: 'FRQI Init', type: 'init', target: 0 }},
      {{ name: 'CCX Carry', type: 'ccx', controls: [0, 1], target: 2 }},
      {{ name: 'CX Shift', type: 'cx', controls: [0], target: 1 }},
      {{ name: 'X Invert', type: 'x', target: 0 }},
      {{ name: 'H (col diff)', type: 'h', target: 0 }},
      {{ name: 'Measure', type: 'm', target: 0 }}
    ];
    renderSvgCircuit(svgH, hGates, activeH, '#388bfd', 'col');

    const vGates = [
      {{ name: 'FRQI Init', type: 'init', target: 3 }},
      {{ name: 'CCX Carry', type: 'ccx', controls: [3, 4], target: 5 }},
      {{ name: 'CX Shift', type: 'cx', controls: [3], target: 4 }},
      {{ name: 'X Invert', type: 'x', target: 3 }},
      {{ name: 'H (row diff)', type: 'h', target: 3 }},
      {{ name: 'Measure', type: 'm', target: 3 }}
    ];
    renderSvgCircuit(svgV, vGates, activeV, '#bc8cff', 'row');
  }}

  function renderSvgCircuit(svgEl, gates, activeIdx, accentColor, regName) {{
    const w = 880, h = 155;
    const x0 = 100, right = w - 24;
    const gap = (right - x0) / (gates.length + 1);

    let body = `<defs>
      <filter id="glow-${{regName}}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    // 6 Qubit Wires
    for (let q = 0; q < 6; q++) {{
      const y = 20 + q * 21;
      const role = q < 3 ? `q${{q}} (col ${{q}})` : `q${{q}} (row ${{q-3}})`;
      body += `<text x="8" y="${{y + 4}}" fill="#79c0ff" font-family="monospace" font-size="11px" font-weight="700">${{role}}</text>`;
      body += `<line x1="${{x0}}" y1="${{y}}" x2="${{right}}" y2="${{y}}" stroke="${{accentColor}}" stroke-width="2.5" stroke-opacity="0.85"/>`;
    }}

    // Moving glowing vertical laser cursor
    if (activeIdx >= 0 && activeIdx < gates.length) {{
      const cursorX = x0 + (activeIdx + 1) * gap;
      body += `<rect x="${{cursorX - 26}}" y="6" width="52" height="140" rx="8" fill="rgba(88, 166, 255, 0.28)" stroke="${{accentColor}}" stroke-width="3" stroke-dasharray="6,3" filter="url(#glow-${{regName}})"/>`;
    }}

    // Gates
    gates.forEach((gate, i) => {{
      const x = x0 + (i + 1) * gap;
      const isActive = i === activeIdx;

      if (gate.type === 'init') {{
        const fill = isActive ? accentColor : '#1f6feb';
        const stroke = isActive ? '#ffffff' : accentColor;
        body += `<rect x="${{x - 22}}" y="12" width="44" height="130" rx="6" fill="${{fill}}" stroke="${{stroke}}" stroke-width="${{isActive?3:1.5}}"/>`;
        body += `<text x="${{x}}" y="82" text-anchor="middle" fill="#ffffff" font-size="12px" font-weight="bold" transform="rotate(-90 ${{x}} 82)">FRQI State Init</text>`;
      }} else if (gate.type === 'm') {{
        for (let q = 0; q < 6; q++) {{
          const y = 20 + q * 21;
          body += `<rect x="${{x - 12}}" y="${{y - 9}}" width="24" height="18" rx="3" fill="${{isActive?'#d29922':'#9e6a03'}}" stroke="${{isActive?'#ffd700':'#30363d'}}"/>`;
          body += `<text x="${{x}}" y="${{y + 4}}" text-anchor="middle" fill="#ffffff" font-size="9px" font-weight="bold">M</text>`;
        }}
      }} else {{
        const targetY = 20 + gate.target * 21;
        const fill = isActive ? accentColor : '#238636';

        if (gate.controls && gate.controls.length) {{
          const minY = 20 + Math.min(...gate.controls, gate.target) * 21;
          const maxY = 20 + Math.max(...gate.controls, gate.target) * 21;
          body += `<line x1="${{x}}" y1="${{minY}}" x2="${{x}}" y2="${{maxY}}" stroke="${{isActive?accentColor:'#58a6ff'}}" stroke-width="${{isActive?3.5:2}}"/>`;
          gate.controls.forEach(c => {{
            body += `<circle cx="${{x}}" cy="${{20 + c * 21}}" r="5" fill="${{isActive?accentColor:'#f0f6fc'}}"/>`;
          }});
          body += `<circle cx="${{x}}" cy="${{targetY}}" r="10" fill="${{fill}}" stroke="#ffffff" stroke-width="2"/>`;
          body += `<path d="M${{x-6}} ${{targetY}}h12 M${{x}} ${{targetY-6}}v12" stroke="#ffffff" stroke-width="2"/>`;
        }} else {{
          const gateColor = gate.type === 'h' ? (isActive ? '#ff79c6' : '#8957e5') : fill;
          body += `<rect x="${{x - 15}}" y="${{targetY - 11}}" width="30" height="22" rx="4" fill="${{gateColor}}" stroke="${{isActive?'#ffffff':'#388bfd'}}" stroke-width="${{isActive?3:1.5}}"/>`;
          body += `<text x="${{x}}" y="${{targetY + 4}}" text-anchor="middle" fill="#ffffff" font-size="11px" font-weight="bold">${{gate.name.split(' ')[0]}}</text>`;
        }}
      }}
    }});

    svgEl.innerHTML = body;
  }}

  // Extract 8x8 Patch Info
  function getPatch(patchIdx) {{
    const py = Math.floor(patchIdx / nPatchesX);
    const px = patchIdx % nPatchesX;
    const startY = py * patchSize;
    const startX = px * patchSize;

    const patch = new Uint8Array(64);
    for (let r = 0; r < 8; r++) {{
      for (let c = 0; c < 8; c++) {{
        patch[r * 8 + c] = pixels[(startY + r) * imgW + (startX + c)] || 0;
      }}
    }}
    return {{ patch, startX, startY, px, py, patchIdx }};
  }}

  // Compute QHED for 8x8 Patch
  function computePatchQHED(patch) {{
    const norm = Math.sqrt(patch.reduce((s, v) => s + v * v, 0)) || 1.0;
    const amps = patch.map(v => v / norm);
    const edge = new Float32Array(64);

    for (let r = 0; r < 8; r++) {{
      for (let c = 0; c < 8; c++) {{
        const idx = r * 8 + c;
        const nbrC = (c + 1) % 8;
        const nbrR = (r + 1) % 8;
        const diffH = Math.abs(amps[idx] - amps[r * 8 + nbrC]);
        const diffV = Math.abs(amps[idx] - amps[nbrR * 8 + c]);
        edge[idx] = Math.max(diffH * diffH, diffV * diffV);
      }}
    }}
    return edge;
  }}

  // Redraw Output Full Canvas (360x360)
  function drawOutputCanvas(activeGX = -1, activeGY = -1) {{
    const off = document.createElement('canvas');
    off.width = imgW;
    off.height = imgH;
    const offCtx = off.getContext('2d');
    const imgData = offCtx.createImageData(imgW, imgH);

    for (let i = 0; i < fullEdgeBuffer.length; i++) {{
      const rawVal = fullEdgeBuffer[i];
      if (rawVal < 0) {{
        // Untouched pending blueprint
        imgData.data[i * 4 + 0] = 8;
        imgData.data[i * 4 + 1] = 13;
        imgData.data[i * 4 + 2] = 23;
        imgData.data[i * 4 + 3] = 255;
      }} else if (rawVal > 0.0001) {{
        // Evaluated Quantum Edge: Vivid Electric Magenta-Violet
        const norm = Math.min(1.0, Math.pow(rawVal / globalMaxEdge, 0.65));
        imgData.data[i * 4 + 0] = Math.round(255 * norm);
        imgData.data[i * 4 + 1] = Math.round(40 * (1 - norm) + 60 * norm);
        imgData.data[i * 4 + 2] = Math.round(220 + 35 * norm);
        imgData.data[i * 4 + 3] = 255;
      }} else {{
        // Evaluated Flat Area (Destructive interference)
        imgData.data[i * 4 + 0] = 16;
        imgData.data[i * 4 + 1] = 24;
        imgData.data[i * 4 + 2] = 36;
        imgData.data[i * 4 + 3] = 255;
      }}
    }}
    offCtx.putImageData(imgData, 0, 0);

    ctxOut.imageSmoothingEnabled = false;
    ctxOut.drawImage(off, 0, 0, 360, 360);

    // Update laser crosshair
    if (activeGX >= 0 && activeGY >= 0) {{
      const scaleX = 360 / imgW;
      const scaleY = 360 / imgH;
      const posX = (activeGX + 0.5) * scaleX;
      const posY = (activeGY + 0.5) * scaleY;
      laserOut.style.left = `${{posX}}px`;
      laserOut.style.top = `${{posY}}px`;
      laserOut.style.display = 'block';

      laserIn.style.left = `${{posX}}px`;
      laserIn.style.top = `${{posY}}px`;
      laserIn.style.display = 'block';
    }} else {{
      laserOut.style.display = 'none';
      laserIn.style.display = 'none';
    }}
  }}

  // Draw Magnified 8x8 Patch Canvases (360x360 px each)
  function drawPatchCanvases(patch, patchEdge, activePixIdx) {{
    // 1. Input Patch (360x360)
    const offIn = document.createElement('canvas');
    offIn.width = 8; offIn.height = 8;
    const inData = offIn.getContext('2d').createImageData(8, 8);
    for (let i = 0; i < 64; i++) {{
      const v = patch[i];
      inData.data[i * 4 + 0] = v;
      inData.data[i * 4 + 1] = v;
      inData.data[i * 4 + 2] = v;
      inData.data[i * 4 + 3] = 255;
    }}
    offIn.getContext('2d').putImageData(inData, 0, 0);
    ctxPatchIn.imageSmoothingEnabled = false;
    ctxPatchIn.drawImage(offIn, 0, 0, 360, 360);

    // 2. Edge Patch (360x360)
    const offEdge = document.createElement('canvas');
    offEdge.width = 8; offEdge.height = 8;
    const edgeData = offEdge.getContext('2d').createImageData(8, 8);
    for (let i = 0; i < 64; i++) {{
      const val = patchEdge[i];
      if (val < 0) {{
        edgeData.data[i * 4 + 0] = 8;
        edgeData.data[i * 4 + 1] = 13;
        edgeData.data[i * 4 + 2] = 23;
      }} else if (val > 0.0001) {{
        const norm = Math.min(1.0, Math.pow(val / globalMaxEdge, 0.65));
        edgeData.data[i * 4 + 0] = Math.round(255 * norm);
        edgeData.data[i * 4 + 1] = Math.round(40 * (1 - norm) + 60 * norm);
        edgeData.data[i * 4 + 2] = 255;
      }} else {{
        edgeData.data[i * 4 + 0] = 16;
        edgeData.data[i * 4 + 1] = 24;
        edgeData.data[i * 4 + 2] = 36;
      }}
      edgeData.data[i * 4 + 3] = 255;
    }}
    offEdge.getContext('2d').putImageData(edgeData, 0, 0);
    ctxPatchEdge.imageSmoothingEnabled = false;
    ctxPatchEdge.drawImage(offEdge, 0, 0, 360, 360);

    // Update Pixel Cursor on magnified patch
    if (activePixIdx >= 0) {{
      const pxX = activePixIdx % 8;
      const pxY = Math.floor(activePixIdx / 8);
      const cellSize = 360 / 8;
      pixelCursor.style.left = `${{pxX * cellSize}}px`;
      pixelCursor.style.top = `${{pxY * cellSize}}px`;
      pixelCursor.style.width = `${{cellSize}}px`;
      pixelCursor.style.height = `${{cellSize}}px`;

      pixelCursorEdge.style.left = `${{pxX * cellSize}}px`;
      pixelCursorEdge.style.top = `${{pxY * cellSize}}px`;
      pixelCursorEdge.style.width = `${{cellSize}}px`;
      pixelCursorEdge.style.height = `${{cellSize}}px`;

      badgeLocalPixel.textContent = `Pixel (${{pxX}}, ${{pxY}}) &bull; Index ${{activePixIdx}}`;
    }}
  }}

  // Update Sliding ROI Box on Big Input Canvas (360x360)
  function updateSlidingBox(startX, startY) {{
    const scaleX = 360 / imgW;
    const scaleY = 360 / imgH;
    slidingBox.style.left = `${{startX * scaleX}}px`;
    slidingBox.style.top = `${{startY * scaleY}}px`;
    slidingBox.style.width = `${{patchSize * scaleX}}px`;
    slidingBox.style.height = `${{patchSize * scaleY}}px`;
    badgePatchPos.textContent = `ROI: [${{startY}}:${{startY + patchSize}}, ${{startX}}:${{startX + patchSize}}]`;
  }}

  // Execute Single Pixel Step
  function stepPixel() {{
    if (currentPatchIdx >= totalPatches) {{
      stop();
      badgeStatusRecon.textContent = "✅ Complete!";
      footerText.textContent = "Full-image quantum edge detection complete across all patches!";
      badgeEdgePct.textContent = "100% Built";
      return;
    }}

    const pInfo = getPatch(currentPatchIdx);
    updateSlidingBox(pInfo.startX, pInfo.startY);

    const qhedEdges = computePatchQHED(pInfo.patch);

    // Assign current pixel edge
    const edgeVal = qhedEdges[currentPixelInPatch];
    patchEdgeBuffer[currentPixelInPatch] = edgeVal;

    // Immediately commit this pixel into full image buffer
    const lX = currentPixelInPatch % 8;
    const lY = Math.floor(currentPixelInPatch / 8);
    const gX = pInfo.startX + lX;
    const gY = pInfo.startY + lY;
    fullEdgeBuffer[gY * imgW + gX] = edgeVal;

    // Live update visuals
    drawPatchCanvases(pInfo.patch, patchEdgeBuffer, currentPixelInPatch);
    drawOutputCanvas(gX, gY);

    // Advance circuits
    gateIdxH = (gateIdxH + 1) % 6;
    gateIdxV = (gateIdxV + 1) % 6;
    const gateNames = ['Init', 'CCX Carry', 'CX Shift', 'X Invert', 'Hadamard', 'Measure'];
    badgeGateH.textContent = `Gate ${{gateIdxH}}: ${{gateNames[gateIdxH]}}`;
    badgeGateV.textContent = `Gate ${{gateIdxV}}: ${{gateNames[gateIdxV]}}`;
    drawCircuits(gateIdxH, gateIdxV);

    // Telemetry updates
    const valA = pInfo.patch[currentPixelInPatch];
    const nbrC = (lX + 1) % 8;
    const nbrR = (lY + 1) % 8;
    const valCol = pInfo.patch[lY * 8 + nbrC];
    const valRow = pInfo.patch[nbrR * 8 + lX];
    const diff = Math.max(Math.abs(valA - valCol), Math.abs(valA - valRow));

    hudPatch.textContent = `Patch ${{currentPatchIdx + 1}} / ${{totalPatches}} [${{pInfo.px}}, ${{pInfo.py}}]`;
    hudCoords.textContent = `Local (${{lX}}, ${{lY}}) &rarr; Global (${{gX}}, ${{gY}})`;
    hudIntensity.textContent = `I: ${{valA}} &bull; I_nbr: ${{valCol}} &bull; &Delta;I: ${{diff}}`;
    hudProb.textContent = `P(edge) = ${{edgeVal.toFixed(5)}}`;

    const totalDone = currentPatchIdx * 64 + (currentPixelInPatch + 1);
    const totalAll = totalPatches * 64;
    const pct = Math.min(100, Math.round((totalDone / totalAll) * 100));
    hudProgress.textContent = `${{pct}}% (${{totalDone}} / ${{totalAll}} px)`;
    progressFill.style.width = `${{pct}}%`;
    badgeEdgePct.textContent = `${{pct}}% Built`;

    // Data-flow strip updates
    flowPxVal.textContent = `I = ${{valA}}`;
    flowNbrVal.textContent = `I_col = ${{valCol}}, I_row = ${{valRow}}`;
    flowDiffVal.textContent = `&Delta;I = ${{diff}}`;
    const theta = (valA / 255.0) * (Math.PI / 2.0);
    flowThetaVal.textContent = `&theta; = ${{theta.toFixed(3)}} rad`;
    flowDegVal.textContent = `${{(theta * 180 / Math.PI).toFixed(1)}}&deg;`;
    const deltaA = Math.sqrt(edgeVal);
    flowDeltaH.textContent = `&Delta;a_x = ${{deltaA.toFixed(4)}}`;
    flowDeltaV.textContent = `&Delta;a_y = ${{deltaA.toFixed(4)}}`;
    flowEdgeProb.textContent = `P = ${{edgeVal.toFixed(5)}}`;
    flowEdgeState.textContent = edgeVal > 0.001 ? "Sharp Boundary" : "Flat (Cancelled)";
    flowBasisState.textContent = `|${{lY.toString(2).padStart(3, '0')}}&rang;|${{lX.toString(2).padStart(3, '0')}}&rang;`;

    currentPixelInPatch++;

    if (currentPixelInPatch >= 64) {{
      currentPatchIdx++;
      currentPixelInPatch = 0;
      patchEdgeBuffer.fill(-1);

      if (currentPatchIdx >= totalPatches) {{
        stop();
        badgeStatusRecon.textContent = "✅ Complete!";
        footerText.textContent = "All patches resolved. Complete quantum edge map assembled!";
        badgeEdgePct.textContent = "100% Built";
        drawOutputCanvas(-1, -1);
      }}
    }}
  }}

  // Step Full Patch (64 px)
  function stepPatch() {{
    if (currentPatchIdx >= totalPatches) return;
    const pInfo = getPatch(currentPatchIdx);
    updateSlidingBox(pInfo.startX, pInfo.startY);

    const qhedEdges = computePatchQHED(pInfo.patch);

    // Commit all 64 pixels of this patch
    for (let r = 0; r < 8; r++) {{
      for (let c = 0; c < 8; c++) {{
        const gX = pInfo.startX + c;
        const gY = pInfo.startY + r;
        fullEdgeBuffer[gY * imgW + gX] = qhedEdges[r * 8 + c];
      }}
    }}

    drawPatchCanvases(pInfo.patch, qhedEdges, 63);
    drawOutputCanvas(pInfo.startX + 7, pInfo.startY + 7);

    drawCircuits(4, 4); // Hadamard active
    badgeGateH.textContent = "Gate 4: Hadamard (Col Difference)";
    badgeGateV.textContent = "Gate 4: Hadamard (Row Difference)";

    currentPatchIdx++;
    currentPixelInPatch = 0;
    patchEdgeBuffer.fill(-1);

    const totalDone = currentPatchIdx * 64;
    const totalAll = totalPatches * 64;
    const pct = Math.min(100, Math.round((totalDone / totalAll) * 100));
    hudProgress.textContent = `${{pct}}% (${{totalDone}} / ${{totalAll}} px)`;
    progressFill.style.width = `${{pct}}%`;
    badgeEdgePct.textContent = `${{pct}}% Built`;

    if (currentPatchIdx >= totalPatches) {{
      stop();
      badgeStatusRecon.textContent = "✅ Complete!";
      footerText.textContent = "All patches resolved. Complete quantum edge map assembled!";
      drawOutputCanvas(-1, -1);
    }}
  }}

  // Instant Full Build
  function buildInstant() {{
    stop();
    for (let p = 0; p < totalPatches; p++) {{
      const pInfo = getPatch(p);
      const qhedEdges = computePatchQHED(pInfo.patch);
      for (let r = 0; r < 8; r++) {{
        for (let c = 0; c < 8; c++) {{
          const gX = pInfo.startX + c;
          const gY = pInfo.startY + r;
          fullEdgeBuffer[gY * imgW + gX] = qhedEdges[r * 8 + c];
        }}
      }}
    }}
    currentPatchIdx = totalPatches;
    currentPixelInPatch = 0;
    drawOutputCanvas(-1, -1);

    const lastPatch = getPatch(totalPatches - 1);
    updateSlidingBox(lastPatch.startX, lastPatch.startY);
    drawPatchCanvases(lastPatch.patch, computePatchQHED(lastPatch.patch), 63);

    drawCircuits(5, 5);
    badgeGateH.textContent = "Gate 5: Measure";
    badgeGateV.textContent = "Gate 5: Measure";

    hudProgress.textContent = "100% Complete";
    progressFill.style.width = "100%";
    badgeStatusRecon.textContent = "✅ Complete!";
    badgeEdgePct.textContent = "100% Built";
    footerText.textContent = "Instant quantum edge reconstruction complete across all patches!";
  }}

  function loop() {{
    if (!running) return;
    if (totalPatches > 64) {{
      // Adaptive batch streaming for large images (e.g. 128x128, 256x256, 512x512)
      const batch = totalPatches >= 1024 ? 8 : (totalPatches >= 256 ? 2 : 1);
      for (let k = 0; k < batch && currentPatchIdx < totalPatches; k++) {{
        stepPatch();
      }}
    }} else {{
      stepPixel();
    }}
    if (running && currentPatchIdx < totalPatches) {{
      timer = setTimeout(loop, speed);
    }}
  }}

  function start() {{
    if (running) {{
      stop();
      return;
    }}
    if (currentPatchIdx >= totalPatches) {{
      reset();
    }}
    running = true;
    document.querySelector('[data-action="run"]').textContent = "⏸ Pause Auto-Build";
    footerText.textContent = "Building quantum edge detection map pixel-by-pixel...";
    badgeStatusRecon.textContent = "Reconstructing...";
    loop();
  }}

  function stop() {{
    running = false;
    clearTimeout(timer);
    timer = null;
    document.querySelector('[data-action="run"]').textContent = "▶ Start Auto-Build";
    if (currentPatchIdx < totalPatches) {{
      badgeStatusRecon.textContent = "Paused";
    }}
  }}

  function reset() {{
    stop();
    currentPatchIdx = 0;
    currentPixelInPatch = 0;
    fullEdgeBuffer.fill(-1);
    patchEdgeBuffer.fill(-1);

    renderInitialInput();
    updateSlidingBox(0, 0);
    drawCircuits(-1, -1);
    const p0 = getPatch(0);
    drawPatchCanvases(p0.patch, patchEdgeBuffer, 0);

    hudPatch.textContent = `Patch 1 / ${{totalPatches}} [0, 0]`;
    hudCoords.textContent = `Local (0, 0) &rarr; Global (0, 0)`;
    hudIntensity.textContent = `Ia: 0 &bull; Ib: 0 &bull; &Delta;I: 0`;
    hudProb.textContent = `P(edge) = 0.00000`;
    hudProgress.textContent = `0% (0 / ${{totalPatches * 64}} px)`;
    progressFill.style.width = '0%';
    badgeStatusRecon.textContent = "Ready";
    badgeEdgePct.textContent = "0% Built";
    footerText.textContent = "Canvas reset. Ready to run.";
  }}

  // Event Listeners
  document.querySelector('[data-action="run"]').addEventListener('click', start);
  document.querySelector('[data-action="step-patch"]').addEventListener('click', () => {{
    stop();
    stepPatch();
  }});
  document.querySelector('[data-action="step-pixel"]').addEventListener('click', () => {{
    stop();
    stepPixel();
  }});
  document.querySelector('[data-action="instant"]').addEventListener('click', buildInstant);
  document.querySelector('[data-action="reset"]').addEventListener('click', reset);

  document.querySelector('[data-control="speed"]').addEventListener('change', (e) => {{
    speed = Number(e.target.value);
  }});

  // Initial Boot
  renderInitialInput();
  updateSlidingBox(0, 0);
  drawCircuits(-1, -1);
  const p0 = getPatch(0);
  drawPatchCanvases(p0.patch, patchEdgeBuffer, 0);
  updateSlidingBox(p0.startX, p0.startY);

  // Auto-start if requested
  if (autoStart) {{
    setTimeout(start, 350);
  }}
}})();
</script>
</body>
</html>"""
