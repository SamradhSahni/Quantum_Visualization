'use client';

import React from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

interface ZneExtrapolationChartProps {
  snrIdeal?: number;
  snrS1?: number;
  snrS3?: number;
  snrS5?: number;
  snrZne?: number;
}

export const ZneExtrapolationChart: React.FC<ZneExtrapolationChartProps> = ({
  snrIdeal = 2.14,
  snrS1 = 1.42,
  snrS3 = 1.11,
  snrS5 = 0.94,
  snrZne = 1.63
}) => {
  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#30D158]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("Richardson Zero Noise Extrapolation Curve")}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#30D158] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Error Mitigated</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* SVG Extrapolation Curve */}
        <div className="md:col-span-2 aspect-video bg-[#121212] rounded-xl border border-[#2B2B2B] p-4 flex flex-col justify-between">
          <div className="flex justify-between text-[11px] font-mono text-[#888]">
            <span>Noise Scale Factor (λ)</span>
            <span className="text-[#30D158]">Mitigated Zero Noise Point: λ = 0</span>
          </div>

          {/* SVG Line Chart */}
          <div className="relative flex-1 flex items-center justify-center">
            <svg className="w-full h-36 select-none" viewBox="0 0 320 120">
              {/* Axes */}
              <line x1="40" y1="100" x2="300" y2="100" stroke="#333" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="100" stroke="#333" strokeWidth="1" />

              {/* Tick labels */}
              <text x="50" y="114" fill="#666" fontSize="8" fontFamily="monospace">λ=0</text>
              <text x="100" y="114" fill="#666" fontSize="8" fontFamily="monospace">λ=1</text>
              <text x="180" y="114" fill="#666" fontSize="8" fontFamily="monospace">λ=3</text>
              <text x="260" y="114" fill="#666" fontSize="8" fontFamily="monospace">λ=5</text>

              {/* Extrapolated curve backwards to x=50 (λ=0) */}
              <path
                d="M 50 38 Q 100 48 180 72 T 260 90"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2"
                strokeDasharray="3,3"
              />

              {/* Measured solid segment */}
              <path
                d="M 100 48 L 180 72 L 260 90"
                fill="none"
                stroke="#FF79C6"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {/* Measured 1x */}
              <circle cx="100" cy="48" r="4" fill="#FF79C6" />
              <text x="100" y="40" fill="#FFF" fontSize="8" fontFamily="monospace" textAnchor="middle">1.42x</text>

              {/* Measured 3x */}
              <circle cx="180" cy="72" r="4" fill="#FF79C6" />
              <text x="180" y="65" fill="#FFF" fontSize="8" fontFamily="monospace" textAnchor="middle">1.11x</text>

              {/* Measured 5x */}
              <circle cx="260" cy="90" r="4" fill="#FF79C6" />
              <text x="260" y="83" fill="#FFF" fontSize="8" fontFamily="monospace" textAnchor="middle">0.94x</text>

              {/* Mitigated zero-noise point */}
              <circle cx="50" cy="38" r="5" fill="#30D158" className="shadow-glow" />
              <text x="50" y="28" fill="#30D158" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {snrZne.toFixed(2)}x
              </text>
            </svg>
          </div>
        </div>

        {/* Analytical Weights Formula */}
        <div className="bg-[#1F1F1F] p-3.5 rounded-xl border border-[#313131] space-y-2 text-xs font-mono">
          <span className="text-[#9B9B9B] text-[10px] uppercase block font-semibold">
            Richardson Extrapolation Formula
          </span>
          <div className="p-2.5 rounded bg-[#141414] border border-[#262626] text-[11px] text-[#00F0FF] leading-relaxed">
            Ê_ZNE(0) = (15/8)·E(1) - (5/4)·E(3) + (3/8)·E(5)
          </div>
          <div className="space-y-1 text-[#9B9B9B] text-[11px]">
            <div className="flex justify-between">
              <span>Raw Noisy SNR:</span>
              <span className="text-white font-semibold">{snrS1.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span>ZNE Mitigated SNR:</span>
              <span className="text-[#30D158] font-bold">{snrZne.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span>Fidelity Recovery:</span>
              <span className="text-[#00F0FF] font-semibold">+15.1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

