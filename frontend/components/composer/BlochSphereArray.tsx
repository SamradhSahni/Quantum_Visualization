'use client';

import React from 'react';
import { BlochVector } from './engine/tensorSimulator';

interface BlochSphereArrayProps {
  blochVectors: BlochVector[];
}

export const BlochSphereArray: React.FC<BlochSphereArrayProps> = ({ blochVectors }) => {
  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            3D Bloch Spheres & Entanglement Purity
          </span>
          <span className="text-[10px] font-mono text-[#9B9B9B]">1 to 8 Qubits</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#9B9B9B]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#30D158]" /> Pure (Radius 1.0)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF00B4]" /> Entangled (Contracted)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {blochVectors.map((bv) => {
          const { qubit, rx, ry, rz, purity, entropyBits } = bv;
          const normR = Math.sqrt(rx * rx + ry * ry + rz * rz);
          const isEntangled = normR < 0.95;

          // 3D Isometric projection constants
          const cx = 60;
          const cy = 60;
          const radius = 42;

          // Project (rx, ry, rz) into 2D screen coords
          // X-axis projects at (-cos(30), +sin(30))
          // Y-axis projects at (+cos(30), +sin(30))
          // Z-axis projects straight UP (-rz)
          const px = cx + (ry * Math.cos(Math.PI / 6) - rx * Math.cos(Math.PI / 6)) * radius;
          const py = cy - rz * radius + (rx * Math.sin(Math.PI / 6) + ry * Math.sin(Math.PI / 6)) * radius * 0.45;

          return (
            <div
              key={qubit}
              className={`p-3 bg-[#1F1F1F] rounded-xl border flex flex-col items-center transition-all ${
                isEntangled ? 'border-[#FF00B4]/40 bg-[#1F1A22]' : 'border-[#313131]'
              }`}
            >
              <div className="w-full flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-white">Qubit q{qubit}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isEntangled ? 'bg-[#FF00B4]/20 text-[#FF00B4]' : 'bg-[#30D158]/20 text-[#30D158]'
                  }`}
                >
                  {isEntangled ? 'Entangled' : 'Pure'}
                </span>
              </div>

              {/* 3D Bloch Sphere SVG */}
              <svg className="w-28 h-28 select-none" viewBox="0 0 120 120">
                {/* Background sphere circle */}
                <circle cx={cx} cy={cy} r={radius} fill="#141414" stroke="#2D2D2D" strokeWidth="1.5" />

                {/* Equator Ellipse */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={radius}
                  ry={radius * 0.35}
                  fill="none"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Z-Axis line (vertical) */}
                <line x1={cx} y1={cy - radius - 4} x2={cx} y2={cy + radius + 4} stroke="#444" strokeWidth="1" />
                <text x={cx} y={cy - radius - 5} fill="#999" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  |0⟩
                </text>
                <text x={cx} y={cy + radius + 11} fill="#999" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  |1⟩
                </text>

                {/* Center origin */}
                <circle cx={cx} cy={cy} r="2" fill="#555" />

                {/* State Vector Arrow */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={px}
                  y2={py}
                  stroke={isEntangled ? '#FF00B4' : '#00F0FF'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle
                  cx={px}
                  cy={py}
                  r="3.5"
                  fill={isEntangled ? '#FF00B4' : '#00F0FF'}
                  className="shadow-glow"
                />
              </svg>

              {/* Numerical Vector Coordinates & Entropy */}
              <div className="w-full mt-2 pt-2 border-t border-[#292929] space-y-1 text-[11px] font-mono text-[#9B9B9B]">
                <div className="flex justify-between">
                  <span>r = ({rx.toFixed(2)}, {ry.toFixed(2)}, {rz.toFixed(2)})</span>
                  <span className="text-white font-semibold">|r| = {normR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Purity: {purity.toFixed(2)}</span>
                  <span className={entropyBits > 0.05 ? 'text-[#FF00B4] font-semibold' : 'text-[#888]'}>
                    Entropy: {entropyBits.toFixed(2)} bit
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

