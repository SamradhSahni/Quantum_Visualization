"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { apiFetch } from "@/lib/apiClient";
import { MethodCardData } from "@/components/studio/UnifiedComparisonMatrix";
import { QuantumLabConfig } from "@/components/studio/LiveEdgeParameterLab";
import { Compass, Layers, Radar, ShieldAlert, TrendingDown } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface BenchmarkVisualChartsProps {
  cards: MethodCardData[];
  presetId: string;
  customImageB64: string | null;
  config: QuantumLabConfig;
  nisqScaling?: {
    resolution: number;
    profiles: Array<{
      algorithm: string;
      storage_qubits_patch: number;
      active_qubits_patch: number;
      full_frame_qubits: number;
      cnot_depth_per_tile: number;
      passes_per_tile: number;
      estimated_nisq_fidelity: number;
    }>;
  } | null;
}

export const BenchmarkVisualCharts: React.FC<BenchmarkVisualChartsProps> = ({
  cards,
  presetId,
  customImageB64,
  config,
  nisqScaling,
}) => {
  const [histIdx, setHistIdx] = useState<number>(0);
  const [stageTab, setStageTab] = useState<"canny" | "sobel" | "robinson" | "halo_ab" | "noise_sweep">("canny");
  const [stageLoading, setStageLoading] = useState<boolean>(false);
  const [stageData, setStageData] = useState<Record<string, any>>({});
  const [selectedSector, setSelectedSector] = useState<string>("N");

  const loadTier2Stage = async (target: "canny" | "sobel" | "robinson" | "halo_ab" | "noise_sweep") => {
    setStageTab(target);
    setStageLoading(true);
    try {
      const res = await apiFetch("/api/studio/stage-layers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preset_id: customImageB64 ? null : presetId,
          image_base64: customImageB64,
          resolution: 128,
          target,
          config,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStageData((prev) => ({ ...prev, [target]: data }));
      }
    } catch {
      // Keep UI responsive offline
    }
    setStageLoading(false);
  };

  if (cards.length === 0) return null;

  // 1. Normalize 6 Radar axes in [0.1 .. 1.0]
  const radarAxes = ["Pratt FOM", "Thinness", "SNR", "CNR", "Speed", "Compact Q"];
  const maxLat = Math.max(1, ...cards.map((c) => c.latency_ms || 1));

  const getAxisValues = (c: MethodCardData): number[] => {
    const m: any = c.metrics || {};
    const fom = Math.min(1, Math.max(0.15, m.pfom_exact ?? m.pratt_fom ?? 0.7));
    const thin = Math.min(1, Math.max(0.15, m.thinness_ratio ?? m.thinness ?? 0.6));
    const snr = Math.min(1, Math.max(0.15, (m.snr_db ?? m.snr ?? 10) / 30));
    const cnr = Math.min(1, Math.max(0.15, (m.cnr ?? 2) / 5));
    const spd = Math.min(1, Math.max(0.2, 1 - (c.latency_ms || 1) / (maxLat * 1.15)));
    const qEff = c.type === "classical" ? 0.95 : c.qubits <= 7 ? 0.88 : 0.55;
    return [fom, thin, snr, cnr, spd, qEff];
  };

  const activeHistCard = cards[histIdx] || cards[0];
  const histBins: number[] =
    (activeHistCard.metrics as any)?.histogram_bins ||
    Array.from({ length: 32 }, (_, i) => Math.exp(-i * 0.25) * 0.25);
  const maxBin = Math.max(0.01, ...histBins);

  const curStage = stageData[stageTab];

  return (
    <div className="space-y-6">
      {/* Row 1: 6-Axis Radar Footprint & Edge Confidence Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart (6 Cols) */}
        <Card surface="card" outerRadius={16} className="lg:col-span-6 p-5 border border-[#313131] space-y-4">
          <div className="flex items-center justify-between border-b border-[#313131] pb-3">
            <div className="flex items-center gap-2">
              <Radar size={16} className="text-[#FF79C6]" />
              <h4 className="text-sm font-semibold text-white">
                {formatDisplayCopy("6 Axis Performance Footprint Across All Techniques")}
              </h4>
            </div>
            <Badge label="Multi Metric Radar" variant="magenta" size="xs" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <svg viewBox="0 0 240 240" className="w-56 h-56 flex-shrink-0 bg-[#0A0A0A] rounded-xl border border-[#313131]">
              {[0.25, 0.5, 0.75, 1.0].map((rFrac) => (
                <polygon
                  key={rFrac}
                  fill="none"
                  stroke="#272727"
                  strokeWidth="1"
                  points={radarAxes
                    .map((_, i) => {
                      const ang = (i * 60 * Math.PI) / 180 - Math.PI / 2;
                      return `${(120 + Math.cos(ang) * 82 * rFrac).toFixed(1)},${(120 + Math.sin(ang) * 82 * rFrac).toFixed(1)}`;
                    })
                    .join(" ")}
                />
              ))}
              {radarAxes.map((ax, i) => {
                const ang = (i * 60 * Math.PI) / 180 - Math.PI / 2;
                return (
                  <g key={ax}>
                    <line
                      x1="120"
                      y1="120"
                      x2={120 + Math.cos(ang) * 82}
                      y2={120 + Math.sin(ang) * 82}
                      stroke="#272727"
                    />
                    <text
                      x={120 + Math.cos(ang) * 98}
                      y={123 + Math.sin(ang) * 98}
                      textAnchor="middle"
                      fill="#9B9B9B"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      {ax}
                    </text>
                  </g>
                );
              })}

              {cards.map((c) => {
                const vals = getAxisValues(c);
                return (
                  <polygon
                    key={c.name}
                    fill={c.color_hex}
                    fillOpacity="0.10"
                    stroke={c.color_hex}
                    strokeWidth="2"
                    points={vals
                      .map((v, i) => {
                        const ang = (i * 60 * Math.PI) / 180 - Math.PI / 2;
                        const rad = v * 82;
                        return `${(120 + Math.cos(ang) * rad).toFixed(1)},${(120 + Math.sin(ang) * rad).toFixed(1)}`;
                      })
                      .join(" ")}
                  />
                );
              })}
            </svg>

            <div className="space-y-2 text-xs font-mono flex-1 w-full">
              {cards.map((c) => (
                <div
                  key={c.name}
                  className="p-2 rounded-lg bg-[#181818] border border-[#313131] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 font-semibold" style={{ color: c.color_hex }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color_hex }} />
                    {formatDisplayCopy(c.name)}
                  </span>
                  <span className="text-[#9B9B9B]">
                    FOM: {((c.metrics as any).pfom_exact ?? c.metrics.pratt_fom ?? 0.8).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Confidence Distribution Histogram + Otsu / Rosin Threshold Marker (6 Cols) */}
        <Card surface="card" outerRadius={16} className="lg:col-span-6 p-5 border border-[#313131] space-y-4">
          <div className="flex items-center justify-between border-b border-[#313131] pb-3">
            <h4 className="text-sm font-semibold text-white">
              {formatDisplayCopy("Edge Confidence Density Histogram & Threshold Cutoff")}
            </h4>
            <select
              value={histIdx}
              onChange={(e) => setHistIdx(parseInt(e.target.value, 10))}
              className="px-2 py-1 rounded bg-[#181818] border border-[#313131] text-xs font-mono text-white"
            >
              {cards.map((c, i) => (
                <option key={c.name} value={i}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative h-48 bg-[#0A0A0A] rounded-xl border border-[#313131] p-3 flex items-end gap-[2px]">
            {histBins.map((val, bIdx) => {
              const hPct = Math.max(2, (val / maxBin) * 100);
              const binPos = (bIdx + 0.5) / histBins.length;
              const isAbove = binPos >= (activeHistCard.threshold ?? 0.25);
              return (
                <div
                  key={bIdx}
                  title={`Bin ${binPos.toFixed(2)}: ${(val * 100).toFixed(1)}%`}
                  style={{
                    height: `${hPct}%`,
                    backgroundColor: isAbove ? activeHistCard.color_hex : "#3A3A3A",
                  }}
                  className="flex-1 rounded-t-[1px]"
                />
              );
            })}
            {/* Threshold dashed marker */}
            <div
              className="absolute top-2 bottom-2 border-l-2 border-dashed border-[#FFE600] pointer-events-none"
              style={{ left: `${Math.min(96, Math.max(4, (activeHistCard.threshold ?? 0.25) * 100))}%` }}
            >
              <span className="bg-[#FFE600] text-black text-[9px] font-mono font-bold px-1 rounded ml-1">
                τ = {(activeHistCard.threshold ?? 0.25).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-xs font-mono text-[#9B9B9B]">
            <span>{formatDisplayCopy("Gray Floor (0.00)")}</span>
            <span className="text-[#00F0FF]">
              {formatDisplayCopy("Highlighted Bars Classified as Detected Rim Pixels")}
            </span>
            <span>{formatDisplayCopy("Max Contrast (1.00)")}</span>
          </div>
        </Card>
      </div>

      {/* Row 2: Tier-2 On-Demand Classical & Quantum Stage Dissector Lab */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#00F0FF]" />
              <h3 className="text-base font-semibold text-white">
                {formatDisplayCopy("Deep Stage Dissector: Classical Pipeline Internals, Halo Seams & Noise Stress")}
              </h3>
            </div>
            <p className="text-xs text-[#9B9B9B] mt-0.5">
              {formatDisplayCopy(
                "Lazy Tier 2 evaluation: click any diagnostic tab to stream exact internal filter maps, compass roses, and noise degradation curves."
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {(
              [
                ["canny", "Canny 5 Stages"],
                ["sobel", "Sobel Gx / Gy / Angle"],
                ["robinson", "Robinson 8 Compass"],
                ["halo_ab", "Halo Seam A/B"],
                ["noise_sweep", "Noise Stress Curve"],
              ] as const
            ).map(([tKey, tLabel]) => (
              <Button
                key={tKey}
                variant={stageTab === tKey ? "accent" : "secondary"}
                size="sm"
                onClick={() => loadTier2Stage(tKey)}
              >
                {formatDisplayCopy(tLabel)}
              </Button>
            ))}
          </div>
        </div>

        {!curStage ? (
          <div className="p-8 rounded-xl bg-[#181818] border border-[#313131] text-center space-y-3">
            <p className="text-xs font-mono text-[#9B9B9B]">
              {stageLoading
                ? formatDisplayCopy("Generating high resolution internal stage layers from FastAPI backend...")
                : formatDisplayCopy("Click below to inspect the active diagnostic layer cleanly on demand (zero bloat in initial payload).")}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => loadTier2Stage(stageTab)}
              disabled={stageLoading}
            >
              {stageLoading ? formatDisplayCopy("Loading Stage Data...") : formatDisplayCopy("Inspect Selected Dissector Layer")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Canny 5 Stage Scrubber */}
            {stageTab === "canny" && curStage.stages && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3 text-xs font-mono">
                  <Badge label={`Strong Pixels: ${curStage.counts?.strong_pixels}`} variant="cyan" size="xs" />
                  <Badge label={`Weak Candidates: ${curStage.counts?.weak_pixels}`} variant="classical" size="xs" />
                  <Badge label={`Hysteresis Final: ${curStage.counts?.rescued_total}`} variant="success" size="xs" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    ["1. Gaussian Smooth", curStage.stages.stage1_smoothed],
                    ["2. Gradient & Mag", curStage.stages.stage2_gradient],
                    ["3. NMS Thinning", curStage.stages.stage3_nms],
                    ["4. Double Thresh", curStage.stages.stage4_double_thresh_rgb],
                    ["5. Final Hysteresis", curStage.stages.stage5_hysteresis],
                  ].map(([title, src]) => (
                    <div key={title as string} className="p-2.5 rounded-xl bg-[#181818] border border-[#313131] space-y-1.5">
                      <span className="text-[11px] font-mono text-white font-semibold block">
                        {formatDisplayCopy(title as string)}
                      </span>
                      <img src={src as string} alt={title as string} className="w-full aspect-square rounded-lg object-cover border border-[#272727]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sobel Split */}
            {stageTab === "sobel" && curStage.stages && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  ["Vertical Edges |Gx|", curStage.stages.gx_abs],
                  ["Horizontal Edges |Gy|", curStage.stages.gy_abs],
                  ["Euclidean Magnitude G", curStage.stages.magnitude],
                  ["HSV Orientation Wheel", curStage.stages.orientation_rgb],
                ].map(([title, src]) => (
                  <div key={title as string} className="p-3 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
                    <span className="text-xs font-mono text-[#38BDF8] font-semibold block">
                      {formatDisplayCopy(title as string)}
                    </span>
                    <img src={src as string} alt={title as string} className="w-full aspect-square rounded-lg object-cover border border-[#272727]" />
                  </div>
                ))}
              </div>
            )}

            {/* Robinson 8 Compass Rose */}
            {stageTab === "robinson" && curStage.sector_maps && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-4 space-y-3">
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                    {(curStage.sector_names || []).map((dir: string) => (
                      <button
                        key={dir}
                        onClick={() => setSelectedSector(dir)}
                        className={`py-1.5 rounded border ${
                          selectedSector === dir
                            ? "bg-[#39D353] text-black border-[#39D353] font-bold"
                            : "bg-[#181818] text-[#9B9B9B] border-[#313131]"
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-[#181818] border border-[#313131] text-xs font-mono space-y-1">
                    <span className="text-[#39D353] font-bold block">
                      {formatDisplayCopy(`Sector ${selectedSector} Directional Energy`)}
                    </span>
                    <span className="text-white block">
                      Energy: {curStage.sector_energies?.[selectedSector]}
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-4 p-3 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
                  <span className="text-xs font-mono text-white block">
                    {formatDisplayCopy(`Isolated ${selectedSector} Compass Mask`)}
                  </span>
                  <img
                    src={curStage.sector_maps[selectedSector]}
                    alt={selectedSector}
                    className="w-full aspect-square rounded-lg object-cover border border-[#272727]"
                  />
                </div>
                <div className="lg:col-span-4 p-3 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
                  <span className="text-xs font-mono text-[#00F0FF] block">
                    {formatDisplayCopy("Winning Solar Azimuth Aspect Map")}
                  </span>
                  <img
                    src={curStage.azimuth_rgb}
                    alt="Robinson Azimuth"
                    className="w-full aspect-square rounded-lg object-cover border border-[#272727]"
                  />
                </div>
              </div>
            )}

            {/* Halo ON vs OFF Seam Analyzer */}
            {stageTab === "halo_ab" && curStage.halo_on_base64 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE600]">
                  <ShieldAlert size={14} />
                  <span>Max Wrap Around Checkerboard Seam Error Measured: {curStage.max_seam_error}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    ["Halo Padding ON (6×6 Core Discard)", curStage.halo_on_base64],
                    ["Halo Padding OFF (Naive 8×8 Wrap)", curStage.halo_off_base64],
                    ["Amplified Cyclic Seam Artifact |Δ|", curStage.seam_diff_base64],
                  ].map(([title, src]) => (
                    <div key={title as string} className="p-3 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
                      <span className="text-xs font-mono text-white font-semibold block">
                        {formatDisplayCopy(title as string)}
                      </span>
                      <img src={src as string} alt={title as string} className="w-full aspect-square rounded-lg object-cover border border-[#272727]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Noise Stress Curve */}
            {stageTab === "noise_sweep" && curStage.series && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <TrendingDown size={14} className="text-[#FF79C6]" />
                    {formatDisplayCopy(`Degradation Curve Under σ = 0..25 Noise (${curStage.metric_label})`)}
                  </span>
                </div>
                <svg viewBox="0 0 600 180" className="w-full h-48 bg-[#0A0A0A] rounded-xl border border-[#313131]">
                  {[0.25, 0.5, 0.75, 1.0].map((v) => (
                    <line
                      key={v}
                      x1="40"
                      y1={160 - v * 135}
                      x2="580"
                      y2={160 - v * 135}
                      stroke="#1F1F1F"
                      strokeDasharray="3,3"
                    />
                  ))}
                  {cards.map((c) => {
                    const pts: any[] = curStage.series[c.name] || [];
                    return (
                      <polyline
                        key={c.name}
                        fill="none"
                        stroke={c.color_hex}
                        strokeWidth="2.2"
                        points={pts
                          .map((pt, i) => {
                            const x = 40 + (i / Math.max(1, pts.length - 1)) * 535;
                            const y = 160 - Math.min(1, Math.max(0, pt.score)) * 135;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(" ")}
                      />
                    );
                  })}
                  <text x="45" y="20" fill="#9B9B9B" fontSize="9" fontFamily="monospace">
                    σ = 0 ────────────────────────────────────────────── σ = 25
                  </text>
                </svg>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Row 3: NISQ Hardware Resource & Decoherence Fidelity Matrix */}
      {nisqScaling && (
        <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-3 overflow-x-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#313131]">
            <h4 className="text-sm font-semibold text-white">
              {formatDisplayCopy(`NISQ Qubit Width & Decoherence Fidelity Model (${nisqScaling.resolution}×${nisqScaling.resolution})`)}
            </h4>
            <Badge label="Gate Err 0.001" variant="purple" size="xs" />
          </div>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#181818] text-[#9B9B9B] uppercase border-b border-[#313131]">
              <tr>
                <th className="py-2.5 px-3">{formatDisplayCopy("Quantum Architecture")}</th>
                <th className="py-2.5 px-3">{formatDisplayCopy("Patch Storage Qubits")}</th>
                <th className="py-2.5 px-3">{formatDisplayCopy("Patch Active Execution Qubits")}</th>
                <th className="py-2.5 px-3">{formatDisplayCopy("Full Frame Qubits")}</th>
                <th className="py-2.5 px-3">{formatDisplayCopy("CNOT Depth / Tile")}</th>
                <th className="py-2.5 px-3">{formatDisplayCopy("Passes / Tile")}</th>
                <th className="py-2.5 px-3">{formatDisplayCopy("Est. NISQ Fidelity")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272727]">
              {nisqScaling.profiles.map((p) => (
                <tr key={p.algorithm} className="hover:bg-[#272727]">
                  <td className="py-2.5 px-3 font-bold text-white">{formatDisplayCopy(p.algorithm)}</td>
                  <td className="py-2.5 px-3 text-[#00F0FF]">{p.storage_qubits_patch}</td>
                  <td className="py-2.5 px-3 text-[#FF79C6] font-bold">{p.active_qubits_patch}</td>
                  <td className="py-2.5 px-3 text-white">{p.full_frame_qubits}</td>
                  <td className="py-2.5 px-3 text-white">{p.cnot_depth_per_tile}</td>
                  <td className="py-2.5 px-3 text-[#9B9B9B]">{p.passes_per_tile}</td>
                  <td className="py-2.5 px-3 text-[#39D353] font-bold">
                    {(p.estimated_nisq_fidelity * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
