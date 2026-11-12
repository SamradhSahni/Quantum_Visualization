"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { FormulaFlowBlock } from "@/components/studio/FormulaFlowBlock";
import { analyzeLocalPatchPair } from "@/lib/quantumEdgeMath";
import { apiFetch } from "@/lib/apiClient";
import { Sliders, Sparkles, Activity, CheckCircle2, ChevronRight, Cpu, Layers, Eye, HelpCircle } from "lucide-react";

interface PatchSandboxProps {
  algorithm: "frqi" | "qpie" | "neqr";
}

const PRESETS = {
  crater_rim: [
    [38, 40, 42, 215, 218, 220, 221, 219],
    [39, 41, 44, 212, 219, 222, 220, 218],
    [37, 39, 41, 216, 220, 221, 219, 217],
    [36, 38, 38, 218, 220, 223, 221, 220],
    [35, 37, 40, 214, 217, 219, 218, 216],
    [38, 40, 43, 210, 215, 218, 217, 215],
    [37, 39, 41, 208, 214, 216, 215, 214],
    [36, 38, 40, 205, 212, 215, 214, 212]
  ],
  flat_mare: [
    [40, 41, 41, 42, 43, 42, 41, 40],
    [41, 42, 42, 43, 44, 43, 42, 41],
    [40, 41, 43, 44, 45, 44, 43, 42],
    [42, 43, 44, 45, 45, 45, 44, 43],
    [41, 42, 43, 44, 44, 43, 42, 41],
    [40, 41, 42, 43, 43, 42, 41, 40],
    [39, 40, 41, 42, 42, 41, 40, 39],
    [38, 39, 40, 41, 41, 40, 39, 38]
  ],
  diagonal_ray: [
    [210, 215, 50, 45, 40, 38, 36, 35],
    [215, 220, 215, 52, 46, 41, 39, 37],
    [52, 215, 222, 218, 55, 48, 43, 40],
    [46, 54, 218, 224, 219, 58, 50, 44],
    [41, 47, 56, 220, 225, 221, 60, 52],
    [38, 42, 49, 60, 222, 226, 223, 65],
    [36, 40, 45, 52, 62, 224, 228, 225],
    [35, 38, 42, 48, 55, 68, 225, 230]
  ]
};

