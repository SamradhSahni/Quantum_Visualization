'use client';

import React from 'react';
import { GateInstance, CircuitStep } from './engine/tensorSimulator';
import { Plus, Trash2, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';

interface CircuitGridCanvasProps {
  numQubits: number;
  initialStates: string[];
  onToggleInitialState: (qubit: number) => void;
  steps: CircuitStep[];
  activeStep: number;
  onSelectStep: (step: number) => void;
  onAddGate: (stepIndex: number, gate: GateInstance) => void;
  onRemoveGate: (stepIndex: number, gateId: string) => void;
  onAddColumn: () => void;
  onRemoveColumn: (stepIndex: number) => void;
  onClearCircuit: () => void;
  selectedGateFromPalette: string | null;
  selectedGateParams: number[];
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const CircuitGridCanvas: React.FC<CircuitGridCanvasProps> = ({
  numQubits,
  initialStates,
  onToggleInitialState,
  steps,
  activeStep,
  onSelectStep,
  onAddGate,
  onRemoveGate,
  onAddColumn,
  onRemoveColumn,
  onClearCircuit,
  selectedGateFromPalette,
  selectedGateParams,
  isPlaying,
  onTogglePlay
}) => {
  const n = numQubits;

  // Handle clicking on a wire slot
  const handleSlotClick = (stepIndex: number, qubit: number) => {
    if (!selectedGateFromPalette) return;

    const gateName = selectedGateFromPalette.toUpperCase();
    let targets = [qubit];
    let controls: number[] = [];

    // Automatically assign controls for common multi-qubit gates
    if (gateName === "CX" || gateName === "CY" || gateName === "CZ" || gateName === "CRY" || gateName === "CP") {
      const defaultControl = qubit > 0 ? qubit - 1 : Math.min(n - 1, qubit + 1);
      controls = [defaultControl];
    } else if (gateName === "CCX") {
      const c1 = qubit > 0 ? qubit - 1 : 1;
      const c2 = qubit > 1 ? qubit - 2 : Math.min(n - 1, qubit + 1);
      controls = [c1, c2];
    } else if (gateName === "SWAP") {
      const partner = qubit < n - 1 ? qubit + 1 : qubit - 1;
      targets = [qubit, partner];
    }

    const newGate: GateInstance = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      gate: gateName,
      targets,
      controls,
      params: selectedGateParams
    };

    onAddGate(stepIndex, newGate);
  };

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl select-none">
      {/* Top Header: Step Scrubber & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2B2B]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-wider font-semibold">
            Laser Timeline Scrubber
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#272727] text-white text-xs font-mono border border-[#3A3A3A]">
            Step {activeStep} / {steps.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1F1F1F] p-1 rounded-xl border border-[#313131]">
          <button
            onClick={() => onSelectStep(0)}
            className="p-1.5 rounded-lg text-[#9B9B9B] hover:text-white hover:bg-[#2A2A2A] transition-all"
            title="Step 0 (Initial State)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectStep(Math.max(0, activeStep - 1))}
            className="p-1.5 rounded-lg text-[#9B9B9B] hover:text-white hover:bg-[#2A2A2A] transition-all"
            title="Previous Step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? "bg-[#FF00B4] text-white shadow-md shadow-[#FF00B4]/30"
                : "bg-[#00F0FF] text-black hover:opacity-90 shadow-md shadow-[#00F0FF]/30"
            }`}
          >
            <Play className={`w-3 h-3 ${isPlaying ? "animate-pulse" : ""}`} />
            <span>{isPlaying ? "Pause" : "Play Auto"}</span>
          </button>
          <button
            onClick={() => onSelectStep(Math.min(steps.length, activeStep + 1))}
            className="p-1.5 rounded-lg text-[#9B9B9B] hover:text-white hover:bg-[#2A2A2A] transition-all"
            title="Next Step"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddColumn}
            className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2A2A2A] text-xs font-mono text-white border border-[#3A3A3A] flex items-center gap-1 transition-all"
          >
            <Plus className="w-3 h-3 text-[#30D158]" />
            <span>Add Step</span>
          </button>
          <button
            onClick={onClearCircuit}
            className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2A2A2A] text-xs font-mono text-[#FF453A] border border-[#3A3A3A] flex items-center gap-1 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Grid</span>
          </button>
        </div>
      </div>

      {/* Main Quantum Circuit Grid Canvas */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px] flex flex-col space-y-3 relative">
          {/* Wire rows */}
          {Array.from({ length: n }).map((_, qIdx) => {
            const wireLabel = `q${qIdx}`;
            const initState = initialStates[qIdx] || "|0>";

            return (
              <div key={qIdx} className="flex items-center space-x-2 relative group">
                {/* Wire Header: Name & Ground State Selector */}
                <div className="w-24 flex items-center justify-between bg-[#1F1F1F] px-2 py-1.5 rounded-lg border border-[#313131] shrink-0">
                  <span className="text-xs font-mono font-semibold text-white">{wireLabel}</span>
                  <button
                    onClick={() => onToggleInitialState(qIdx)}
                    className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#2B2B2B] text-[#00F0FF] hover:bg-[#333] border border-[#3A3A3A] transition-all"
                    title="Click to toggle initial state (|0>, |1>, |+>)"
                  >
                    {initState}
                  </button>
                </div>

                {/* Horizontal Quantum Wire Line */}
                <div className="flex-1 relative flex items-center space-x-4 h-12 bg-[#141414] rounded-xl px-3 border border-[#272727]">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#2E2E2E] group-hover:bg-[#3D3D3D] transition-colors" />

                  {/* Time Columns for this Wire */}
                  {steps.map((step) => {
                    const stepIdx = step.stepIndex;
                    const isActive = activeStep === stepIdx;

                    // Find gate acting on this qubit at this step
                    const gateOnWire = step.gates.find(
                      (g) => g.targets.includes(qIdx) || g.controls.includes(qIdx)
                    );

                    const isTarget = gateOnWire && gateOnWire.targets.includes(qIdx);
                    const isControl = gateOnWire && gateOnWire.controls.includes(qIdx);
                    const isAntiControl = gateOnWire?.antiControls?.includes(qIdx);

                    return (
                      <div
                        key={stepIdx}
                        onClick={() => {
                          onSelectStep(stepIdx);
                          if (!gateOnWire) handleSlotClick(stepIdx, qIdx);
                        }}
                        className={`relative z-10 w-11 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                          isActive
                            ? "ring-2 ring-[#00F0FF] bg-[#1F1F1F]"
                            : "hover:bg-[#242424]"
                        }`}
                      >
                        {gateOnWire ? (
                          <div
                            className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-mono font-bold shadow-md transition-all ${
                              isTarget
                                ? gateOnWire.gate === "H"
                                  ? "bg-[#30D158] text-black"
                                  : gateOnWire.gate === "X"
                                  ? "bg-[#FF00B4] text-white"
                                  : gateOnWire.gate === "RY" || gateOnWire.gate === "RX" || gateOnWire.gate === "P"
                                  ? "bg-[#FFD700] text-black"
                                  : "bg-[#00F0FF] text-black"
                                : isControl
                                ? "bg-transparent text-white"
                                : isAntiControl
                                ? "bg-transparent text-white"
                                : "bg-[#2A2A2A] text-white"
                            }`}
                            title={`${gateOnWire.gate} on ${wireLabel}`}
                          >
                            {isTarget ? (
                              <span>
                                {gateOnWire.gate}
                                {gateOnWire.params && gateOnWire.params.length > 0 && (
                                  <span className="text-[9px] block">
                                    {(gateOnWire.params[0] / Math.PI).toFixed(2)}π
                                  </span>
                                )}
                              </span>
                            ) : isControl ? (
                              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-glow" />
                            ) : isAntiControl ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-white bg-transparent" />
                            ) : null}

                            {/* Quick remove button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveGate(stepIdx, gateOnWire.id);
                              }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF453A] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#2A2A2A] hover:bg-[#00F0FF] transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

