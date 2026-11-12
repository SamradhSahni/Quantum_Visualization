'use client';

import React, { useState } from 'react';
import { StatevectorEntry } from './engine/tensorSimulator';

interface StatevectorPhaseChartProps {
  statevector: StatevectorEntry[];
}

export const StatevectorPhaseChart: React.FC<StatevectorPhaseChartProps> = ({ statevector }) => {
  const [selectedKet, setSelectedKet] = useState<StatevectorEntry | null>(
    statevector.find((s) => s.prob > 0.05) || statevector[0] || null
  );

  // Compute color based on phase angle phi in (-pi, pi]
  const getPhaseColor = (phi: number): string => {
    // Normalize phi to [0, 1]
    const norm = (phi + Math.PI) / (2 * Math.PI);
    // Interpolate around cyan (#00F0FF), magenta (#FF79C6), gold (#FFD700), purple (#BD93F9)
    if (norm < 0.25) return '#00F0FF';
    if (norm < 0.5) return '#FF79C6';
    if (norm < 0.75) return '#FFD700';
    return '#BD93F9';
  };

  const activeKet = selectedKet || statevector[0];

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2B2B2B]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            Statevector Amplitudes & Cyclic Phase Visualizer
          </span>
          <span className="text-[10px] font-mono text-[#9B9B9B]">
            {statevector.length} Hilbert Basis States
          </span>
        </div>

        {/* Phase Color Wheel Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#00F0FF]">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF]" /> φ=0 (Real +)
          </span>
          <span className="flex items-center gap-1 text-[#FF79C6]">
            <span className="w-2 h-2 rounded-full bg-[#FF79C6]" /> φ=+π/2 (+i)
          </span>
          <span className="flex items-center gap-1 text-[#FFD700]">
            <span className="w-2 h-2 rounded-full bg-[#FFD700]" /> φ=±π (Real -)
          </span>
          <span className="flex items-center gap-1 text-[#BD93F9]">
            <span className="w-2 h-2 rounded-full bg-[#BD93F9]" /> φ=-π/2 (-i)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: 2D Probability & Phase Bars */}
        <div className="lg:col-span-2 bg-[#1F1F1F] p-3.5 rounded-xl border border-[#313131] flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block font-semibold mb-2">
            Born Measurement Probabilities P(k) = |α_k|²
          </span>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {statevector.map((entry) => {
              const color = getPhaseColor(entry.phaseRad);
              const isSelected = activeKet?.index === entry.index;
              const probPct = (entry.prob * 100).toFixed(1);

              return (
                <div
                  key={entry.index}
                  onClick={() => setSelectedKet(entry)}
                  className={`flex items-center gap-3 text-xs font-mono p-1.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'bg-[#2A2A2A] ring-1 ring-[#00F0FF]' : 'hover:bg-[#252525]'
                  }`}
                >
                  <span className="w-14 text-white font-semibold">|{entry.ket}⟩</span>

                  {/* Horizontal Bar */}
                  <div className="flex-1 h-3.5 bg-[#141414] rounded overflow-hidden relative">
                    <div
                      className="h-full rounded transition-all duration-300"
                      style={{
                        width: `${Math.max(entry.prob > 0 ? 1 : 0, entry.prob * 100)}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>

                  <span className="w-12 text-right text-white font-bold">{probPct}%</span>
                  <span className="w-20 text-right text-[#888] text-[10px]">
                    φ = {(entry.phaseRad / Math.PI).toFixed(2)}π
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: 2D Argand Complex Plane */}
        <div className="bg-[#1F1F1F] p-3.5 rounded-xl border border-[#313131] flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[11px] font-mono text-[#9B9B9B] uppercase font-semibold">
              Argand Complex Plane
            </span>
            <span className="text-[#00F0FF] font-bold">|{activeKet?.ket}⟩</span>
          </div>

          {/* SVG Complex Unit Circle */}
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 select-none" viewBox="-70 -70 140 140">
              {/* Complex axes */}
              <line x1="-60" y1="0" x2="60" y2="0" stroke="#333" strokeWidth="1" />
              <line x1="0" y1="-60" x2="0" y2="60" stroke="#333" strokeWidth="1" />
              <text x="56" y="-4" fill="#666" fontSize="7" fontFamily="monospace">Re</text>
              <text x="4" y="-52" fill="#666" fontSize="7" fontFamily="monospace">Im</text>

              {/* Unit circle radius = 50 */}
              <circle cx="0" cy="0" r="50" fill="none" stroke="#2A2A2A" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="25" fill="none" stroke="#222" strokeWidth="1" strokeDasharray="2,2" />

              {/* Vector arrow for activeKet: x = Re, y = -Im */}
              {activeKet && (
                <>
                  <line
                    x1="0"
                    y1="0"
                    x2={activeKet.re * 50}
                    y2={-activeKet.im * 50}
                    stroke={getPhaseColor(activeKet.phaseRad)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={activeKet.re * 50}
                    cy={-activeKet.im * 50}
                    r="4"
                    fill={getPhaseColor(activeKet.phaseRad)}
                    className="shadow-glow"
                  />
                </>
              )}
            </svg>
          </div>

          {/* Complex Telemetry */}
          {activeKet && (
            <div className="w-full mt-2 pt-2 border-t border-[#292929] text-[11px] font-mono space-y-1 text-[#9B9B9B]">
              <div className="flex justify-between">
                <span>α = {activeKet.re.toFixed(3)} + {activeKet.im.toFixed(3)}i</span>
                <span className="text-white font-semibold">|α| = {activeKet.mag.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Phase: {activeKet.phaseRad.toFixed(3)} rad</span>
                <span className="text-[#00F0FF] font-semibold">Prob: {(activeKet.prob * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

