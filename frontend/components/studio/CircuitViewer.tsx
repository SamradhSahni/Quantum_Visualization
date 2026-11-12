"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Activity,
  Waves,
  Sliders,
  CheckCircle2
} from "lucide-react";

interface CircuitViewerProps {
  algorithm: string;
  activeGateStep: number; // 0 to 5
  pixelVal?: number;
  thetaRad?: number;
  gammaNorm?: number;
  deltaVal?: number;
  edgeProb?: number;
  patchX?: number;
  patchY?: number;
  onSelectGateStep?: (step: number) => void;
}

export const CircuitViewer: React.FC<CircuitViewerProps> = ({
  algorithm = "FRQI-QHED",
  activeGateStep = 0,
  pixelVal = 180,
  thetaRad = 1.109,
  gammaNorm = 1240.5,
  deltaVal = 0.245,
  edgeProb = 0.059,
  patchX = 15,
  patchY = 15,
  onSelectGateStep
}) => {
  const [activeCircuitTab, setActiveCircuitTab] = useState<"both" | "h" | "v">("both");
  const isQpie = algorithm.includes("QPIE");
  const isNeqr = algorithm.includes("NEQR");

  // Determine wire state descriptions based on active step
  const wireState = (wireIdx: number, isVertical: boolean = false) => {
    const regName = isVertical ? `row ${wireIdx % 3}` : `col ${wireIdx % 3}`;
    if (activeGateStep === 0) return `|0> (init)`;
    if (activeGateStep === 1) {
      return wireIdx === 6
        ? `cos(${thetaRad.toFixed(2)})|0> + sin(${thetaRad.toFixed(2)})|1>`
        : `|+> (superpos)`;
    }
    if (activeGateStep === 2) return `|${regName}+1> (D64 shifted)`;
    if (activeGateStep === 3) {
      return wireIdx === 0 ? `(|0>-|1>)/sqrt(2)` : `|${regName}>`;
    }
    if (activeGateStep === 4) {
      return wireIdx === 0 ? (deltaVal > 0.08 ? `|1> (constructive)` : `|0> (canceled)`) : `|${regName}>`;
    }
    // Measurement collapse bit
    return ((wireIdx * 3 + activeGateStep + (deltaVal > 0.08 ? 1 : 0)) % 2).toString();
  };

  const PIPELINE_STAGES = [
    {
      step: 0,
      title: "1. Data Ingest",
      sub: `I(${patchX},${patchY}) = ${pixelVal}`,
      color: "#00F0FF",
      desc: "Pixel brightness loaded into computational basis registers."
    },
    {
      step: 1,
      title: isQpie ? "2. Vector Norm" : isNeqr ? "2. Bitplane Load" : "2. State Angle",
      sub: isQpie ? `||I|| = ${gammaNorm.toFixed(1)}` : isNeqr ? `|${pixelVal.toString(2).padStart(8, "0")}>` : `theta = ${thetaRad.toFixed(3)} rad`,
      color: "#FF00B4",
      desc: "Trigonometric rotation Ry(2*theta) into color qubit amplitude."
    },
    {
      step: 2,
      title: "3. Cyclic Shift D64",
      sub: "i -> (i + 1) mod 64",
      color: "#38BDF8",
      desc: "Permutes column coordinates to bring adjacent pixel into interference."
    },
    {
      step: 3,
      title: "4. Hadamard H",
      sub: "Interference on q0",
      color: "#FFE600",
      desc: "Hadamard gate produces interference between adjacent amplitude phases."
    },
    {
      step: 4,
      title: "5. Phase Cancellation",
      sub: `Delta = ${deltaVal.toFixed(3)} rad`,
      color: deltaVal > 0.08 ? "#30D158" : "#9B9B9B",
      desc: deltaVal > 0.08 ? "Constructive phase interference: Edge detected!" : "Destructive cancellation: Flat crater basin suppressed."
    },
    {
      step: 5,
      title: "6. Born Collapse",
      sub: `P(1) = ${edgeProb.toFixed(4)}`,
      color: "#BD93F9",
      desc: "Measurement in Z-basis yields final quantum edge confidence."
    }
  ];

  return (
    <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-6">
      {/* 1. HEADER & PASS SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div className="flex items-center gap-3">
          <Badge
            label={algorithm}
            variant={isQpie ? "cyan" : isNeqr ? "purple" : "magenta"}
          />
          <h3 className="text-lg font-semibold text-white">
            {formatDisplayCopy("Standalone Dual Quantum Circuits with Real Time Data Passing")}
          </h3>
        </div>

        {/* Tab switch for Circuit A, Circuit B, or Both */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#181818] border border-[#313131] text-xs font-mono">
          <button
            onClick={() => setActiveCircuitTab("both")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCircuitTab === "both" ? "bg-white text-black font-semibold" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Dual Passes (A + B)")}
          </button>
          <button
            onClick={() => setActiveCircuitTab("h")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCircuitTab === "h" ? "bg-[#00F0FF] text-black font-semibold" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Circuit A: Horizontal")}
          </button>
          <button
            onClick={() => setActiveCircuitTab("v")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCircuitTab === "v" ? "bg-[#FF00B4] text-white font-semibold" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Circuit B: Vertical")}
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE CLICKABLE DATA PASSING PIPELINE RIBBON */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-[#9B9B9B] uppercase">
            {formatDisplayCopy("Quantum Data Passing Pipeline (Click any stage to scrub gate):")}
          </span>
          <span className="text-xs font-mono text-[#00F0FF] animate-pulse">
            Active: {PIPELINE_STAGES[activeGateStep].title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PIPELINE_STAGES.map((st) => {
            const isActive = activeGateStep === st.step;
            return (
              <button
                key={st.step}
                onClick={() => onSelectGateStep?.(st.step)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 relative group overflow-hidden ${
                  isActive
                    ? "bg-[#272727] border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-[1.02]"
                    : "bg-[#181818] border-[#313131] hover:border-[#555555]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[11px] font-mono font-semibold"
                    style={{ color: st.color }}
                  >
                    {st.title}
                  </span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                </div>
                <div className="text-xs font-mono text-white font-bold truncate">{st.sub}</div>
                <p className="text-[10px] text-[#9B9B9B] mt-1 leading-snug line-clamp-2">
                  {formatDisplayCopy(st.desc)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DUAL QUANTUM CIRCUITS WITH ANIMATED PHOTON/DATA FLOW */}
      <div className="space-y-6">
        {/* CIRCUIT A: HORIZONTAL PASS */}
        {(activeCircuitTab === "both" || activeCircuitTab === "h") && (
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#313131] relative">
            <div className="flex justify-between items-center text-xs font-mono mb-3">
              <span className="text-white font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                {formatDisplayCopy("Circuit A: Horizontal Pass (q0, q1, q2 Column Register + |c> Color Qubit)")}
              </span>
              <span className="text-[#00F0FF] font-mono">
                {activeGateStep >= 5 ? formatDisplayCopy("Measured to Edge Map") : formatDisplayCopy("Data Passing Active")}
              </span>
            </div>

            <div className="relative overflow-x-auto py-2">
              <svg
                className="w-full min-w-[680px] h-[210px]"
                viewBox="0 0 700 210"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Wires with High Contrast */}
                {[25, 52, 79, 106, 133, 160, 187].map((y, i) => (
                  <g key={i}>
                    {/* Dark backing stroke */}
                    <line x1="160" y1={y} x2="640" y2={y} stroke="#222" strokeWidth="4" />
                    {/* Active Wire */}
                    <line
                      x1="160"
                      y1={y}
                      x2="640"
                      y2={y}
                      stroke={i === 6 ? "#E5A93C" : "#00F0FF"}
                      strokeWidth="2"
                      strokeOpacity={0.8}
                    />

                    {/* Animated Quantum Data Particles moving along the wire */}
                    <circle r="4" fill={i === 6 ? "#FFD700" : "#00F0FF"}>
                      <animateMotion
                        path={`M 160 ${y} L 640 ${y}`}
                        dur={`${2.0 + i * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Dynamic Wire State Label */}
                    <text
                      x="10"
                      y={y + 4}
                      fill={i === 6 ? "#E5A93C" : "#00F0FF"}
                      fontFamily="monospace"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {i === 6 ? `|c> (theta=${thetaRad.toFixed(2)})` : `q${i} (col ${i % 3})`}
                    </text>
                    <text
                      x="92"
                      y={y + 4}
                      fill="#E1E1E1"
                      fontFamily="monospace"
                      fontSize="10"
                    >
                      {wireState(i, false)}
                    </text>
                  </g>
                ))}

                {/* Gate 0: Superposition & State Init */}
                <rect
                  x="180"
                  y="12"
                  width="44"
                  height="186"
                  rx="6"
                  fill="#1E3A8A"
                  stroke={activeGateStep === 0 ? "#60A5FA" : "#3B82F6"}
                  strokeWidth={activeGateStep === 0 ? "3.5" : "1.5"}
                  style={{
                    filter: activeGateStep === 0 ? "drop-shadow(0 0 12px #60A5FA)" : "none"
                  }}
                />
                <text
                  x="202"
                  y="105"
                  fill="#FFFFFF"
                  fontFamily="monospace"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform="rotate(-90 202 105)"
                >
                  FRQI Init
                </text>

                {/* Gate 1: Controlled Ry(2*theta) */}
                <g style={{ filter: activeGateStep === 1 ? "drop-shadow(0 0 14px #FF00B4)" : "none" }}>
                  <line x1="260" y1="25" x2="260" y2="187" stroke="#FF00B4" strokeWidth="2" strokeDasharray="3,3" />
                  <circle cx="260" cy="25" r="4.5" fill="#FF00B4" />
                  <rect
                    x="242"
                    y="172"
                    width="36"
                    height="30"
                    rx="4"
                    fill="#831843"
                    stroke={activeGateStep === 1 ? "#FF00B4" : "#BE185D"}
                    strokeWidth={activeGateStep === 1 ? "3" : "1.5"}
                  />
                  <text x="260" y="191" fill="#FFF" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Ry
                  </text>
                </g>

                {/* Gate 2: Cyclic Decrement D64 */}
                <g style={{ filter: activeGateStep === 2 ? "drop-shadow(0 0 14px #38BDF8)" : "none" }}>
                  <line x1="330" y1="25" x2="330" y2="79" stroke="#38BDF8" strokeWidth="2" />
                  <circle cx="330" cy="25" r="4" fill="#38BDF8" />
                  <circle cx="330" cy="79" r="7" fill="#0D0D0D" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="324" y1="79" x2="336" y2="79" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="330" y1="73" x2="330" y2="85" stroke="#38BDF8" strokeWidth="2" />

                  <line x1="375" y1="25" x2="375" y2="52" stroke="#38BDF8" strokeWidth="2" />
                  <circle cx="375" cy="25" r="4" fill="#38BDF8" />
                  <circle cx="375" cy="52" r="7" fill="#0D0D0D" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="369" y1="52" x2="381" y2="52" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="375" y1="46" x2="375" y2="58" stroke="#38BDF8" strokeWidth="2" />

                  <rect
                    x="420"
                    y="13"
                    width="24"
                    height="24"
                    rx="4"
                    fill="#14532D"
                    stroke={activeGateStep === 2 ? "#4ADE80" : "#22C55E"}
                    strokeWidth={activeGateStep === 2 ? "2.5" : "1.5"}
                  />
                  <text x="432" y="29" fill="#FFF" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="middle">
                    X
                  </text>
                </g>

                {/* Gate 3 & 4: Hadamard Interference & Phase Cancellation */}
                <g style={{ filter: activeGateStep === 3 || activeGateStep === 4 ? "drop-shadow(0 0 16px #FFE600)" : "none" }}>
                  <rect
                    x="480"
                    y="10"
                    width="34"
                    height="30"
                    rx="5"
                    fill="#713F12"
                    stroke={activeGateStep === 3 || activeGateStep === 4 ? "#FFE600" : "#CA8A04"}
                    strokeWidth={activeGateStep === 3 || activeGateStep === 4 ? "3" : "1.5"}
                  />
                  <text x="497" y="30" fill="#FFFFFF" fontFamily="monospace" fontSize="13" fontWeight="bold" textAnchor="middle">
                    H
                  </text>

                  {/* Pulsing wave interference aura */}
                  {(activeGateStep === 3 || activeGateStep === 4) && (
                    <circle cx="497" cy="25" r="18" fill="none" stroke="#FFE600" strokeWidth="2" opacity="0.6">
                      <animate attributeName="r" values="18;30;18" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>

                {/* Gate 5: Measurement Gates */}
                {[25, 52, 79, 106, 133, 160, 187].map((y, i) => (
                  <g key={i} style={{ filter: activeGateStep === 5 ? "drop-shadow(0 0 12px #BD93F9)" : "none" }}>
                    <rect
                      x="570"
                      y={y - 12}
                      width="24"
                      height="24"
                      rx="4"
                      fill="#3B0764"
                      stroke={activeGateStep === 5 ? "#BD93F9" : "#7E22CE"}
                      strokeWidth={activeGateStep === 5 ? "2.5" : "1"}
                    />
                    <text x="582" y={y + 4} fill="#FFF" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">
                      M
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* CIRCUIT B: VERTICAL PASS */}
        {(activeCircuitTab === "both" || activeCircuitTab === "v") && (
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#313131] relative">
            <div className="flex justify-between items-center text-xs font-mono mb-3">
              <span className="text-white font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF00B4]" />
                {formatDisplayCopy("Circuit B: Vertical Pass (q3, q4, q5 Row Register + |c> Color Qubit)")}
              </span>
              <span className="text-[#FF00B4] font-mono">
                {activeGateStep >= 5 ? formatDisplayCopy("Measured to Edge Map") : formatDisplayCopy("Data Passing Active")}
              </span>
            </div>

            <div className="relative overflow-x-auto py-2">
              <svg
                className="w-full min-w-[680px] h-[210px]"
                viewBox="0 0 700 210"
                xmlns="http://www.w3.org/2000/svg"
              >
                {[25, 52, 79, 106, 133, 160, 187].map((y, i) => (
                  <g key={i}>
                    <line x1="160" y1={y} x2="640" y2={y} stroke="#222" strokeWidth="4" />
                    <line
                      x1="160"
                      y1={y}
                      x2="640"
                      y2={y}
                      stroke={i === 6 ? "#E5A93C" : "#FF00B4"}
                      strokeWidth="2"
                      strokeOpacity={0.8}
                    />

                    {/* Animated Quantum Data Particles */}
                    <circle r="4" fill={i === 6 ? "#FFD700" : "#FF00B4"}>
                      <animateMotion
                        path={`M 160 ${y} L 640 ${y}`}
                        dur={`${2.0 + i * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </circle>

                    <text
                      x="10"
                      y={y + 4}
                      fill={i === 6 ? "#E5A93C" : "#FF00B4"}
                      fontFamily="monospace"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {i === 6 ? `|c> (theta=${thetaRad.toFixed(2)})` : `q${i} (row ${i % 3})`}
                    </text>
                    <text
                      x="92"
                      y={y + 4}
                      fill="#E1E1E1"
                      fontFamily="monospace"
                      fontSize="10"
                    >
                      {wireState(i, true)}
                    </text>
                  </g>
                ))}

                {/* State Init */}
                <rect x="180" y="12" width="44" height="186" rx="6" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="202" y="105" fill="#FFF" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(-90 202 105)">
                  FRQI Init
                </text>

                {/* Row CNOT Cascade */}
                <line x1="330" y1="106" x2="330" y2="160" stroke="#FF00B4" strokeWidth="2" />
                <circle cx="330" cy="106" r="4" fill="#FF00B4" />
                <circle cx="330" cy="160" r="7" fill="#0D0D0D" stroke="#FF00B4" strokeWidth="2" />
                <line x1="324" y1="160" x2="336" y2="160" stroke="#FF00B4" strokeWidth="2" />
                <line x1="330" y1="154" x2="330" y2="166" stroke="#FF00B4" strokeWidth="2" />

                <line x1="375" y1="106" x2="375" y2="133" stroke="#FF00B4" strokeWidth="2" />
                <circle cx="375" cy="106" r="4" fill="#FF00B4" />
                <circle cx="375" cy="133" r="7" fill="#0D0D0D" stroke="#FF00B4" strokeWidth="2" />
                <line x1="369" y1="133" x2="381" y2="133" stroke="#FF00B4" strokeWidth="2" />
                <line x1="375" y1="127" x2="375" y2="139" stroke="#FF00B4" strokeWidth="2" />

                <rect x="420" y="94" width="24" height="24" rx="4" fill="#14532D" stroke="#22C55E" strokeWidth="1.5" />
                <text x="432" y="110" fill="#FFF" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="middle">
                  X
                </text>

                {/* Vertical Hadamard Interference on q3 */}
                <rect
                  x="480"
                  y="91"
                  width="34"
                  height="30"
                  rx="5"
                  fill="#581C87"
                  stroke={activeGateStep === 3 || activeGateStep === 4 ? "#C084FC" : "#7E22CE"}
                  strokeWidth={activeGateStep === 3 || activeGateStep === 4 ? "3" : "1.5"}
                  style={{
                    filter: activeGateStep === 3 || activeGateStep === 4 ? "drop-shadow(0 0 16px #C084FC)" : "none"
                  }}
                />
                <text x="497" y="111" fill="#FFFFFF" fontFamily="monospace" fontSize="13" fontWeight="bold" textAnchor="middle">
                  H
                </text>

                {/* Measurement */}
                {[25, 52, 79, 106, 133, 160, 187].map((y, i) => (
                  <g key={i}>
                    <rect x="570" y={y - 12} width="24" height="24" rx="4" fill="#3B0764" stroke="#7E22CE" strokeWidth="1" />
                    <text x="582" y={y + 4} fill="#FFF" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">
                      M
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 4. CONSTRUCTIVE VS DESTRUCTIVE PHASE MONITOR & AMPLITUDE SPECTRUM */}
      <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${deltaVal > 0.08 ? "bg-[#30D158]/10 border-[#30D158]/40 text-[#30D158]" : "bg-[#1F1F1F] border-[#313131] text-[#9B9B9B]"}`}>
            <Zap size={22} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase font-semibold text-white">
              {deltaVal > 0.08 ? formatDisplayCopy("Constructive Phase Interference Active") : formatDisplayCopy("Destructive Phase Cancellation Active")}
            </div>
            <div className="text-xs text-[#9B9B9B] mt-0.5">
              {deltaVal > 0.08
                ? formatDisplayCopy(`Crater rim detected! Delta theta = ${deltaVal.toFixed(3)} rad > threshold. Born probability P(1) = ${edgeProb.toFixed(4)}.`)
                : formatDisplayCopy(`Uniform smooth basin. Identical angle phases cancel destructively under Hadamard interference (P(1) ~ 0).`)}
            </div>
          </div>
        </div>

        {/* Amplitude bars */}
        <div className="flex items-center gap-1 self-stretch md:self-auto justify-end">
          <span className="text-[10px] font-mono text-[#9B9B9B] mr-2 uppercase">Amplitudes α:</span>
          {[-0.35, 0.45, -0.2, 0.7, -0.5, 0.25, -0.1, 0.6, 0.4, -0.3].map((val, idx) => (
            <div
              key={idx}
              title={`State |${idx}>: alpha = ${val}`}
              className="w-2 rounded-sm transition-all duration-300"
              style={{
                height: `${Math.abs(val) * 32 + 6}px`,
                backgroundColor: val > 0 ? "#00F0FF" : "#FF9F0A"
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
