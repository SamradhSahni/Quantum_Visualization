"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { BarrenPlateauDiagnostics, CostFunctionId } from "@/lib/qmlTypes";

interface BarrenPlateauChartProps {
  diagnostics: BarrenPlateauDiagnostics;
  costType: CostFunctionId;
  numQubits: number;
  circuitDepth: number;
  onChangeCostType: (c: CostFunctionId) => void;
  onChangeQubits: (q: number) => void;
  onChangeDepth: (d: number) => void;
}

export const BarrenPlateauChart: React.FC<BarrenPlateauChartProps> = ({
  diagnostics,
  costType,
  numQubits,
  circuitDepth,
  onChangeCostType,
  onChangeQubits,
  onChangeDepth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const grid = diagnostics.loss_surface_grid_21x21 || [];
  const traj = diagnostics.optimizer_trajectory || [];
  const scaling = diagnostics.variance_scaling_curve || [];
  const qfim = diagnostics.qfim_matrix || [[0, 0], [0, 0]];
  const isBarren = diagnostics.is_barren_plateau;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;
    const rows = grid.length;
    const cols = grid[0].length;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lo = Infinity;
    let hi = -Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] < lo) lo = grid[r][c];
        if (grid[r][c] > hi) hi = grid[r][c];
      }
    }
    const span = Math.max(1e-6, hi - lo);
    const img = ctx.createImageData(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) * 4;
        if (isBarren) {
          // Flat barren plateau gray-red uniform slab
          const t = (grid[r][c] - lo) / span;
          img.data[idx] = Math.round(52 + 18 * t);
          img.data[idx + 1] = Math.round(32 + 8 * t);
          img.data[idx + 2] = Math.round(36 + 8 * t);
        } else {
          const t = (grid[r][c] - lo) / span;
          if (t < 0.45) {
            const k = t / 0.45;
            img.data[idx] = Math.round(14 + 20 * k);
            img.data[idx + 1] = Math.round(120 + 80 * k);
            img.data[idx + 2] = Math.round(110 + 130 * k);
          } else {
            const k = (t - 0.45) / 0.55;
            img.data[idx] = Math.round(34 + 215 * k);
            img.data[idx + 1] = Math.round(200 - 110 * k);
            img.data[idx + 2] = Math.round(240 - 150 * k);
          }
        }
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [grid, isBarren]);

  // Project trajectory points (-pi..pi) onto SVG 210x210 space
  const trajPath = traj
    .map((pt, i) => {
      const x = ((pt.theta2 + Math.PI) / (2 * Math.PI)) * 210;
      const y = ((pt.theta1 + Math.PI) / (2 * Math.PI)) * 210;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const firstPt = traj[0];
  const lastPt = traj[traj.length - 1];

  return (
    <div className="space-y-3">
      {/* Cost Observable + Qubits & Depth Controls */}
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[#888888]">{formatDisplayCopy("Cost Observable")}:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChangeCostType("LOCAL_PAULI_Z")}
              className={`text-[10px] px-2.5 py-1 rounded border transition-colors ${
                costType === "LOCAL_PAULI_Z"
                  ? "bg-[#39D353]/20 border-[#39D353] text-[#39D353]"
                  : "bg-[#181818] border-[#313131] text-[#888888] hover:text-white"
              }`}
            >
              {formatDisplayCopy("Local Pauli Z")}
            </button>
            <button
              type="button"
              onClick={() => onChangeCostType("GLOBAL_PROJECTOR")}
              className={`text-[10px] px-2.5 py-1 rounded border transition-colors ${
                costType === "GLOBAL_PROJECTOR"
                  ? "bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]"
                  : "bg-[#181818] border-[#313131] text-[#888888] hover:text-white"
              }`}
            >
              {formatDisplayCopy("Global Projector")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#888888]">{formatDisplayCopy("Qubits (n)")}</span>
              <span className="text-[#00F0FF]">{numQubits}Q</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={numQubits}
              onChange={(e) => onChangeQubits(parseInt(e.target.value, 10))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#888888]">{formatDisplayCopy("Ansatz Depth (L)")}</span>
              <span className="text-[#FF79C6]">{circuitDepth} Layers</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={circuitDepth}
              onChange={(e) => onChangeDepth(parseInt(e.target.value, 10))}
              className="w-full accent-[#FF79C6] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 21x21 Loss Surface Heatmap + Trajectory + Variance Scaling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-3 space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-white">{formatDisplayCopy("21x21 Loss Landscape")}</span>
            <span className={isBarren ? "text-[#EF4444]" : "text-[#39D353]"}>
              {isBarren ? formatDisplayCopy("Flat Plateau") : formatDisplayCopy("Steep Basin")}
            </span>
          </div>
          <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-lg overflow-hidden border border-[#313131]">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <svg viewBox="0 0 210 210" className="absolute inset-0 w-full h-full pointer-events-none">
              {trajPath && (
                <path
                  d={trajPath}
                  fill="none"
                  stroke={isBarren ? "#EF4444" : "#FFFFFF"}
                  strokeWidth="2.2"
                />
              )}
              {firstPt && (
                <circle
                  cx={((firstPt.theta2 + Math.PI) / (2 * Math.PI)) * 210}
                  cy={((firstPt.theta1 + Math.PI) / (2 * Math.PI)) * 210}
                  r="4"
                  fill="#FFD700"
                />
              )}
              {lastPt && (
                <circle
                  cx={((lastPt.theta2 + Math.PI) / (2 * Math.PI)) * 210}
                  cy={((lastPt.theta1 + Math.PI) / (2 * Math.PI)) * 210}
                  r="4.5"
                  fill={isBarren ? "#EF4444" : "#39D353"}
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
              )}
            </svg>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#777777]">
            <span>{formatDisplayCopy("Gold: Init")}</span>
            <span>{formatDisplayCopy(isBarren ? "Red: Stalled" : "Green: Converged")}</span>
          </div>
        </div>

        {/* Variance Scaling Curve + QFIM */}
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-3 flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-white">{formatDisplayCopy("Gradient Variance Scaling")}</span>
            {isBarren ? (
              <span className="text-[#EF4444] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Barren
              </span>
            ) : (
              <span className="text-[#39D353] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Trainable
              </span>
            )}
          </div>

          <svg viewBox="0 0 220 96" className="w-full h-24 bg-[#181818] border border-[#2A2A2A] rounded">
            <line x1="22" y1="80" x2="208" y2="80" stroke="#313131" />
            <line x1="22" y1="10" x2="22" y2="80" stroke="#313131" />
            {scaling.length > 1 && (
              <>
                <path
                  d={scaling
                    .map((pt, i) => {
                      const x = 24 + (i / (scaling.length - 1)) * 180;
                      const logY = Math.max(-5, Math.min(0, Math.log10(Math.max(1e-5, pt.local_var))));
                      const y = 14 + (-logY / 5) * 62;
                      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#39D353"
                  strokeWidth="1.8"
                />
                <path
                  d={scaling
                    .map((pt, i) => {
                      const x = 24 + (i / (scaling.length - 1)) * 180;
                      const logY = Math.max(-5, Math.min(0, Math.log10(Math.max(1e-5, pt.global_var))));
                      const y = 14 + (-logY / 5) * 62;
                      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="1.8"
                  strokeDasharray="3,2"
                />
                <line
                  x1={24 + ((numQubits - 2) / 10) * 180}
                  y1="10"
                  x2={24 + ((numQubits - 2) / 10) * 180}
                  y2="80"
                  stroke="#00F0FF"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              </>
            )}
            <text x="26" y="18" fill="#39D353" fontSize="7" fontFamily="monospace">
              Local 1/poly(n)
            </text>
            <text x="26" y="72" fill="#EF4444" fontSize="7" fontFamily="monospace">
              Global 2^-n
            </text>
          </svg>

          {/* QFIM Metrics */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded p-2 text-[10px] font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-[#888888]">{formatDisplayCopy("Grad Variance")}:</span>
              <span className={isBarren ? "text-[#EF4444] font-bold" : "text-[#39D353] font-bold"}>
                {diagnostics.gradient_variance.toExponential(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">det(QFIM):</span>
              <span className="text-[#00F0FF] font-bold">{diagnostics.qfim_determinant}</span>
            </div>
            <div className="flex justify-between text-[#777777]">
              <span>F00={qfim[0]?.[0]} | F11={qfim[1]?.[1]}</span>
              <span>Loss {lastPt?.loss ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

