"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { apiFetch } from "@/lib/apiClient";
import { GisTheoryFormulaStrip } from "@/components/gis/GisTheoryFormulaStrip";

type ScenarioId = "new_impact" | "boulder_roll" | "plume_scour" | "solar_shift_control";

interface InterferometryApiResponse {
  status: string;
  metadata: {
    changed_pixels_count: number;
    changed_surface_pct: number;
    mean_change_probability: number;
    max_phase_shift_rad: number;
    threshold_used: number;
    illumination_normalized: boolean;
    estimated_false_alarm: number;
    status: string;
    scenario: string;
    scenario_title: string;
    baseline_years: number;
  };
  before_grid: number[][];
  after_grid: number[][];
  change_probability_map: number[][];
}

function drawMatrixToCanvas(
  canvas: HTMLCanvasElement | null,
  grid: number[][] | undefined,
  mode: "gray" | "phase"
) {
  if (!canvas || !grid || grid.length === 0) return;
  const h = grid.length;
  const w = grid[0].length;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imgData = ctx.createImageData(w, h);
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const val = Math.max(0, Math.min(255, grid[r][c] || 0));
      const idx = (r * w + c) * 4;
      if (mode === "gray") {
        imgData.data[idx] = val;
        imgData.data[idx + 1] = val;
        imgData.data[idx + 2] = Math.min(255, val + 6);
      } else {
        // Phase difference glow colormap: black -> indigo -> cyan -> amber/red
        const t = val / 255;
        let R = 10;
        let G = 12;
        let B = 18;
        if (t > 0.05 && t <= 0.45) {
          const k = (t - 0.05) / 0.4;
          R = Math.round(10 + 20 * k);
          G = Math.round(12 + 210 * k);
          B = Math.round(35 + 220 * k);
        } else if (t > 0.45) {
          const k = (t - 0.45) / 0.55;
          R = Math.round(30 + 225 * k);
          G = Math.round(222 - 140 * k);
          B = Math.round(255 - 210 * k);
        }
        imgData.data[idx] = R;
        imgData.data[idx + 1] = G;
        imgData.data[idx + 2] = B;
      }
      imgData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

export const TemporalInterferometryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"before" | "after" | "quantum_diff" | "triptych">("triptych");
  const [scenario, setScenario] = useState<ScenarioId>("new_impact");
  const [threshold, setThreshold] = useState<number>(0.15);
  const [normalizeIllum, setNormalizeIllum] = useState<boolean>(false);
  const [data, setData] = useState<InterferometryApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const canvasBeforeRef = useRef<HTMLCanvasElement | null>(null);
  const canvasAfterRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDiffRef = useRef<HTMLCanvasElement | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/v1/gis/interferometry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            scenario,
            change_threshold: threshold,
            normalize_illumination: normalizeIllum,
          }),
        });
        if (res.ok) {
          const json: InterferometryApiResponse = await res.json();
          setData(json);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Interferometry fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [scenario, threshold, normalizeIllum]);

  useEffect(() => {
    if (!data) return;
    if (activeTab === "triptych") {
      drawMatrixToCanvas(canvasBeforeRef.current, data.before_grid, "gray");
      drawMatrixToCanvas(canvasAfterRef.current, data.after_grid, "gray");
      drawMatrixToCanvas(canvasDiffRef.current, data.change_probability_map, "phase");
    } else if (activeTab === "before") {
      drawMatrixToCanvas(singleCanvasRef.current, data.before_grid, "gray");
    } else if (activeTab === "after") {
      drawMatrixToCanvas(singleCanvasRef.current, data.after_grid, "gray");
    } else {
      drawMatrixToCanvas(singleCanvasRef.current, data.change_probability_map, "phase");
    }
  }, [data, activeTab]);

  const meta = data?.metadata;
  const isImpact = meta?.status === "IMPACT_DETECTED";

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-5 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("Sub Pixel Temporal Phase Interferometry")}
          </h3>
          {meta && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                isImpact
                  ? "bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/30"
                  : "bg-[#39D353]/20 text-[#39D353] border-[#39D353]/30"
              }`}
            >
              {isImpact ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              <span>
                {isImpact
                  ? formatDisplayCopy("Impact Detected")
                  : formatDisplayCopy("Surface Stable")}
              </span>
            </span>
          )}
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-1 bg-[#1F1F1F] p-0.5 rounded-lg border border-[#313131] text-[10px] font-mono">
          {[
            { id: "triptych", label: "All 3 Co Registered" },
            { id: "before", label: "Before (t1)" },
            { id: "after", label: "After (t2)" },
            { id: "quantum_diff", label: "Phase Delta" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-[#2A2A2A] text-white font-semibold border border-[#00F0FF]"
                  : "text-[#9B9B9B] hover:text-white border border-transparent"
              }`}
            >
              {formatDisplayCopy(tab.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario & Phase Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#1F1F1F] border border-[#313131] rounded-xl p-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-[#888888] block uppercase">
            {formatDisplayCopy("Orbital Change Scenario")}
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "new_impact", label: "Bolide Impact" },
              { id: "boulder_roll", label: "Boulder Roll" },
              { id: "plume_scour", label: "Plume Blast" },
              { id: "solar_shift_control", label: "Solar Drift Only" },
            ].map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setScenario(sc.id as ScenarioId)}
                className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                  scenario === sc.id
                    ? "bg-[#272727] text-white border-[#00F0FF]"
                    : "bg-[#181818] text-[#888888] border-[#313131] hover:text-white"
                }`}
              >
                {formatDisplayCopy(sc.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#888888]">
              {formatDisplayCopy("Phase Gate Threshold")} (τ)
            </span>
            <span className="text-[#00F0FF] font-bold">{threshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.50"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
          <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1A1] cursor-pointer">
            <input
              type="checkbox"
              checked={normalizeIllum}
              onChange={(e) => setNormalizeIllum(e.target.checked)}
              className="accent-[#39D353]"
            />
            <span>{formatDisplayCopy("Normalize Solar Gain Drift")}</span>
          </label>
        </div>
      </div>

      {/* Viewport & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-[#0A0A0A] rounded-xl border border-[#2B2B2B] p-3 flex flex-col justify-center">
          {loading && !data ? (
            <div className="h-44 flex items-center justify-center text-xs font-mono text-[#888888] gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00F0FF]" />
              <span>{formatDisplayCopy("Running Phase Subtraction")}</span>
            </div>
          ) : activeTab === "triptych" ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 text-center">
                <canvas
                  ref={canvasBeforeRef}
                  className="w-full aspect-square rounded-lg border border-[#2B2B2B]"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-[10px] font-mono text-[#888888] block">
                  {formatDisplayCopy("Before Pass t1")}
                </span>
              </div>
              <div className="space-y-1 text-center">
                <canvas
                  ref={canvasAfterRef}
                  className="w-full aspect-square rounded-lg border border-[#2B2B2B]"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-[10px] font-mono text-white block">
                  {formatDisplayCopy("After Pass t2")}
                </span>
              </div>
              <div className="space-y-1 text-center">
                <canvas
                  ref={canvasDiffRef}
                  className="w-full aspect-square rounded-lg border border-[#00F0FF]/50"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-[10px] font-mono text-[#00F0FF] block">
                  {formatDisplayCopy("Born Delta P_change")}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <canvas
                ref={singleCanvasRef}
                className="w-48 h-48 rounded-lg border border-[#313131]"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="text-[10px] font-mono text-[#A1A1A1]">
                {formatDisplayCopy(meta?.scenario_title || "Temporal Pass View")}
              </span>
            </div>
          )}
        </div>

        {/* Live Telemetry */}
        <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#313131] flex flex-col justify-between text-xs font-mono space-y-2">
          <div>
            <span className="text-[#9B9B9B] text-[10px] uppercase block font-semibold">
              {formatDisplayCopy("Temporal Telemetry")}
            </span>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#9B9B9B]">{formatDisplayCopy("Changed Area")}:</span>
                <span className="text-white font-semibold">
                  {meta ? `${meta.changed_surface_pct}% (${meta.changed_pixels_count} px)` : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9B9B9B]">{formatDisplayCopy("Max Phase Shift")}:</span>
                <span className="text-[#00F0FF] font-semibold">
                  {meta ? `${meta.max_phase_shift_rad} rad` : "0.000 rad"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9B9B9B]">{formatDisplayCopy("Mean Prob")}:</span>
                <span className="text-white font-semibold">
                  {meta ? meta.mean_change_probability.toFixed(4) : "0.0000"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9B9B9B]">{formatDisplayCopy("False Alarm Est")}:</span>
                <span className="text-[#39D353] font-semibold">
                  {meta ? meta.estimated_false_alarm.toFixed(4) : "0.0005"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#292929] text-[10px] text-[#777777]">
            {formatDisplayCopy(
              `Co registered across ${meta?.baseline_years ?? 1.8} yr orbital baseline.`
            )}
          </div>
        </div>
      </div>

      {/* KaTeX Physics Law */}
      <GisTheoryFormulaStrip
        title="Adjoint Unitary Phase Subtraction"
        accentColor="#00F0FF"
        roleSummary="By applying adjoint Ry(-2 theta_t1) after loading Pass t2 via Ry(2 theta_t2) on the color ancilla qubit, static crater regolith constructively interferes to |0> while fresh impacts excite |1> with Born probability P_change."
        symbolicMath={String.raw`R_y(2\theta_{t_2})R_y(-2\theta_{t_1})\lvert 0\rangle_c \implies P_{\text{change}} = \sin^2\!\left(\frac{\pi}{2}\frac{|I_{t_2} - I_{t_1}|}{255}\right)`}
        liveSubstitutionMath={
          meta
            ? String.raw`\Delta\theta_{\max} = ${meta.max_phase_shift_rad}\text{ rad}, \quad P_{\text{change}} > ${meta.threshold_used.toFixed(2)} \;\Longrightarrow\; ${meta.changed_surface_pct}\% \text{ flagged}`
            : undefined
        }
      />
    </div>
  );
};