export const PatchSandbox: React.FC<PatchSandboxProps> = ({ algorithm }) => {
  const [presetKey, setPresetKey] = useState<"crater_rim" | "flat_mare" | "diagonal_ray">("crater_rim");
  const [patch, setPatch] = useState<number[][]>(PRESETS["crater_rim"]);
  const [selectedCoord, setSelectedCoord] = useState<{ r: number; c: number }>({ r: 3, c: 2 });

  // Parameters
  const [shots, setShots] = useState<number>(4096);
  const [threshold, setThreshold] = useState<number>(0.25);
  const [phaseGain, setPhaseGain] = useState<number>(1.0);
  const [bitDepth, setBitDepth] = useState<number>(8);
  const [epsilonFloor, setEpsilonFloor] = useState<number>(1.0);
  const [haloPadding, setHaloPadding] = useState<boolean>(true);
  const [normType, setNormType] = useState<string>("L2");

  // Output simulation maps
  const [horizMap, setHorizMap] = useState<number[][]>([]);
  const [vertMap, setVertMap] = useState<number[][]>([]);
  const [fusedMap, setFusedMap] = useState<number[][]>([]);
  const [binaryMap, setBinaryMap] = useState<number[][]>([]);
  const [traceData, setTraceData] = useState<any>(null);

  // Recalculate simulation on parameter change
  useEffect(() => {
    runSimulation();
  }, [presetKey, patch, selectedCoord, shots, threshold, phaseGain, bitDepth, epsilonFloor, haloPadding, normType, algorithm]);

  const handleSelectPreset = (key: "crater_rim" | "flat_mare" | "diagonal_ray") => {
    setPresetKey(key);
    setPatch(PRESETS[key]);
  };

  const runSimulation = async () => {
    const algoStr = algorithm === "frqi" ? "FRQI_QHED" : algorithm === "qpie" ? "QPIE_QHED" : "NEQR_GRADIENT";

    try {
      const res = await apiFetch("/api/v1/docs/simulate-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm: algoStr,
          patch_8x8: patch,
          inspect_coord: { row: selectedCoord.r, col: selectedCoord.c },
          parameters: {
            shots: shots === 99999 ? null : shots,
            threshold,
            phase_gain: phaseGain,
            bit_depth: bitDepth,
            epsilon_floor: epsilonFloor,
            halo_padding: haloPadding,
            norm_type: normType
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setHorizMap(data.horizontal_combined_map || []);
        setVertMap(data.vertical_combined_map || []);
        setFusedMap(data.fused_confidence_map || []);
        setBinaryMap(data.binary_edge_map || []);
        setTraceData(data.inspected_pair_trace || null);
        return;
      }
    } catch {
      // Fallback local calculations
    }

    // Client-side fallback computation
    computeClientFallback();
  };

  const computeClientFallback = () => {
    const h = Array.from({ length: 8 }, () => Array(8).fill(0));
    const v = Array.from({ length: 8 }, () => Array(8).fill(0));
    const f = Array.from({ length: 8 }, () => Array(8).fill(0));
    const b = Array.from({ length: 8 }, () => Array(8).fill(0));

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const val = patch[r][c];
        const right = patch[r][(c + 1) % 8];
        const down = patch[(r + 1) % 8][c];

        let dh = 0;
        let dv = 0;

        if (algorithm === "frqi") {
          const thA = (val / 255.0) * (Math.PI / 2.0) * phaseGain;
          const thB = (right / 255.0) * (Math.PI / 2.0) * phaseGain;
          const thDown = (down / 255.0) * (Math.PI / 2.0) * phaseGain;
          dh = 2.0 * Math.sin(Math.abs(thA - thB) / 2.0) ** 2;
          dv = 2.0 * Math.sin(Math.abs(thA - thDown) / 2.0) ** 2;
        } else if (algorithm === "qpie") {
          dh = Math.abs(val - right) / 255.0;
          dv = Math.abs(val - down) / 255.0;
        } else {
          const shift = 8 - bitDepth;
          const qVal = (val >> shift) << shift;
          const qR = (right >> shift) << shift;
          const qD = (down >> shift) << shift;
          dh = Math.abs(qVal - qR) / 255.0;
          dv = Math.abs(qVal - qD) / 255.0;
        }

        h[r][c] = Math.min(1.0, dh);
        v[r][c] = Math.min(1.0, dv);
        const fusedVal = Math.min(1.0, Math.sqrt(dh * dh + dv * dv));
        f[r][c] = fusedVal;
        b[r][c] = fusedVal >= threshold ? 1 : 0;
      }
    }

    setHorizMap(h);
    setVertMap(v);
    setFusedMap(f);
    setBinaryMap(b);

    const valA = patch[selectedCoord.r][selectedCoord.c];
    const valB = patch[selectedCoord.r][(selectedCoord.c + 1) % 8];
    const conf = f[selectedCoord.r][selectedCoord.c];

    setTraceData({
      coord_a: [selectedCoord.r, selectedCoord.c],
      coord_b: [selectedCoord.r, (selectedCoord.c + 1) % 8],
      intensity_a: valA,
      intensity_b: valB,
      encoded_a:
        algorithm === "frqi"
          ? `θ_a = ${((valA / 255.0) * (Math.PI / 2.0)).toFixed(4)} rad`
          : algorithm === "qpie"
          ? `α_a = ${(valA / 1120.0).toFixed(5)}`
          : `|${valA.toString(2).padStart(8, "0")}>_c`,
      encoded_b:
        algorithm === "frqi"
          ? `θ_b = ${((valB / 255.0) * (Math.PI / 2.0)).toFixed(4)} rad`
          : algorithm === "qpie"
          ? `α_b = ${(valB / 1120.0).toFixed(5)}`
          : `|${valB.toString(2).padStart(8, "0")}>_c`,
      hadamard_sum_amplitude: 0.84,
      hadamard_diff_amplitude: Math.abs(valA - valB) / 255.0,
      horiz_edge_prob: h[selectedCoord.r][selectedCoord.c],
      vert_edge_prob: v[selectedCoord.r][selectedCoord.c],
      fused_confidence: conf,
      is_edge: conf >= threshold
    });
  };

  const activeColor =
    algorithm === "frqi" ? "#FF00B4" : algorithm === "qpie" ? "#00F0FF" : "#BD93F9";

  return (
    <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColor }} />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("Live 8×8 Patch Data Passing & Parameter Tuning Sandbox")}
            </h3>
          </div>
          <p className="text-xs text-[#9B9B9B]">
            {formatDisplayCopy("Click any pixel on the 8×8 grid and adjust quantum parameters in real time to observe intermediate interference outputs.")}
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#141414] border border-[#313131] text-xs font-mono">
          <button
            onClick={() => handleSelectPreset("crater_rim")}
            className={`px-2.5 py-1 rounded transition-colors ${
              presetKey === "crater_rim" ? "bg-white text-black font-semibold shadow-sm" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Crater Rim")}
          </button>
          <button
            onClick={() => handleSelectPreset("flat_mare")}
            className={`px-2.5 py-1 rounded transition-colors ${
              presetKey === "flat_mare" ? "bg-white text-black font-semibold shadow-sm" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Flat Mare")}
          </button>
          <button
            onClick={() => handleSelectPreset("diagonal_ray")}
            className={`px-2.5 py-1 rounded transition-colors ${
              presetKey === "diagonal_ray" ? "bg-white text-black font-semibold shadow-sm" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Diagonal Ray")}
          </button>
        </div>
      </div>

      {/* Educational Explanatory Banner: The Role & What It Showcases */}
      <div className="p-4 rounded-xl bg-[#141414] border border-[#313131] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge label="Microscopic Qubit Laboratory" variant="cyan" size="xs" />
            <h4 className="text-sm font-semibold text-white">
              {formatDisplayCopy("What is this Sandbox & What does it showcase?")}
            </h4>
          </div>
          <span className="text-xs font-mono text-[#00F0FF]">
            {algorithm === "frqi"
              ? "7 Qubits (6 Pos + 1 Color Dial)"
              : algorithm === "qpie"
              ? "6 Spatial Qubits (Pure Amplitudes)"
              : "14 Qubits (6 Pos + 8 Gray Basis)"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#222] space-y-1.5">
            <span className="text-[#00F0FF] font-mono font-bold block flex items-center gap-1.5">
              <Cpu size={14} />
              1. The Role: Single Patch Microscope
            </span>
            <p className="text-[#9B9B9B]">
              Large 512×512 lunar imagery is partitioned into 8×8 patches. This sandbox is the microscopic laboratory that lets you inspect the exact quantum statevector, data flow, and interference dynamics between any two neighboring pixels (A and B).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#222] space-y-1.5">
            <span className="text-[#30D158] font-mono font-bold block flex items-center gap-1.5">
              <Sparkles size={14} />
              2. The Mechanism: Zero Convolutions
            </span>
            <p className="text-[#9B9B9B]">
              Classical algorithms (Sobel, Canny) compute edges by sliding 3×3 matrix convolution filters over every pixel. In quantum vision, a single Hadamard gate applied to the position qubit causes adjacent pixel amplitudes to interfere simultaneously across all 64 coordinates in O(1) depth.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#222] space-y-1.5">
            <span className="text-[#FFE600] font-mono font-bold block flex items-center gap-1.5">
              <Layers size={14} />
              3. The Showcase: 4 Progressive Maps
            </span>
            <p className="text-[#9B9B9B]">
              Witness the 4 physical stages of quantum image processing: Horizontal Pass (interfering columns), Vertical Pass (interfering rows), 2D Euclidean Fusion, and final Otsu Quantum Binary Decision thresholding.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls + Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): 8x8 Grid & Sliders */}
        <div className="lg:col-span-5 space-y-5">
          {/* Interactive 8x8 Clickable Grid */}
          <div className="p-3.5 bg-[#0A0A0A] border border-[#313131] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#9B9B9B]">
              <span className="font-semibold text-white">{formatDisplayCopy("Input 8×8 Patch (Click to Inspect)")}:</span>
              <span className="text-[#00F0FF] font-bold">
                Pixel A ({selectedCoord.r}, {selectedCoord.c}) = {patch[selectedCoord.r][selectedCoord.c]}
              </span>
            </div>

            {/* Pixel Focus Legend */}
            <div className="flex items-center gap-3 text-[10.5px] font-mono bg-[#141414] px-2.5 py-1.5 rounded border border-[#272727]">
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-[#00F0FF] text-black font-bold text-[8px] flex items-center justify-center">A</span>
                <span className="text-white">Active Pixel</span>
              </div>
              <span className="text-[#555]">vs</span>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-[#FF00B4] text-white font-bold text-[8px] flex items-center justify-center">B</span>
                <span className="text-white">Interfering Neighbor</span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1 aspect-square pt-1">
              {patch.map((row, r) =>
                row.map((val, c) => {
                  const isSelected = selectedCoord.r === r && selectedCoord.c === c;
                  const isNeighbor = selectedCoord.r === r && c === (selectedCoord.c + 1) % 8;
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => setSelectedCoord({ r, c })}
                      style={{ backgroundColor: `rgb(${val}, ${val}, ${val})` }}
                      className={`relative w-full h-full rounded transition-all flex items-center justify-center ${
                        isSelected
                          ? "ring-2 ring-[#00F0FF] z-10 scale-105 shadow-[0_0_8px_#00F0FF]"
                          : isNeighbor
                          ? "ring-1 ring-[#FF00B4] z-5"
                          : "hover:ring-1 hover:ring-white/40"
                      }`}
                    >
                      {isSelected && (
                        <span className="text-[8px] font-mono font-bold text-black bg-[#00F0FF] px-0.5 rounded-sm">
                          A
                        </span>
                      )}
                      {isNeighbor && (
                        <span className="text-[8px] font-mono font-bold text-white bg-[#FF00B4] px-0.5 rounded-sm">
                          B
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="p-4 bg-[#141414] border border-[#313131] rounded-xl space-y-3.5 text-xs font-mono">
            {/* Common: Threshold */}
            <div>
              <div className="flex justify-between text-[#9B9B9B] mb-1">
                <span>{formatDisplayCopy("Decision Threshold (tau)")}:</span>
                <span className="text-white font-bold">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.02"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
            </div>

            {/* FRQI Specific Sliders */}
            {algorithm === "frqi" && (
              <>
                <div>
                  <div className="flex justify-between text-[#9B9B9B] mb-1">
                    <span>{formatDisplayCopy("Quantum Shot Count (S)")}:</span>
                    <span className="text-[#00F0FF] font-bold">
                      {shots >= 99999 ? "Statevector (Infinity)" : `${shots} shots`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="16384"
                    step="512"
                    value={shots}
                    onChange={(e) => setShots(parseInt(e.target.value))}
                    className="w-full accent-[#FF00B4] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[#9B9B9B] mb-1">
                    <span>{formatDisplayCopy("Phase Scaling Gain (alpha)")}:</span>
                    <span className="text-white font-bold">{phaseGain.toFixed(2)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={phaseGain}
                    onChange={(e) => setPhaseGain(parseFloat(e.target.value))}
                    className="w-full accent-[#FF00B4] cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* QPIE Specific Sliders */}
            {algorithm === "qpie" && (
              <div>
                <div className="flex justify-between text-[#9B9B9B] mb-1">
                  <span>{formatDisplayCopy("Shadow Norm Floor (epsilon)")}:</span>
                  <span className="text-[#00F0FF] font-bold">{epsilonFloor.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="300"
                  step="10"
                  value={epsilonFloor}
                  onChange={(e) => setEpsilonFloor(parseFloat(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>
            )}

            {/* NEQR Specific Sliders */}
            {algorithm === "neqr" && (
              <>
                <div>
                  <div className="flex justify-between text-[#9B9B9B] mb-1">
                    <span>{formatDisplayCopy("Grayscale Bit Depth (q)")}:</span>
                    <span className="text-[#BD93F9] font-bold">{bitDepth} Bits ({6 + bitDepth} Qubits)</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="2"
                    value={bitDepth}
                    onChange={(e) => setBitDepth(parseInt(e.target.value))}
                    className="w-full accent-[#BD93F9] cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#9B9B9B]">{formatDisplayCopy("Distance Norm")}:</span>
                  <div className="flex gap-1 text-[11px]">
                    {["L1", "L2", "Linf"].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNormType(n)}
                        className={`px-2 py-0.5 rounded ${
                          normType === n ? "bg-[#BD93F9] text-black font-bold" : "text-[#9B9B9B] bg-[#222]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Halo Seam Padding Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#272727]">
              <span className="text-[#9B9B9B]">{formatDisplayCopy("10×10 Reflective Halo Seam Protection")}:</span>
              <button
                onClick={() => setHaloPadding(!haloPadding)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  haloPadding ? "bg-[#30D158] text-black" : "bg-[#272727] text-[#9B9B9B]"
                }`}
              >
                {haloPadding ? "Enabled (0 Seams)" : "Disabled (Cyclic Seams)"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Step by Step Trace & 4 Previews */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step-by-Step Data Passing Trace */}
          {traceData && (
            <div className="p-4 bg-[#141414] border border-[#313131] rounded-xl space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272727] pb-2 gap-1">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Activity size={14} style={{ color: activeColor }} />
                  {formatDisplayCopy("Microscopic Quantum Interference Trace (Pixel A vs B)")}
                </span>
                <span className="text-[11px] text-[#00F0FF]">
                  Pixel A ({traceData.coord_a[0]},{traceData.coord_a[1]}) vs Neighbor B ({traceData.coord_b[0]},{traceData.coord_b[1]})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                {/* Step 1 */}
                <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#272727] space-y-1">
                  <span className="text-[#9B9B9B] block font-bold">Step 1: Classical Optical Input</span>
                  <div className="text-white font-bold">
                    I_a = {traceData.intensity_a} · I_b = {traceData.intensity_b}
                  </div>
                  <div className="text-[#00F0FF] text-[10px]">
                    Luminance Delta ΔI = {Math.abs(traceData.intensity_a - traceData.intensity_b)} / 255
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#272727] space-y-1">
                  <span className="text-[#9B9B9B] block font-bold">Step 2: Quantum State Encoding</span>
                  <div className="text-[#00F0FF] truncate font-bold">{traceData.encoded_a}</div>
                  <div className="text-[#888] text-[10px] truncate">{traceData.encoded_b}</div>
                </div>

                {/* Step 3 */}
                <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#272727] space-y-1">
                  <span className="text-[#9B9B9B] block font-bold">Step 3: Hadamard Interference</span>
                  <div className="text-[#FFE600] font-bold">
                    Diff Amplitude = {traceData.hadamard_diff_amplitude.toFixed(4)}
                  </div>
                  <div className="text-[#888] text-[10px]">
                    {traceData.hadamard_diff_amplitude > 0.05
                      ? "Constructive interference (Rim step)"
                      : "Destructive cancellation (Flat terrain)"}
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#272727] space-y-1">
                  <span className="text-[#9B9B9B] block font-bold">Step 4: Born Collapse & Decision</span>
                  <div className="text-white font-bold">
                    P_edge = {traceData.fused_confidence.toFixed(4)}
                  </div>
                  <div className={`text-[10px] font-bold ${traceData.is_edge ? "text-[#30D158]" : "text-[#9B9B9B]"}`}>
                    {traceData.is_edge ? "✓ EDGE DETECTED (≥ Threshold)" : "✗ SUPPRESSED (< Threshold)"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Intermediate Representation Previews */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#9B9B9B] px-1">
              <span className="font-semibold text-white">
                {formatDisplayCopy("4 Progressive Quantum Edge Maps (Hilbert Space to Boundary Decision)")}
              </span>
              <span className="text-[10.5px] text-[#00F0FF]">8×8 Matrix</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 1. Horizontal Map */}
              <div className="p-2.5 bg-[#0D0D0D] border border-[#272727] rounded-xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-[#9B9B9B] block font-semibold truncate">
                  {formatDisplayCopy("1. Horiz Px Map")}
                </span>
                <span className="text-[9px] font-mono text-[#777] block -mt-1 truncate">
                  Col Interferometer (q0)
                </span>
                <div className="grid grid-cols-8 gap-0.5 aspect-square bg-black p-1 rounded">
                  {horizMap.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`h-${r}-${c}`}
                        style={{ backgroundColor: `rgb(${Math.floor(val * 255)}, ${Math.floor(val * 255)}, ${Math.floor(val * 255)})` }}
                        className="w-full h-full rounded-[1px]"
                      />
                    ))
                  )}
                </div>
              </div>

              {/* 2. Vertical Map */}
              <div className="p-2.5 bg-[#0D0D0D] border border-[#272727] rounded-xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-[#9B9B9B] block font-semibold truncate">
                  {formatDisplayCopy("2. Vert Py Map")}
                </span>
                <span className="text-[9px] font-mono text-[#777] block -mt-1 truncate">
                  Row Interferometer (q3)
                </span>
                <div className="grid grid-cols-8 gap-0.5 aspect-square bg-black p-1 rounded">
                  {vertMap.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`v-${r}-${c}`}
                        style={{ backgroundColor: `rgb(${Math.floor(val * 255)}, ${Math.floor(val * 255)}, ${Math.floor(val * 255)})` }}
                        className="w-full h-full rounded-[1px]"
                      />
                    ))
                  )}
                </div>
              </div>

              {/* 3. Fused Map */}
              <div className="p-2.5 bg-[#0D0D0D] border border-[#272727] rounded-xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-[#00F0FF] block font-semibold truncate">
                  {formatDisplayCopy("3. Fused 2D Map")}
                </span>
                <span className="text-[9px] font-mono text-[#00F0FF]/70 block -mt-1 truncate">
                  Euclidean √(Px²+Py²)
                </span>
                <div className="grid grid-cols-8 gap-0.5 aspect-square bg-black p-1 rounded">
                  {fusedMap.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`f-${r}-${c}`}
                        style={{ backgroundColor: `rgb(${Math.floor(val * 255)}, ${Math.floor(val * 255)}, ${Math.floor(val * 255)})` }}
                        className="w-full h-full rounded-[1px]"
                      />
                    ))
                  )}
                </div>
              </div>

              {/* 4. Binary Decision Map */}
              <div className="p-2.5 bg-[#0D0D0D] border border-[#272727] rounded-xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-[#30D158] block font-semibold truncate">
                  {formatDisplayCopy("4. Binary Edge")}
                </span>
                <span className="text-[9px] font-mono text-[#30D158]/70 block -mt-1 truncate">
                  Decision at τ = {threshold.toFixed(2)}
                </span>
                <div className="grid grid-cols-8 gap-0.5 aspect-square bg-black p-1 rounded">
                  {binaryMap.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`b-${r}-${c}`}
                        style={{ backgroundColor: val === 1 ? "#30D158" : "#0A0A0A" }}
                        className="w-full h-full rounded-[1px]"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive KaTeX Formula DAG & Physics Dissector synchronized with selected (r, c) */}
      <FormulaFlowBlock
        patch8x8={patch}
        inspectRow={selectedCoord.r}
        inspectCol={selectedCoord.c}
        threshold={threshold}
        shots={shots}
        bitDepth={bitDepth}
        phaseGain={phaseGain}
        activeMethod={algorithm}
        showMethodSwitcher={false}
      />
    </Card>
  );
};

