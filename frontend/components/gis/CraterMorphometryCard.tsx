"use client";

import React, { useState } from "react";
import { Check, Download, MapPin } from "lucide-react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { CraterChronologyResponse, CraterRecord } from "@/lib/gisTypes";
import { GisTheoryFormulaStrip } from "@/components/gis/GisTheoryFormulaStrip";

export type { CraterRecord };

interface CraterMorphometryCardProps {
  craters: CraterRecord[];
  chronology?: CraterChronologyResponse | null;
  geojsonObj?: any;
  presetId?: string;
  selectedCraterId?: string | null;
  onSelectCrater?: (crater: CraterRecord) => void;
}

export const CraterMorphometryCard: React.FC<CraterMorphometryCardProps> = ({
  craters,
  chronology,
  geojsonObj,
  presetId = "apollo_16",
  selectedCraterId = null,
  onSelectCrater,
}) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const handleDownloadGeoJSON = () => {
    if (!geojsonObj) return;
    const blob = new Blob([JSON.stringify(geojsonObj, null, 2)], {
      type: "application/geo+json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presetId}_craters_iau2015.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const bins = chronology?.csfd_r_plot_bins ?? [];
  const maxR = Math.max(0.035, ...bins.map((b) => b.r_value + b.error_plus));

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-5 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#FF79C6]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("Fitzgibbon Crater Morphometry & Neukum Age")}
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242424] text-white border border-[#383838]">
            {craters.length} {formatDisplayCopy("Fitted")}
          </span>
        </div>

        {geojsonObj && (
          <button
            type="button"
            onClick={handleDownloadGeoJSON}
            className="px-3 py-1 rounded-xl bg-[#242424] hover:bg-[#2F2F2F] text-xs font-mono text-white flex items-center gap-1.5 border border-[#3A3A3A] transition-colors"
          >
            {downloaded ? (
              <Check className="w-3.5 h-3.5 text-[#39D353]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#00F0FF]" />
            )}
            <span>
              {downloaded
                ? formatDisplayCopy("Saved")
                : formatDisplayCopy("Export GeoJSON (IAU 2015)")}
            </span>
          </button>
        )}
      </div>

      {/* Neukum Age & Geological Epoch Summary Strip */}
      {chronology && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div className="bg-[#1F1F1F] border border-[#313131] rounded-lg p-2.5">
            <span className="text-[10px] text-[#888888] block">
              {formatDisplayCopy("Neukum Model Age")}
            </span>
            <span className="text-sm font-bold text-[#00F0FF]">
              {chronology.neukum_model_age_ga.toFixed(2)} Ga
            </span>
          </div>
          <div className="bg-[#1F1F1F] border border-[#313131] rounded-lg p-2.5">
            <span className="text-[10px] text-[#888888] block">
              {formatDisplayCopy("Lunar Epoch")}
            </span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {formatDisplayCopy(chronology.geological_epoch)}
            </span>
          </div>
          <div className="bg-[#1F1F1F] border border-[#313131] rounded-lg p-2.5">
            <span className="text-[10px] text-[#888888] block">
              {formatDisplayCopy("Fresh / Degraded")}
            </span>
            <span className="text-xs font-bold text-[#39D353] block mt-0.5">
              {chronology.fresh_bowl_count} / {chronology.degraded_count}
            </span>
          </div>
          <div className="bg-[#1F1F1F] border border-[#313131] rounded-lg p-2.5">
            <span className="text-[10px] text-[#888888] block">
              {formatDisplayCopy("Density N(D>=1km)")}
            </span>
            <span className="text-xs font-bold text-[#FFD700] block mt-0.5">
              {chronology.cumulative_n1_km2.toFixed(4)} /km²
            </span>
          </div>
        </div>
      )}

      {/* CSFD R-Plot Visualization */}
      {bins.length > 0 && (
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] mb-2">
            <span>{formatDisplayCopy("Crater Size Frequency R Plot Bins")}</span>
            <span className="text-[#FF79C6]">
              {formatDisplayCopy("Area")}: {chronology?.total_area_km2 ?? 0} km²
            </span>
          </div>
          <svg viewBox="0 0 320 84" className="w-full h-20">
            <line x1="28" y1="64" x2="306" y2="64" stroke="#313131" />
            <line x1="28" y1="10" x2="28" y2="64" stroke="#313131" />
            {bins.map((b, idx) => {
              const stepW = 260 / Math.max(1, bins.length);
              const cx = 56 + idx * stepW;
              const barH = Math.max(4, (b.r_value / maxR) * 48);
              const topY = 64 - barH;
              const errPx = Math.min(20, (b.error_plus / maxR) * 48);
              return (
                <g key={b.diam_km_mean}>
                  <rect
                    x={cx - 12}
                    y={topY}
                    width={24}
                    height={barH}
                    rx={3}
                    fill="#00F0FF"
                    fillOpacity={0.28}
                    stroke="#00F0FF"
                    strokeWidth={1}
                  />
                  <line
                    x1={cx}
                    y1={Math.max(4, topY - errPx)}
                    x2={cx}
                    y2={Math.min(64, topY + errPx)}
                    stroke="#FF79C6"
                    strokeWidth={1.5}
                  />
                  <line x1={cx - 4} y1={Math.max(4, topY - errPx)} x2={cx + 4} y2={Math.max(4, topY - errPx)} stroke="#FF79C6" strokeWidth={1.2} />
                  <text x={cx} y={77} textAnchor="middle" fill="#888888" fontSize="9" fontFamily="monospace">
                    {b.diam_km_mean} km
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Craters Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#2B2B2B] text-[#9B9B9B] text-[10px] uppercase">
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">{formatDisplayCopy("Diameter")}</th>
              <th className="py-2 px-2">{formatDisplayCopy("Depth")}</th>
              <th className="py-2 px-2">d/D</th>
              <th className="py-2 px-2">{formatDisplayCopy("Ellipticity")}</th>
              <th className="py-2 px-2">{formatDisplayCopy("Terrain Class")}</th>
              <th className="py-2 px-2 text-right">{formatDisplayCopy("Rim Conf")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {craters.map((c) => {
              const isSelected = selectedCraterId === c.crater_id;
              return (
                <tr
                  key={c.crater_id}
                  onClick={() => onSelectCrater && onSelectCrater(c)}
                  className={`transition-colors cursor-pointer ${
                    isSelected ? "bg-[#22222A] text-white" : "hover:bg-[#1F1F1F]"
                  }`}
                >
                  <td className="py-2.5 px-2 font-semibold text-white flex items-center gap-1.5">
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />}
                    {c.crater_id}
                  </td>
                  <td className="py-2.5 px-2 text-[#00F0FF]">{c.diameter_km} km</td>
                  <td className="py-2.5 px-2 text-white">{c.depth_m} m</td>
                  <td className="py-2.5 px-2 text-[#9B9B9B]">{c.depth_to_diameter_ratio}</td>
                  <td className="py-2.5 px-2 text-[#9B9B9B]">{c.ellipticity}</td>
                  <td className="py-2.5 px-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF79C6]/20 text-[#FF79C6] border border-[#FF79C6]/30">
                      {formatDisplayCopy(c.terrain_class)}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-[#39D353]">
                    {(c.rim_confidence * 100).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Theory Formula Strip */}
      <GisTheoryFormulaStrip
        title="Neukum Chronology & Fitzgibbon Rim Fit"
        accentColor="#FF79C6"
        roleSummary="Quantum rim contours are fit by Fitzgibbon direct least squares ellipses under 4AC - B^2 = 1. Cumulative density N(D>=1 km) then inverts the Neukum lunar production curve to date planetary resurfacing in Gigaannum."
        symbolicMath={String.raw`N(D \ge 1\text{ km}) = 5.44 \times 10^{-14}\!\left(e^{6.93\,T} - 1\right) + 8.38 \times 10^{-4}\,T`}
        liveSubstitutionMath={
          chronology
            ? String.raw`N(1) = ${chronology.cumulative_n1_km2.toFixed(5)}\text{ km}^{-2} \;\Longrightarrow\; T = ${chronology.neukum_model_age_ga.toFixed(2)}\text{ Ga}`
            : undefined
        }
      />
    </div>
  );
};
