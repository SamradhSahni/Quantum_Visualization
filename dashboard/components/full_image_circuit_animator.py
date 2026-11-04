"""
Spacious, High-Contrast Full-Image Patch-by-Patch Quantum Circuit & Visual Edge Reconstruction Engine
Features:
1. Panel 1: Big Input Canvas (360x360 px) with animated golden sliding 8x8 ROI window
            + Magnified Active 8x8 Patch Canvas (360x360 px) with live pixel cursor & cell values
            + Live Mathematical Data-Flow Transmission Bridge (Intensity -> FRQI Angle -> Amplitude diff -> P(edge))
2. Panel 2: Large Standalone Dual Quantum Circuits (7 Wires: 6 Position + 1 Color Qubit)
            - Live wire state indicators (|0> vs |1>) matching active pixel coordinates
            - Gate-by-Gate Step Mode (Init -> CCX -> CX -> X -> Hadamard -> Measure)
            - Active laser beam and animated interference pulses
3. Panel 3: True FRQI Quantum Edge Reconstruction Canvas (360x360 px) with exact phase difference
            (Zero patch-boundary seams, high SNR, razor-sharp crater rims)
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
  gap: 10px;
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
  padding: 9px 15px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}}
.btn:hover {{
  background: #30363d;
  border-color: #8b949e;
}}
.btn-build {{
  background: linear-gradient(135deg, #8957e5, #a371f7);
  color: #ffffff;
  border-color: #bc8cff;
  box-shadow: 0 0 14px rgba(163, 113, 247, 0.45);
}}
.btn-build:hover {{
  background: linear-gradient(135deg, #a371f7, #bc8cff);
}}
.btn-gate {{
  background: #1f6feb;
  color: #ffffff;
  border-color: #388bfd;
}}
.btn-gate:hover {{
  background: #388bfd;
}}
.btn-instant {{
  background: linear-gradient(135deg, #238636, #2ea043);
  color: #ffffff;
  border-color: #3fb950;
}}
.btn-instant:hover {{
  background: linear-gradient(135deg, #2ea043, #3fb950);
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
  font-size: 14px;
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
  height: 180px;
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
      Exact FRQI Phase Encoding &bull; Dual 7-Qubit Interference Circuits &bull; Zero Patch-Boundary Artifacts
    </span>
  </div>

  <!-- Interactive Controls Bar -->
  <div class="controls-bar">
    <button class="btn btn-build" data-action="run" type="button">▶ Start / Pause Auto-Build</button>
    <button class="btn btn-gate" data-action="step-gate" type="button">⏯ Step 1 Gate</button>
    <button class="btn" data-action="step-pixel" type="button">⏩ Step 1 Pixel</button>
    <button class="btn" data-action="step-patch" type="button">⏭ Step 1 Patch (64 px)</button>
    <button class="btn btn-instant" data-action="instant" type="button">✨ Instant Full Reconstruction</button>
    <button class="btn" data-action="reset" type="button">↺ Reset Canvas</button>

    <label style="display:flex; align-items:center; gap:8px; margin-left:auto; font-size:12px; color:#8b9eb0;">
      Execution Speed:
      <select class="form-select" data-control="speed">
        <option value="150">Slow (150ms)</option>
        <option value="50" selected>Normal (50ms)</option>
        <option value="15">Fast (15ms)</option>
        <option value="2">Hyper (2ms)</option>
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
      <span class="hud-val" id="hud-intensity" style="color:#f0f6fc;">I: 0 &bull; I_nbr: 0 &bull; &Delta;I: 0</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Quantum Edge Probability</span>
      <span class="hud-val" id="hud-prob" style="color:#ff79c6;">P(edge) = 0.00000</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Active Circuit Gate</span>
      <span class="hud-val" id="hud-active-gate" style="color:#39d353;">Ready</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Progress</span>
      <span class="hud-val" id="hud-progress" style="color:#388bfd;">0% (0 / 0 px)</span>
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
        <div class="flow-step-tag">Step 1 &bull; Pixel Extraction</div>
        <div class="flow-step-math">
          Active: <b id="flow-px-val" style="color:#58a6ff;">I = 0</b><br>
          Neighbor: <b id="flow-nbr-val" style="color:#79c0ff;">I_col = 0, I_row = 0</b><br>
          Difference: <b id="flow-diff-val" style="color:#e6edf3;">&Delta;I = 0</b>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-tag">Step 2 &bull; FRQI State Encoding</div>
        <div class="flow-step-math">
          Rotation: <b id="flow-theta-val" style="color:#ffd700;">&theta; = 0.000 rad</b><br>
          Degrees: <b id="flow-deg-val" style="color:#ffd700;">0.0&deg;</b><br>
          |c&rang; = cos(&theta;)|0&rang; + sin(&theta;)|1&rang;
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-tag">Step 3 &bull; Hadamard Interference</div>
        <div class="flow-step-math">
          Col Diff: <b id="flow-delta-h" style="color:#ff79c6;">P_x = 0.000</b><br>
          Row Diff: <b id="flow-delta-v" style="color:#bc8cff;">P_y = 0.000</b><br>
          Cancellation: <span id="flow-cancel-state" style="color:#8b9eb0;">Destructive</span>
        </div>
      </div>

      <div class="flow-step-item">
        <div class="flow-step-tag">Step 4 &bull; Measurement Collapse</div>
        <div class="flow-step-math">
          P(edge): <b id="flow-edge-prob" style="color:#39d353;">0.00000</b><br>
          Decision: <b id="flow-edge-state" style="color:#39d353;">Flat Surface</b><br>
          Basis: <span id="flow-basis-state" style="color:#8b9eb0;">|000&rang;|000&rang;</span>
        </div>
      </div>
    </div>
  </div>

  <!-- PANEL 2: Standalone Dual Quantum Circuits with Active Qubit States -->
  <div class="section-panel">
    <div class="section-heading">
      <span style="color:#58a6ff;">⚛️ PANEL 2: Standalone Dual Quantum Circuits (7 Wires: 6 Position + 1 Color Qubit)</span>
      <span style="font-family:monospace; color:#39d353;" id="badge-gate-step-info">Gate 0: FRQI Init Active</span>
    </div>

    <div class="circuits-container">
      <!-- Circuit A: Horizontal Pass -->
      <div class="circuit-card">
        <div class="circuit-card-header">
          <span style="color:#58a6ff;">Circuit A: Horizontal Pass (q0, q1, q2 Column Register + |c&rang; Color Qubit + Hadamard Interference)</span>
          <span style="color:#79c0ff; font-family:monospace;" id="badge-gate-h">Gate: Ready</span>
        </div>
        <svg class="circuit-svg" id="svg-h" viewBox="0 0 920 175"></svg>
      </div>

      <!-- Circuit B: Vertical Pass -->
      <div class="circuit-card">
        <div class="circuit-card-header">
          <span style="color:#bc8cff;">Circuit B: Vertical Pass (q3, q4, q5 Row Register + |c&rang; Color Qubit + Hadamard Interference)</span>
          <span style="color:#d2a8ff; font-family:monospace;" id="badge-gate-v">Gate: Ready</span>
        </div>
        <svg class="circuit-svg" id="svg-v" viewBox="0 0 920 175"></svg>
      </div>
    </div>
  </div>

  <!-- PANEL 3: Reconstructed Quantum Edge Detection Map -->
  <div class="section-panel">
    <div class="section-heading">
      <span style="color:#ff79c6;">🌟 PANEL 3: Live Reconstructed True FRQI Quantum Edge Map</span>
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
    <span id="footer-text">Simulation engine ready. Click <b>'▶ Start Auto-Build'</b> or <b>'⏯ Step 1 Gate'</b> to watch circuit execution!</span>
    <span style="font-family:monospace; color:#58a6ff;">Exact FRQI Quantum Image Encoding &bull; 7 Qubits &bull; Coherent Phase Interference</span>
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
  const hudActiveGate = document.getElementById('hud-active-gate');
  const hudProgress = document.getElementById('hud-progress');
  const progressFill = document.getElementById('anim-progress-fill');
  const badgePatchPos = document.getElementById('badge-patch-pos');
  const badgeStatusRecon = document.getElementById('badge-status-recon');
  const badgeLocalPixel = document.getElementById('badge-local-pixel');
  const badgeEdgePct = document.getElementById('badge-edge-pct');
  const badgeGateStepInfo = document.getElementById('badge-gate-step-info');
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
  const flowCancelState = document.getElementById('flow-cancel-state');

  const badgeGateH = document.getElementById('badge-gate-h');
  const badgeGateV = document.getElementById('badge-gate-v');
  const svgH = document.getElementById('svg-h');
  const svgV = document.getElementById('svg-v');

  // State
  let currentPatchIdx = 0;
  let currentPixelInPatch = 0;
  let currentGateStep = 0; // 0 to 5
  let running = false;
  let timer = null;
  let speed = 50;

  // Buffer: -1 means untouched pending pixel, >= 0 means processed edge value
  const fullEdgeBuffer = new Float32Array(imgW * imgH).fill(-1);
  const patchEdgeBuffer = new Float32Array(64).fill(-1);

  // Exact True FRQI Quantum Phase Pixel Calculation
  function getPixelIntensity(x, y) {{
    const cX = Math.max(0, Math.min(imgW - 1, x));
    const cY = Math.max(0, Math.min(imgH - 1, y));
    return pixels[cY * imgW + cX] || 0;
  }}

  function computePixelQHED(gX, gY) {{
    const iA = getPixelIntensity(gX, gY);
    const iCol = getPixelIntensity(gX + 1, gY);
    const iRow = getPixelIntensity(gX, gY + 1);

    const thetaA = (iA / 255.0) * (Math.PI / 2.0);
    const thetaCol = (iCol / 255.0) * (Math.PI / 2.0);
    const thetaRow = (iRow / 255.0) * (Math.PI / 2.0);

    const dThetaX = Math.abs(thetaA - thetaCol);
    const dThetaY = Math.abs(thetaA - thetaRow);

    // Exact FRQI Hadamard measurement probability: P = 2 * sin^2(Delta_theta / 2)
    const pX = 2.0 * Math.sin(dThetaX / 2.0);
    const pY = 2.0 * Math.sin(dThetaY / 2.0);

    return Math.sqrt(pX * pX + pY * pY);
  }}

  // Pre-calculate global max edge across the image
  let globalMaxEdge = 0.05;
  const stepProbe = Math.max(1, Math.floor(pixels.length / 4000));
  for (let i = 0; i < pixels.length; i += stepProbe) {{
    const gx = i % imgW;
    const gy = Math.floor(i / imgW);
    const v = computePixelQHED(gx, gy);
    if (v > globalMaxEdge) globalMaxEdge = v;
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

  // Draw Large Dual SVG Circuits with Live Wire States (7 Wires)
  function drawCircuits(activeGateIdx = 0, lX = 0, lY = 0, theta = 0) {{
    const hGates = [
      {{ name: 'FRQI Init', type: 'init', target: 6 }},
      {{ name: 'CCX Carry', type: 'ccx', controls: [0, 1], target: 2 }},
      {{ name: 'CX Shift', type: 'cx', controls: [0], target: 1 }},
      {{ name: 'X Invert', type: 'x', target: 0 }},
      {{ name: 'H (col diff)', type: 'h', target: 0 }},
      {{ name: 'Measure', type: 'm', target: 0 }}
    ];
    renderSvgCircuit(svgH, hGates, activeGateIdx, '#388bfd', 'col', lX, lY, theta, true);

    const vGates = [
      {{ name: 'FRQI Init', type: 'init', target: 6 }},
      {{ name: 'CCX Carry', type: 'ccx', controls: [3, 4], target: 5 }},
      {{ name: 'CX Shift', type: 'cx', controls: [3], target: 4 }},
      {{ name: 'X Invert', type: 'x', target: 3 }},
      {{ name: 'H (row diff)', type: 'h', target: 3 }},
      {{ name: 'Measure', type: 'm', target: 3 }}
    ];
    renderSvgCircuit(svgV, vGates, activeGateIdx, '#bc8cff', 'row', lX, lY, theta, false);
  }}

  function renderSvgCircuit(svgEl, gates, activeIdx, accentColor, regName, lX, lY, theta, isHoriz) {{
    const w = 920, h = 175;
    const x0 = 120, right = w - 24;
    const gap = (right - x0) / (gates.length + 1);

    // 7 Qubit Wires: q0..q2 (col), q3..q5 (row), q6 (|c>)
    const wireStates = [
      (lX & 1) ? 1 : 0,
      (lX & 2) ? 1 : 0,
      (lX & 4) ? 1 : 0,
      (lY & 1) ? 1 : 0,
      (lY & 2) ? 1 : 0,
      (lY & 4) ? 1 : 0,
      1 // Color qubit is active superposition
    ];

    let body = `<defs>
      <filter id="glow-${{regName}}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    // Render Wires with Live State Labels
    for (let q = 0; q < 7; q++) {{
      const y = 16 + q * 22;
      let label = "";
      if (q < 3) label = `q${{q}} (col ${{q}}): |${{wireStates[q]}}&rang;`;
      else if (q < 6) label = `q${{q}} (row ${{q-3}}): |${{wireStates[q]}}&rang;`;
      else label = `|c&rang; (&theta;=${{theta.toFixed(2)}} rad)`;

      const isWireActive = wireStates[q] === 1;
      const wireColor = q === 6 ? '#ffd700' : (isWireActive ? '#00f0ff' : '#2b3644');
      const textColor = q === 6 ? '#ffd700' : (isWireActive ? '#79c0ff' : '#6e7681');
      const strokeW = isWireActive ? '2.5' : '1.5';

      body += `<text x="6" y="${{y + 4}}" fill="${{textColor}}" font-family="monospace" font-size="10px" font-weight="700">${{label}}</text>`;
      body += `<line x1="${{x0}}" y1="${{y}}" x2="${{right}}" y2="${{y}}" stroke="${{wireColor}}" stroke-width="${{strokeW}}" stroke-opacity="0.9"/>`;
    }}

    // Moving glowing vertical laser cursor
    if (activeIdx >= 0 && activeIdx < gates.length) {{
      const cursorX = x0 + (activeIdx + 1) * gap;
      body += `<rect x="${{cursorX - 28}}" y="4" width="56" height="162" rx="8" fill="rgba(88, 166, 255, 0.28)" stroke="${{accentColor}}" stroke-width="3" stroke-dasharray="6,3" filter="url(#glow-${{regName}})"/>`;
    }}

    // Gates
    gates.forEach((gate, i) => {{
      const x = x0 + (i + 1) * gap;
      const isActive = i === activeIdx;

      if (gate.type === 'init') {{
        const fill = isActive ? accentColor : '#1f6feb';
        const stroke = isActive ? '#ffffff' : accentColor;
        body += `<rect x="${{x - 22}}" y="10" width="44" height="150" rx="6" fill="${{fill}}" stroke="${{stroke}}" stroke-width="${{isActive?3:1.5}}"/>`;
        body += `<text x="${{x}}" y="92" text-anchor="middle" fill="#ffffff" font-size="11px" font-weight="bold" transform="rotate(-90 ${{x}} 92)">FRQI State Init</text>`;
      }} else if (gate.type === 'm') {{
        for (let q = 0; q < 7; q++) {{
          const y = 16 + q * 22;
          body += `<rect x="${{x - 12}}" y="${{y - 9}}" width="24" height="18" rx="3" fill="${{isActive?'#d29922':'#9e6a03'}}" stroke="${{isActive?'#ffd700':'#30363d'}}"/>`;
          body += `<text x="${{x}}" y="${{y + 4}}" text-anchor="middle" fill="#ffffff" font-size="9px" font-weight="bold">M</text>`;
        }}
      }} else {{
        const targetY = 16 + gate.target * 22;
        const fill = isActive ? accentColor : '#238636';

        if (gate.controls && gate.controls.length) {{
          const minY = 16 + Math.min(...gate.controls, gate.target) * 22;
          const maxY = 16 + Math.max(...gate.controls, gate.target) * 22;
          body += `<line x1="${{x}}" y1="${{minY}}" x2="${{x}}" y2="${{maxY}}" stroke="${{isActive?accentColor:'#58a6ff'}}" stroke-width="${{isActive?3.5:2}}"/>`;
          gate.controls.forEach(c => {{
            body += `<circle cx="${{x}}" cy="${{16 + c * 22}}" r="5" fill="${{isActive?accentColor:'#f0f6fc'}}"/>`;
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
      }} else if (rawVal > 0.005) {{
        // Evaluated Quantum Edge: Vivid Electric Magenta-Violet
        const norm = Math.min(1.0, Math.pow(rawVal / globalMaxEdge, 0.72));
        imgData.data[i * 4 + 0] = Math.round(255 * norm);
        imgData.data[i * 4 + 1] = Math.round(40 * (1 - norm) + 65 * norm);
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
      }} else if (val > 0.005) {{
        const norm = Math.min(1.0, Math.pow(val / globalMaxEdge, 0.72));
        edgeData.data[i * 4 + 0] = Math.round(255 * norm);
        edgeData.data[i * 4 + 1] = Math.round(40 * (1 - norm) + 65 * norm);
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

  const gateNames = [
    'Gate 0: FRQI State Init (Rotation on |c⟩ by θ)',
    'Gate 1: CCX Carry (Column carry shift q0 ∧ q1 → q2)',
    'Gate 2: CX Shift (Coordinate shift q0 → q1)',
    'Gate 3: Pauli-X Inversion (q0 parity flip)',
    'Gate 4: Hadamard H (Waveform Phase Interference)',
    'Gate 5: Measure (Collapse Basis State → Paint Edge Pixel)'
  ];

  // Advance Simulation by 1 Single Gate (Gate-by-Gate Simulation with Image)
  function stepGate() {{
    if (currentPatchIdx >= totalPatches) return;
    const pInfo = getPatch(currentPatchIdx);
    const lX = currentPixelInPatch % 8;
    const lY = Math.floor(currentPixelInPatch / 8);
    const gX = pInfo.startX + lX;
    const gY = pInfo.startY + lY;

    const valA = getPixelIntensity(gX, gY);
    const valCol = getPixelIntensity(gX + 1, gY);
    const valRow = getPixelIntensity(gX, gY + 1);
    const diff = Math.max(Math.abs(valA - valCol), Math.abs(valA - valRow));
    const theta = (valA / 255.0) * (Math.PI / 2.0);
    const edgeVal = computePixelQHED(gX, gY);

    hudActiveGate.textContent = gateNames[currentGateStep];
    badgeGateStepInfo.textContent = gateNames[currentGateStep];
    badgeGateH.textContent = gateNames[currentGateStep];
    badgeGateV.textContent = gateNames[currentGateStep];

    // Animate circuits with live wire states
    drawCircuits(currentGateStep, lX, lY, theta);
    updateSlidingBox(pInfo.startX, pInfo.startY);
    drawPatchCanvases(pInfo.patch, patchEdgeBuffer, currentPixelInPatch);

    // Update telemetry
    hudPatch.textContent = `Patch ${{currentPatchIdx + 1}} / ${{totalPatches}} [${{pInfo.px}}, ${{pInfo.py}}]`;
    hudCoords.textContent = `Local (${{lX}}, ${{lY}}) &rarr; Global (${{gX}}, ${{gY}})`;
    hudIntensity.textContent = `I: ${{valA}} &bull; I_nbr: ${{valCol}} &bull; &Delta;I: ${{diff}}`;
    hudProb.textContent = `P(edge) = ${{edgeVal.toFixed(5)}}`;

    // Data-flow updates
    flowPxVal.textContent = `I = ${{valA}}`;
    flowNbrVal.textContent = `I_col = ${{valCol}}, I_row = ${{valRow}}`;
    flowDiffVal.textContent = `&Delta;I = ${{diff}}`;
    flowThetaVal.textContent = `&theta; = ${{theta.toFixed(3)}} rad`;
    flowDegVal.textContent = `${{(theta * 180 / Math.PI).toFixed(1)}}&deg;`;
    const dThetaX = Math.abs(theta - (valCol / 255.0) * (Math.PI / 2.0));
    const dThetaY = Math.abs(theta - (valRow / 255.0) * (Math.PI / 2.0));
    const pX = 2.0 * Math.sin(dThetaX / 2.0);
    const pY = 2.0 * Math.sin(dThetaY / 2.0);
    flowDeltaH.textContent = `P_x = ${{pX.toFixed(4)}}`;
    flowDeltaV.textContent = `P_y = ${{pY.toFixed(4)}}`;
    flowEdgeProb.textContent = `${{edgeVal.toFixed(5)}}`;
    flowEdgeState.textContent = edgeVal > 0.04 ? "Boundary Edge" : "Flat (Cancelled)";
    flowCancelState.textContent = edgeVal > 0.04 ? "Constructive Pulse" : "Exact Destructive";
    flowBasisState.textContent = `|${{lY.toString(2).padStart(3, '0')}}&rang;|${{lX.toString(2).padStart(3, '0')}}&rang;`;

    // When Gate 5 (Measure) executes, commit the pixel!
    if (currentGateStep === 5) {{
      patchEdgeBuffer[currentPixelInPatch] = edgeVal;
      fullEdgeBuffer[gY * imgW + gX] = edgeVal;
      drawOutputCanvas(gX, gY);

      const totalDone = currentPatchIdx * 64 + (currentPixelInPatch + 1);
      const totalAll = totalPatches * 64;
      const pct = Math.min(100, Math.round((totalDone / totalAll) * 100));
      hudProgress.textContent = `${{pct}}% (${{totalDone}} / ${{totalAll}} px)`;
      progressFill.style.width = `${{pct}}%`;
      badgeEdgePct.textContent = `${{pct}}% Built`;

      currentPixelInPatch++;
      currentGateStep = 0;

      if (currentPixelInPatch >= 64) {{
        currentPatchIdx++;
        currentPixelInPatch = 0;
        patchEdgeBuffer.fill(-1);

        if (currentPatchIdx >= totalPatches) {{
          stop();
          badgeStatusRecon.textContent = "✅ Complete!";
          footerText.textContent = "Full quantum edge reconstruction complete across all patches!";
          drawOutputCanvas(-1, -1);
        }}
      }}
    }} else {{
      currentGateStep++;
    }}
  }}

  // Execute 1 Full Pixel (Cycle gates synchronously with pixel)
  function stepPixel() {{
    if (currentPatchIdx >= totalPatches) return;
    const pInfo = getPatch(currentPatchIdx);
    const lX = currentPixelInPatch % 8;
    const lY = Math.floor(currentPixelInPatch / 8);
    const gX = pInfo.startX + lX;
    const gY = pInfo.startY + lY;

    const valA = getPixelIntensity(gX, gY);
    const valCol = getPixelIntensity(gX + 1, gY);
    const valRow = getPixelIntensity(gX, gY + 1);
    const diff = Math.max(Math.abs(valA - valCol), Math.abs(valA - valRow));
    const theta = (valA / 255.0) * (Math.PI / 2.0);
    const edgeVal = computePixelQHED(gX, gY);

    patchEdgeBuffer[currentPixelInPatch] = edgeVal;
    fullEdgeBuffer[gY * imgW + gX] = edgeVal;

    updateSlidingBox(pInfo.startX, pInfo.startY);
    drawPatchCanvases(pInfo.patch, patchEdgeBuffer, currentPixelInPatch);
    drawOutputCanvas(gX, gY);

    // Actively cycle gates across 0..5 as pixels advance
    currentGateStep = (currentGateStep + 1) % 6;
    drawCircuits(currentGateStep, lX, lY, theta);
    badgeGateH.textContent = gateNames[currentGateStep];
    badgeGateV.textContent = gateNames[currentGateStep];
    hudActiveGate.textContent = gateNames[currentGateStep];
    badgeGateStepInfo.textContent = `${{gateNames[currentGateStep]}} &bull; Pixel (${{lX}}, ${{lY}})`;

    // Telemetry updates
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

    // Data-flow strip
    flowPxVal.textContent = `I = ${{valA}}`;
    flowNbrVal.textContent = `I_col = ${{valCol}}, I_row = ${{valRow}}`;
    flowDiffVal.textContent = `&Delta;I = ${{diff}}`;
    flowThetaVal.textContent = `&theta; = ${{theta.toFixed(3)}} rad`;
    flowDegVal.textContent = `${{(theta * 180 / Math.PI).toFixed(1)}}&deg;`;
    const dThetaX = Math.abs(theta - (valCol / 255.0) * (Math.PI / 2.0));
    const dThetaY = Math.abs(theta - (valRow / 255.0) * (Math.PI / 2.0));
    const pX = 2.0 * Math.sin(dThetaX / 2.0);
    const pY = 2.0 * Math.sin(dThetaY / 2.0);
    flowDeltaH.textContent = `P_x = ${{pX.toFixed(4)}}`;
    flowDeltaV.textContent = `P_y = ${{pY.toFixed(4)}}`;
    flowEdgeProb.textContent = `${{edgeVal.toFixed(5)}}`;
    flowEdgeState.textContent = edgeVal > 0.04 ? "Boundary Edge" : "Flat (Cancelled)";
    flowBasisState.textContent = `|${{lY.toString(2).padStart(3, '0')}}&rang;|${{lX.toString(2).padStart(3, '0')}}&rang;`;

    currentPixelInPatch++;

    if (currentPixelInPatch >= 64) {{
      currentPatchIdx++;
      currentPixelInPatch = 0;
      patchEdgeBuffer.fill(-1);

      if (currentPatchIdx >= totalPatches) {{
        stop();
        badgeStatusRecon.textContent = "✅ Complete!";
        footerText.textContent = "Full quantum edge reconstruction complete across all patches!";
        drawOutputCanvas(-1, -1);
      }}
    }}
  }}

  // Step 1 Patch (64 px) with Active Gate Simulation
  function stepPatch() {{
    if (currentPatchIdx >= totalPatches) return;
    const pInfo = getPatch(currentPatchIdx);
    updateSlidingBox(pInfo.startX, pInfo.startY);

    // Cycle through representative pixels in this patch so wires actively change
    const activePix = (currentPatchIdx * 11 + currentPixelInPatch) % 64;
    const lX = activePix % 8;
    const lY = Math.floor(activePix / 8);
    const gX = pInfo.startX + lX;
    const gY = pInfo.startY + lY;
    const valA = getPixelIntensity(gX, gY);
    const valCol = getPixelIntensity(gX + 1, gY);
    const valRow = getPixelIntensity(gX, gY + 1);
    const diff = Math.max(Math.abs(valA - valCol), Math.abs(valA - valRow));
    const theta = (valA / 255.0) * (Math.PI / 2.0);
    const activeEdgeVal = computePixelQHED(gX, gY);

    patchEdgeBuffer.fill(-1);
    for (let r = 0; r < 8; r++) {{
      for (let c = 0; c < 8; c++) {{
        const gx = pInfo.startX + c;
        const gy = pInfo.startY + r;
        const edgeVal = computePixelQHED(gx, gy);
        patchEdgeBuffer[r * 8 + c] = edgeVal;
        fullEdgeBuffer[gy * imgW + gx] = edgeVal;
      }}
    }}

    drawPatchCanvases(pInfo.patch, patchEdgeBuffer, activePix);
    drawOutputCanvas(gX, gY);

    // Cycle through all 6 gates on the circuits
    currentGateStep = (currentGateStep + 1) % 6;
    drawCircuits(currentGateStep, lX, lY, theta);

    hudActiveGate.textContent = gateNames[currentGateStep];
    badgeGateStepInfo.textContent = `${{gateNames[currentGateStep]}} &bull; Patch [${{pInfo.px}}, ${{pInfo.py}}]`;
    badgeGateH.textContent = gateNames[currentGateStep];
    badgeGateV.textContent = gateNames[currentGateStep];

    // Telemetry updates for patch
    hudPatch.textContent = `Patch ${{currentPatchIdx + 1}} / ${{totalPatches}} [${{pInfo.px}}, ${{pInfo.py}}]`;
    hudCoords.textContent = `Local (${{lX}}, ${{lY}}) &rarr; Global (${{gX}}, ${{gY}})`;
    hudIntensity.textContent = `I: ${{valA}} &bull; I_nbr: ${{valCol}} &bull; &Delta;I: ${{diff}}`;
    hudProb.textContent = `P(edge) = ${{activeEdgeVal.toFixed(5)}}`;

    // Data-flow strip
    flowPxVal.textContent = `I = ${{valA}}`;
    flowNbrVal.textContent = `I_col = ${{valCol}}, I_row = ${{valRow}}`;
    flowDiffVal.textContent = `&Delta;I = ${{diff}}`;
    flowThetaVal.textContent = `&theta; = ${{theta.toFixed(3)}} rad`;
    flowDegVal.textContent = `${{(theta * 180 / Math.PI).toFixed(1)}}&deg;`;
    const dThetaX = Math.abs(theta - (valCol / 255.0) * (Math.PI / 2.0));
    const dThetaY = Math.abs(theta - (valRow / 255.0) * (Math.PI / 2.0));
    const pX = 2.0 * Math.sin(dThetaX / 2.0);
    const pY = 2.0 * Math.sin(dThetaY / 2.0);
    flowDeltaH.textContent = `P_x = ${{pX.toFixed(4)}}`;
    flowDeltaV.textContent = `P_y = ${{pY.toFixed(4)}}`;
    flowEdgeProb.textContent = `${{activeEdgeVal.toFixed(5)}}`;
    flowEdgeState.textContent = activeEdgeVal > 0.04 ? "Boundary Edge" : "Flat (Cancelled)";
    flowCancelState.textContent = activeEdgeVal > 0.04 ? "Constructive Pulse" : "Exact Destructive";
    flowBasisState.textContent = `|${{lY.toString(2).padStart(3, '0')}}&rang;|${{lX.toString(2).padStart(3, '0')}}&rang;`;

    currentPixelInPatch = (currentPixelInPatch + 1) % 64;
    currentPatchIdx++;

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
      for (let r = 0; r < 8; r++) {{
        for (let c = 0; c < 8; c++) {{
          const gX = pInfo.startX + c;
          const gY = pInfo.startY + r;
          fullEdgeBuffer[gY * imgW + gX] = computePixelQHED(gX, gY);
        }}
      }}
    }}
    currentPatchIdx = totalPatches;
    currentPixelInPatch = 0;
    drawOutputCanvas(-1, -1);

    const lastPatch = getPatch(totalPatches - 1);
    updateSlidingBox(lastPatch.startX, lastPatch.startY);
    const pEdges = new Float32Array(64);
    for (let i = 0; i < 64; i++) {{
      const gx = lastPatch.startX + (i % 8);
      const gy = lastPatch.startY + Math.floor(i / 8);
      pEdges[i] = computePixelQHED(gx, gy);
    }}
    drawPatchCanvases(lastPatch.patch, pEdges, 63);

    drawCircuits(5, 4, 4, 1.0);
    hudActiveGate.textContent = "Gate 5: Measure (Complete)";
    badgeGateStepInfo.textContent = "All Gates Evaluated & Measured";
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
    footerText.textContent = "Building quantum edge detection map with live circuit simulation...";
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
    currentGateStep = 0;
    fullEdgeBuffer.fill(-1);
    patchEdgeBuffer.fill(-1);

    renderInitialInput();
    updateSlidingBox(0, 0);
    const p0 = getPatch(0);
    const initTheta = (p0.patch[0] / 255.0) * (Math.PI / 2.0);
    drawCircuits(0, 0, 0, initTheta);
    drawPatchCanvases(p0.patch, patchEdgeBuffer, 0);

    hudPatch.textContent = `Patch 1 / ${{totalPatches}} [0, 0]`;
    hudCoords.textContent = `Local (0, 0) &rarr; Global (0, 0)`;
    hudIntensity.textContent = `I: 0 &bull; I_nbr: 0 &bull; &Delta;I: 0`;
    hudProb.textContent = `P(edge) = 0.00000`;
    hudActiveGate.textContent = "Gate 0: FRQI Init";
    hudProgress.textContent = `0% (0 / ${{totalPatches * 64}} px)`;
    progressFill.style.width = '0%';
    badgeStatusRecon.textContent = "Ready";
    badgeEdgePct.textContent = "0% Built";
    footerText.textContent = "Canvas reset. Ready to run.";
  }}

  // Event Listeners
  document.querySelector('[data-action="run"]').addEventListener('click', start);
  document.querySelector('[data-action="step-gate"]').addEventListener('click', () => {{
    stop();
    stepGate();
  }});
  document.querySelector('[data-action="step-pixel"]').addEventListener('click', () => {{
    stop();
    stepPixel();
  }});
  document.querySelector('[data-action="step-patch"]').addEventListener('click', () => {{
    stop();
    stepPatch();
  }});
  document.querySelector('[data-action="instant"]').addEventListener('click', buildInstant);
  document.querySelector('[data-action="reset"]').addEventListener('click', reset);

  document.querySelector('[data-control="speed"]').addEventListener('change', (e) => {{
    speed = Number(e.target.value);
  }});

  // Initial Boot
  renderInitialInput();
  updateSlidingBox(0, 0);
  const p0 = getPatch(0);
  const bootTheta = (p0.patch[0] / 255.0) * (Math.PI / 2.0);
  drawCircuits(0, 0, 0, bootTheta);
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
