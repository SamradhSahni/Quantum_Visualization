'use client';

import React from 'react';
import { Cpu, Activity } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

interface NisqDecoherenceControlsProps {
  selectedProfile: string;
  onSelectProfile: (prof: string) => void;
  enableZne: boolean;
  onToggleZne: (val: boolean) => void;
}

export const NisqDecoherenceControls: React.FC<NisqDecoherenceControlsProps> = ({
  selectedProfile,
  onSelectProfile,
  enableZne,
  onToggleZne
}) => {
  const profiles = [
    {
      id: "IBM_HERON_133Q",
      name: "IBM Heron 133Q",
      type: "Heavy Hexagonal Superconducting",
      t1: "180 μs",
      t2: "140 μs",
      cxErr: "0.45%"
    },
    {
      id: "RIGETTI_ANKAA_84Q",
      name: "Rigetti Ankaa 84Q",
      type: "Square Octagon Superconducting",
      t1: "32 μs",
      t2: "28 μs",
      cxErr: "1.80%"
    },
    {
      id: "IONQ_ARIA_25Q",
      name: "IonQ Aria 25Q",
      type: "Trapped Ion All to All",
      t1: "10 ms",
      t2: "1000 μs",
      cxErr: "0.20%"
    }
  ];

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("NISQ Hardware Profiles & Noise Channels")}
          </h3>
        </div>

        {/* ZNE Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono select-none">
          <span className="text-[#9B9B9B]">{formatDisplayCopy("Zero Noise Extrapolation")}</span>
          <input
            type="checkbox"
            checked={enableZne}
            onChange={(e) => onToggleZne(e.target.checked)}
            className="w-4 h-4 accent-[#00F0FF] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {profiles.map((p) => {
          const isSelected = selectedProfile === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProfile(p.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-lg'
                  : 'border-[#2D2D2D] bg-[#1F1F1F] hover:bg-[#252525]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-white">{p.name}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />}
              </div>
              <span className="text-[10px] font-mono text-[#888] block mb-2">{p.type}</span>
              <div className="space-y-0.5 text-[10px] font-mono text-[#9B9B9B]">
                <div className="flex justify-between">
                  <span>T1 / T2:</span>
                  <span className="text-white">{p.t1} / {p.t2}</span>
                </div>
                <div className="flex justify-between">
                  <span>CNOT Error:</span>
                  <span className="text-[#FF79C6] font-semibold">{p.cxErr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

