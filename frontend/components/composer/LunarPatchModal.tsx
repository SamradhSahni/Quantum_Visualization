'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { CircuitStep } from './engine/tensorSimulator';
import { apiFetch } from '@/lib/apiClient';

interface LunarPatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPatchCircuit: (numQubits: number, steps: CircuitStep[]) => void;
}

export const LunarPatchModal: React.FC<LunarPatchModalProps> = ({
  isOpen,
  onClose,
  onLoadPatchCircuit
}) => {
  const [patchSize, setPatchSize] = useState<'2x2' | '4x4'>('2x2');
  const [algo, setAlgo] = useState<'FRQI' | 'QPIE' | 'NEQR'>('FRQI');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/composer/from-image-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch_size: patchSize,
          intensities: [38.0, 218.0, 42.0, 224.0],
          algorithm: algo
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Convert to client steps
        const clientSteps: CircuitStep[] = data.steps.map((st: any) => ({
          stepIndex: st.step_index,
          gates: st.gates.map((g: any, idx: number) => ({
            id: `patch_g_${st.step_index}_${idx}`,
            gate: g.gate,
            targets: g.targets,
            controls: g.controls || [],
            antiControls: g.anti_controls || [],
            params: g.params || []
          }))
        }));
        onLoadPatchCircuit(data.num_qubits, clientSteps);
        onClose();
      }
    } catch (err) {
      console.error("Failed to load lunar patch from API:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#181818] border border-[#313131] rounded-2xl p-5 shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-white font-mono">
              Load Lunar Crater Patch into Composer
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#9B9B9B] hover:text-white hover:bg-[#2A2A2A]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patch Size Selector */}
        <div className="space-y-1.5 text-xs font-mono">
          <span className="text-[#9B9B9B] block">Select Micro Patch Geometry:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPatchSize('2x2')}
              className={`p-2 rounded-xl border text-center transition-all ${
                patchSize === '2x2'
                  ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white font-semibold'
                  : 'border-[#313131] bg-[#1F1F1F] text-[#9B9B9B]'
              }`}
            >
              2×2 Rim Tile (4 Pixels)
            </button>
            <button
              onClick={() => setPatchSize('4x4')}
              className={`p-2 rounded-xl border text-center transition-all ${
                patchSize === '4x4'
                  ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white font-semibold'
                  : 'border-[#313131] bg-[#1F1F1F] text-[#9B9B9B]'
              }`}
            >
              4×4 Crater Tile (16 Pixels)
            </button>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="space-y-1.5 text-xs font-mono">
          <span className="text-[#9B9B9B] block">Target Encoding Algorithm:</span>
          <div className="grid grid-cols-3 gap-2">
            {(['FRQI', 'QPIE', 'NEQR'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  algo === a
                    ? 'border-[#FF00B4] bg-[#FF00B4]/10 text-white font-semibold'
                    : 'border-[#313131] bg-[#1F1F1F] text-[#9B9B9B]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Pixel Preview */}
        <div className="bg-[#121212] p-3 rounded-xl border border-[#262626] space-y-1 text-xs font-mono">
          <span className="text-[#9B9B9B] block text-[10px] uppercase">Lunar Mare Rim Pixel Intensities:</span>
          <div className="flex gap-2">
            {[38, 218, 42, 224].map((val, idx) => (
              <div key={idx} className="flex-1 p-2 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-center">
                <div
                  className="w-full h-4 rounded mb-1"
                  style={{ backgroundColor: `rgb(${val}, ${val}, ${val})` }}
                />
                <span className="text-white text-[11px] font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#FF00B4] text-black font-semibold font-mono text-xs hover:opacity-95 shadow-lg shadow-[#00F0FF]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {loading ? (
            <span>Generating Quantum Circuit...</span>
          ) : (
            <span>Synthesize Circuit into Composer</span>
          )}
        </button>
      </div>
    </div>
  );
};

