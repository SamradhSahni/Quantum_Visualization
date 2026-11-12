'use client';

import React, { useState } from 'react';
import { Radio, Zap, ShieldCheck, Activity, Sliders } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

export const OpenPulseOscilloscope: React.FC = () => {
  const [pixelIntensity, setPixelIntensity] = useState<number>(218);
  
  // Normalized rotation angle theta = (I / 255) * (pi / 2)
  const thetaRad = (pixelIntensity / 255.0) * (Math.PI / 2.0);
  const amplitude = Number((0.15 + (pixelIntensity / 255.0) * 0.75).toFixed(2));
  
  // Sample points for Gaussian I(t) and DRAG Q(t) derivative
  const numSamples = 24;
  const waveformSamples = Array.from({ length: numSamples }, (_, i) => {
    const t = (i / (numSamples - 1)) * 40.0; // 0 to 40 ns
    const tMid = 20.0;
    const sigma = 8.0;
    const rawGauss = Math.exp(-((t - tMid) ** 2) / (2.0 * (sigma ** 2)));
    const iVal = amplitude * rawGauss;
    const qVal = amplitude * 0.35 * (- (t - tMid) / (sigma ** 2)) * rawGauss * 4.0;
    return { t: Math.round(t), iVal: Number(iVal.toFixed(3)), qVal: Number(qVal.toFixed(3)) };
  });

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#00F0FF]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy('OpenPulse Transmon Microwave Oscilloscope')}
            </h3>
            <span className="text-xs font-mono text-[#888888]">
              {formatDisplayCopy('Gaussian DRAG & Echoed Cross Resonance (ECR) Waveforms')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-[#1F1F1F] border border-[#313131] text-[#39D353] px-2.5 py-1 rounded-lg flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {formatDisplayCopy('DRAG Orthogonality Verified')}
          </span>
          <span className="text-xs font-mono text-[#00F0FF] bg-[#1F1F1F] border border-[#313131] px-2.5 py-1 rounded-lg">
            Schedule: 840 ns (0.47% T1)
          </span>
        </div>
      </div>

      {/* Interactive Intensity Slider */}
      <div className="bg-[#1F1F1F] border border-[#313131] rounded-xl p-4 mb-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white font-medium flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
            {formatDisplayCopy('Inspected Pixel Intensity (Ii in 0 to 255)')}
          </span>
          <span className="font-mono text-[#00F0FF] font-bold">
            {pixelIntensity} (Pulse Amp: {amplitude})
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          value={pixelIntensity}
          onChange={(e) => setPixelIntensity(parseInt(e.target.value))}
          className="w-full accent-[#00F0FF] bg-[#272727] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#666666] font-mono">
          <span>{formatDisplayCopy('Minimum Rotation (0 rad)')}</span>
          <span>{formatDisplayCopy('Color Gate: Ry(')}{Number((2 * thetaRad).toFixed(3))}{formatDisplayCopy(' rad)')}</span>
          <span>{formatDisplayCopy('Maximum Rotation (pi/2 rad)')}</span>
        </div>
      </div>

      {/* Synchronized Microwave Channels Timeline */}
      <div className="space-y-3 bg-[#121212] border border-[#2B2B2B] rounded-xl p-4">
        {/* Channel 1: Drive D6 */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF]"></span>
              Drive D6 (|c⟩ Color Qubit, 5.12 GHz) - Ry(2θ) Gate
            </span>
            <span className="text-[10px] text-[#888888]">In Phase I(t) & DRAG Q(t)</span>
          </div>
          <div className="h-20 w-full bg-[#181818] rounded-lg border border-[#262626] relative overflow-hidden flex items-center px-2">
            <svg className="w-full h-full" viewBox="0 0 240 60" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="240" y2="30" stroke="#313131" strokeDasharray="2,2" />
              {/* In-Phase Gaussian I(t) in Cyan */}
              <path
                d="M 20 30 Q 50 2, 80 30"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2"
              />
              {/* DRAG Quadrature Derivative Q(t) in Magenta */}
              <path
                d="M 20 30 Q 35 15, 50 30 Q 65 45, 80 30"
                fill="none"
                stroke="#FF79C6"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
            </svg>
          </div>
        </div>

        {/* Channel 2: Control U0 */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFD700]"></span>
              Control U0 (Cross Resonance CR tone, 4.98 GHz) - CX(q0, |c⟩)
            </span>
            <span className="text-[10px] text-[#888888]">Echoed Flat Top CR Tone</span>
          </div>
          <div className="h-16 w-full bg-[#181818] rounded-lg border border-[#262626] relative overflow-hidden flex items-center px-2">
            <svg className="w-full h-full" viewBox="0 0 240 50" preserveAspectRatio="none">
              <line x1="0" y1="25" x2="240" y2="25" stroke="#313131" strokeDasharray="2,2" />
              {/* Flat-top CR Envelope */}
              <path
                d="M 80 25 L 90 8 L 170 8 L 180 25"
                fill="none"
                stroke="#FFD700"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Channel 3: Drive D0 */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#39D353]"></span>
              Drive D0 (q0 Position LSB, 4.98 GHz) - Hadamard Gate
            </span>
            <span className="text-[10px] text-[#888888]">Gaussian Boundary Interference</span>
          </div>
          <div className="h-16 w-full bg-[#181818] rounded-lg border border-[#262626] relative overflow-hidden flex items-center px-2">
            <svg className="w-full h-full" viewBox="0 0 240 50" preserveAspectRatio="none">
              <line x1="0" y1="25" x2="240" y2="25" stroke="#313131" strokeDasharray="2,2" />
              <path
                d="M 180 25 Q 200 6, 220 25"
                fill="none"
                stroke="#39D353"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Timeline Axis */}
        <div className="flex justify-between text-[10px] font-mono text-[#666666] pt-1 border-t border-[#222]">
          <span>0 ns (Start)</span>
          <span>280 ns (CR Pulse)</span>
          <span>560 ns (Hadamard)</span>
          <span>840 ns (Readout Measure)</span>
        </div>
      </div>
    </div>
  );
};

