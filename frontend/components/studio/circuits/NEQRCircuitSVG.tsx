"use client";

import React, { useState, useEffect } from "react";
import { formatDisplayCopy } from "@/lib/copyFormatter";

interface NEQRCircuitSVGProps {
  activeGateStep: number;
  pixelVal: number;
  deltaVal: number;
  passMode?: "both" | "horizontal" | "vertical";
  compact?: boolean;
}

export const NEQRCircuitSVG: React.FC<NEQRCircuitSVGProps> = ({
  activeGateStep = 0,
  pixelVal = 180,
  deltaVal = 0.245,
  passMode = "both",
  compact = false
}) => {
  const [internalPass, setInternalPass] = useState<"both" | "horizontal" | "vertical">(passMode);

  useEffect(() => {
    setInternalPass(passMode);
  }, [passMode]);
  const binaryString = (Math.round(pixelVal) & 255).toString(2).padStart(8, "0");
  const posLabels = ["y2", "y1", "y0", "x2", "x1", "x0"];
  const bitLabels = ["c7 (MSB)", "c6", "c5", "c4", "c3", "c2", "c1", "c0 (LSB)"];

  const allLabels = [
    ...posLabels.map((l) => `|${l}> (pos)`),
    ...bitLabels.map((l) => `|${l}>`)
  ];

  const wireY = Array.from({ length: 14 }, (_, i) => 18 + i * 14.5);

  const wireState = (idx: number, isVertical: boolean) => {
    if (idx < 6) {
      if (activeGateStep === 0) return "|0>";
      if (activeGateStep === 1) return "|+>";
      return `|pos_${idx}>`;
    }
    const bitIdx = idx - 6;
    const bitVal = binaryString[bitIdx];
    if (activeGateStep === 0) return "|0>";
    if (activeGateStep === 1) return `|${bitVal}>`;
    if (activeGateStep === 2) return isVertical ? `|Δy_${bitIdx}>` : `|Δx_${bitIdx}>`;
    if (activeGateStep === 3) return isVertical ? `|ALU_y_${bitIdx}>` : `|ALU_x_${bitIdx}>`;
    if (activeGateStep === 4) return `|grad_${bitIdx}>`;
    return bitVal;
  };

  const renderSinglePassSVG = (isVertical: boolean) => {
    return (
      <div className="p-3 bg-[#0D0D0D] border border-[#313131] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#BD93F9] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#BD93F9] animate-pulse" />
            {isVertical
              ? formatDisplayCopy("Circuit B: Vertical Pass (Y-Direction Reversible Arithmetic Subtractor)")
              : formatDisplayCopy("Circuit A: Horizontal Pass (X-Direction Reversible Arithmetic Subtractor)")}
          </span>
          <span className="text-white text-[11px]">
            {isVertical ? "Row Difference |ΔI_y|" : "Col Difference |ΔI_x|"}: {(deltaVal * 255).toFixed(1)} (Exact Bitplane)
          </span>
        </div>

        <div className={compact ? "py-1" : "overflow-x-auto py-1"}>
          <svg
            className={
              compact
                ? "w-full h-auto bg-[#050505] border border-[#222] rounded-lg p-1"
                : "w-full min-w-[650px] h-[235px] bg-[#050505] border border-[#222] rounded-lg p-1"
            }
            viewBox="0 0 680 235"
            xmlns="http://www.w3.org/2000/svg"
          >
            {wireY.map((y, i) => {
              const isPos = i < 6;
              const strokeColor = isPos ? "#00F0FF" : "#BD93F9";
              return (
                <g key={i}>
                  <line x1="145" y1={y} x2="630" y2={y} stroke="#1A1A1A" strokeWidth="3" />
                  <line
                    x1="145"
                    y1={y}
                    x2="630"
                    y2={y}
                    stroke={strokeColor}
                    strokeWidth="1.2"
                    strokeOpacity={isPos ? 0.7 : 0.9}
                  />

                  {/* Animated Quanta */}
                  <circle r="2.8" fill={strokeColor}>
                    <animateMotion
                      path={`M 145 ${y} L 630 ${y}`}
                      dur={`${1.6 + (i % 6) * 0.25}s`}
                      repeatCount="indefinite"
                    />
                  </circle>

                  <text x="6" y={y + 3} fill={strokeColor} fontFamily="monospace" fontSize="8.5" fontWeight="bold">
                    {allLabels[i]}
                  </text>
                  <text x="96" y={y + 3} fill="#A1A1A1" fontFamily="monospace" fontSize="8">
                    {wireState(i, isVertical)}
                  </text>
                </g>
              );
            })}

            {/* Separator between position and color bitplanes */}
            <line x1="145" y1="102" x2="630" y2="102" stroke="#444" strokeWidth="1" strokeDasharray="4,4" />

            {/* Gate 0: Position H^(x6) */}
            <g style={{ filter: activeGateStep === 0 ? "drop-shadow(0 0 12px #00F0FF)" : "none" }}>
              <rect
                x="170"
                y="10"
                width="34"
                height="85"
                rx="4"
                fill="#0E3A4A"
                stroke={activeGateStep === 0 ? "#00F0FF" : "#0891B2"}
                strokeWidth={activeGateStep === 0 ? "2.5" : "1"}
              />
              <text x="187" y="52" fill="#FFF" fontFamily="monospace" fontSize="8.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 187 52)">
                Pos H^(x6)
              </text>
            </g>

            {/* Gate 1: Multi-Controlled Pauli-X Bitplane Encoding */}
            <g style={{ filter: activeGateStep === 1 ? "drop-shadow(0 0 14px #BD93F9)" : "none" }}>
              <line x1="235" y1="18" x2="235" y2="215" stroke="#BD93F9" strokeWidth="1.5" strokeDasharray="2,2" />
              <circle cx="235" cy={isVertical ? 25 : 40} r="3" fill="#BD93F9" />
              <circle cx="235" cy={isVertical ? 55 : 70} r="3" fill="#BD93F9" />
              <rect
                x="218"
                y="108"
                width="34"
                height="115"
                rx="4"
                fill="#3B0764"
                stroke={activeGateStep === 1 ? "#BD93F9" : "#6B21A8"}
                strokeWidth={activeGateStep === 1 ? "2.5" : "1"}
              />
              <text x="235" y="165" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 235 165)">
                MC X |{binaryString}&gt;
              </text>
            </g>

            {/* Gate 2: Quantum Full Subtractor (Borrow Propagation) */}
            <g style={{ filter: activeGateStep === 2 ? "drop-shadow(0 0 14px #38BDF8)" : "none" }}>
              <rect
                x="290"
                y="108"
                width="42"
                height="115"
                rx="4"
                fill="#1E3A8A"
                stroke={activeGateStep === 2 ? "#38BDF8" : "#2563EB"}
                strokeWidth={activeGateStep === 2 ? "2.5" : "1"}
              />
              <text x="311" y="165" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 311 165)">
                {isVertical ? "Y Borrow Sub" : "X Borrow Sub"}
              </text>
            </g>

            {/* Gate 3: Quantum ALU Arithmetic Difference */}
            <g style={{ filter: activeGateStep === 3 ? "drop-shadow(0 0 14px #FFE600)" : "none" }}>
              <rect
                x="365"
                y="108"
                width="44"
                height="115"
                rx="4"
                fill="#713F12"
                stroke={activeGateStep === 3 ? "#FFE600" : "#CA8A04"}
                strokeWidth={activeGateStep === 3 ? "2.5" : "1"}
              />
              <text x="387" y="165" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 387 165)">
                {isVertical ? "ALU |ΔI_y|" : "ALU |ΔI_x|"}
              </text>
            </g>

            {/* Gate 4: Threshold Sign Comparator */}
            <g style={{ filter: activeGateStep === 4 ? "drop-shadow(0 0 14px #30D158)" : "none" }}>
              <rect
                x="445"
                y="108"
                width="38"
                height="115"
                rx="4"
                fill="#064E3B"
                stroke={activeGateStep === 4 ? "#34D399" : "#059669"}
                strokeWidth={activeGateStep === 4 ? "2.5" : "1"}
              />
              <text x="464" y="165" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 464 165)">
                Sign Comp τ
              </text>
            </g>

            {/* Gate 5: Measurement M on all 14 wires */}
            {wireY.map((y, i) => (
              <g key={i} style={{ filter: activeGateStep === 5 ? "drop-shadow(0 0 8px #BD93F9)" : "none" }}>
                <rect
                  x="520"
                  y={y - 6}
                  width="18"
                  height="12"
                  rx="2"
                  fill="#262626"
                  stroke={activeGateStep === 5 ? "#BD93F9" : "#555"}
                  strokeWidth={activeGateStep === 5 ? "2" : "1"}
                />
                <text x="529" y={y + 3} fill="#FFF" fontFamily="monospace" fontSize="7.5" fontWeight="bold" textAnchor="middle">
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
        <span className="text-xs sm:text-sm font-semibold text-[#BD93F9] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#BD93F9] animate-pulse" />
          {formatDisplayCopy("NEQR QFS: 14 Store / 24 Active ALU Wires")}
        </span>

        {!compact && (
          <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-lg border border-[#313131] text-[11px] font-mono">
            <button
              onClick={() => setInternalPass("both")}
              className={`px-2.5 py-1 rounded ${internalPass === "both" ? "bg-[#BD93F9] text-black font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
            >
              {formatDisplayCopy("Dual Passes (A + B)")}
            </button>
            <button
              onClick={() => setInternalPass("horizontal")}
              className={`px-2.5 py-1 rounded ${internalPass === "horizontal" ? "bg-[#BD93F9] text-black font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
            >
              {formatDisplayCopy("Circuit A (Horizontal)")}
            </button>
            <button
              onClick={() => setInternalPass("vertical")}
              className={`px-2.5 py-1 rounded ${internalPass === "vertical" ? "bg-[#BD93F9] text-black font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
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
