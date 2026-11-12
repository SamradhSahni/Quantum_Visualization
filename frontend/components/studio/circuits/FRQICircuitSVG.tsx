"use client";

import React, { useState, useEffect } from "react";
import { formatDisplayCopy } from "@/lib/copyFormatter";

interface FRQICircuitSVGProps {
  activeGateStep: number;
  thetaRad: number;
  deltaVal: number;
  pixelVal: number;
  passMode?: "both" | "horizontal" | "vertical";
  compact?: boolean;
}

export const FRQICircuitSVG: React.FC<FRQICircuitSVGProps> = ({
  activeGateStep = 0,
  thetaRad = 1.109,
  deltaVal = 0.245,
  pixelVal = 180,
  passMode = "both",
  compact = false
}) => {
  const [internalPass, setInternalPass] = useState<"both" | "horizontal" | "vertical">(passMode);

  useEffect(() => {
    setInternalPass(passMode);
  }, [passMode]);

  const wireState = (idx: number, isVertical: boolean) => {
    if (activeGateStep === 0) return "|0>";
    if (activeGateStep === 1) {
      return idx === 6
        ? `cos(${thetaRad.toFixed(2)})|0> + sin(${thetaRad.toFixed(2)})|1>`
        : "|+>";
    }
    const reg = isVertical ? `row ${idx % 3}` : `col ${idx % 3}`;
    if (activeGateStep === 2) return `|${reg}+1>`;
    const targetIdx = isVertical ? 3 : 0;
    if (activeGateStep === 3) return idx === targetIdx ? "(|0>-|1>)/sqrt(2)" : `|${reg}>`;
    if (activeGateStep === 4) return idx === targetIdx ? (deltaVal > 0.08 ? "|1>" : "|0>") : `|${reg}>`;
    return ((idx * 3 + activeGateStep + (deltaVal > 0.08 ? 1 : 0)) % 2).toString();
  };

  const wireY = [24, 48, 72, 96, 120, 144, 172];

  const renderSinglePassSVG = (isVertical: boolean) => {
    const wireLabels = isVertical
      ? ["q0 (col 0)", "q1 (col 1)", "q2 (col 2)", "q3 (row 0: Target H)", "q4 (row 1)", "q5 (row 2)", "|c> (color)"]
      : ["q0 (col 0: Target H)", "q1 (col 1)", "q2 (col 2)", "q3 (row 0)", "q4 (row 1)", "q5 (row 2)", "|c> (color)"];

    return (
      <div className="p-3 bg-[#0D0D0D] border border-[#313131] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#FF00B4] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF00B4] animate-pulse" />
            {isVertical
              ? formatDisplayCopy("Circuit B: Vertical Pass (q3, q4, q5 Row Register + Hadamard on q3)")
              : formatDisplayCopy("Circuit A: Horizontal Pass (q0, q1, q2 Column Register + Hadamard on q0)")}
          </span>
          <span className="text-white text-[11px]">
            {isVertical ? "Row Gradient Delta_y" : "Col Gradient Delta_x"}: {deltaVal.toFixed(3)} rad
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
                  stroke={i === 6 ? "#E5A93C" : "#FF00B4"}
                  strokeWidth="1.5"
                  strokeOpacity={0.8}
                />

                {/* Animated Data Packet */}
                <circle r="3.5" fill={i === 6 ? "#FFD700" : "#FF00B4"}>
                  <animateMotion
                    path={`M 150 ${y} L 630 ${y}`}
                    dur={`${1.8 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                </circle>

                <text x="8" y={y + 3.5} fill={i === 6 ? "#E5A93C" : "#FF00B4"} fontFamily="monospace" fontSize="9.5" fontWeight="bold">
                  {wireLabels[i]}
                </text>
                <text x="110" y={y + 3.5} fill="#A1A1A1" fontFamily="monospace" fontSize="8.5">
                  {wireState(i, isVertical)}
                </text>
              </g>
            ))}

            {/* Gate 0: FRQI Init */}
            <g style={{ filter: activeGateStep === 0 ? "drop-shadow(0 0 12px #3B82F6)" : "none" }}>
              <rect
                x="170"
                y="12"
                width="38"
                height="168"
                rx="5"
                fill="#1E3A8A"
                stroke={activeGateStep === 0 ? "#60A5FA" : "#3B82F6"}
                strokeWidth={activeGateStep === 0 ? "3" : "1.5"}
              />
              <text x="189" y="96" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90 189 96)">
                FRQI Init H^(x6)
              </text>
            </g>

            {/* Gate 1: Controlled Ry(2*theta) into |c> */}
            <g style={{ filter: activeGateStep === 1 ? "drop-shadow(0 0 14px #FF00B4)" : "none" }}>
              <line x1="240" y1="24" x2="240" y2="172" stroke="#FF00B4" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="240" cy={isVertical ? 96 : 24} r="3.5" fill="#FF00B4" />
              <circle cx="240" cy={isVertical ? 120 : 48} r="3.5" fill="#FF00B4" />
              <circle cx="240" cy={isVertical ? 144 : 72} r="3.5" fill="#FF00B4" />
              <rect
                x="224"
                y="158"
                width="32"
                height="26"
                rx="4"
                fill="#831843"
                stroke={activeGateStep === 1 ? "#FF00B4" : "#BE185D"}
                strokeWidth={activeGateStep === 1 ? "2.5" : "1.5"}
              />
              <text x="240" y="174" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                Ry(2θ)
              </text>
            </g>

            {/* Gate 2: Cyclic Decrement D64 (Col or Row based) */}
            <g style={{ filter: activeGateStep === 2 ? "drop-shadow(0 0 14px #38BDF8)" : "none" }}>
              {isVertical ? (
                <>
                  <line x1="305" y1="96" x2="305" y2="144" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="305" cy="96" r="3.5" fill="#38BDF8" />
                  <circle cx="305" cy="144" r="6" fill="#0A0A0A" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="299" y1="144" x2="311" y2="144" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="305" y1="138" x2="305" y2="150" stroke="#38BDF8" strokeWidth="1.5" />

                  <line x1="345" y1="96" x2="345" y2="120" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="345" cy="96" r="3.5" fill="#38BDF8" />
                  <circle cx="345" cy="120" r="6" fill="#0A0A0A" stroke="#38BDF8" strokeWidth="1.5" />

                  <rect x="385" y="86" width="22" height="20" rx="3" fill="#14532D" stroke="#22C55E" strokeWidth="1.5" />
                  <text x="396" y="100" fill="#FFF" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">
                    X
                  </text>
                </>
              ) : (
                <>
                  <line x1="305" y1="24" x2="305" y2="72" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="305" cy="24" r="3.5" fill="#38BDF8" />
                  <circle cx="305" cy="72" r="6" fill="#0A0A0A" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="299" y1="72" x2="311" y2="72" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="305" y1="66" x2="305" y2="78" stroke="#38BDF8" strokeWidth="1.5" />

                  <line x1="345" y1="24" x2="345" y2="48" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="345" cy="24" r="3.5" fill="#38BDF8" />
                  <circle cx="345" cy="48" r="6" fill="#0A0A0A" stroke="#38BDF8" strokeWidth="1.5" />

                  <rect x="385" y="14" width="22" height="20" rx="3" fill="#14532D" stroke="#22C55E" strokeWidth="1.5" />
                  <text x="396" y="28" fill="#FFF" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">
                    X
                  </text>
                </>
              )}
            </g>

            {/* Gate 3 & 4: Hadamard H (on q0 for Horizontal, on q3 for Vertical) */}
            <g style={{ filter: activeGateStep === 3 || activeGateStep === 4 ? "drop-shadow(0 0 16px #FFE600)" : "none" }}>
              <rect
                x="440"
                y={isVertical ? 83 : 11}
                width="30"
                height="26"
                rx="4"
                fill="#713F12"
                stroke={activeGateStep === 3 || activeGateStep === 4 ? "#FFE600" : "#CA8A04"}
                strokeWidth={activeGateStep === 3 || activeGateStep === 4 ? "3" : "1.5"}
              />
              <text x="455" y={isVertical ? 100 : 28} fill="#FFF" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="middle">
                H
              </text>
            </g>

            {/* Gate 5: Measurement */}
            {wireY.map((y, i) => (
              <g key={i} style={{ filter: activeGateStep === 5 ? "drop-shadow(0 0 10px #BD93F9)" : "none" }}>
                <rect
                  x="530"
                  y={y - 10}
                  width="20"
                  height="20"
                  rx="3"
                  fill="#3B0764"
                  stroke={activeGateStep === 5 ? "#BD93F9" : "#7E22CE"}
                  strokeWidth={activeGateStep === 5 ? "2" : "1"}
                />
                <text x="540" y={y + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
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
      {/* Circuit Header with Pass Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-xs sm:text-sm font-semibold text-[#FF79C6] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF79C6] animate-pulse" />
          {formatDisplayCopy("FRQI QHED: 7 Wires (6 Position + 1 Color)")}
        </span>

        {!compact && (
          <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-lg border border-[#313131] text-[11px] font-mono">
            <button
              onClick={() => setInternalPass("both")}
              className={`px-2.5 py-1 rounded ${internalPass === "both" ? "bg-[#FF00B4] text-white font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
            >
              {formatDisplayCopy("Dual Passes (A + B)")}
            </button>
            <button
              onClick={() => setInternalPass("horizontal")}
              className={`px-2.5 py-1 rounded ${internalPass === "horizontal" ? "bg-[#FF00B4] text-white font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
            >
              {formatDisplayCopy("Circuit A (Horizontal)")}
            </button>
            <button
              onClick={() => setInternalPass("vertical")}
              className={`px-2.5 py-1 rounded ${internalPass === "vertical" ? "bg-[#FF00B4] text-white font-semibold" : "text-[#9B9B9B] hover:text-white"}`}
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
