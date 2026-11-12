"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { formatDisplayCopy } from "@/lib/copyFormatter";

interface TelemetryHudProps {
  algorithm: string;
  patchX: number;
  patchY: number;
  totalPatches: number;
  completedPatches: number;
  isCulled: boolean;
  qubits: number;
  latencyMs: number;
  prattFom?: number;
  shannonEntropy?: number;
  snrDb?: number;
  computeSavedPct?: number;
  executedTiles?: number;
  totalTiles?: number;
}

export const TelemetryHud: React.FC<TelemetryHudProps> = ({
  patchX,
  patchY,
  totalPatches,
  completedPatches,
  isCulled,
  qubits = 7,
  latencyMs = 14.2,
  prattFom = 0.884,
  snrDb = 24.6,
  computeSavedPct,
  executedTiles,
  totalTiles,
}) => {
  const percentComplete =
    totalPatches > 0 ? ((completedPatches / totalPatches) * 100).toFixed(1) : "0.0";

  return (
    <Card surface="card" outerRadius={16} className="p-4 border border-[#313131]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#313131]">
        <span className="text-xs font-mono text-[#9B9B9B] uppercase">
          {formatDisplayCopy("Real Time Quantum Telemetry HUD")}
        </span>
        <div className="flex items-center gap-4 text-xs font-mono">
          {computeSavedPct !== undefined && (
            <span className="text-[#39D353]">
              {executedTiles}/{totalTiles} {formatDisplayCopy("Active Circuits")} ({computeSavedPct.toFixed(1)}% {formatDisplayCopy("Saved")})
            </span>
          )}
          <span className="text-[#00F0FF]">
            {percentComplete}% {formatDisplayCopy("Processed")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#313131]">
          <span className="text-[#9B9B9B] block text-[10px] uppercase">{formatDisplayCopy("Tile Coords")}</span>
          <span className="text-white font-semibold text-sm">({patchX}, {patchY})</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#313131]">
          <span className="text-[#9B9B9B] block text-[10px] uppercase">{formatDisplayCopy("Variance Cull")}</span>
          <span className={`font-semibold text-sm ${isCulled ? "text-[#39D353]" : "text-[#00F0FF]"}`}>
            {isCulled ? formatDisplayCopy("Culled (Skipped)") : formatDisplayCopy("Qiskit Active")}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#313131]">
          <span className="text-[#9B9B9B] block text-[10px] uppercase">{formatDisplayCopy("Qubits / States")}</span>
          <span className="text-white font-semibold text-sm">{qubits} Qubits ({Math.pow(2, qubits)})</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#313131]">
          <span className="text-[#9B9B9B] block text-[10px] uppercase">{formatDisplayCopy("Patch Latency")}</span>
          <span className="text-[#39D353] font-semibold text-sm">{latencyMs} ms</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#313131]">
          <span className="text-[#9B9B9B] block text-[10px] uppercase">{formatDisplayCopy("Pratt FOM")}</span>
          <span className="text-[#00F0FF] font-semibold text-sm">{prattFom.toFixed(3)}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#313131]">
          <span className="text-[#9B9B9B] block text-[10px] uppercase">{formatDisplayCopy("Compute Saved / SNR")}</span>
          <span className="text-white font-semibold text-sm">
            {computeSavedPct !== undefined ? `${computeSavedPct.toFixed(1)}%` : `${snrDb.toFixed(1)} dB`}
          </span>
        </div>
      </div>
    </Card>
  );
};
