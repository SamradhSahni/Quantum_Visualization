'use client';

import React, { useState } from 'react';
import { StepTelemetry } from './engine/tensorSimulator';

interface MathCalculationInspectorProps {
  currentTelemetry?: StepTelemetry;
  selectedGateName?: string | null;
}

export const MathCalculationInspector: React.FC<MathCalculationInspectorProps> = ({
  currentTelemetry,
  selectedGateName
}) => {
  const [ketFormat, setKetFormat] = useState<'cartesian' | 'polar'>('cartesian');
  const [indexFormat, setIndexFormat] = useState<'binary' | 'decimal'>('binary');

  if (!currentTelemetry) {
    return (
      <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 text-xs font-mono text-[#9B9B9B]">
        No step selected. Click on any column in the timeline to inspect calculations.
      </div>
    );
  }

  const { stepIndex, desc, statevector, butterflies } = currentTelemetry;

  // Filter non-zero states
  const nonZeroStates = statevector.filter((s) => s.prob > 1e-4);

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2B2B2B]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            Mathematical Calculation Inspector
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#272727] text-white border border-[#383838]">
            Step {stepIndex}: {desc}
          </span>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <button
            onClick={() => setKetFormat('cartesian')}
            className={`px-2 py-0.5 rounded transition-all ${
              ketFormat === 'cartesian' ? 'bg-[#00F0FF] text-black font-semibold' : 'bg-[#242424] text-[#9B9B9B]'
            }`}
          >
            Cartesian (a + bi)
          </button>
          <button
            onClick={() => setKetFormat('polar')}
            className={`px-2 py-0.5 rounded transition-all ${
              ketFormat === 'polar' ? 'bg-[#00F0FF] text-black font-semibold' : 'bg-[#242424] text-[#9B9B9B]'
            }`}
          >
            Polar (r·e^(iφ))
          </button>
          <button
            onClick={() => setIndexFormat(indexFormat === 'binary' ? 'decimal' : 'binary')}
            className="px-2 py-0.5 rounded bg-[#242424] text-white hover:bg-[#2F2F2F] transition-all ml-1"
          >
            {indexFormat === 'binary' ? 'Bin |011⟩' : 'Dec |3⟩'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Dirac Ket Expansion at Step t */}
        <div className="bg-[#1F1F1F] p-3.5 rounded-xl border border-[#313131] space-y-2">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block font-semibold">
            Dirac Ket Statevector Expansion |ψ^({stepIndex})⟩
          </span>

          <div className="bg-[#141414] p-3 rounded-lg border border-[#272727] font-mono text-xs overflow-x-auto leading-relaxed max-h-32">
            {nonZeroStates.length === 0 ? (
              <span className="text-[#777]">Ground zero state</span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[#00F0FF]">|ψ^({stepIndex})⟩ =</span>
                {nonZeroStates.map((s, idx) => {
                  const ketLabel = indexFormat === 'binary' ? s.ket : s.decIndex.toString();
                  const term =
                    ketFormat === 'cartesian'
                      ? `${s.re >= 0 && idx > 0 ? '+ ' : s.re < 0 ? '- ' : ''}${Math.abs(s.re).toFixed(3)}${
                          s.im !== 0 ? ` ${s.im >= 0 ? '+' : '-'} ${Math.abs(s.im).toFixed(3)}i` : ''
                        }`
                      : `${s.mag.toFixed(3)}·e^(${s.phaseRad.toFixed(2)}i)`;

                  return (
                    <span key={s.index} className="inline-flex items-center gap-0.5">
                      <span className="text-white font-semibold">{term}</span>
                      <span className="text-[#FF79C6]">|{ketLabel}⟩</span>
                      {idx < nonZeroStates.length - 1 && <span className="text-[#666]"></span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-[#888] flex justify-between">
            <span>Non zero basis states: {nonZeroStates.length}</span>
            <span>Total Hilbert Dim: {statevector.length}</span>
          </div>
        </div>

        {/* Right: Active Butterfly Calculations & Linear Algebra */}
        <div className="bg-[#1F1F1F] p-3.5 rounded-xl border border-[#313131] space-y-2">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block font-semibold">
            Pairwise Butterfly Amplitude Updates
          </span>

          {butterflies.length === 0 ? (
            <div className="p-3 bg-[#141414] rounded-lg border border-[#272727] text-xs font-mono text-[#777]">
              Step 0: Ground initialization. No gates applied yet.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {butterflies.map((b, idx) => {
                const badgeColor =
                  b.effectType === 'CONSTRUCTIVE_INTERFERENCE'
                    ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40'
                    : b.effectType === 'DESTRUCTIVE_CANCELLATION'
                    ? 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/40'
                    : 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/40';

                return (
                  <div
                    key={idx}
                    className="p-2 bg-[#141414] rounded-lg border border-[#272727] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-white font-semibold">
                        |{b.pairKets[0]}⟩ ↔ |{b.pairKets[1]}⟩
                      </span>
                      <span className="text-[11px] text-[#888] ml-2">{b.equationLatex}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${badgeColor}`}>
                      {b.effectType.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

