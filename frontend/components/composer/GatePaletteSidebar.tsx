'use client';

import React, { useState } from 'react';

interface GatePaletteSidebarProps {
  selectedGate: string | null;
  onSelectGate: (gate: string) => void;
  gateParams: number[];
  onChangeParams: (params: number[]) => void;
}

export const GatePaletteSidebar: React.FC<GatePaletteSidebarProps> = ({
  selectedGate,
  onSelectGate,
  gateParams,
  onChangeParams
}) => {
  const [sliderAngle, setSliderAngle] = useState<number>(gateParams[0] ?? Math.PI / 2);

  const handleAngleChange = (rad: number) => {
    setSliderAngle(rad);
    onChangeParams([rad]);
  };

  const isParametric = selectedGate === "RX" || selectedGate === "RY" || selectedGate === "RZ" || selectedGate === "P";

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
          Quantum Gate Palette
        </h3>
        <span className="text-[10px] font-mono text-[#9B9B9B]">Click to equip</span>
      </div>

      {/* 1. Single Qubit Pauli & Clifford */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-[#9B9B9B] block">Single Qubit Gates</span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "H", name: "H", color: "bg-[#30D158] text-black" },
            { id: "X", name: "X", color: "bg-[#FF00B4] text-white" },
            { id: "Y", name: "Y", color: "bg-[#BD93F9] text-black" },
            { id: "Z", name: "Z", color: "bg-[#00F0FF] text-black" },
            { id: "S", name: "S", color: "bg-[#2A2A2A] text-white border border-[#3E3E3E]" },
            { id: "SDG", name: "S†", color: "bg-[#2A2A2A] text-white border border-[#3E3E3E]" },
            { id: "T", name: "T", color: "bg-[#2A2A2A] text-white border border-[#3E3E3E]" },
            { id: "SX", name: "SX", color: "bg-[#2A2A2A] text-white border border-[#3E3E3E]" }
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => onSelectGate(g.id)}
              className={`h-9 rounded-lg font-mono text-xs font-bold transition-all ${g.color} ${
                selectedGate === g.id ? "ring-2 ring-white scale-105 shadow-lg" : "hover:opacity-90"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Parametric Rotations */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-[#9B9B9B] block">Parametric Rotations</span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "RY", name: "Ry(θ)", desc: "FRQI Color" },
            { id: "RX", name: "Rx(θ)", desc: "X Rotation" },
            { id: "RZ", name: "Rz(φ)", desc: "Phase" },
            { id: "P", name: "P(λ)", desc: "Phase Shift" }
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => onSelectGate(g.id)}
              className={`h-9 rounded-lg font-mono text-xs font-bold transition-all bg-[#FFD700] text-black ${
                selectedGate === g.id ? "ring-2 ring-white scale-105 shadow-lg" : "hover:opacity-90"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Angle Slider if parametric gate is active */}
        {isParametric && (
          <div className="p-2.5 bg-[#1F1F1F] rounded-xl border border-[#313131] space-y-2 mt-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#9B9B9B]">Angle (θ / λ):</span>
              <span className="text-[#FFD700] font-bold">
                {(sliderAngle / Math.PI).toFixed(2)}π ({((sliderAngle * 180) / Math.PI).toFixed(0)}°)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2 * Math.PI}
              step={Math.PI / 16}
              value={sliderAngle}
              onChange={(e) => handleAngleChange(parseFloat(e.target.value))}
              className="w-full accent-[#FFD700] h-1.5 bg-[#2B2B2B] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#777]">
              <button onClick={() => handleAngleChange(Math.PI / 4)} className="hover:text-white">π/4</button>
              <button onClick={() => handleAngleChange(Math.PI / 2)} className="hover:text-white">π/2</button>
              <button onClick={() => handleAngleChange(Math.PI)} className="hover:text-white">π</button>
              <button onClick={() => handleAngleChange(2 * Math.PI)} className="hover:text-white">2π</button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Multi-Qubit Controlled Gates */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-[#9B9B9B] block">Multi Qubit Gates</span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "CX", name: "CX (CNOT)" },
            { id: "CZ", name: "CZ" },
            { id: "CRY", name: "CRy(θ)" },
            { id: "SWAP", name: "SWAP" },
            { id: "CCX", name: "CCX (Toffoli)" },
            { id: "CP", name: "CP(λ)" }
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => onSelectGate(g.id)}
              className={`h-9 px-1 rounded-lg font-mono text-[11px] font-bold transition-all bg-[#262626] text-white border border-[#3E3E3E] ${
                selectedGate === g.id ? "ring-2 ring-[#00F0FF] bg-[#333] shadow-lg" : "hover:bg-[#2C2C2C]"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. QIP & Vision Macros */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-mono text-[#9B9B9B] block">QIP & Vision Macros</span>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "D_SHIFT", name: "D Shift (QHED)", desc: "Cyclic Decrement" },
            { id: "QFT", name: "QFT", desc: "Fourier Transform" },
            { id: "M", name: "Measure [M]", desc: "Z Basis Measurement" },
            { id: "I", name: "Identity [I]", desc: "No Operation" }
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => onSelectGate(g.id)}
              className={`h-9 px-2 rounded-lg font-mono text-xs font-semibold transition-all bg-[#1F1F1F] text-[#00F0FF] border border-[#313131] ${
                selectedGate === g.id ? "ring-2 ring-[#00F0FF] bg-[#2A2A2A] shadow-lg" : "hover:bg-[#252525]"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

