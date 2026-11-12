"use client";

import React, { useState, useEffect } from "react";
import { formatDisplayCopy } from "@/lib/copyFormatter";

interface QPIECircuitSVGProps {
  activeGateStep: number;
  gammaNorm: number;
  pixelVal: number;
  edgeProb: number;
  passMode?: "both" | "horizontal" | "vertical";
  compact?: boolean;
}

export const QPIECircuitSVG: React.FC<QPIECircuitSVGProps> = ({
  activeGateStep = 0,
  gammaNorm = 1240.5,
  pixelVal = 180,
  edgeProb = 0.059,
  passMode = "both",
  compact = false
}) => {
  const [internalPass, setInternalPass] = useState<"both" | "horizontal" | "vertical">(passMode);

  useEffect(() => {
    setInternalPass(passMode);
  }, [passMode]);
  const wireY = [26, 54, 82, 110, 138, 166];

  const wireState = (idx: number, isVertical: boolean) => {
    if (activeGateStep === 0) return "|0>";
    if (activeGateStep === 1) return `c_${idx} = ${(pixelVal / (gammaNorm + 1e-6)).toFixed(3)}`;
    if (activeGateStep === 2) return `|i+1>`;
    const targetIdx = isVertical ? 3 : 0;
    if (activeGateStep === 3) return idx === targetIdx ? "(c_i-c_{i+1})/√2" : `|q${idx}>`;
    if (activeGateStep === 4) return idx === targetIdx ? `scaled * γ_p` : `|q${idx}>`;
    return ((idx * 2 + activeGateStep) % 2).toString();
  };

  const renderSinglePassSVG = (isVertical: boolean) => {
    const wireLabels = isVertical
      ? ["q0 (spatial 0)", "q1 (spatial 1)", "q2 (spatial 2)", "q3 (row 0: Target H)", "q4 (row 1)", "q5 (row 2)"]
      : ["q0 (col 0: Target H)", "q1 (col 1)", "q2 (col 2)", "q3 (spatial 3)", "q4 (spatial 4)", "q5 (spatial 5)"];

    return (
      <div className="p-3 bg-[#0D0D0D] border border-[#313131] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#00F0FF] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            {isVertical
              ? formatDisplayCopy("Circuit B: Vertical Pass (Transposed Row Superposition + Hadamard on q3)")
              : formatDisplayCopy("Circuit A: Horizontal Pass (Column Amplitude Superposition + Hadamard on q0)")}
          </span>
          <span className="text-white text-[11px]">
            γ_p = {gammaNorm.toFixed(1)} · P_Born = {edgeProb.toFixed(4)}
          </span>
        </div>

        <div className={compact ? "py-1" : "overflow-x-auto py-1"}>
          <svg
            className={
              compact
                ? "w-full h-auto bg-[#050505] border border-[#222] rounded-lg p-1"
                : "w-full min-w-[650px] h-[195px] bg-[#050505] border border-[#222] rounded-lg p-1"
            }
            viewBox="0 0 680 195"
            xmlns="http://www.w3.org/2000/svg"
          >
            {wireY.map((y, i) => (
              <g key={i}>
                <line x1="150" y1={y} x2="630" y2={y} stroke="#1A1A1A" strokeWidth="4" />
                <line
                  x1="150"
                  y1={y}
                  x2="630"
                  y2={y}
                  stroke="#00F0FF"
                  strokeWidth="1.5"
                  strokeOpacity={0.8}
                />

                {/* Animated Cyan Quanta */}
                <circle r="3.5" fill="#00F0FF">
                  <animateMotion
                    path={`M 150 ${y} L 630 ${y}`}
                    dur={`${1.6 + i * 0.25}s`}
                    repeatCount="indefinite"
                  />
                </circle>

                <text x="8" y={y + 3.5} fill="#00F0FF" fontFamily="monospace" fontSize="9.5" fontWeight="bold">
                  {wireLabels[i]}
                </text>
                <text x="110" y={y + 3.5} fill="#A1A1A1" fontFamily="monospace" fontSize="8.5">
                  {wireState(i, isVertical)}
                </text>
              </g>
            ))}

            {/* Gate 0: Isometric State Vector Prep */}
            <g style={{ filter: activeGateStep === 0 ? "drop-shadow(0 0 12px #00F0FF)" : "none" }}>
              <rect
                x="170"
                y="14"
                width="42"
                height="164"
                rx="5"
                fill="#0E3A4A"
                stroke={activeGateStep === 0 ? "#00F0FF" : "#0891B2"}
                strokeWidth={activeGateStep === 0 ? "3" : "1.5"}
              />
              <text x="191" y="96" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90 191 96)">
                U_iso (64 Amps)
              </text>
            </g>

            {/* Gate 1: L2-Norm Scaler Gate */}
            <g style={{ filter: activeGateStep === 1 ? "drop-shadow(0 0 14px #38BDF8)" : "none" }}>
              <rect
                x="245"
                y="14"
                width="34"
                height="164"
                rx="5"
                fill="#0369A1"
                stroke={activeGateStep === 1 ? "#38BDF8" : "#0284C7"}
                strokeWidth={activeGateStep === 1 ? "3" : "1.5"}
              />
              <text x="262" y="96" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90 262 96)">
                L2 γ_p Scaler
              </text>
            </g>

            {/* Gate 2: Cyclic Decrement D64 */}
            <g style={{ filter: activeGateStep === 2 ? "drop-shadow(0 0 14px #38BDF8)" : "none" }}>
              <rect
                x="315"
                y="14"
                width="42"
                height="164"
                rx="5"
                fill="#164E63"
                stroke={activeGateStep === 2 ? "#22D3EE" : "#0891B2"}
                strokeWidth={activeGateStep === 2 ? "3" : "1.5"}
              />
              <text x="336" y="96" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90 336 96)">
                {isVertical ? "D64 Stride 8 Shift" : "D64 Column Shift"}
              </text>
            </g>

            {/* Gate 3: Hadamard on q0 (H) or on q3 (V) */}
            <g style={{ filter: activeGateStep === 3 ? "drop-shadow(0 0 16px #FFE600)" : "none" }}>
              <rect
                x="395"
                y={isVertical ? 96 : 14}
                width="32"
                height="28"
                rx="4"
                fill="#713F12"
                stroke={activeGateStep === 3 ? "#FFE600" : "#CA8A04"}
                strokeWidth={activeGateStep === 3 ? "3" : "1.5"}
              />
              <text x="411" y={isVertical ? 114 : 32} fill="#FFF" fontFamily="monospace" fontSize="12" fontWeight="bold" textAnchor="middle">
                H
              </text>
            </g>

            {/* Gate 4: Radiometric Normalization Multiplication */}
            <g style={{ filter: activeGateStep === 4 ? "drop-shadow(0 0 14px #30D158)" : "none" }}>
              <rect
                x="465"
                y="14"
                width="34"
                height="164"
                rx="5"
                fill="#064E3B"
                stroke={activeGateStep === 4 ? "#34D399" : "#059669"}
                strokeWidth={activeGateStep === 4 ? "3" : "1.5"}
              />
              <text x="482" y="96" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90 482 96)">
                * (√2 γ_p / 255)
              </text>
            </g>

            {/* Gate 5: Measurement */}
            {wireY.map((y, i) => (
              <g key={i} style={{ filter: activeGateStep === 5 ? "drop-shadow(0 0 10px #BD93F9)" : "none" }}>
                <rect
                  x="540"
                  y={y - 11}
                  width="22"
                  height="22"
                  rx="3"
                  fill="#3B0764"
                  stroke={activeGateStep === 5 ? "#BD93F9" : "#7E22CE"}
                  strokeWidth={activeGateStep === 5 ? "2" : "1"}
                />
                <text x="551" y={y + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                  M
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-xs sm:text-sm font-semibold text-[#00F0FF] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
          {formatDisplayCopy("QPIE QHED: 6 Wires (Pure Amplitude Register)")}
        </span>

        {!compact && (
          <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-lg border border-[#313131] text-[11px] font-mono">
            <button
              onClick={() => setInternalPass("both")}
              className={`px-2.5 py-1 rounded ${internalPass === "both" ? "bg-[#00F0FF] text-black font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
            >
              {formatDisplayCopy("Dual Passes (A + B)")}
            </button>
            <button
              onClick={() => setInternalPass("horizontal")}
              className={`px-2.5 py-1 rounded ${internalPass === "horizontal" ? "bg-[#00F0FF] text-black font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
            >
              {formatDisplayCopy("Circuit A (Horizontal)")}
            </button>
            <button
              onClick={() => setInternalPass("vertical")}
              className={`px-2.5 py-1 rounded ${internalPass === "vertical" ? "bg-[#00F0FF] text-black font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
            >
              {formatDisplayCopy("Circuit B (Vertical)")}
            </button>
          </div>
        )}
      </div>

      {(internalPass === "both" || internalPass === "horizontal") && renderSinglePassSVG(false)}
      {(internalPass === "both" || internalPass === "vertical") && renderSinglePassSVG(true)}
    </div>
  );
};
