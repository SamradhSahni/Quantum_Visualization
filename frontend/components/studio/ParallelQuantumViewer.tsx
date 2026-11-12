"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { FRQICircuitSVG } from "./circuits/FRQICircuitSVG";
import { QPIECircuitSVG } from "./circuits/QPIECircuitSVG";
import { NEQRCircuitSVG } from "./circuits/NEQRCircuitSVG";
import { Zap, Columns3, Rows3 } from "lucide-react";

interface ParallelQuantumViewerProps {
  activeGateStep: number;
  pixelVal: number;
  thetaRad: number;
  gammaNorm: number;
  deltaVal: number;
  edgeProb: number;
  patchX: number;
  patchY: number;
  onSelectGateStep: (step: number) => void;
}

export const ParallelQuantumViewer: React.FC<ParallelQuantumViewerProps> = ({
  activeGateStep = 0,
  pixelVal = 180,
  thetaRad = 1.109,
  gammaNorm = 1240.5,
  deltaVal = 0.245,
  edgeProb = 0.059,
  patchX = 15,
  patchY = 15,
  onSelectGateStep,
}) => {
  const [viewMode, setViewMode] = useState<"parallel" | "frqi" | "qpie" | "neqr">("parallel");
  const [passMode, setPassMode] = useState<"both" | "horizontal" | "vertical">("both");
  const [parallelLayout, setParallelLayout] = useState<"grid" | "stack">("grid");

  const binaryStr = (Math.round(pixelVal) & 255).toString(2).padStart(8, "0");
  const deltaInt = Math.round(deltaVal * (255 / (Math.PI / 2)));

  const PIPELINE_STAGES = [
    {
      step: 0,
      title: "1. State Init",
      sub: `Pixel I: ${Math.round(pixelVal)} / 255`,
      detail: `FRQI 7Q · QPIE 6Q · NEQR 14/24Q`,
      color: "#00F0FF",
    },
    {
      step: 1,
      title: "2. Encoding",
      sub: `θ: ${thetaRad.toFixed(2)} | γ: ${gammaNorm.toFixed(0)}`,
      detail: `NEQR Basis: |${binaryStr}⟩`,
      color: "#FF79C6",
    },
    {
      step: 2,
      title: "3. Spatial Shift",
      sub: `D64 & Dual Operands`,
      detail: `FRQI/QPIE D64 · NEQR |A⟩,|B⟩`,
      color: "#38BDF8",
    },
    {
      step: 3,
      title: "4. Core Operator",
      sub: `Hadamard & QFS ALU`,
      detail: `H(q0/q3) vs Ripple Subtractor`,
      color: "#FFE600",
    },
    {
      step: 4,
      title: "5. Difference",
      sub: `Δθ: ${deltaVal.toFixed(3)} rad`,
      detail: `NEQR |ΔI|: ${deltaInt} Gray Levels`,
      color: deltaVal > 0.08 ? "#39D353" : "#9B9B9B",
    },
    {
      step: 5,
      title: "6. Readout",
      sub: `P_edge: ${edgeProb.toFixed(4)}`,
      detail: `Born Prob vs Exact Z Basis`,
      color: "#BD93F9",
    },
  ];

  const isCompactGrid = viewMode === "parallel" && parallelLayout === "grid";

  return (
    <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-6">
      {/* 1. Header & Circuit Mode Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <h3 className="text-lg font-semibold text-white">
              {formatDisplayCopy("Three Distinct Quantum Circuits (Simulating Simultaneously)")}
            </h3>
          </div>
          <p className="text-xs text-[#9B9B9B]">
            {formatDisplayCopy(
              "Inspect FRQI (7 qubits), QPIE (6 qubits), and NEQR (14 storage / 24 QFS qubits) simultaneously across Horizontal and Vertical passes."
            )}
          </p>
        </div>

        {/* View Mode, Parallel Layout & Pass Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "parallel" && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141414] border border-[#313131] text-xs font-mono">
              <button
                onClick={() => setParallelLayout("grid")}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                  parallelLayout === "grid"
                    ? "bg-[#39D353] text-black font-semibold"
                    : "text-[#9B9B9B] hover:text-white"
                }`}
              >
                <Columns3 size={13} />
                {formatDisplayCopy("Side by Side (All 3)")}
              </button>
              <button
                onClick={() => setParallelLayout("stack")}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                  parallelLayout === "stack"
                    ? "bg-[#39D353] text-black font-semibold"
                    : "text-[#9B9B9B] hover:text-white"
                }`}
              >
                <Rows3 size={13} />
                {formatDisplayCopy("Stacked Expanded")}
              </button>
            </div>
          )}

          {/* Pass Mode Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141414] border border-[#313131] text-xs font-mono">
            <button
              onClick={() => setPassMode("both")}
              className={`px-2.5 py-1 rounded transition-colors ${
                passMode === "both"
                  ? "bg-white text-black font-semibold"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("Both Passes (A+B)")}
            </button>
            <button
              onClick={() => setPassMode("horizontal")}
              className={`px-2.5 py-1 rounded transition-colors ${
                passMode === "horizontal"
                  ? "bg-[#00F0FF] text-black font-semibold"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("Circuit A (Horiz)")}
            </button>
            <button
              onClick={() => setPassMode("vertical")}
              className={`px-2.5 py-1 rounded transition-colors ${
                passMode === "vertical"
                  ? "bg-[#FF79C6] text-black font-semibold"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("Circuit B (Vert)")}
            </button>
          </div>

          {/* Algorithm Focus Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#181818] border border-[#313131] text-xs font-mono">
            <button
              onClick={() => setViewMode("parallel")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "parallel"
                  ? "bg-[#272727] text-white font-semibold"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("All 3 In Parallel")}
            </button>
            <button
              onClick={() => setViewMode("frqi")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "frqi"
                  ? "bg-[#FF79C6] text-black font-semibold"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("FRQI")}
            </button>
            <button
              onClick={() => setViewMode("qpie")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "qpie"
                  ? "bg-[#00F0FF] text-black font-semibold"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("QPIE")}
            </button>
            <button
              onClick={() => setViewMode("neqr")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "neqr"
                  ? "bg-[#BD93F9] text-black font-semibold"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("NEQR")}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Clickable Scrubbing Ribbon */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-[#9B9B9B] mb-2">
          <span>{formatDisplayCopy("Quantum Gate Execution Phase (Click any to scrub):")}</span>
          <span className="text-[#00F0FF]">
            Active: {PIPELINE_STAGES[activeGateStep].title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((s) => {
            const isSelected = activeGateStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => onSelectGateStep(s.step)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "bg-[#272727] border-white"
                    : "bg-[#181818] border-[#313131] hover:border-[#555]"
                }`}
              >
                <div className="text-[11px] font-mono font-semibold" style={{ color: s.color }}>
                  {formatDisplayCopy(s.title)}
                </div>
                <div className="text-xs font-mono text-white mt-0.5 font-bold truncate">
                  {s.sub}
                </div>
                <div className="text-[10px] font-mono text-[#9B9B9B] mt-0.5 truncate">
                  {formatDisplayCopy(s.detail)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Synchronized 3-Circuit Live Summary Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === "frqi" ? "parallel" : "frqi")}
          className={`p-3 rounded-xl border text-left transition-colors ${
            viewMode === "frqi"
              ? "bg-[#272727] border-[#FF79C6]"
              : "bg-[#181818] border-[#313131] hover:border-[#FF79C6]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#FF79C6] font-bold">1. FRQI QHED (7 Qubits)</span>
            <span className="text-[#9B9B9B] text-[10px]">6 Pos + 1 Color |c⟩</span>
          </div>
          <div className="text-white mt-1">
            θ: {thetaRad.toFixed(3)} rad · P_circuit: {(edgeProb / 64).toFixed(5)} · P_edge: {edgeProb.toFixed(4)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "qpie" ? "parallel" : "qpie")}
          className={`p-3 rounded-xl border text-left transition-colors ${
            viewMode === "qpie"
              ? "bg-[#272727] border-[#00F0FF]"
              : "bg-[#181818] border-[#313131] hover:border-[#00F0FF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#00F0FF] font-bold">2. QPIE QHED (6 Qubits)</span>
            <span className="text-[#9B9B9B] text-[10px]">Amplitude Vector |ψ⟩</span>
          </div>
          <div className="text-white mt-1">
            Norm γ_p: {gammaNorm.toFixed(1)} · α: {(pixelVal / Math.max(1, gammaNorm)).toFixed(4)} · Gradient: {(deltaInt / 255).toFixed(3)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "neqr" ? "parallel" : "neqr")}
          className={`p-3 rounded-xl border text-left transition-colors ${
            viewMode === "neqr"
              ? "bg-[#272727] border-[#BD93F9]"
              : "bg-[#181818] border-[#313131] hover:border-[#BD93F9]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#BD93F9] font-bold">3. NEQR Gradient (14 / 24 Q)</span>
            <span className="text-[#9B9B9B] text-[10px]">8 Bit Basis + QFS ALU</span>
          </div>
          <div className="text-white mt-1">
            Basis: |{binaryStr}⟩ · Reversible |ΔI|: {deltaInt} levels
          </div>
        </button>
      </div>

      {/* 4. The Circuits Display — 3-Column Simultaneous Grid or Focused Full Width */}
      <div
        className={
          isCompactGrid
            ? "grid grid-cols-1 xl:grid-cols-3 gap-4 items-start"
            : "space-y-6"
        }
      >
        {(viewMode === "parallel" || viewMode === "frqi") && (
          <div className={isCompactGrid ? "p-3 rounded-xl bg-[#181818] border border-[#313131]" : ""}>
            <FRQICircuitSVG
              activeGateStep={activeGateStep}
              thetaRad={thetaRad}
              deltaVal={deltaVal}
              pixelVal={pixelVal}
              passMode={passMode}
              compact={isCompactGrid}
            />
          </div>
        )}

        {(viewMode === "parallel" || viewMode === "qpie") && (
          <div className={isCompactGrid ? "p-3 rounded-xl bg-[#181818] border border-[#313131]" : ""}>
            <QPIECircuitSVG
              activeGateStep={activeGateStep}
              gammaNorm={gammaNorm}
              pixelVal={pixelVal}
              edgeProb={edgeProb}
              passMode={passMode}
              compact={isCompactGrid}
            />
          </div>
        )}

        {(viewMode === "parallel" || viewMode === "neqr") && (
          <div className={isCompactGrid ? "p-3 rounded-xl bg-[#181818] border border-[#313131]" : ""}>
            <NEQRCircuitSVG
              activeGateStep={activeGateStep}
              pixelVal={pixelVal}
              deltaVal={deltaVal}
              passMode={passMode}
              compact={isCompactGrid}
            />
          </div>
        )}
      </div>

      {/* 5. Real-time Constructive vs Destructive Interference Monitor */}
      <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border ${
              deltaVal > 0.08
                ? "bg-[#39D353]/10 border-[#39D353]/40 text-[#39D353]"
                : "bg-[#1F1F1F] border-[#313131] text-[#9B9B9B]"
            }`}
          >
            <Zap size={18} />
          </div>
          <div>
            <span className="text-white font-semibold block">
              {deltaVal > 0.08
                ? formatDisplayCopy("Constructive Phase Interference (Edge Detected)")
                : formatDisplayCopy("Destructive Phase Cancellation (Basin Suppressed)")}
            </span>
            <span className="text-[#9B9B9B] text-[11px]">
              {deltaVal > 0.08
                ? `High local phase gradient Δθ: ${deltaVal.toFixed(3)} rad · Rescaled P_edge: ${edgeProb.toFixed(4)} · NEQR |ΔI|: ${deltaInt}`
                : "Smooth crater basin with near zero phase divergence. Amplitudes cancel cleanly under Hadamard interference."}
            </span>
          </div>
        </div>

        <span className="text-[11px] px-3 py-1 rounded bg-[#272727] text-white border border-[#313131]">
          Tile ({patchX}, {patchY}) · Pixel {Math.round(pixelVal)}/255
        </span>
      </div>
    </Card>
  );
};
