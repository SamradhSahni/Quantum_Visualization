"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { apiFetch } from "@/lib/apiClient";
import {
  ExperimentMetricRow,
  ResearchSuitesPayload,
} from "@/lib/benchmarkTypes";
import {
  BarChart3,
  Cpu,
  FlaskConical,
  Globe,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const METHOD_COLORS: Record<string, string> = {
  "FRQI-QHED": "#FF79C6",
  FRQI: "#FF79C6",
  "QPIE-QHED": "#00F0FF",
  QPIE: "#00F0FF",
  "NEQR-Gradient": "#BD93F9",
  NEQR: "#BD93F9",
  "Exact-gradient": "#A3E635",
  "Exact-NEQR-inequality": "#C084FC",
  Sobel: "#38BDF8",
  Canny: "#FFE600",
  Robinson: "#39D353",
};

const FAILURE_STYLES: Record<string, { color: string; label: string }> = {
  SUCCESS: { color: "#39D353", label: "Success" },
  DISPLACEMENT: { color: "#00F0FF", label: "1px D64 Shift" },
  MODERATE: { color: "#FFD700", label: "Moderate" },
  UNDER_DETECTION: { color: "#FB923C", label: "Under Detection" },
  COMPLETE_MISS: { color: "#EF4444", label: "Sparse Miss" },
};

type ObservatoryTab =
  | "grand_aer"
  | "geometry_failures"
  | "shots_scaling"
  | "stress_prep"
  | "sombench";

export const ResearchBenchmarksHub: React.FC = () => {
  const [data, setData] = useState<ResearchSuitesPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ObservatoryTab>("grand_aer");

  // Interactive Filters Across Tabs
  const [aerSubset, setAerSubset] = useState<"primary_8crop" | "subset_6crop">("primary_8crop");
  const [aerMetric, setAerMetric] = useState<"pr_auc" | "f1_2px" | "f1_exact">("pr_auc");

  const [geoMetric, setGeoMetric] = useState<
    "f1_exact_mean" | "f1_1px_mean" | "f1_2px_mean" | "iou_mean" | "pr_auc_mean" | "chamfer_mean"
  >("f1_exact_mean");

  const [shotImage, setShotImage] = useState<string>("circle");
  const [shotMetric, setShotMetric] = useState<"f1_exact_mean" | "f1_1px_mean" | "pr_auc_mean">("f1_1px_mean");

  const [stressSubTab, setStressSubTab] = useState<"exp4" | "exp5" | "exp7">("exp4");
  const [stressImage, setStressImage] = useState<string>("circle");
  const [stressMetric, setStressMetric] = useState<"f1_exact_mean" | "f1_1px_mean">("f1_exact_mean");

  const [somSize, setSomSize] = useState<"all" | "8" | "16">("all");
  const [somCategory, setSomCategory] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch("/api/benchmark/research-suites");
        if (res.ok && mounted) {
          const json: ResearchSuitesPayload = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed loading curated research benchmarks:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived Exp 1 geometries & methods
  const geoMethods = ["Sobel", "Canny", "Robinson", "QPIE-QHED", "NEQR-Gradient"];
  const geoShapes = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.exp1_geometry.map((r) => r.image || ""))).filter(Boolean);
  }, [data]);

  // Derived Exp 8 SomBench filtered rows + aggregated summary
  const somFiltered = useMemo(() => {
    if (!data) return [];
    return data.exp8_sombench.filter((r) => {
      if (somSize !== "all" && String(r.size) !== somSize) return false;
      if (somCategory !== "all" && r.category !== somCategory) return false;
      return true;
    });
  }, [data, somSize, somCategory]);

  const somCategories = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.exp8_sombench.map((r) => r.category || ""))).filter(Boolean);
  }, [data]);

  const somAggregated = useMemo(() => {
    const groups: Record<string, { f1e: number[]; f1_1: number[]; f1_2: number[]; pr: number[] }> = {};
    somFiltered.forEach((r) => {
      if (!groups[r.method]) groups[r.method] = { f1e: [], f1_1: [], f1_2: [], pr: [] };
      if (typeof r.f1_exact_mean === "number") groups[r.method].f1e.push(r.f1_exact_mean);
      if (typeof r.f1_1px_mean === "number") groups[r.method].f1_1.push(r.f1_1px_mean);
      if (typeof r.f1_2px_mean === "number") groups[r.method].f1_2.push(r.f1_2px_mean);
      if (typeof r.pr_auc_mean === "number") groups[r.method].pr.push(r.pr_auc_mean);
    });
    const avg = (arr: number[]) =>
      arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(4)) : 0;
    return Object.entries(groups).map(([method, g]) => ({
      method,
      f1_exact: avg(g.f1e),
      f1_1px: avg(g.f1_1),
      f1_2px: avg(g.f1_2),
      pr_auc: avg(g.pr),
      count: g.f1e.length,
    }));
  }, [somFiltered]);

  if (loading) {
    return (
      <Card surface="card" outerRadius={16} className="p-8 border border-[#313131] text-center">
        <p className="text-xs font-mono text-[#9B9B9B]">
          {formatDisplayCopy("Loading Empirical Experiment Suites & NASA SomBench Datasets...")}
        </p>
      </Card>
    );
  }

  if (!data) return null;

  const interpKeyMap: Record<ObservatoryTab, string> = {
    grand_aer: "matched_aer",
    geometry_failures: "exp1_6_10",
    shots_scaling: "exp2",
    stress_prep: "exp4_5_7",
    sombench: "exp8_sombench",
  };
  const activeInterp = data.suite_interpretations[interpKeyMap[activeTab]];

  return (
    <section className="space-y-6 pt-6 border-t border-[#313131]">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#313131] bg-[#181818] mb-2">
            <FlaskConical size={13} className="text-[#FF79C6]" />
            <span className="text-[11px] font-mono text-[#E1E1E1] uppercase">
              {formatDisplayCopy("Curated Empirical Experiment Observatory (Exp 1 to 10 + Matched Aer)")}
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-white">
            {formatDisplayCopy("Complete Research Benchmarks, Ablations & NASA SomBench Results")}
          </h2>
          <p className="text-xs text-[#9B9B9B] mt-1 max-w-3xl">
            {formatDisplayCopy(
              "Explore all 12 curated CSV research tables and the 57,600 circuit Qiskit Aer hardware matched benchmark with statistical bootstrap intervals, failure taxonomy, and LRO tile filters."
            )}
          </p>
        </div>

        {/* Observatory Suite Switcher Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#121212] p-1.5 rounded-xl border border-[#313131]">
          {[
            { id: "grand_aer", label: "Grand & Aer (57.6k)", icon: BarChart3 },
            { id: "geometry_failures", label: "Exp 1/6/10 Geometry & Failures", icon: ShieldAlert },
            { id: "shots_scaling", label: "Exp 2/3/9 Shots & Scaling", icon: Cpu },
            { id: "stress_prep", label: "Exp 4/5/7 Noise & Prep", icon: SlidersHorizontal },
            { id: "sombench", label: "Exp 8 NASA SomBench", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ObservatoryTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
                  active
                    ? "bg-[#272727] text-white border-[#00F0FF] font-semibold"
                    : "bg-[#181818] text-[#888888] border-transparent hover:text-white"
                }`}
              >
                <Icon size={13} className={active ? "text-[#00F0FF]" : "text-[#777777]"} />
                <span>{formatDisplayCopy(tab.label)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scientific Role & Interpretation Banner */}
      {activeInterp && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#141414] border border-[#313131] rounded-2xl p-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F0FF] block">
              {formatDisplayCopy(`What ${activeInterp.title} Tests`)}
            </span>
            <p className="text-xs text-[#CCCCCC] leading-relaxed">
              {formatDisplayCopy(activeInterp.what_it_tests)}
            </p>
          </div>
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#2B2B2B] pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#39D353] block">
              {formatDisplayCopy("What The Empirical Data Shows")}
            </span>
            <p className="text-xs text-[#CCCCCC] leading-relaxed">
              {formatDisplayCopy(activeInterp.what_it_shows)}
            </p>
          </div>
        </div>
      )}

      {/* ==================== TAB 1: GRAND SUMMARY & MATCHED AER ENCODING ==================== */}
      {activeTab === "grand_aer" && (
        <div className="space-y-6">
          {/* Grand Summary Grouped Bar & Table */}
          <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2B2B2B]">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {formatDisplayCopy("Grand Benchmark Summary Matrix Across 3 Core Evaluations")}
                </h3>
                <span className="text-xs font-mono text-[#888888]">
                  {formatDisplayCopy(data.suite_interpretations.grand_summary.what_it_shows)}
                </span>
              </div>
              <Badge label="Grand Summary CSV" variant="cyan" size="xs" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-6 space-y-3">
                {data.grand_summary.map((row) => {
                  const col = METHOD_COLORS[row.Method] || "#FFFFFF";
                  const rVal = row["Representation Ablation"] ?? 0;
                  const gVal = row["Geometry Ablation"] ?? 0;
                  const sVal = row["SomBench Benchmark"] ?? 0;
                  return (
                    <div key={row.Method} className="bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-bold" style={{ color: col }}>
                          {formatDisplayCopy(row.Method)}
                        </span>
                        <span className="text-[#888888]">
                          Rep {rVal.toFixed(3)} | Geo {gVal.toFixed(3)} | Som {sVal.toFixed(3)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                        {[
                          ["Rep", rVal],
                          ["Geo", gVal],
                          ["SomBench", sVal],
                        ].map(([lbl, v]) => (
                          <div key={lbl as string} className="space-y-1">
                            <div className="w-full h-2 bg-[#242424] rounded overflow-hidden">
                              <div
                                className="h-full rounded"
                                style={{
                                  width: `${Math.min(100, Number(v) * 100)}%`,
                                  backgroundColor: col,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Matched Aer Summary Banner */}
              <div className="lg:col-span-6 bg-[#121212] border border-[#2B2B2B] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#FF79C6]">
                    {formatDisplayCopy("Qiskit Aer Study Verification Audit")}
                  </span>
                  <span className="text-[10px] font-mono text-[#39D353] bg-[#39D353]/10 border border-[#39D353]/30 px-2 py-0.5 rounded">
                    {formatDisplayCopy("Count Replay Verified")}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono text-xs">
                  <div className="bg-[#181818] border border-[#2B2B2B] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#888888] block">{formatDisplayCopy("Quantum Circuits")}</span>
                    <span className="font-bold text-white">57,600</span>
                  </div>
                  <div className="bg-[#181818] border border-[#2B2B2B] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#888888] block">{formatDisplayCopy("Total Shots")}</span>
                    <span className="font-bold text-[#00F0FF]">265.42 M</span>
                  </div>
                  <div className="bg-[#181818] border border-[#2B2B2B] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#888888] block">{formatDisplayCopy("Replay Err")}</span>
                    <span className="font-bold text-[#39D353]">5.68e-14</span>
                  </div>
                  <div className="bg-[#181818] border border-[#2B2B2B] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#888888] block">{formatDisplayCopy("Crop Scale")}</span>
                    <span className="font-bold text-white">128x128</span>
                  </div>
                  <div className="bg-[#181818] border border-[#2B2B2B] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#888888] block">{formatDisplayCopy("Bootstrap")}</span>
                    <span className="font-bold text-[#FFD700]">10,000x</span>
                  </div>
                  <div className="bg-[#181818] border border-[#2B2B2B] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#888888] block">{formatDisplayCopy("Total Records")}</span>
                    <span className="font-bold text-white">184 Runs</span>
                  </div>
                </div>
                <p className="text-[11px] font-mono text-[#9B9B9B] leading-relaxed">
                  {formatDisplayCopy(
                    "Note: On 16x16 FRQI blocks, 1 measurement count corresponds to ~117.3 grayscale diff at 1024 shots vs 40.7 at 8192 shots, explaining finite shot AP recovery."
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Matched Aer Detailed Table + Bootstrap Forest Plot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card surface="card" outerRadius={16} className="lg:col-span-7 p-5 border border-[#313131] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2B2B2B]">
                <h4 className="text-sm font-semibold text-white">
                  {formatDisplayCopy("Aer Circuit Benchmark Table (1024 vs 8192 Shots)")}
                </h4>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setAerSubset("primary_8crop")}
                    className={`px-2 py-1 rounded border ${
                      aerSubset === "primary_8crop" ? "bg-[#272727] text-white border-[#00F0FF]" : "bg-[#181818] text-[#888888] border-[#313131]"
                    }`}
                  >
                    {formatDisplayCopy("8 Crop Primary")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAerSubset("subset_6crop")}
                    className={`px-2 py-1 rounded border ${
                      aerSubset === "subset_6crop" ? "bg-[#272727] text-white border-[#00F0FF]" : "bg-[#181818] text-[#888888] border-[#313131]"
                    }`}
                  >
                    {formatDisplayCopy("6 Crop Clean")}
                  </button>
                  <select
                    value={aerMetric}
                    onChange={(e) => setAerMetric(e.target.value as any)}
                    className="px-2 py-1 rounded bg-[#181818] border border-[#313131] text-white"
                  >
                    <option value="pr_auc">Mean AP</option>
                    <option value="f1_2px">2px F1</option>
                    <option value="f1_exact">Exact F1</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {data.matched_aer[aerSubset].map((row, idx) => {
                  const rawVal =
                    aerMetric === "pr_auc"
                      ? row.pr_auc ?? row.ap ?? 0
                      : aerMetric === "f1_2px"
                      ? row.f1_2px ?? 0
                      : row.f1_exact ?? 0;
                  const maxScale = aerMetric === "pr_auc" ? 0.055 : aerMetric === "f1_exact" ? 0.10 : 0.35;
                  const col = METHOD_COLORS[row.method] || "#9B9B9B";
                  return (
                    <div key={`${row.method}_${row.shots}_${idx}`} className="flex items-center gap-3 text-xs font-mono">
                      <span className="w-36 truncate font-semibold" style={{ color: col }}>
                        {formatDisplayCopy(row.method)} {row.shots > 0 ? `(${row.shots})` : "(Det)"}
                      </span>
                      <div className="flex-1 h-3 bg-[#141414] border border-[#2B2B2B] rounded overflow-hidden">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${Math.min(100, (Number(rawVal) / maxScale) * 100)}%`,
                            backgroundColor: col,
                          }}
                        />
                      </div>
                      <span className="w-16 text-right text-white">{Number(rawVal).toFixed(4)}</span>
                      {row.operator_rmse !== undefined && row.operator_rmse !== null && (
                        <span className="w-20 text-right text-[10px] text-[#888888] hidden sm:inline">
                          RMSE {row.operator_rmse.toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Bootstrap 95% CI Forest Plot */}
            <Card surface="card" outerRadius={16} className="lg:col-span-5 p-5 border border-[#313131] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
                <h4 className="text-sm font-semibold text-white">
                  {formatDisplayCopy("Paired AP Bootstrap 95% Intervals")}
                </h4>
                <Badge label="10k Resamples" variant="magenta" size="xs" />
              </div>

              <div className="space-y-2.5 text-[10px] font-mono">
                {data.matched_aer.bootstrap_intervals.map((b, i) => {
                  // Map [-0.025 .. +0.015] into 0..100%
                  const minX = -0.025;
                  const maxX = 0.015;
                  const toPct = (v: number) => Math.max(0, Math.min(100, ((v - minX) / (maxX - minX)) * 100));
                  const zeroPct = toPct(0);
                  const loPct = toPct(b.ci_lo);
                  const hiPct = toPct(b.ci_hi);
                  const midPct = toPct(b.diff);
                  const posCol = b.ci_lo >= 0 ? "#39D353" : b.ci_hi <= 0 ? "#EF4444" : "#FFD700";

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[#CCCCCC]">
                        <span>{formatDisplayCopy(`${b.a} vs ${b.b}`)}</span>
                        <span style={{ color: posCol }}>
                          {b.diff >= 0 ? "+" : ""}
                          {b.diff.toFixed(4)} [{b.ci_lo.toFixed(4)}, {b.ci_hi.toFixed(4)}]
                        </span>
                      </div>
                      <div className="relative h-3 bg-[#121212] border border-[#2B2B2B] rounded">
                        <div
                          className="absolute top-0 bottom-0 w-px bg-[#666666]"
                          style={{ left: `${zeroPct}%` }}
                        />
                        <div
                          className="absolute top-1 bottom-1 rounded"
                          style={{
                            left: `${loPct}%`,
                            width: `${Math.max(1, hiPct - loPct)}%`,
                            backgroundColor: posCol,
                            opacity: 0.45,
                          }}
                        />
                        <div
                          className="absolute top-0.5 w-2 h-2 rounded-full -ml-1"
                          style={{ left: `${midPct}%`, backgroundColor: posCol }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: EXP 1, 6 & 10 GEOMETRY ABLATION & FAILURES ==================== */}
      {activeTab === "geometry_failures" && (
        <div className="space-y-6">
          <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2B2B]">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {formatDisplayCopy("8 Geometry x 5 Algorithm Heatmap Matrix (Exp 1 & Exp 6)")}
                </h3>
                <span className="text-xs font-mono text-[#888888]">
                  {formatDisplayCopy("Comparing Exact F1 vs 1px/2px Shift Tolerance across elementary shapes")}
                </span>
              </div>
              <select
                value={geoMetric}
                onChange={(e) => setGeoMetric(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#313131] text-xs font-mono text-white"
              >
                <option value="f1_exact_mean">Exact F1 Mean</option>
                <option value="f1_1px_mean">1px Tolerance F1</option>
                <option value="f1_2px_mean">2px Tolerance F1</option>
                <option value="iou_mean">IoU Mean</option>
                <option value="pr_auc_mean">PR AUC Mean</option>
                <option value="chamfer_mean">Chamfer Distance (Lower Best)</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141414] text-[#9B9B9B] uppercase border-b border-[#313131]">
                  <tr>
                    <th className="py-2.5 px-3">{formatDisplayCopy("Target Shape")}</th>
                    {geoMethods.map((m) => (
                      <th key={m} className="py-2.5 px-3 text-center" style={{ color: METHOD_COLORS[m] }}>
                        {formatDisplayCopy(m)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272727]">
                  {geoShapes.map((shape) => (
                    <tr key={shape} className="hover:bg-[#1F1F1F]">
                      <td className="py-2.5 px-3 font-semibold text-white">{formatDisplayCopy(shape)}</td>
                      {geoMethods.map((m) => {
                        const row = data.exp1_geometry.find((r) => r.image === shape && r.method === m);
                        const val = row ? (row[geoMetric] as number | null) : null;
                        const isChamfer = geoMetric === "chamfer_mean";
                        const heat =
                          val === null
                            ? 0
                            : isChamfer
                            ? Math.max(0.05, Math.min(0.45, 0.45 - val * 0.14))
                            : Math.max(0.04, Math.min(0.45, val * 0.45));
                        const cellColor = val === null ? "#EF4444" : isChamfer ? "#00F0FF" : "#39D353";
                        return (
                          <td key={m} className="py-2 px-3 text-center">
                            <div
                              className="py-1 px-2 rounded border border-[#2B2B2B] font-semibold"
                              style={{
                                backgroundColor: `rgba(${cellColor === "#39D353" ? "57, 211, 83" : cellColor === "#00F0FF" ? "0, 240, 255" : "239, 68, 68"}, ${heat})`,
                                color: val === null ? "#EF4444" : "#FFFFFF",
                              }}
                            >
                              {val === null ? "Inf" : val.toFixed(3)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Exp 10 Failure Taxonomy */}
          <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2B2B2B]">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {formatDisplayCopy("Exp 10 Quantum Failure Taxonomy Diagnostic Matrix")}
                </h4>
                <span className="text-xs font-mono text-[#888888]">
                  {formatDisplayCopy("Explains 1 px D64 cyclic shift displacement vs sparse line cancellation")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(FAILURE_STYLES).map(([k, st]) => (
                  <span
                    key={k}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border"
                    style={{
                      color: st.color,
                      borderColor: `${st.color}44`,
                      backgroundColor: `${st.color}15`,
                    }}
                  >
                    {formatDisplayCopy(st.label)}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.exp10_failure_taxonomy.map((item, idx) => {
                const st = FAILURE_STYLES[item.failure_mode || "MODERATE"] || FAILURE_STYLES.MODERATE;
                return (
                  <div
                    key={`${item.geometry}_${item.method}_${idx}`}
                    className="p-3 rounded-xl bg-[#141414] border border-[#2B2B2B] space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{formatDisplayCopy(item.geometry || "")}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded border"
                        style={{ color: st.color, borderColor: `${st.color}55`, backgroundColor: `${st.color}15` }}
                      >
                        {formatDisplayCopy(st.label)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span style={{ color: METHOD_COLORS[item.method] || "#CCCCCC" }}>
                        {formatDisplayCopy(item.method)}
                      </span>
                      <span className="text-[#A1A1A1]">1px F1: {(item.f1_1px_mean ?? 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#777777]">
                      <span>Exact {(item.f1_exact_mean ?? 0).toFixed(3)}</span>
                      <span>P {(item.precision_mean ?? 0).toFixed(2)} | R {(item.recall_mean ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ==================== TAB 3: EXP 2, 3, 9 & TIMING SHOTS & SCALING ==================== */}
      {activeTab === "shots_scaling" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Exp 2 Shot Sweep Chart */}
          <Card surface="card" outerRadius={16} className="lg:col-span-7 p-5 border border-[#313131] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2B2B2B]">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {formatDisplayCopy("Exp 2: Projective Measurement Shot Convergence (256 to 16,384)")}
                </h3>
                <span className="text-xs font-mono text-[#888888]">
                  {formatDisplayCopy("Shaded variance bars show +/- 1 std sampling fluctuation")}
                </span>
              </div>
              <div className="flex gap-1.5 text-xs font-mono">
                <select
                  value={shotImage}
                  onChange={(e) => setShotImage(e.target.value)}
                  className="px-2 py-1 rounded bg-[#181818] border border-[#313131] text-white"
                >
                  <option value="circle">Circle Rim</option>
                  <option value="corner_junction">Corner Junction</option>
                  <option value="diagonal_45">Diagonal 45</option>
                </select>
                <select
                  value={shotMetric}
                  onChange={(e) => setShotMetric(e.target.value as any)}
                  className="px-2 py-1 rounded bg-[#181818] border border-[#313131] text-white"
                >
                  <option value="f1_1px_mean">1px F1</option>
                  <option value="f1_exact_mean">Exact F1</option>
                  <option value="pr_auc_mean">PR AUC</option>
                </select>
              </div>
            </div>

            {(() => {
              const shotsList = [256, 512, 1024, 2048, 4096, 8192, 16384];
              const qpieRows = shotsList.map((s) =>
                data.exp2_shots.find((r) => r.image === shotImage && r.method === "QPIE-QHED" && r.shots === s)
              );
              const neqrRows = shotsList.map((s) =>
                data.exp2_shots.find((r) => r.image === shotImage && r.method === "NEQR-Gradient" && r.shots === s)
              );

              const makePolyline = (rows: (ExperimentMetricRow | undefined)[]) =>
                rows
                  .map((r, i) => {
                    const v = r ? (r[shotMetric] ?? 0) : 0;
                    const x = 44 + (i / 6) * 440;
                    const y = 175 - Math.min(1, Math.max(0, v)) * 145;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ");

              return (
                <div className="space-y-3">
                  <svg viewBox="0 0 520 205" className="w-full h-56 bg-[#0B0D12] border border-[#2B2B2B] rounded-xl">
                    {[0.25, 0.5, 0.75, 1.0].map((v) => (
                      <g key={v}>
                        <line x1="40" y1={175 - v * 145} x2="495" y2={175 - v * 145} stroke="#222530" strokeDasharray="2,2" />
                        <text x="8" y={178 - v * 145} fill="#777777" fontSize="9" fontFamily="monospace">
                          {v.toFixed(2)}
                        </text>
                      </g>
                    ))}
                    <polyline fill="none" stroke="#BD93F9" strokeWidth="2.5" points={makePolyline(neqrRows)} />
                    <polyline fill="none" stroke="#00F0FF" strokeWidth="2.5" points={makePolyline(qpieRows)} />

                    {shotsList.map((s, i) => {
                      const x = 44 + (i / 6) * 440;
                      const rq = qpieRows[i];
                      const rn = neqrRows[i];
                      const vq = rq ? (rq[shotMetric] ?? 0) : 0;
                      const vn = rn ? (rn[shotMetric] ?? 0) : 0;
                      return (
                        <g key={s}>
                          <circle cx={x} cy={175 - vn * 145} r="4" fill="#BD93F9" />
                          <circle cx={x} cy={175 - vq * 145} r="4" fill="#00F0FF" />
                          <text x={x} y="196" textAnchor="middle" fill="#888888" fontSize="9" fontFamily="monospace">
                            {s >= 1024 ? `${s / 1024}k` : s}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono bg-[#141414] border border-[#2B2B2B] rounded-lg px-3 py-2">
                    <span className="text-[#BD93F9]">
                      NEQR @ 8k: {((neqrRows[5]?.[shotMetric] ?? 0) as number).toFixed(4)}
                    </span>
                    <span className="text-[#00F0FF]">
                      QPIE @ 8k: {((qpieRows[5]?.[shotMetric] ?? 0) as number).toFixed(4)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Exp 3, 9 & Simulator Timing Scaling */}
          <Card surface="card" outerRadius={16} className="lg:col-span-5 p-5 border border-[#313131] space-y-4">
            <div className="pb-2 border-b border-[#2B2B2B]">
              <h3 className="text-sm font-semibold text-white">
                {formatDisplayCopy("Exp 3, 9 & Timing: Circuit Footprint & Latency")}
              </h3>
              <span className="text-xs font-mono text-[#888888]">
                {formatDisplayCopy("Qubits, depth, and measured milliseconds across 4x4 and 8x8 tiles")}
              </span>
            </div>

            <div className="space-y-2.5">
              {data.exp9_resources.map((res, idx) => {
                const col = METHOD_COLORS[res.method] || "#00F0FF";
                return (
                  <div key={idx} className="p-3 rounded-xl bg-[#141414] border border-[#2B2B2B] text-xs font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="font-bold" style={{ color: col }}>
                        {formatDisplayCopy(`${res.method} (${res.size}x${res.size})`)}
                      </span>
                      <span className="text-white">
                        {res.n_qubits} Qubits | Depth {res.circuit_depth}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#222222] rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.min(100, (res.circuit_depth / 180) * 100)}%`,
                          backgroundColor: col,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#2B2B2B]">
              <span className="text-[11px] font-mono text-[#888888] block mb-2">
                {formatDisplayCopy("8x8 Simulator Execution Time Comparison (ms)")}
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {data.timing_analysis
                  .filter((t) => t.size === 8)
                  .map((t) => (
                    <div key={t.method} className="flex justify-between items-center bg-[#141414] px-2.5 py-1.5 rounded border border-[#2B2B2B]">
                      <span style={{ color: METHOD_COLORS[t.method] || "#CCCCCC" }}>
                        {formatDisplayCopy(t.method)}
                      </span>
                      <span className="text-white font-semibold">
                        {(t.mean_time_ms ?? 0).toFixed(2)} ms
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== TAB 4: EXP 4, 5 & 7 DEGRADATION, NISQ & PREPROCESSING ==================== */}
      {activeTab === "stress_prep" && (
        <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2B2B]">
            <div className="flex gap-1.5 text-xs font-mono">
              {[
                { id: "exp4", label: "Exp 4: Image Degradation" },
                { id: "exp5", label: "Exp 5: NISQ Noise Channels" },
                { id: "exp7", label: "Exp 7: Preprocessing" },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setStressSubTab(b.id as any)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    stressSubTab === b.id
                      ? "bg-[#272727] text-white border-[#00F0FF] font-semibold"
                      : "bg-[#181818] text-[#888888] border-[#313131] hover:text-white"
                  }`}
                >
                  {formatDisplayCopy(b.label)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 text-xs font-mono">
              <select
                value={stressImage}
                onChange={(e) => setStressImage(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#313131] text-white"
              >
                <option value="circle">Circle</option>
                <option value="corner_junction">Corner Junction</option>
                {stressSubTab !== "exp5" && <option value="diagonal_45">Diagonal 45</option>}
              </select>
              {stressSubTab !== "exp7" && (
                <select
                  value={stressMetric}
                  onChange={(e) => setStressMetric(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#313131] text-white"
                >
                  <option value="f1_exact_mean">Exact F1</option>
                  <option value="f1_1px_mean">1px F1</option>
                </select>
              )}
            </div>
          </div>

          {(() => {
            const sourceRows =
              stressSubTab === "exp4"
                ? data.exp4_degradation
                : stressSubTab === "exp5"
                ? data.exp5_nisq_noise
                : data.exp7_preprocessing;
            const filtered = sourceRows.filter((r) => r.image === stressImage);
            const condKey =
              stressSubTab === "exp4"
                ? "degradation"
                : stressSubTab === "exp5"
                ? "noise"
                : "preprocessing";
            const conditions = Array.from(new Set(filtered.map((r) => String((r as any)[condKey] || "")))).filter(Boolean);
            const methods = Array.from(new Set(filtered.map((r) => r.method)));
            const metricKey = stressSubTab === "exp7" ? "f1_exact_mean" : stressMetric;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {conditions.map((cond) => (
                  <div key={cond} className="bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 space-y-2">
                    <span className="text-xs font-mono font-bold text-white block border-b border-[#242424] pb-1">
                      {formatDisplayCopy(cond)}
                    </span>
                    <div className="space-y-1.5">
                      {methods.map((m) => {
                        const row = filtered.find((r) => (r as any)[condKey] === cond && r.method === m);
                        const val = Number((row as any)?.[metricKey] ?? 0);
                        const col = METHOD_COLORS[m] || "#CCCCCC";
                        return (
                          <div key={m} className="space-y-0.5 text-[10px] font-mono">
                            <div className="flex justify-between">
                              <span style={{ color: col }}>{formatDisplayCopy(m)}</span>
                              <span className="text-white">{val.toFixed(3)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#222222] rounded overflow-hidden">
                              <div
                                className="h-full rounded"
                                style={{ width: `${Math.min(100, val * 100)}%`, backgroundColor: col }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </Card>
      )}

      {/* ==================== TAB 5: EXP 8 NASA LRO SOMBENCH LUNAR BENCHMARK ==================== */}
      {activeTab === "sombench" && (
        <div className="space-y-6">
          <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2B2B]">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {formatDisplayCopy("NASA LRO WAC SomBench Orbital Crater Explorer (120 Runs)")}
                </h3>
                <span className="text-xs font-mono text-[#888888]">
                  {formatDisplayCopy("Filter real Moon spacecraft tiles by resolution and solar illumination category")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <select
                  value={somSize}
                  onChange={(e) => setSomSize(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#313131] text-white"
                >
                  <option value="all">All Sizes (8x8 & 16x16)</option>
                  <option value="8">8x8 Tiles Only</option>
                  <option value="16">16x16 Tiles Only</option>
                </select>
                <select
                  value={somCategory}
                  onChange={(e) => setSomCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#313131] text-white"
                >
                  <option value="all">All Lunar Categories</option>
                  {somCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aggregated Summary Cards across Filtered SomBench Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {somAggregated.map((agg) => {
                const col = METHOD_COLORS[agg.method] || "#FFFFFF";
                return (
                  <div key={agg.method} className="bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 space-y-2 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold" style={{ color: col }}>
                        {formatDisplayCopy(agg.method)}
                      </span>
                      <span className="text-[10px] text-[#777777]">{agg.count} tiles</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#888888]">Exact F1</span>
                        <span className="text-white font-semibold">{agg.f1_exact.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#888888]">1px F1</span>
                        <span className="text-[#00F0FF] font-semibold">{agg.f1_1px.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#888888]">2px F1</span>
                        <span className="text-[#39D353] font-semibold">{agg.f1_2px.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#888888]">PR AUC</span>
                        <span className="text-[#FFD700]">{agg.pr_auc.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filtered LRO Product Patch Table */}
            <div className="overflow-x-auto max-h-96 overflow-y-auto border border-[#2B2B2B] rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141414] text-[#9B9B9B] uppercase border-b border-[#313131] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">{formatDisplayCopy("LRO WAC Patch")}</th>
                    <th className="py-2 px-3">{formatDisplayCopy("Category")}</th>
                    <th className="py-2 px-3">{formatDisplayCopy("Method")}</th>
                    <th className="py-2 px-3 text-right">Exact F1</th>
                    <th className="py-2 px-3 text-right">1px F1</th>
                    <th className="py-2 px-3 text-right">2px F1</th>
                    <th className="py-2 px-3 text-right">Chamfer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {somFiltered.slice(0, 60).map((r, i) => (
                    <tr key={`${r.patch}_${r.method}_${i}`} className="hover:bg-[#1F1F1F]">
                      <td className="py-2 px-3 text-white truncate max-w-[190px]">{r.patch}</td>
                      <td className="py-2 px-3 text-[#888888]">{formatDisplayCopy(r.category || "")}</td>
                      <td className="py-2 px-3 font-semibold" style={{ color: METHOD_COLORS[r.method] || "#FFF" }}>
                        {formatDisplayCopy(r.method)}
                      </td>
                      <td className="py-2 px-3 text-right text-white">{(r.f1_exact_mean ?? 0).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right text-[#00F0FF]">{(r.f1_1px_mean ?? 0).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right text-[#39D353]">{(r.f1_2px_mean ?? 0).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right text-[#9B9B9B]">
                        {r.chamfer_mean === null || r.chamfer_mean === undefined ? "Inf" : r.chamfer_mean.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};

