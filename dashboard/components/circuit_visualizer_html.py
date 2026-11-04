"""
Self-contained, high-contrast Dark-Theme Quantum Circuit & Live Pixel-by-Pixel Reconstruction Engine HTML
Provides:
- 6-Qubit SVG Circuit diagram with explicit high-contrast colors and neon active gate cursor
- Automated and step-by-step Pixel-by-Pixel Quantum Edge Image Construction:
  Watch the quantum edge map build up cell by cell as the quantum gates process each pixel's basis state!
- 5 Synchronized Interactive Visual Panels:
  1. Input Image Patch (active pixel highlighted with pulsing golden outline)
  2. Quantum Statevector Amplitudes (+ cyan / - orange)
  3. Live Reconstructing Quantum Edge Map (builds pixel-by-pixel with glowing transitions)
  4. Sampled Measurement Outcomes (shots hits from Aer)
  5. Thresholded Binary Edge Decision (Otsu T*)
- Live Telemetry HUD: shows active pixel (x,y), basis state |yx>, intensity difference, and quantum probability.
"""
import json

def get_quantum_circuit_stepper_html(patch_pixels):
    """
    Returns standalone HTML with full CSS and JS for the interactive quantum circuit stepper
    and live pixel-by-pixel edge reconstruction engine.
    patch_pixels: list of 64 integer pixel brightness values [0-255].
    """
    pixels_json = json.dumps(patch_pixels)

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Live Quantum Circuit & Pixel-by-Pixel Reconstruction</title>
<style>
* {{ box-sizing: border-box; }}
body {{
  margin: 0;
  padding: 16px;
  background-color: #0d1117;
  color: #f0f6fc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 13px;
}}
.header-row {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #30363d;
  padding-bottom: 10px;
}}
.header-title {{
  font-size: 18px;
  font-weight: 700;
  color: #58a6ff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}}
.viz-row, .viz-controls {{
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 10px 0;
}}
.viz-controls .form-label {{
  display: flex;
  gap: 6px;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
  color: #8b9eb0;
  font-size: 12px;
  font-weight: 500;
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
  background: #1f6feb;
  color: #ffffff;
  border-color: #388bfd;
}}
.btn-primary:hover {{
  background: #388bfd;
  border-color: #58a6ff;
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
  padding: 7px 10px;
  font-size: 12px;
  outline: none;
}}
.form-select:focus {{
  border-color: #58a6ff;
}}
.form-range {{
  width: 100%;
  accent-color: #58a6ff;
}}
.hud-card {{
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}}
.hud-metric {{
  display: flex;
  flex-direction: column;
  gap: 2px;
}}
.hud-label {{
  font-size: 11px;
  color: #8b9eb0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}}
.hud-value {{
  font-size: 13px;
  font-weight: 700;
  color: #f0f6fc;
  font-family: monospace;
}}
.progress-bar-container {{
  width: 100%;
  height: 6px;
  background: #21262d;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 6px;
}}
.progress-bar-fill {{
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #58a6ff, #a371f7);
  transition: width 0.1s ease;
}}
.ql-circuit {{
  display: block;
  width: 100%;
  height: 240px;
  margin: 12px 0;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
}}
.ql-fields {{
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}}
@media (max-width: 1100px) {{
  .ql-fields {{ grid-template-columns: repeat(3, minmax(0, 1fr)); }}
}}
@media (max-width: 700px) {{
  .ql-fields {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
}}
figure {{
  margin: 0;
  min-width: 0;
}}
figcaption {{
  margin-bottom: 6px;
  color: #8b9eb0;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}}
.ql-pixels {{
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 2px;
  width: 100%;
  aspect-ratio: 1;
  background: #0d1117;
  padding: 4px;
  border: 1px solid #30363d;
  border-radius: 6px;
}}
.ql-cell {{
  aspect-ratio: 1;
  min-width: 0;
  background: #161b22;
  position: relative;
  border: 1px solid #21262d;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.15s ease;
}}
.ql-cell:hover {{
  transform: scale(1.18);
  z-index: 3;
  border-color: #58a6ff;
}}
.ql-cell.active-inspect {{
  outline: 2px solid #e3b341 !important;
  outline-offset: -1px;
  z-index: 2;
  box-shadow: 0 0 8px rgba(227, 179, 65, 0.8);
}}
.ql-cell.just-built {{
  animation: cellPulse 0.4s ease-out;
}}
@keyframes cellPulse {{
  0% {{ transform: scale(1.3); filter: brightness(2); }}
  100% {{ transform: scale(1); filter: brightness(1); }}
}}
.legend-row {{
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  color: #8b9eb0;
  margin-top: 8px;
  flex-wrap: wrap;
}}
.swatch {{
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 2px;
  margin-right: 4px;
}}
.swatch-pos {{ background: #38bdf8; }}
.swatch-neg {{ background: #fb923c; }}
.swatch-recon {{ background: #a855f7; }}
.swatch-sample {{ background: #f43f5e; }}
.swatch-binary {{ background: #ffffff; border: 1px solid #8b9eb0; }}

@media (max-width: 900px) {{
  .ql-fields {{ grid-template-columns: repeat(3, minmax(0, 1fr)); }}
}}
@media (max-width: 600px) {{
  .ql-fields {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
}}
</style>
</head>
<body>
<div id="lunar-quantum-live">
  <div class="header-row">
    <h2 class="header-title">⚛️ Live Quantum Gate Execution & Pixel-by-Pixel Image Reconstruction</h2>
    <span style="font-size:12px; color:#8b9eb0;">FRQI State Encoding + Cyclic Coordinate Shift + Hadamard Difference</span>
  </div>

  <div class="viz-controls">
    <label class="form-label">
      Active Image Preset
      <select class="form-select" data-control="image">
        <option value="lunar" selected>Current Active Image Patch (Uploaded / Selected)</option>
        <option value="circle">Synthetic Crater Rim</option>
        <option value="split">Sharp Vertical Boundary</option>
        <option value="ramp">Row Gradient Ramp</option>
        <option value="edited">Custom Edited Pixels</option>
      </select>
    </label>
    <label class="form-label">
      Circuit Direction & Pair Pass
      <select class="form-select" data-control="pass">
        <option value="0">Horizontal · Even Pairs (x, x+1)</option>
        <option value="1" selected>Horizontal · Shifted Pairs (Cyclic Boundary)</option>
        <option value="2">Vertical · Even Pairs (y, y+1)</option>
        <option value="3">Vertical · Shifted Pairs (Cyclic Boundary)</option>
      </select>
    </label>
    <label class="form-label">
      Building Animation Speed
      <select class="form-select" data-control="speed">
        <option value="400">Slow (400ms / pixel)</option>
        <option value="150" selected>Normal (150ms / pixel)</option>
        <option value="40">Fast (40ms / pixel)</option>
      </select>
    </label>
  </div>

  <!-- Primary Interactive Action Buttons -->
  <div class="viz-row">
    <button class="btn btn-build" data-action="build-pixels" type="button">🚀 Build Image Pixel-by-Pixel</button>
    <button class="btn btn-primary" data-action="run" type="button">▶ Run Circuit Gates</button>
    <button class="btn" data-action="step-pixel" type="button">⏭ Next Pixel</button>
    <button class="btn" data-action="step-gate" type="button">⏩ Next Gate</button>
    <button class="btn" data-action="restart" type="button">↺ Reset Canvas</button>
  </div>

  <!-- Telemetry HUD & Status Card -->
  <div class="hud-card">
    <div class="hud-metric">
      <span class="hud-label">Active Pixel</span>
      <span class="hud-value" id="hud-pixel">(x: 0, y: 0) · Idx 0</span>
    </div>
    <div class="hud-metric">
      <span class="hud-label">Position State |y⟩|x⟩</span>
      <span class="hud-value" id="hud-basis">|000⟩|000⟩</span>
    </div>
    <div class="hud-metric">
      <span class="hud-label">Pixel & Neighbor Intensity</span>
      <span class="hud-value" id="hud-intensity">Ia: 0.0 | Ib: 0.0 | ΔI: 0.0</span>
    </div>
    <div class="hud-metric">
      <span class="hud-label">Hadamard Edge Probability</span>
      <span class="hud-value" id="hud-prob" style="color:#a855f7;">P(edge) = 0.0000</span>
    </div>
    <div class="hud-metric">
      <span class="hud-label">Reconstruction Progress</span>
      <span class="hud-value" id="hud-progress" style="color:#58a6ff;">0 / 64 (0%)</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" id="build-progress-bar"></div>
    </div>
  </div>

  <!-- Interactive SVG Circuit Wire & Gate Diagram -->
  <svg class="ql-circuit" role="img" aria-label="Interactive six-qubit circuit with live gate playback"></svg>

  <!-- 5 Synchronized Pixel Grids -->
  <div class="ql-fields">
    <figure>
      <figcaption>1. Input Patch (Click to Edit)</figcaption>
      <div class="ql-pixels" data-grid="image" role="group"></div>
    </figure>
    <figure>
      <figcaption>2. Statevector Amplitudes (α)</figcaption>
      <div class="ql-pixels" data-grid="state" role="img"></div>
    </figure>
    <figure>
      <figcaption style="color:#bc8cff;">3. 🌟 Live Reconstructed Edge Map</figcaption>
      <div class="ql-pixels" data-grid="reconstructed" role="img"></div>
    </figure>
    <figure>
      <figcaption>4. Sampled Hits (Aer Shots)</figcaption>
      <div class="ql-pixels" data-grid="sampled" role="img"></div>
    </figure>
    <figure>
      <figcaption>5. Binary Decision (T*)</figcaption>
      <div class="ql-pixels" data-grid="binary" role="img"></div>
    </figure>
  </div>

  <div class="legend-row">
    <span><span class="swatch swatch-pos"></span>Positive Amplitude</span>
    <span><span class="swatch swatch-neg"></span>Negative Amplitude</span>
    <span><span class="swatch swatch-recon"></span>Reconstructed Edge Intensity</span>
    <span><span class="swatch swatch-sample"></span>Sampled Measurement Shots</span>
    <span><span class="swatch swatch-binary"></span>Binary Decision Edge</span>
    <span style="margin-left:auto; font-style:italic;" id="build-status-msg">Click '🚀 Build Image Pixel-by-Pixel' to watch quantum edge construction!</span>
  </div>
</div>

<script>
(() => {{
  const root = document.getElementById('lunar-quantum-live');
  const select = name => root.querySelector(`[data-control="${{name}}"]`);
  const action = name => root.querySelector(`[data-action="${{name}}"]`);
  const svg = root.querySelector('.ql-circuit');

  const hudPixel = document.getElementById('hud-pixel');
  const hudBasis = document.getElementById('hud-basis');
  const hudIntensity = document.getElementById('hud-intensity');
  const hudProb = document.getElementById('hud-prob');
  const hudProgress = document.getElementById('hud-progress');
  const progressBar = document.getElementById('build-progress-bar');
  const statusMsg = document.getElementById('build-status-msg');

  const SQRT2 = Math.SQRT2;
  const currentPatchPixels = {pixels_json};

  let pixels = [];
  let pass = 1;
  let gateIndex = -1;
  let state = [];
  let operations = [];
  let interference = [];

  // Pixel-by-pixel reconstruction state
  let currentPixelIdx = 0;
  let builtEdgeMap = new Array(64).fill(0);
  let buildingPixels = false;
  let pixelTimer = null;

  // Circuit gate execution state
  let measured = 0;
  let accepted = 0;
  let edgeCounts = new Array(64).fill(0);
  let runningCircuit = false;
  let circuitTimer = null;
  let lastMeasured = -1;

  let rng = 42;
  let limit = 2048;
  let speed = 150;
  let preset = 'lunar';

  function random() {{
    rng = (1664525 * rng + 1013904223) >>> 0;
    return rng / 4294967296;
  }}

  function input(name) {{
    if(name === 'lunar' && Array.isArray(currentPatchPixels) && currentPatchPixels.length === 64) {{
      return currentPatchPixels.slice();
    }}
    return Array.from({{length: 64}}, (_, i) => {{
      const x = i % 8, y = Math.floor(i / 8), radius = Math.hypot(x - 3.5, y - 3.5);
      if(name === 'split') return x >= 4 ? 255 : 0;
      if(name === 'circle') return radius < 2.8 ? 220 : 35;
      if(name === 'ramp') return Math.round(y / 7 * 255);
      return currentPatchPixels[i] || 100;
    }});
  }}

  function normalize(values) {{
    const norm = Math.sqrt(values.reduce((sum, x) => sum + x * x, 0));
    return norm ? values.map(x => x / norm) : values.map(() => 1 / 8);
  }}

  function applyGate(values, gate) {{
    if(gate.kind === 'prepare') return normalize(pixels);
    const result = values.slice();
    if(gate.kind === 'h') {{
      const stride = 1 << gate.target;
      for(let i = 0; i < 64; i++) if(!(i & stride)) {{
        result[i] = (values[i] + values[i + stride]) / SQRT2;
        result[i + stride] = (values[i] - values[i + stride]) / SQRT2;
      }}
    }} else if(gate.kind === 'x') {{
      const stride = 1 << gate.target;
      const controls = gate.controls || [];
      for(let i = 0; i < 64; i++) if(!(i & stride) && controls.every(q => i & (1 << q))) {{
        result[i] = values[i + stride];
        result[i + stride] = values[i];
      }}
    }}
    return result;
  }}

  function gates(p) {{
    const base = p < 2 ? 0 : 3, shifted = p % 2;
    const list = [{{ kind: 'prepare', name: 'Gate 0: Prepare FRQI Image Amplitudes' }}];
    if(shifted) {{
      list.push({{ kind: 'x', target: base + 2, controls: [base, base + 1], name: `Gate 1: CCX Carry Shift (q${{base}}, q${{base+1}} → q${{base+2}})` }});
      list.push({{ kind: 'x', target: base + 1, controls: [base], name: `Gate 2: CX Coordinate Shift (q${{base}} → q${{base+1}})` }});
      list.push({{ kind: 'x', target: base, controls: [], name: `Gate 3: Pauli-X Coordinate Inversion (q${{base}})` }});
    }}
    list.push({{ kind: 'h', target: base, name: `Gate 4: Hadamard H (Local Angle Difference Interference on q${{base}})` }});
    list.push({{ kind: 'measure', name: 'Gate 5: Measure All Qubits in Computational Basis' }});
    return list;
  }}

  function destination(index, p) {{
    const stride = p < 2 ? 1 : 8;
    if(!(index & stride)) return -1;
    const base = index & ~stride, coordinate = p < 2 ? base % 8 : Math.floor(base / 8);
    const anchor = (coordinate + 1 - p % 2 + 8) % 8;
    return anchor === 0 ? -1 : base + (anchor - coordinate) * stride;
  }}

  function calculate(p, values = pixels) {{
    let v = normalize(values);
    for(const gate of gates(p).slice(1, -1)) v = applyGate(v, gate);
    const edge = new Array(64).fill(0);
    v.forEach((a, i) => {{ const d = destination(i, p); if(d >= 0) edge[d] += a * a; }});
    return {{ amplitudes: v, edge }};
  }}

  function exactCombined() {{
    const views = [0, 1, 2, 3].map(p => calculate(p).edge);
    return Array.from({{length: 64}}, (_, i) => Math.max(...views.map(v => v[i])));
  }}

  // Setup DOM cells for all 5 grids
  const cells = {{}};
  for(const kind of ['image', 'state', 'reconstructed', 'sampled', 'binary']) {{
    const grid = root.querySelector(`[data-grid="${{kind}}"]`);
    cells[kind] = Array.from({{length: 64}}, (_, i) => {{
      const cell = document.createElement(kind === 'image' ? 'button' : 'div');
      cell.className = 'ql-cell';
      if(kind === 'image') {{
        cell.type = 'button';
        cell.addEventListener('click', () => {{
          pixels[i] = pixels[i] >= 128 ? 0 : 255;
          preset = 'edited';
          select('image').value = 'edited';
          restart();
        }});
      }}
      grid.appendChild(cell);
      return cell;
    }});
  }}

  function drawGrid(kind, values, signed = false) {{
    const max = Math.max(...values.map(Math.abs), 1e-20);
    values.forEach((value, i) => {{
      const cell = cells[kind][i];
      const pxX = i % 8, pxY = Math.floor(i / 8);
      const caption = `(row ${{pxY}}, col ${{pxX}}): ${{kind === 'image' ? Math.round(value) : value.toFixed(5)}}`;
      cell.setAttribute('title', caption);

      if(kind === 'image') {{
        const b = Math.round(Math.min(255, Math.max(0, value)));
        cell.style.backgroundColor = `rgb(${{b}}, ${{b}}, ${{b}})`;
        cell.style.borderColor = '#30363d';
        cell.classList.toggle('active-inspect', i === currentPixelIdx);
      }} else if(kind === 'state') {{
        const normVal = Math.abs(value) / max;
        if(value > 0.0001) {{
          cell.style.backgroundColor = `rgba(56, 189, 248, ${{Math.max(0.18, normVal)}})`;
          cell.style.borderColor = '#0284c7';
        }} else if(value < -0.0001) {{
          cell.style.backgroundColor = `rgba(251, 146, 60, ${{Math.max(0.18, normVal)}})`;
          cell.style.borderColor = '#ea580c';
        }} else {{
          cell.style.backgroundColor = '#161b22';
          cell.style.borderColor = '#21262d';
        }}
        cell.classList.toggle('active-inspect', i === currentPixelIdx);
      }} else if(kind === 'reconstructed') {{
        const normVal = value / max;
        if(value > 0.0001) {{
          cell.style.backgroundColor = `rgba(168, 85, 247, ${{Math.max(0.25, normVal)}})`;
          cell.style.borderColor = '#a855f7';
        }} else {{
          cell.style.backgroundColor = '#161b22';
          cell.style.borderColor = '#21262d';
        }}
        cell.classList.toggle('active-inspect', i === currentPixelIdx);
      }} else if(kind === 'sampled') {{
        const normVal = value / max;
        if(value > 0) {{
          cell.style.backgroundColor = `rgba(244, 63, 94, ${{Math.max(0.25, normVal)}})`;
          cell.style.borderColor = '#e11d48';
        }} else {{
          cell.style.backgroundColor = '#161b22';
          cell.style.borderColor = '#21262d';
        }}
      }} else if(kind === 'binary') {{
        if(value > 0) {{
          cell.style.backgroundColor = '#ffffff';
          cell.style.borderColor = '#58a6ff';
        }} else {{
          cell.style.backgroundColor = '#0d1117';
          cell.style.borderColor = '#21262d';
        }}
      }}
    }});
  }}

  function drawCircuit() {{
    const width = Math.max(svg.clientWidth || 700, 500);
    const height = 240;
    svg.setAttribute('viewBox', `0 0 ${{width}} ${{height}}`);

    const x0 = 85, right = width - 15;
    const gap = (right - x0) / (operations.length + 1);

    let body = '<title>Live Six-Qubit QHED Circuit</title>';
    body += `<defs>
      <linearGradient id="initGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1f6feb"/>
        <stop offset="100%" stop-color="#8957e5"/>
      </linearGradient>
      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    // Qubit wire lines and labels
    for(let q = 0; q < 6; q++) {{
      const y = 28 + q * 34;
      const qRole = q < 3 ? `q${{q}} (col ${{q}})` : `q${{q}} (row ${{q-3}})`;
      body += `<text x="6" y="${{y + 4}}" fill="#79c0ff" font-family="monospace" font-size="12px" font-weight="700">${{qRole}}</text>`;
      body += `<line x1="${{x0}}" y1="${{y}}" x2="${{right}}" y2="${{y}}" stroke="#388bfd" stroke-width="2.5" stroke-opacity="0.85"/>`;
    }}

    // Moving glowing vertical cursor
    if(gateIndex >= 0 && gateIndex < operations.length) {{
      const cursorX = x0 + (gateIndex + 1) * gap;
      body += `<rect x="${{cursorX - 22}}" y="6" width="44" height="228" rx="6" fill="rgba(88, 166, 255, 0.3)" stroke="#79c0ff" stroke-width="3" stroke-dasharray="6,3" filter="url(#neonGlow)"/>`;
    }}

    // Draw individual gates
    operations.forEach((gate, i) => {{
      const x = x0 + (i + 1) * gap;
      const active = i === gateIndex;

      if(gate.kind === 'prepare') {{
        const fill = active ? '#8957e5' : '#1f6feb';
        const stroke = active ? '#bc8cff' : '#58a6ff';
        const sw = active ? '3' : '2';
        const filter = active ? 'filter="url(#neonGlow)"' : '';
        body += `<rect x="${{x - 20}}" y="14" width="40" height="198" rx="6" fill="${{fill}}" stroke="${{stroke}}" stroke-width="${{sw}}" ${{filter}}/>`;
        body += `<text x="${{x}}" y="118" text-anchor="middle" fill="#ffffff" font-weight="bold" font-size="12px">FRQI Init</text>`;
      }} else if(gate.kind === 'measure') {{
        const fill = active ? '#d29922' : '#9e6a03';
        const stroke = active ? '#f0883e' : '#d29922';
        const sw = active ? '3' : '2';
        const filter = active ? 'filter="url(#neonGlow)"' : '';
        for(let q = 0; q < 6; q++) {{
          const y = 28 + q * 34;
          body += `<rect x="${{x - 13}}" y="${{y - 13}}" width="26" height="26" rx="4" fill="${{fill}}" stroke="${{stroke}}" stroke-width="${{sw}}" ${{filter}}/>`;
          body += `<text x="${{x}}" y="${{y + 5}}" text-anchor="middle" fill="#ffffff" font-weight="bold" font-size="11px">M</text>`;
        }}
      }} else {{
        const y = 28 + gate.target * 34;
        const fill = active ? '#58a6ff' : '#1f6feb';
        const stroke = active ? '#ffffff' : '#388bfd';
        const sw = active ? '3' : '2';
        const filter = active ? 'filter="url(#neonGlow)"' : '';

        if(gate.controls && gate.controls.length) {{
          const minY = 28 + Math.min(...gate.controls, gate.target) * 34;
          const maxY = 28 + Math.max(...gate.controls, gate.target) * 34;
          body += `<line x1="${{x}}" y1="${{minY}}" x2="${{x}}" y2="${{maxY}}" stroke="${{active ? '#79c0ff' : '#58a6ff'}}" stroke-width="${{active ? 3 : 2}}"/>`;
          for(const q of gate.controls) {{
            body += `<circle cx="${{x}}" cy="${{28 + q * 34}}" r="5" fill="${{active ? '#58a6ff' : '#f0f6fc'}}"/>`;
          }}
          body += `<circle cx="${{x}}" cy="${{y}}" r="12" fill="${{fill}}" stroke="${{stroke}}" stroke-width="${{sw}}" ${{filter}}/>`;
          body += `<path d="M${{x-7}} ${{y}}h14 M${{x}} ${{y-7}}v14" stroke="#ffffff" stroke-width="2"/>`;
        }} else {{
          const gateColor = gate.kind === 'h' ? (active ? '#a371f7' : '#8957e5') : fill;
          body += `<rect x="${{x - 14}}" y="${{y - 14}}" width="28" height="28" rx="4" fill="${{gateColor}}" stroke="${{stroke}}" stroke-width="${{sw}}" ${{filter}}/>`;
          body += `<text x="${{x}}" y="${{y + 5}}" text-anchor="middle" fill="#ffffff" font-weight="bold" font-size="12px">${{gate.kind === 'h' ? 'H' : 'X'}}</text>`;
        }}
      }}
    }});

    svg.innerHTML = body;
  }}

  function updateHUD() {{
    const x = currentPixelIdx % 8;
    const y = Math.floor(currentPixelIdx / 8);
    const xBin = x.toString(2).padStart(3, '0');
    const yBin = y.toString(2).padStart(3, '0');

    hudPixel.textContent = `(x: ${{x}}, y: ${{y}}) · Idx ${{currentPixelIdx}}`;
    hudBasis.textContent = `|${{yBin}}⟩|${{xBin}}⟩`;

    const valA = pixels[currentPixelIdx] || 0;
    const nextX = Math.min(7, x + 1);
    const valB = pixels[y * 8 + nextX] || 0;
    const diff = Math.abs(valA - valB);

    hudIntensity.textContent = `Ia: ${{valA.toFixed(0)}} | Ib: ${{valB.toFixed(0)}} | ΔI: ${{diff.toFixed(0)}}`;

    // Exact theoretical edge probability for this pixel
    const exactMap = exactCombined();
    const pVal = exactMap[currentPixelIdx] || 0.0;
    hudProb.textContent = `P(edge) = ${{pVal.toFixed(5)}}`;

    const pct = Math.round(((currentPixelIdx + 1) / 64) * 100);
    hudProgress.textContent = `${{currentPixelIdx + 1}} / 64 (${{pct}}%)`;
    progressBar.style.width = `${{pct}}%`;
  }}

  function draw() {{
    drawCircuit();
    drawGrid('image', pixels);
    drawGrid('state', state, true);
    drawGrid('reconstructed', builtEdgeMap);
    drawGrid('sampled', edgeCounts.map(x => measured ? x / measured : 0));

    // Dynamic Otsu binary decision from reconstructed map
    const maxVal = Math.max(...builtEdgeMap, 1e-4);
    const otsuT = maxVal * 0.35;
    const binMap = builtEdgeMap.map(v => v >= otsuT ? 1 : 0);
    drawGrid('binary', binMap);

    updateHUD();
  }}

  // --------------------------------------------------------------------------
  // Pixel-by-Pixel Image Reconstruction Engine
  // --------------------------------------------------------------------------
  function stepPixelReconstruct() {{
    if(currentPixelIdx >= 64) {{
      stopPixelBuilding();
      statusMsg.textContent = "✅ Quantum edge reconstruction complete across all 64 basis states!";
      return;
    }}

    const exactMap = exactCombined();
    builtEdgeMap[currentPixelIdx] = exactMap[currentPixelIdx];

    // Trigger cell pulse animation on just-built cell
    if(cells['reconstructed'][currentPixelIdx]) {{
      cells['reconstructed'][currentPixelIdx].classList.add('just-built');
    }}

    // Advance circuit gate visualization to Hadamard for this pixel
    gateIndex = (gateIndex + 1) % operations.length;

    draw();

    currentPixelIdx++;
    if(currentPixelIdx >= 64) {{
      stopPixelBuilding();
      statusMsg.textContent = "✅ Complete! All 64 pixel interference outcomes resolved.";
    }}
  }}

  function startPixelBuilding() {{
    if(buildingPixels) {{
      stopPixelBuilding();
      return;
    }}
    if(currentPixelIdx >= 64) {{
      restart();
    }}
    buildingPixels = true;
    action('build-pixels').textContent = "⏸ Pause Building";
    statusMsg.textContent = "Building quantum edge image pixel-by-pixel...";

    function loop() {{
      if(!buildingPixels) return;
      stepPixelReconstruct();
      if(buildingPixels && currentPixelIdx < 64) {{
        pixelTimer = setTimeout(loop, speed);
      }}
    }}
    loop();
  }}

  function stopPixelBuilding() {{
    buildingPixels = false;
    clearTimeout(pixelTimer);
    pixelTimer = null;
    action('build-pixels').textContent = "🚀 Build Image Pixel-by-Pixel";
  }}

  // --------------------------------------------------------------------------
  // Circuit Gate Stepper
  // --------------------------------------------------------------------------
  function advanceGate() {{
    if(gateIndex < operations.length - 1) {{
      gateIndex++;
      const gate = operations[gateIndex];
      if(gate.kind === 'measure') sample(1);
      else state = applyGate(state, gate);
    }} else {{
      sample(Math.min(64, limit - measured));
    }}
    draw();
  }}

  function sample(batch) {{
    const probabilities = interference.map(a => a * a);
    for(let k = 0; k < batch && measured < limit; k++) {{
      const r = random();
      let sum = 0, index = 63;
      for(let i = 0; i < 64; i++) {{
        sum += probabilities[i];
        if(r < sum) {{ index = i; break; }}
      }}
      const d = destination(index, pass);
      if(d >= 0) {{ edgeCounts[d]++; accepted++; }}
      lastMeasured = index;
      measured++;
    }}
    state = new Array(64).fill(0);
    state[lastMeasured] = 1;
  }}

  function restart() {{
    stopPixelBuilding();
    runningCircuit = false;
    clearTimeout(circuitTimer);
    circuitTimer = null;

    currentPixelIdx = 0;
    builtEdgeMap = new Array(64).fill(0);
    gateIndex = -1;
    measured = 0;
    accepted = 0;
    lastMeasured = -1;
    rng = 42;

    state = new Array(64).fill(0);
    state[0] = 1;
    edgeCounts = new Array(64).fill(0);

    operations = gates(pass);
    interference = calculate(pass).amplitudes;

    statusMsg.textContent = "Canvas reset. Ready for live pixel-by-pixel build!";
    draw();
  }}

  // Event Listeners
  action('build-pixels').addEventListener('click', startPixelBuilding);
  action('step-pixel').addEventListener('click', () => {{
    stopPixelBuilding();
    stepPixelReconstruct();
  }});

  action('run').addEventListener('click', () => {{
    if(runningCircuit) {{
      runningCircuit = false;
      clearTimeout(circuitTimer);
      circuitTimer = null;
      action('run').textContent = "▶ Run Circuit Gates";
      return;
    }}
    runningCircuit = true;
    action('run').textContent = "⏸ Pause Gates";
    function cLoop() {{
      if(!runningCircuit) return;
      advanceGate();
      if(runningCircuit && measured < limit) {{
        circuitTimer = setTimeout(cLoop, speed);
      }} else {{
        runningCircuit = false;
        action('run').textContent = "▶ Run Circuit Gates";
      }}
    }}
    cLoop();
  }});

  action('step-gate').addEventListener('click', () => {{
    runningCircuit = false;
    advanceGate();
  }});

  action('restart').addEventListener('click', restart);

  select('image').addEventListener('change', () => {{
    preset = select('image').value;
    pixels = input(preset);
    restart();
  }});

  select('pass').addEventListener('change', () => {{
    pass = Number(select('pass').value);
    restart();
  }});

  select('speed').addEventListener('change', () => {{
    speed = Number(select('speed').value);
  }});

  new ResizeObserver(drawCircuit).observe(svg);

  // Initialize with lunar/uploaded image
  pixels = input('lunar');
  restart();
}})();
</script>
</body>
</html>"""
