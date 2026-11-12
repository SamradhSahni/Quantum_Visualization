'use client';

import React from 'react';
import { MutualInfoPair } from './engine/tensorSimulator';

interface EntanglementChordGraphProps {
  numQubits: number;
  mutualInfoPairs: MutualInfoPair[];
}

export const EntanglementChordGraph: React.FC<EntanglementChordGraphProps> = ({
  numQubits,
  mutualInfoPairs
}) => {
  const n = numQubits;
  const radius = 60;
  const cx = 90;
  const cy = 90;

  // Node positions on circle
  const nodes = Array.from({ length: n }).map((_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      id: i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      label: `q${i}`
    };
  });

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
          Entanglement Topology & Mutual Information
        </span>
        <span className="text-[10px] font-mono text-[#9B9B9B]">
          {mutualInfoPairs.length} Active Entangled Pairs
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
        {/* SVG Circular Graph */}
        <svg className="w-44 h-44 select-none" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#262626" strokeWidth="1" strokeDasharray="3,3" />

          {/* Arcs between entangled qubits */}
          {mutualInfoPairs.map((pair, idx) => {
            const na = nodes[pair.qubitA];
            const nb = nodes[pair.qubitB];
            if (!na || !nb) return null;

            return (
              <line
                key={idx}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="#00F0FF"
                strokeWidth={Math.max(1.5, pair.mutualInfo * 1.5)}
                strokeOpacity={Math.min(1.0, pair.mutualInfo / 2 + 0.3)}
                className="animate-pulse"
              />
            );
          })}

          {/* Qubit Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r="12" fill="#1F1F1F" stroke="#00F0FF" strokeWidth="1.5" />
              <text
                x={node.x}
                y={node.y + 4}
                fill="#FFF"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Pairwise Mutual Information List */}
        <div className="flex-1 space-y-1.5 max-h-36 overflow-y-auto w-full">
          {mutualInfoPairs.length === 0 ? (
            <div className="p-3 bg-[#1F1F1F] rounded-lg border border-[#313131] text-xs font-mono text-[#777] text-center">
              Separable state. All qubits are unentangled.
            </div>
          ) : (
            mutualInfoPairs.map((p, idx) => (
              <div
                key={idx}
                className="p-2 bg-[#1F1F1F] rounded-lg border border-[#313131] flex items-center justify-between text-xs font-mono"
              >
                <span className="text-white font-semibold">
                  I(q{p.qubitA} : q{p.qubitB})
                </span>
                <span className="text-[#00F0FF] font-bold">
                  {p.mutualInfo.toFixed(2)} bit
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

