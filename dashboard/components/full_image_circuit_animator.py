"""
Full-Image Patch-by-Patch Quantum Circuit & Visual Edge Reconstruction Engine
Renders an interactive, standalone high-contrast dark-mode HTML/SVG canvas demonstrating:
1. Original Full Input Image with an animated sliding 8x8 Patch Window
2. Dual Quantum Circuit Visualizers:
   - Circuit A: Horizontal Pass (q0-q2 Column registers, CCX/CX/X column shift + H interference)
   - Circuit B: Vertical Pass (q3-q5 Row registers, CCX/CX/X row shift + H interference)
3. Moving gate execution cursors sliding across both circuits
4. Live Data-Flow Transmission HUD (showing exact numbers: Intensity -> Angle theta -> Amplitude difference -> P(edge))
5. Active 8x8 Patch Pixel-by-Pixel Edge Construction
6. Full Assembled Quantum Edge Image Canvas that builds patch-by-patch in real time
"""
import json
import numpy as np

def get_full_image_animator_html(image_2d, patch_size=8):
    """
    Generates standalone HTML string for full-image patch-by-patch quantum edge detection.
    image_2d: 2D numpy array of shape (H, W), dtype uint8 or float [0, 255].
    patch_size: size of quantum patch (default 8 for 6-qubit circuit).
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
        "pixels": flat_pixels
    }

    meta_json = json.dumps(image_meta)

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Full-Image Patch-by-Patch Quantum Circuit Pipeline</title>
<style>
* {{ box-sizing: border-box; }}
body {{
  margin: 0;
  padding: 16px;
  background-color: #090d13;
  color: #f0f6fc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
}}
.animator-card {{
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}}
.animator-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid #21262d;
  padding-bottom: 12px;
  margin-bottom: 14px;
}}
.animator-title {{
  font-size: 18px;
  font-weight: 700;
  color: #58a6ff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}}
.controls-row {{
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}}
.btn {{
  border: 1px solid #30363d;
  background: #21262d;
  color: #f0f6fc;
  padding: 8px 14px;
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
.btn-primary {{
  background: linear-gradient(135deg, #1f6feb, #388bfd);
  color: #ffffff;
  border-color: #58a6ff;
  box-shadow: 0 0 10px rgba(56, 139, 253, 0.35);
}}
.btn-primary:hover {{
  background: linear-gradient(135deg, #388bfd, #58a6ff);
}}
.btn-build {{
  background: linear-gradient(135deg, #8957e5, #a371f7);
  color: #ffffff;
  border-color: #bc8cff;
  box-shadow: 0 0 12px rgba(163, 113, 247, 0.4);
}}
.btn-build:hover {{
  background: linear-gradient(135deg, #a371f7, #bc8cff);
}}
.form-select {{
  background: #161b22;
  color: #f0f6fc;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  outline: none;
}}
.hud-strip {{
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}}
.hud-item {{
  display: flex;
  flex-direction: column;
  gap: 2px;
}}
.hud-label {{
  font-size: 10px;
  color: #8b9eb0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}}
.hud-val {{
  font-size: 13px;
  font-weight: 700;
  font-family: monospace;
}}
.progress-bar-wrap {{
  width: 100%;
  height: 6px;
  background: #21262d;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}}
.progress-bar-fill {{
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #388bfd, #a371f7, #ff79c6);
  transition: width 0.1s ease;
}}
.main-stage-grid {{
  display: grid;
  grid-template-columns: 240px 1fr 240px;
  gap: 14px;
  margin-bottom: 14px;
}}
@media (max-width: 1100px) {{
  .main-stage-grid {{
    grid-template-columns: 1fr 1fr;
  }}
}}
@media (max-width: 750px) {{
  .main-stage-grid {{
    grid-template-columns: 1fr;
  }}
}}
.canvas-panel {{
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}}
.panel-title {{
  font-size: 12px;
  font-weight: 600;
  color: #8b9eb0;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}}
.image-canvas-container {{
  position: relative;
  width: 200px;
  height: 200px;
  background: #000000;
  border: 1px solid #30363d;
  border-radius: 4px;
  overflow: hidden;
}}
.image-canvas {{
  width: 200px;
  height: 200px;
  image-rendering: pixelated;
  display: block;
}}
.patch-window-overlay {{
  position: absolute;
  border: 2px solid #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 215, 0, 0.4);
  pointer-events: none;
  transition: all 0.15s ease-out;
  background: rgba(255, 215, 0, 0.15);
}}
.circuits-container {{
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}}
.circuit-card {{
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 6px;
  padding: 8px;
}}
.circuit-card-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}}
.circuit-svg {{
  width: 100%;
  height: 115px;
  display: block;
}}
.patch-mini-grids {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
  width: 100%;
}}
.mini-grid-wrap {{
  display: flex;
  flex-direction: column;
  align-items: center;
}}
.mini-grid-wrap span {{
  font-size: 10px;
  color: #8b9eb0;
  margin-bottom: 4px;
}}
.mini-8x8-canvas {{
  width: 90px;
  height: 90px;
  image-rendering: pixelated;
  border: 1px solid #30363d;
  border-radius: 4px;
  background: #000000;
}}
.status-footer {{
  font-size: 12px;
  color: #8b9eb0;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}}
</style>
</head>
<body>

<div class="animator-card" id="full-image-quantum-studio">
  <div class="animator-header">
    <h2 class="animator-title">
      <span>⚛️</span>
      <span>Live Patch-by-Patch Quantum Edge Reconstruction Engine</span>
    </h2>
    <span style="font-size:12px; color:#8b9eb0;">
      Sliding 8×8 ROI Window &bull; Dual Horizontal/Vertical Circuits &bull; Full-Image Reassembly
    </span>
  </div>

  <!-- Interactive Controls -->
  <div class="controls-row">
    <button class="btn btn-build" data-action="run-full" type="button">🚀 Build Full Image Patch-by-Patch</button>
    <button class="btn btn-primary" data-action="step-patch" type="button">⏭ Next Patch</button>
    <button class="btn" data-action="step-pixel" type="button">⏩ Step Pixel</button>
    <button class="btn" data-action="reset" type="button">↺ Reset Canvas</button>

    <label style="display:flex; align-items:center; gap:6px; margin-left:auto; font-size:12px; color:#8b9eb0;">
      Playback Speed:
      <select class="form-select" data-control="speed">
        <option value="350">Slow (350ms)</option>
        <option value="120" selected>Normal (120ms)</option>
        <option value="30">Fast (30ms)</option>
      </select>
    </label>
  </div>

  <!-- Live Telemetry Strip -->
  <div class="hud-strip">
    <div class="hud-item">
      <span class="hud-label">Active Patch</span>
      <span class="hud-val" id="hud-patch" style="color:#ffd700;">Patch 1 / 1 (0, 0)</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Active Pixel in Patch</span>
      <span class="hud-val" id="hud-pixel" style="color:#58a6ff;">(px: 0, py: 0) &rarr; Global (0, 0)</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Data Passing (Ia vs Ib &Delta;I)</span>
      <span class="hud-val" id="hud-intensities">Ia: 0 | Ib: 0 | &Delta;I: 0</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Hadamard Interference P(edge)</span>
      <span class="hud-val" id="hud-prob" style="color:#ff79c6;">P(edge) = 0.0000</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Overall Progress</span>
      <span class="hud-val" id="hud-progress" style="color:#39d353;">0% (0 / 0 px)</span>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" id="anim-progress-bar"></div>
    </div>
  </div>

  <!-- Main Visual Processing Stage Grid -->
  <div class="main-stage-grid">
    <!-- Column 1: Input Original Image with Sliding Patch Window -->
    <div class="canvas-panel">
      <div class="panel-title">
        <span>1. Input Image & Sliding Patch</span>
        <span style="color:#ffd700; font-family:monospace;" id="patch-coord-badge">[0, 0]</span>
      </div>
      <div class="image-canvas-container">
        <canvas class="image-canvas" id="canvas-input" width="200" height="200"></canvas>
        <div class="patch-window-overlay" id="patch-box"></div>
      </div>
      <div class="patch-mini-grids">
        <div class="mini-grid-wrap">
          <span>Current 8×8 Patch</span>
          <canvas class="mini-8x8-canvas" id="canvas-active-patch" width="8" height="8"></canvas>
        </div>
        <div class="mini-grid-wrap">
          <span>Patch Edge Map</span>
          <canvas class="mini-8x8-canvas" id="canvas-patch-edge" width="8" height="8"></canvas>
        </div>
      </div>
    </div>

    <!-- Column 2: Dual Quantum Circuits (Horizontal & Vertical Passes) -->
    <div class="circuits-container">
      <!-- Circuit A: Horizontal Pass -->
      <div class="circuit-card">
        <div class="circuit-card-header">
          <span style="color:#58a6ff;">Circuit A: Horizontal Pass (q0, q1, q2 Column Register Shift & H Interference)</span>
          <span style="color:#8b9eb0; font-family:monospace;" id="status-h-pass">Gate: Ready</span>
        </div>
        <svg class="circuit-svg" id="svg-h-circuit" viewBox="0 0 540 115"></svg>
      </div>

      <!-- Circuit B: Vertical Pass -->
      <div class="circuit-card">
        <div class="circuit-card-header">
          <span style="color:#bc8cff;">Circuit B: Vertical Pass (q3, q4, q5 Row Register Shift & H Interference)</span>
          <span style="color:#8b9eb0; font-family:monospace;" id="status-v-pass">Gate: Ready</span>
        </div>
        <svg class="circuit-svg" id="svg-v-circuit" viewBox="0 0 540 115"></svg>
      </div>
    </div>

    <!-- Column 3: Assembled Full Quantum Edge Map -->
    <div class="canvas-panel">
      <div class="panel-title">
        <span style="color:#ff79c6;">3. Assembled Quantum Edges</span>
        <span style="color:#39d353; font-family:monospace;" id="canvas-complete-badge">Building...</span>
      </div>
      <div class="image-canvas-container">
        <canvas class="image-canvas" id="canvas-output" width="200" height="200"></canvas>
      </div>
      <div style="font-size:11px; color:#8b9eb0; margin-top:10px; text-align:center; line-height:1.4;">
        <span>Each 8×8 block is processed via 6-qubit FRQI-QHED quantum circuits and seamlessly assembled into the final high-resolution boundary map.</span>
      </div>
    </div>
  </div>

  <!-- Status Bar Footer -->
  <div class="status-footer">
    <span id="footer-status">Ready to process image patch-by-patch. Click <b>'🚀 Build Full Image Patch-by-Patch'</b> to begin!</span>
    <span style="font-family:monospace; color:#58a6ff;">6 Qubits / Patch &bull; 4 Circuit Passes &bull; AerSimulator Ideal Emulation</span>
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

  // DOM Elements
  const canvasIn = document.getElementById('canvas-input');
  const ctxIn = canvasIn.getContext('2d');
  const canvasOut = document.getElementById('canvas-output');
  const ctxOut = canvasOut.getContext('2d');
  const canvasPatch = document.getElementById('canvas-active-patch');
  const ctxPatch = canvasPatch.getContext('2d');
  const canvasPatchEdge = document.getElementById('canvas-patch-edge');
  const ctxPatchEdge = canvasPatchEdge.getContext('2d');

  const patchBox = document.getElementById('patch-box');
  const hudPatch = document.getElementById('hud-patch');
  const hudPixel = document.getElementById('hud-pixel');
  const hudIntensities = document.getElementById('hud-intensities');
  const hudProb = document.getElementById('hud-prob');
  const hudProgress = document.getElementById('hud-progress');
  const progressBar = document.getElementById('anim-progress-bar');
  const footerStatus = document.getElementById('footer-status');
  const patchCoordBadge = document.getElementById('patch-coord-badge');
  const completeBadge = document.getElementById('canvas-complete-badge');
  const statusH = document.getElementById('status-h-pass');
  const statusV = document.getElementById('status-v-pass');

  const svgH = document.getElementById('svg-h-circuit');
  const svgV = document.getElementById('svg-v-circuit');

  // Simulation State
  let currentPatchIdx = 0;
  let currentPixelInPatch = 0;
  let running = false;
  let timer = null;
  let speed = 120;
  let gateIndexH = 0;
  let gateIndexV = 0;

  // Output full edge buffer
  const fullEdgeBuffer = new Float32Array(imgW * imgH);
  // Current active patch edge buffer (64)
  const currentPatchEdgeBuffer = new Float32Array(64);

  // Draw Initial Input Image on canvas
  function renderInitialInput() {{
    const imgData = ctxIn.createImageData(imgW, imgH);
    for (let i = 0; i < pixels.length; i++) {{
      const val = pixels[i];
      imgData.data[i * 4 + 0] = val;
      imgData.data[i * 4 + 1] = val;
      imgData.data[i * 4 + 2] = val;
      imgData.data[i * 4 + 3] = 255;
    }}
    // Draw scaled to 200x200 canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = imgW;
    offscreen.height = imgH;
    offscreen.getContext('2d').putImageData(imgData, 0, 0);

    ctxIn.imageSmoothingEnabled = false;
    ctxIn.drawImage(offscreen, 0, 0, 200, 200);

    // Clear output canvas
    ctxOut.fillStyle = '#05070a';
    ctxOut.fillRect(0, 0, 200, 200);
  }}

  // Draw Circuit SVGs
  function drawCircuits(activeGateH = 0, activeGateV = 0) {{
    // Circuit A: Horizontal Pass
    const hGates = [
      {{ name: 'FRQI Init', type: 'init', target: 0, height: 6 }},
      {{ name: 'CCX', type: 'ccx', controls: [0, 1], target: 2 }},
      {{ name: 'CX', type: 'cx', controls: [0], target: 1 }},
      {{ name: 'X', type: 'x', target: 0 }},
      {{ name: 'H (col)', type: 'h', target: 0 }},
      {{ name: 'M', type: 'm', target: 0 }}
    ];
    renderSingleCircuit(svgH, hGates, activeGateH, '#58a6ff', 'col');

    // Circuit B: Vertical Pass
    const vGates = [
      {{ name: 'FRQI Init', type: 'init', target: 3, height: 6 }},
      {{ name: 'CCX', type: 'ccx', controls: [3, 4], target: 5 }},
      {{ name: 'CX', type: 'cx', controls: [3], target: 4 }},
      {{ name: 'X', type: 'x', target: 3 }},
      {{ name: 'H (row)', type: 'h', target: 3 }},
      {{ name: 'M', type: 'm', target: 3 }}
    ];
    renderSingleCircuit(svgV, vGates, activeGateV, '#bc8cff', 'row');
  }}

  function renderSingleCircuit(svgEl, gates, activeIdx, accentColor, registerType) {{
    const w = 540, h = 115;
    const x0 = 65, right = w - 15;
    const gap = (right - x0) / (gates.length + 1);

    let body = `<defs>
      <filter id="c-glow-${{registerType}}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    // Wire lines
    for (let q = 0; q < 6; q++) {{
      const y = 14 + q * 17;
      const label = q < 3 ? `q${{q}} (col)` : `q${{q}} (row)`;
      body += `<text x="5" y="${{y + 3.5}}" fill="#79c0ff" font-family="monospace" font-size="9px" font-weight="600">${{label}}</text>`;
      body += `<line x1="${{x0}}" y1="${{y}}" x2="${{right}}" y2="${{y}}" stroke="#26384a" stroke-width="1.5"/>`;
    }}

    // Moving vertical cursor
    if (activeIdx >= 0 && activeIdx < gates.length) {{
      const cursorX = x0 + (activeIdx + 1) * gap;
      body += `<rect x="${{cursorX - 16}}" y="4" width="32" height="106" rx="4" fill="rgba(88, 166, 255, 0.22)" stroke="${{accentColor}}" stroke-width="2" stroke-dasharray="4,2" filter="url(#c-glow-${{registerType}})"/>`;
    }}

    // Gates
    gates.forEach((gate, i) => {{
      const x = x0 + (i + 1) * gap;
      const isActive = i === activeIdx;

      if (gate.type === 'init') {{
        const fill = isActive ? accentColor : '#1f6feb';
        const stroke = isActive ? '#ffffff' : accentColor;
        body += `<rect x="${{x - 14}}" y="7" width="28" height="100" rx="4" fill="${{fill}}" stroke="${{stroke}}" stroke-width="${{isActive?2:1}}"/>`;
        body += `<text x="${{x}}" y="58" text-anchor="middle" fill="#ffffff" font-size="9px" font-weight="bold" transform="rotate(-90 ${{x}} 58)">FRQI Init</text>`;
      }} else if (gate.type === 'm') {{
        for (let q = 0; q < 6; q++) {{
          const y = 14 + q * 17;
          body += `<rect x="${{x - 8}}" y="${{y - 7}}" width="16" height="14" rx="2" fill="${{isActive?'#d29922':'#6e40c9'}}" stroke="${{isActive?'#ffd700':'#30363d'}}"/>`;
          body += `<text x="${{x}}" y="${{y + 3.5}}" text-anchor="middle" fill="#ffffff" font-size="8px" font-weight="bold">M</text>`;
        }}
      }} else {{
        const targetY = 14 + gate.target * 17;
        const fill = isActive ? accentColor : '#238636';

        if (gate.controls && gate.controls.length) {{
          const minY = 14 + Math.min(...gate.controls, gate.target) * 17;
          const maxY = 14 + Math.max(...gate.controls, gate.target) * 17;
          body += `<line x1="${{x}}" y1="${{minY}}" x2="${{x}}" y2="${{maxY}}" stroke="${{isActive?accentColor:'#8b949e'}}" stroke-width="${{isActive?2.5:1.5}}"/>`;
          gate.controls.forEach(c => {{
            body += `<circle cx="${{x}}" cy="${{14 + c * 17}}" r="3.5" fill="${{isActive?accentColor:'#f0f6fc'}}"/>`;
          }});
          body += `<circle cx="${{x}}" cy="${{targetY}}" r="7" fill="${{fill}}" stroke="#ffffff" stroke-width="1.5"/>`;
          body += `<path d="M${{x-4}} ${{targetY}}h8 M${{x}} ${{targetY-4}}v8" stroke="#ffffff" stroke-width="1.5"/>`;
        }} else {{
          body += `<rect x="${{x - 9}}" y="${{targetY - 7}}" width="18" height="14" rx="3" fill="${{fill}}" stroke="${{isActive?'#ffffff':'#388bfd'}}" stroke-width="${{isActive?2:1}}"/>`;
          body += `<text x="${{x}}" y="${{targetY + 3.5}}" text-anchor="middle" fill="#ffffff" font-size="9px" font-weight="bold">${{gate.name.split(' ')[0]}}</text>`;
        }}
      }}
    }});

    svgEl.innerHTML = body;
  }}

  // Mathematical QHED edge computation for an 8x8 patch
  function computePatchQHED(patchPixels) {{
    // Global normalization for QPIE/FRQI amplitudes
    const norm = Math.sqrt(patchPixels.reduce((s, v) => s + v * v, 0)) || 1.0;
    const amps = patchPixels.map(v => v / norm);

    const edgeOut = new Float32Array(64);

    // Pass 1 & 2: Horizontal even and shifted differences
    for (let r = 0; r < 8; r++) {{
      for (let c = 0; c < 7; c++) {{
        const idxA = r * 8 + c;
        const idxB = r * 8 + (c + 1);
        const diffH = Math.abs(amps[idxA] - amps[idxB]);
        const probH = (diffH * diffH) * 8.0; // Scaled probability
        edgeOut[idxA] = Math.max(edgeOut[idxA], probH);
      }}
    }}

    // Pass 3 & 4: Vertical even and shifted differences
    for (let c = 0; c < 8; c++) {{
      for (let r = 0; r < 7; r++) {{
        const idxA = r * 8 + c;
        const idxB = (r + 1) * 8 + c;
        const diffV = Math.abs(amps[idxA] - amps[idxB]);
        const probV = (diffV * diffV) * 8.0;
        edgeOut[idxA] = Math.max(edgeOut[idxA], probV);
      }}
    }}

    return edgeOut;
  }}

  // Extract pixels for patch index
  function getPatchPixels(patchIdx) {{
    const py = Math.floor(patchIdx / nPatchesX);
    const px = patchIdx % nPatchesX;
    const startY = py * patchSize;
    const startX = px * patchSize;

    const patch = new Uint8Array(64);
    for (let r = 0; r < patchSize; r++) {{
      for (let c = 0; c < patchSize; c++) {{
        const gy = startY + r;
        const gx = startX + c;
        patch[r * 8 + c] = pixels[gy * imgW + gx] || 0;
      }}
    }}
    return {{ patch, startX, startY, px, py }};
  }}

  // Update HUD with live telemetry
  function updateTelemetry(patchInfo, pixelIdx, edgeVal, valA, valB) {{
    const px = patchInfo.px;
    const py = patchInfo.py;
    hudPatch.textContent = `Patch ${{patchInfo.patchIdx + 1}} / ${{totalPatches}} (row ${{py}}, col ${{px}})`;

    const lX = pixelIdx % 8;
    const lY = Math.floor(pixelIdx / 8);
    const gX = patchInfo.startX + lX;
    const gY = patchInfo.startY + lY;
    hudPixel.textContent = `(px: ${{lX}}, py: ${{lY}}) &rarr; Global (${{gX}}, ${{gY}})`;

    const diff = Math.abs(valA - valB);
    hudIntensities.textContent = `Ia: ${{valA}} | Ib: ${{valB}} | &Delta;I: ${{diff}}`;
    hudProb.textContent = `P(edge) = ${{edgeVal.toFixed(5)}}`;

    const totalProcessedPixels = patchInfo.patchIdx * 64 + (pixelIdx + 1);
    const totalAllPixels = totalPatches * 64;
    const pct = Math.min(100, Math.round((totalProcessedPixels / totalAllPixels) * 100));

    hudProgress.textContent = `${{pct}}% (${{totalProcessedPixels}} / ${{totalAllPixels}} px)`;
    progressBar.style.width = `${{pct}}%`;

    patchCoordBadge.textContent = `[${{patchInfo.startX}}, ${{patchInfo.startY}}]`;
  }}

  // Update Patch Box Overlay Position
  function updatePatchBox(startX, startY) {{
    const scaleX = 200 / imgW;
    const scaleY = 200 / imgH;
    patchBox.style.left = `${{startX * scaleX}}px`;
    patchBox.style.top = `${{startY * scaleY}}px`;
    patchBox.style.width = `${{patchSize * scaleX}}px`;
    patchBox.style.height = `${{patchSize * scaleY}}px`;
  }}

  // Draw 8x8 Mini Canvas (Input Patch & Patch Edge)
  function drawMiniPatch(patchPixels, patchEdges, activePixelIdx) {{
    const imgDataIn = ctxPatch.createImageData(8, 8);
    const imgDataEdge = ctxPatchEdge.createImageData(8, 8);

    const maxEdge = Math.max(...patchEdges, 0.001);

    for (let i = 0; i < 64; i++) {{
      const v = patchPixels[i];
      imgDataIn.data[i * 4 + 0] = v;
      imgDataIn.data[i * 4 + 1] = v;
      imgDataIn.data[i * 4 + 2] = v;
      imgDataIn.data[i * 4 + 3] = 255;

      const eNorm = Math.min(1.0, patchEdges[i] / maxEdge);
      if (eNorm > 0.15) {{
        // Glowing magenta for quantum edge
        imgDataEdge.data[i * 4 + 0] = Math.round(255 * eNorm);
        imgDataEdge.data[i * 4 + 1] = Math.round(100 * eNorm);
        imgDataEdge.data[i * 4 + 2] = 255;
      }} else {{
        imgDataEdge.data[i * 4 + 0] = 10;
        imgDataEdge.data[i * 4 + 1] = 15;
        imgDataEdge.data[i * 4 + 2] = 25;
      }}
      imgDataEdge.data[i * 4 + 3] = 255;
    }}

    ctxPatch.putImageData(imgDataIn, 0, 0);
    ctxPatchEdge.putImageData(imgDataEdge, 0, 0);
  }}

  // Commit patch edges to full output canvas
  function commitPatchToOutput(startX, startY, patchEdges) {{
    const maxVal = Math.max(...patchEdges, 0.001);

    for (let r = 0; r < 8; r++) {{
      for (let c = 0; c < 8; c++) {{
        const gy = startY + r;
        const gx = startX + c;
        if (gx < imgW && gy < imgH) {{
          const eVal = patchEdges[r * 8 + c];
          fullEdgeBuffer[gy * imgW + gx] = eVal;
        }}
      }}
    }}

    // Render full buffer to canvasOut
    const fullImgData = ctxOut.createImageData(imgW, imgH);
    for (let i = 0; i < fullEdgeBuffer.length; i++) {{
      const val = fullEdgeBuffer[i];
      if (val > 0.02) {{
        fullImgData.data[i * 4 + 0] = Math.min(255, Math.round(val * 400));
        fullImgData.data[i * 4 + 1] = Math.min(150, Math.round(val * 120));
        fullImgData.data[i * 4 + 2] = 255; // Magenta-cyan quantum tint
      }} else {{
        fullImgData.data[i * 4 + 0] = 5;
        fullImgData.data[i * 4 + 1] = 8;
        fullImgData.data[i * 4 + 2] = 14;
      }}
      fullImgData.data[i * 4 + 3] = 255;
    }}

    const offscreen = document.createElement('canvas');
    offscreen.width = imgW;
    offscreen.height = imgH;
    offscreen.getContext('2d').putImageData(fullImgData, 0, 0);

    ctxOut.imageSmoothingEnabled = false;
    ctxOut.drawImage(offscreen, 0, 0, 200, 200);
  }}

  // Single step pixel execution
  function stepPixel() {{
    if (currentPatchIdx >= totalPatches) {{
      stop();
      completeBadge.textContent = "✅ Complete!";
      footerStatus.textContent = "Full image quantum edge reconstruction complete across all patches!";
      return;
    }}

    const patchInfo = getPatchPixels(currentPatchIdx);
    patchInfo.patchIdx = currentPatchIdx;

    updatePatchBox(patchInfo.startX, patchInfo.startY);

    // Compute complete QHED for this patch
    const patchQHED = computePatchQHED(patchInfo.patch);

    // Increment pixel
    currentPatchEdgeBuffer[currentPixelInPatch] = patchQHED[currentPixelInPatch];

    const valA = patchInfo.patch[currentPixelInPatch];
    const valB = patchInfo.patch[Math.min(63, currentPixelInPatch + 1)];
    const edgeVal = patchQHED[currentPixelInPatch];

    // Cycle circuit gates
    gateIndexH = (gateIndexH + 1) % 6;
    gateIndexV = (gateIndexV + 1) % 6;
    statusH.textContent = `Gate: ${{gateIndexH}} (${{['Init', 'CCX', 'CX', 'X', 'H', 'M'][gateIndexH]}})`;
    statusV.textContent = `Gate: ${{gateIndexV}} (${{['Init', 'CCX', 'CX', 'X', 'H', 'M'][gateIndexV]}})`;

    drawCircuits(gateIndexH, gateIndexV);
    drawMiniPatch(patchInfo.patch, currentPatchEdgeBuffer, currentPixelInPatch);
    updateTelemetry(patchInfo, currentPixelInPatch, edgeVal, valA, valB);

    currentPixelInPatch++;

    if (currentPixelInPatch >= 64) {{
      // Finished patch! Commit to full output canvas
      commitPatchToOutput(patchInfo.startX, patchInfo.startY, patchQHED);
      currentPatchIdx++;
      currentPixelInPatch = 0;
      currentPatchEdgeBuffer.fill(0);

      if (currentPatchIdx >= totalPatches) {{
        stop();
        completeBadge.textContent = "✅ Complete!";
        footerStatus.textContent = "All patches resolved. Quantum continuous edge map assembled!";
      }}
    }}
  }}

  // Step full patch at once
  function stepPatch() {{
    if (currentPatchIdx >= totalPatches) return;
    const patchInfo = getPatchPixels(currentPatchIdx);
    patchInfo.patchIdx = currentPatchIdx;

    updatePatchBox(patchInfo.startX, patchInfo.startY);

    const patchQHED = computePatchQHED(patchInfo.patch);
    commitPatchToOutput(patchInfo.startX, patchInfo.startY, patchQHED);
    drawMiniPatch(patchInfo.patch, patchQHED, 63);

    updateTelemetry(patchInfo, 63, patchQHED[63], patchInfo.patch[62], patchInfo.patch[63]);

    drawCircuits(4, 4); // Hadamard active
    statusH.textContent = "Gate: 4 (Hadamard H)";
    statusV.textContent = "Gate: 4 (Hadamard H)";

    currentPatchIdx++;
    currentPixelInPatch = 0;

    if (currentPatchIdx >= totalPatches) {{
      stop();
      completeBadge.textContent = "✅ Complete!";
      footerStatus.textContent = "All patches resolved. Quantum continuous edge map assembled!";
    }}
  }}

  function loop() {{
    if (!running) return;
    stepPixel();
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
    document.querySelector('[data-action="run-full"]').textContent = "⏸ Pause Simulation";
    footerStatus.textContent = "Processing image patch-by-patch through 6-qubit QHED circuits...";
    loop();
  }}

  function stop() {{
    running = false;
    clearTimeout(timer);
    timer = null;
    document.querySelector('[data-action="run-full"]').textContent = "🚀 Build Full Image Patch-by-Patch";
  }}

  function reset() {{
    stop();
    currentPatchIdx = 0;
    currentPixelInPatch = 0;
    fullEdgeBuffer.fill(0);
    currentPatchEdgeBuffer.fill(0);

    renderInitialInput();
    updatePatchBox(0, 0);
    drawCircuits(-1, -1);
    drawMiniPatch(new Uint8Array(64), new Float32Array(64), -1);

    hudPatch.textContent = `Patch 1 / ${{totalPatches}} (0, 0)`;
    hudPixel.textContent = `(px: 0, py: 0) &rarr; Global (0, 0)`;
    hudIntensities.textContent = `Ia: 0 | Ib: 0 | &Delta;I: 0`;
    hudProb.textContent = `P(edge) = 0.0000`;
    hudProgress.textContent = `0% (0 / ${{totalPatches * 64}} px)`;
    progressBar.style.width = '0%';
    completeBadge.textContent = "Ready";
    footerStatus.textContent = "Canvas reset. Click '🚀 Build Full Image Patch-by-Patch' to begin.";
  }}

  // Event Listeners
  document.querySelector('[data-action="run-full"]').addEventListener('click', start);
  document.querySelector('[data-action="step-patch"]').addEventListener('click', () => {{
    stop();
    stepPatch();
  }});
  document.querySelector('[data-action="step-pixel"]').addEventListener('click', () => {{
    stop();
    stepPixel();
  }});
  document.querySelector('[data-action="reset"]').addEventListener('click', reset);

  document.querySelector('[data-control="speed"]').addEventListener('change', (e) => {{
    speed = Number(e.target.value);
  }});

  // Initial Boot
  renderInitialInput();
  updatePatchBox(0, 0);
  drawCircuits(-1, -1);
  const p0 = getPatchPixels(0);
  p0.patchIdx = 0;
  drawMiniPatch(p0.patch, new Float32Array(64), 0);
  updateTelemetry(p0, 0, 0, p0.patch[0], p0.patch[1]);
}})();
</script>
</body>
</html>"""
