'use client';

import React, { useState } from 'react';
import { Database, Zap, Clock } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

export const FtqcResourceEstimator: React.FC = () => {
  const [res, setRes] = useState<number>(512);

  // Calculate scaling
  const totalPixels = res * res;
  const nSpatial = Math.ceil(Math.log2(totalPixels));
  const logicalQubits = nSpatial + 1; // FRQI
  const numRy = totalPixels;
  const totalT = numRy * 40;
  const codeD = totalT > 1e6 ? 15 : 13;
  const physPerLog = 2 * (codeD ** 2);
  const totalPhys = logicalQubits * physPerLog;
  const runtimeMs = (totalT * 0.015) / 1000.0;

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#FFD700]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("Fault Tolerant Clifford + T & Surface Code Resource Estimator")}
          </h3>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242424] text-[#9B9B9B] border border-[#333]">
          Rotated Surface Code (Lattice Surgery)
        </span>
      </div>

      {/* Resolution Selector Slider */}
      <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#313131] space-y-2 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-[#9B9B9B]">Single Shot Image Resolution:</span>
          <span className="text-white font-bold">{res}×{res} ({totalPixels.toLocaleString()} Pixels)</span>
        </div>
        <input
          type="range"
          min={64}
          max={2048}
          step={64}
          value={res}
          onChange={(e) => setRes(parseInt(e.target.value))}
          className="w-full accent-[#00F0FF] h-1.5 bg-[#2B2B2B] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#777]">
          <span>64×64</span>
          <span>512×512 (Orbital Native)</span>
          <span>1024×1024</span>
          <span>2048×2048</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#313131] text-xs font-mono">
          <span className="text-[#9B9B9B] text-[10px] uppercase block">Logical Qubits</span>
          <span className="text-xl font-bold text-white mt-1 block">{logicalQubits}</span>
          <span className="text-[10px] text-[#888]">18 Spatial + 1 Color</span>
        </div>

        <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#313131] text-xs font-mono">
          <span className="text-[#9B9B9B] text-[10px] uppercase block">Non Clifford T Gates</span>
          <span className="text-xl font-bold text-[#FFD700] mt-1 block">
            {(totalT / 1e6).toFixed(1)}M
          </span>
          <span className="text-[10px] text-[#888]">40 T gates per rotation</span>
        </div>

        <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#313131] text-xs font-mono">
          <span className="text-[#9B9B9B] text-[10px] uppercase block">Physical Qubits</span>
          <span className="text-xl font-bold text-[#00F0FF] mt-1 block">
            {totalPhys.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#888]">d={codeD} (2·d² = {physPerLog})</span>
        </div>

        <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#313131] text-xs font-mono">
          <span className="text-[#9B9B9B] text-[10px] uppercase block">FTQC Runtime</span>
          <span className="text-xl font-bold text-[#30D158] mt-1 block">
            {runtimeMs.toFixed(1)} ms
          </span>
          <span className="text-[10px] text-[#888]">~15 μs T factory cycle</span>
        </div>
      </div>
    </div>
  );
};

