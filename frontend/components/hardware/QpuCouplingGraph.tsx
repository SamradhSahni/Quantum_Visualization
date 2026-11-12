'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

interface QpuCouplingGraphProps {
  profileKey?: string;
  routedQubits?: number[];
  insertedSwaps?: number;
  routedDepth?: number;
}

export const QpuCouplingGraph: React.FC<QpuCouplingGraphProps> = ({
  profileKey = "IBM_HERON_133Q",
  routedQubits = [12, 13, 14, 15, 20, 21, 22],
  insertedSwaps = 6,
  routedDepth = 41
}) => {
  // Generate a 4x8 2D physical grid of qubits
  const nodes = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const id = r * 8 + c;
      nodes.push({ id, r, c, isRouted: routedQubits.includes(id) });
    }
  }

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF00B4]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("Physical QPU Coupling Map & SABRE SWAP Router")}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#9B9B9B]">
          <span className="text-white font-semibold">
            Routed Depth: <span className="text-[#00F0FF]">{routedDepth}</span>
          </span>
          <span className="text-white font-semibold">
            Inserted SWAPs: <span className="text-[#FF79C6]">{insertedSwaps}</span>
          </span>
        </div>
      </div>

      <div className="bg-[#121212] p-4 rounded-xl border border-[#2B2B2B] flex flex-col items-center">
        {/* 2D Qubit Grid */}
        <div className="grid grid-cols-8 gap-3 sm:gap-4 p-2">
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${
                n.isRouted
                  ? 'bg-[#00F0FF] text-black border-white shadow-glow scale-105'
                  : 'bg-[#1C1C1C] text-[#666] border-[#313131]'
              }`}
              title={`Physical Qubit #${n.id}`}
            >
              {n.id}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-[#888] mt-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#00F0FF]" /> Logical Qubit Mapped
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#1C1C1C] border border-[#313131]" /> Physical Ancilla Wire
          </span>
        </div>
      </div>
    </div>
  );
};

