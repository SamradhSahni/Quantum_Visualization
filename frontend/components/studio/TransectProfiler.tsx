"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { MethodCardData } from "@/components/studio/UnifiedComparisonMatrix";
import { Activity } from "lucide-react";

interface TransectProfilerProps {
  cards: MethodCardData[];
  originalBase64: string | null;
}

interface ScanProfile {
  name: string;
  color: string;
  values: number[];
  peakIdx: number;
  peakVal: number;
  fwhmPx: number;
  psr: number;
}

function sampleScanlineFromBase64(
  b64: string,
  axis: "horizontal" | "vertical",
  sliceIdx: number
): Promise<number[]> {
  return new Promise((resolve) => {
    if (!b64) {
      resolve(Array(128).fill(0));
      return;
    }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext("2d");
      if (!ctx) {
        resolve(Array(128).fill(0));
        return;
      }
      ctx.drawImage(img, 0, 0, 128, 128);
      const data = ctx.getImageData(0, 0, 128, 128).data;
      const line: number[] = [];
      const clamped = Math.max(0, Math.min(127, sliceIdx));
      for (let s = 0; s < 128; s++) {
        const px = axis === "horizontal" ? clamped * 128 + s : s * 128 + clamped;
        line.push(data[px * 4] / 255);
      }
      resolve(line);
    };
    img.onerror = () => resolve(Array(128).fill(0));
    img.src = b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`;
  });
}

function computeLineMetrics(values: number[]): { peakIdx: number; peakVal: number; fwhmPx: number; psr: number } {
  let peakIdx = 0;
  let peakVal = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > peakVal) {
      peakVal = values[i];
      peakIdx = i;
    }
  }
  if (peakVal <= 0.01) {
    return { peakIdx: 0, peakVal: 0, fwhmPx: 0, psr: 1.0 };
  }
  const half = peakVal * 0.5;
  let left = peakIdx;
  while (left > 0 && values[left - 1] >= half) left--;
  let right = peakIdx;
  while (right < values.length - 1 && values[right + 1] >= half) right++;
  const fwhmPx = right - left + 1;

  // Sidelobe = mean outside +/- 4 px window around peak
  const bg: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (Math.abs(i - peakIdx) > 4) bg.push(values[i]);
  }
  const bgMean = bg.length > 0 ? bg.reduce((a, b) => a + b, 0) / bg.length : 0.01;
  const psr = peakVal / Math.max(0.01, bgMean);

  return { peakIdx, peakVal, fwhmPx, psr };
}

export const TransectProfiler: React.FC<TransectProfilerProps> = ({
  cards,
  originalBase64,
}) => {
  const [axis, setAxis] = useState<"horizontal" | "vertical">("horizontal");
  const [sliceIdx, setSliceIdx] = useState<number>(64);
  const [intensityLine, setIntensityLine] = useState<number[]>(Array(128).fill(0));
  const [profiles, setProfiles] = useState<ScanProfile[]>([]);
  const [hiddenMethods, setHiddenMethods] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (cards.length === 0) return;
    let cancelled = false;

    const runSample = async () => {
      const [rawLine, methodLines] = await Promise.all([
        originalBase64
          ? sampleScanlineFromBase64(originalBase64, axis, sliceIdx)
          : Promise.resolve(Array(128).fill(0)),
        Promise.all(
          cards.map((c) => sampleScanlineFromBase64(c.edge_base64, axis, sliceIdx))
        ),
      ]);
      if (cancelled) return;
      setIntensityLine(rawLine);
      setProfiles(
        cards.map((c, idx) => {
          const vals = methodLines[idx] ?? Array(128).fill(0);
          return {
            name: c.name,
            color: c.color_hex,
            values: vals,
            ...computeLineMetrics(vals),
          };
        })
      );
    };

    runSample();
    return () => {
      cancelled = true;
    };
  }, [cards, originalBase64, axis, sliceIdx]);

  if (cards.length === 0) return null;

  const refPeakIdx = profiles[0]?.peakIdx ?? 64;

  return (
    <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#00F0FF]" />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("1D Spatial Transect Cross Section Profiler (FWHM & Peak Localization)")}
            </h3>
            <Badge label="60 FPS Waveform" variant="cyan" size="xs" />
          </div>
          <p className="text-xs text-[#9B9B9B] mt-0.5">
            {formatDisplayCopy(
              "Sweep a 1D scanline across crater rims to compare peak localization sharpness, ridge thickness (FWHM), and background noise floor."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex p-0.5 rounded-lg bg-[#181818] border border-[#313131]">
            <button
              onClick={() => setAxis("horizontal")}
              className={`px-3 py-1 rounded ${
                axis === "horizontal" ? "bg-white text-black font-bold" : "text-[#9B9B9B]"
              }`}
            >
              {formatDisplayCopy("Horizontal Row")}
            </button>
            <button
              onClick={() => setAxis("vertical")}
              className={`px-3 py-1 rounded ${
                axis === "vertical" ? "bg-white text-black font-bold" : "text-[#9B9B9B]"
              }`}
            >
              {formatDisplayCopy("Vertical Col")}
            </button>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-[#313131] text-[#00F0FF]">
            {axis === "horizontal" ? `Y = ${sliceIdx}` : `X = ${sliceIdx}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 3 Cols: Mini Input Locator */}
        <div className="lg:col-span-3 space-y-2.5">
          <div
            className="relative aspect-square rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#313131] cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const coord =
                axis === "horizontal"
                  ? Math.round(((e.clientY - rect.top) / rect.height) * 127)
                  : Math.round(((e.clientX - rect.left) / rect.width) * 127);
              setSliceIdx(Math.max(0, Math.min(127, coord)));
            }}
          >
            {originalBase64 && (
              <img
                src={originalBase64.startsWith("data:") ? originalBase64 : `data:image/png;base64,${originalBase64}`}
                alt="Transect Target"
                className="w-full h-full object-cover opacity-80"
              />
            )}
            {axis === "horizontal" ? (
              <div
                className="absolute left-0 right-0 h-[2px] bg-[#00F0FF] pointer-events-none"
                style={{ top: `${(sliceIdx / 127) * 100}%` }}
              />
            ) : (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#00F0FF] pointer-events-none"
                style={{ left: `${(sliceIdx / 127) * 100}%` }}
              />
            )}
          </div>
          <input
            type="range"
            min="0"
            max="127"
            value={sliceIdx}
            onChange={(e) => setSliceIdx(parseInt(e.target.value, 10))}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
        </div>

        {/* Right 9 Cols: Multi-Series SVG Scanline Waveform */}
        <div className="lg:col-span-9 space-y-3">
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {profiles.map((p) => {
              const hidden = !!hiddenMethods[p.name];
              return (
                <button
                  key={p.name}
                  onClick={() =>
                    setHiddenMethods({ ...hiddenMethods, [p.name]: !hidden })
                  }
                  style={{
                    borderColor: hidden ? "#313131" : p.color,
                    opacity: hidden ? 0.4 : 1,
                  }}
                  className="px-2.5 py-1 rounded border bg-[#181818] flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white">{formatDisplayCopy(p.name)}</span>
                </button>
              );
            })}
          </div>

          <svg viewBox="0 0 640 200" className="w-full h-52 bg-[#0A0A0A] rounded-xl border border-[#313131]">
            {/* Grid Lines */}
            {[0.25, 0.5, 0.75].map((yVal) => (
              <line
                key={yVal}
                x1="36"
                y1={180 - yVal * 155}
                x2="625"
                y2={180 - yVal * 155}
                stroke="#1F1F1F"
                strokeDasharray="3,3"
              />
            ))}
            <line x1="36" y1="180" x2="625" y2="180" stroke="#313131" />
            <line x1="36" y1="18" x2="36" y2="180" stroke="#313131" />

            {/* Background Gray Luminance Profile (I(s)) */}
            <polyline
              fill="none"
              stroke="#555555"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              points={intensityLine
                .map((v, i) => {
                  const x = 36 + (i / 127) * 585;
                  const y = 180 - v * 155;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ")}
            />

            {/* 6 Edge Curves */}
            {profiles.map((p) => {
              if (hiddenMethods[p.name]) return null;
              return (
                <polyline
                  key={p.name}
                  fill="none"
                  stroke={p.color}
                  strokeWidth="2"
                  points={p.values
                    .map((v, i) => {
                      const x = 36 + (i / 127) * 585;
                      const y = 180 - v * 155;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ")}
                />
              );
            })}
            <text x="42" y="28" fill="#737373" fontSize="9" fontFamily="monospace">
              {formatDisplayCopy("Dashed Gray: Raw Intensity I(s) · Solid Lines: Edge Confidence Responses")}
            </text>
          </svg>

          {/* Compact FWHM & PSR Readout Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-mono">
            {profiles.map((p) => (
              <div key={p.name} className="p-2 rounded-lg bg-[#181818] border border-[#313131]">
                <span className="font-semibold block truncate" style={{ color: p.color }}>
                  {formatDisplayCopy(p.name)}
                </span>
                <span className="text-white block">FWHM: {p.fwhmPx} px</span>
                <span className="text-[#9B9B9B] block">
                  PSR: {p.psr.toFixed(1)}× · Δs: {p.peakIdx - refPeakIdx}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

