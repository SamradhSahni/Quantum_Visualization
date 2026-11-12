"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BatteryCharging,
  Compass,
  Cpu,
  Route,
  ShieldCheck,
  Sliders,
  Sun,
  TrendingUp,
} from "lucide-react";
import { ThreeLunarTerrain } from "@/components/gis/ThreeLunarTerrain";
import { CraterMorphometryCard } from "@/components/gis/CraterMorphometryCard";
import { TemporalInterferometryView } from "@/components/gis/TemporalInterferometryView";
import { GisTheoryFormulaStrip } from "@/components/gis/GisTheoryFormulaStrip";
import { apiFetch } from "@/lib/apiClient";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import {
  AnalyzeTerrainResponse,
  CraterRecord,
  GisEdgeAlgorithm,
  GisLanderProfileId,
  GisPresetId,
  GisRoverProfileId,
  TerrainShaderMode,
} from "@/lib/gisTypes";

const PRESET_OPTIONS: {
  id: GisPresetId;
  label: string;
  defaultSunEl: number;
  defaultSunAz: number;
}[] = [
  { id: "apollo_16", label: "Apollo 16 Descartes", defaultSunEl: 24, defaultSunAz: 135 },
  { id: "shackleton", label: "Shackleton South Pole", defaultSunEl: 2, defaultSunAz: 45 },
  { id: "tycho", label: "Tycho Central Peak", defaultSunEl: 38, defaultSunAz: 110 },
  { id: "lro_wac_real", label: "LRO WAC GeoTIFF", defaultSunEl: 28, defaultSunAz: 125 },
];

const EDGE_BACKBONES: { id: GisEdgeAlgorithm; label: string; badge: string }[] = [
  { id: "FRQI_QHED", label: "FRQI QHED", badge: "7Q" },
  { id: "QPIE_QHED", label: "QPIE QHED", badge: "6Q" },
  { id: "NEQR_GRADIENT", label: "NEQR Subtractor", badge: "24Q" },
  { id: "SOBEL_CLASSICAL", label: "Sobel Baseline", badge: "0Q" },
];

const LANDER_OPTIONS: { id: GisLanderProfileId; label: string; spec: string }[] = [
  { id: "ARTEMIS_HLS_STARSHIP_50M", label: "Starship 50m", spec: "R=25m | 8.5°" },
  { id: "BLUE_MOON_MK1_15M", label: "Blue Moon 15m", spec: "R=7.5m | 10°" },
  { id: "CHANDRAYAAN_VIKRAM_12M", label: "Vikram 12m", spec: "R=6.0m | 12°" },
];

const ROVER_OPTIONS: { id: GisRoverProfileId; label: string; mass: number }[] = [
  { id: "VIPER", label: "VIPER 450kg", mass: 450 },
  { id: "LTV", label: "LTV 210kg", mass: 210 },
  { id: "PRAGYAN", label: "Pragyan 27kg", mass: 27 },
];

export default function GisExplorerPage() {
  // Region & Photometry Controls
  const [preset, setPreset] = useState<GisPresetId>("apollo_16");
  const [verticalExaggeration, setVerticalExaggeration] = useState<number>(2.5);
  const [sunElevationDeg, setSunElevationDeg] = useState<number>(24);
  const [sunAzimuthDeg, setSunAzimuthDeg] = useState<number>(135);
  const [shaderMode, setShaderMode] = useState<TerrainShaderMode>("elevation");

  // Quantum Edge Controls
  const [algorithm, setAlgorithm] = useState<GisEdgeAlgorithm>("FRQI_QHED");
  const [edgeThreshold, setEdgeThreshold] = useState<number>(0.22);
  const [edgeColor, setEdgeColor] = useState<string>("#FF79C6");
  const [showEdgeOverlay, setShowEdgeOverlay] = useState<boolean>(true);

  // Artemis Lander Safety Controls
  const [landerProfile, setLanderProfile] = useState<GisLanderProfileId>("ARTEMIS_HLS_STARSHIP_50M");
  const [padGsd, setPadGsd] = useState<number>(5.0);
  const [candidateCoord, setCandidateCoord] = useState<{ x_px: number; y_px: number } | null>(null);
  const [isCustomProbe, setIsCustomProbe] = useState<boolean>(false);

  // Rover Transect Controls (96x96 grid coordinates)
  const [startA, setStartA] = useState<[number, number]>([14, 52]);
  const [endB, setEndB] = useState<[number, number]>([82, 46]);
  const [roverProfile, setRoverProfile] = useState<GisRoverProfileId>("VIPER");
  const [routeMode, setRouteMode] = useState<"direct" | "safe_detour">("direct");
  const [hoverSampleIdx, setHoverSampleIdx] = useState<number | null>(null);

  // Crater Highlight State
  const [selectedCrater, setSelectedCrater] = useState<CraterRecord | null>(null);

  // Backend Sync State
  const [terrainData, setTerrainData] = useState<AnalyzeTerrainResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSelectPreset = (nextPreset: GisPresetId) => {
    const cfg = PRESET_OPTIONS.find((p) => p.id === nextPreset);
    setPreset(nextPreset);
    setCandidateCoord(null);
    setIsCustomProbe(false);
    setSelectedCrater(null);
    if (cfg) {
      setSunElevationDeg(cfg.defaultSunEl);
      setSunAzimuthDeg(cfg.defaultSunAz);
    }
    if (nextPreset === "shackleton") {
      setShaderMode("psr");
    } else if (nextPreset === "lro_wac_real") {
      setShaderMode("lommel");
    } else {
      setShaderMode("elevation");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await apiFetch("/api/v1/gis/analyze-terrain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            preset_id: preset,
            resolution: 96,
            algorithm,
            edge_threshold: edgeThreshold,
            lander_profile: landerProfile,
            pad_gsd_m_px: padGsd,
            candidate_landing_coord: candidateCoord,
            transect_line: { start_px: startA, end_px: endB },
            rover_profile: roverProfile,
            route_mode: routeMode,
            sun_azimuth_deg: sunAzimuthDeg,
            sun_elevation_deg: sunElevationDeg,
            gsd_m_px: 59.0,
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json: AnalyzeTerrainResponse = await res.json();
        setTerrainData(json);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setApiError(err?.message || "Failed to analyze terrain");
        }
      } finally {
        setLoading(false);
      }
    }, 90);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    preset,
    algorithm,
    edgeThreshold,
    landerProfile,
    padGsd,
    candidateCoord,
    startA,
    endB,
    roverProfile,
    routeMode,
    sunAzimuthDeg,
    sunElevationDeg,
  ]);

  const safety = terrainData?.landing_safety_analysis;
  const topZones = safety?.top_5_safe_zones ?? [];
  const landerComps = safety?.lander_comparison ?? [];
  const transect = terrainData?.transect_profile;
  const transectComp = terrainData?.transect_comparison;
  const chronology = terrainData?.crater_chronology;
  const qStats = terrainData?.quantum_edge_stats;
  const photMeta = terrainData?.photometry_meta;
  const siteMeta = terrainData?.site_metadata;

  // Compute SVG chart paths from live backend transect samples
  const transectSvg = useMemo(() => {
    const samples = transect?.samples_256 ?? [];
    if (samples.length < 2) {
      return { pathD: "", areaD: "", spikes: [], zeroY: 60, minE: 0, maxE: 0 };
    }
    const elevs = samples.map((s) => s.elevation_m);
    const minE = Math.min(...elevs);
    const maxE = Math.max(minE + 50, ...elevs);
    const span = maxE - minE;
    const W = 320;
    const H = 112;
    const padTop = 10;
    const padBot = 12;
    const usableH = H - padTop - padBot;

    const toX = (i: number) => (i / (samples.length - 1)) * W;
    const toY = (e: number) => padTop + (1 - (e - minE) / span) * usableH;

    const pts = samples.map((s, i) => `${toX(i).toFixed(1)} ${toY(s.elevation_m).toFixed(1)}`);
    const pathD = `M ${pts.join(" L ")}`;
    const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;
    const zeroY = Math.max(padTop, Math.min(H - padBot, toY(0)));

    const spikes = samples
      .map((s, i) => ({
        x: toX(i),
        yBase: toY(s.elevation_m),
        prob: s.quantum_edge_prob,
        slope: s.slope_deg,
      }))
      .filter((sp) => sp.prob >= 0.28 || Math.abs(sp.slope) >= 14.0);

    return { pathD, areaD, spikes, zeroY, minE: Math.round(minE), maxE: Math.round(maxE) };
  }, [transect]);

  const penaltyTotal = Math.max(0.001, safety?.total_penalty ?? 0.001);
  const slopePct = Math.round(((safety?.slope_penalty ?? 0) / penaltyTotal) * 100);
  const hazardPct = Math.round(((safety?.hazard_penalty ?? 0) / penaltyTotal) * 100);
  const roughPct = Math.max(0, 100 - slopePct - hazardPct);

  const hoverSample =
    hoverSampleIdx !== null && transect?.samples_256?.[hoverSampleIdx]
      ? transect.samples_256[hoverSampleIdx]
      : null;

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navigation & Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#888888] hover:text-white bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-lg transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {formatDisplayCopy("Back to Live Studio")}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#00F0FF] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg">
              {siteMeta?.crs || "IAU 2015:30100"}
            </span>
            {qStats && (
              <span className="text-xs font-mono text-[#FF79C6] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg">
                {formatDisplayCopy(`${qStats.algorithm_display} | ${qStats.edge_density_pct}% Edges`)}
              </span>
            )}
            <span className="text-xs font-mono text-[#39D353] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg">
              {loading ? formatDisplayCopy("Computing Quantum DEM") : formatDisplayCopy("Live Backend Synced")}
            </span>
          </div>
        </div>

        {apiError && (
          <div className="bg-[#1F1F1F] border border-[#EF4444] rounded-xl px-4 py-3 text-xs font-mono text-[#EF4444]">
            {formatDisplayCopy(`GIS Backend Error: ${apiError}`)}
          </div>
        )}

        {/* Master 3D WebGL Viewport & Integrated Controls */}
        <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                <span className="text-xs uppercase tracking-wider font-mono text-[#00F0FF]">
                  {formatDisplayCopy("Pillar 2: Planetary 3D GIS & Artemis Mission Planner")}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {formatDisplayCopy("3D Lunar GIS & Quantum Terrain Analyzer")}
              </h1>
              <p className="text-sm text-[#A1A1A1] mt-1 max-w-3xl">
                {formatDisplayCopy(
                  "Hardware accelerated Three.js LOLA DEM mesh driven by Lommel Seeliger radiative transfer, ray cast PSR shadows, real Quantum Edge operators, Artemis Touchdown LSI, and A Star rover routing."
                )}
              </p>
            </div>

            {/* Lunar Region Preset Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-[#888888] mr-1">
                {formatDisplayCopy("Site")}:
              </span>
              {PRESET_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    preset === p.id
                      ? "bg-[#272727] text-white border-[#00F0FF]"
                      : "bg-[#1F1F1F] text-[#888888] border-[#313131] hover:text-white hover:bg-[#272727]"
                  }`}
                >
                  {formatDisplayCopy(p.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Quantum Edge Backbone Ribbon */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141414] border border-[#2B2B2B] rounded-xl p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#888888] flex items-center gap-1.5 mr-1">
                <Cpu className="w-3.5 h-3.5 text-[#FF79C6]" />
                {formatDisplayCopy("Edge Operator")}:
              </span>
              {EDGE_BACKBONES.map((alg) => (
                <button
                  key={alg.id}
                  type="button"
                  onClick={() => setAlgorithm(alg.id)}
                  className={`text-xs font-mono px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                    algorithm === alg.id
                      ? "bg-[#272727] text-white border-[#FF79C6]"
                      : "bg-[#1F1F1F] text-[#888888] border-[#313131] hover:text-white"
                  }`}
                >
                  <span>{formatDisplayCopy(alg.label)}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#141414] text-[#00F0FF]">
                    {alg.badge}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEdgeOverlay(!showEdgeOverlay)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                  showEdgeOverlay
                    ? "bg-[#272727] text-white border-[#FF79C6]"
                    : "bg-[#181818] text-[#888888] border-[#313131]"
                }`}
              >
                {showEdgeOverlay
                  ? formatDisplayCopy("Edge Overlay: Visible")
                  : formatDisplayCopy("Edge Overlay: Hidden")}
              </button>

              <div className="flex items-center gap-1.5">
                {["#FF79C6", "#00F0FF", "#39D353", "#FFD700"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Edge color ${c}`}
                    onClick={() => setEdgeColor(c)}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      edgeColor === c
                        ? "scale-125 border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4 Physical & Quantum Telemetry Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#1F1F1F] border border-[#313131] rounded-xl p-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
                  {formatDisplayCopy("Vertical Z Scale")}
                </span>
                <span className="font-mono text-[#00F0FF]">{verticalExaggeration.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={verticalExaggeration}
                onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#777777] block">
                {formatDisplayCopy("Visual height only; physical slopes stay invariant")}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#FFD700]" />
                  {formatDisplayCopy("Sun Elevation")}
                </span>
                <span className="font-mono text-[#FFD700]">{sunElevationDeg}°</span>
              </div>
              <input
                type="range"
                min="1"
                max="80"
                step="1"
                value={sunElevationDeg}
                onChange={(e) => setSunElevationDeg(parseInt(e.target.value, 10))}
                className="w-full accent-[#FFD700] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#777777] block">
                {formatDisplayCopy(
                  `PSR Shadow Coverage: ${photMeta?.psr_fraction_pct ?? 0}%`
                )}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#39D353]" />
                  {formatDisplayCopy("Sun Azimuth")}
                </span>
                <span className="font-mono text-[#39D353]">{sunAzimuthDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={sunAzimuthDeg}
                onChange={(e) => setSunAzimuthDeg(parseInt(e.target.value, 10))}
                className="w-full accent-[#39D353] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#777777] block">
                {formatDisplayCopy("Rotates ray cast horizon shadows & edge contrast")}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#FF79C6]" />
                  {formatDisplayCopy("Edge Threshold")} (τ)
                </span>
                <span className="font-mono text-[#FF79C6]">{edgeThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.60"
                step="0.02"
                value={edgeThreshold}
                onChange={(e) => setEdgeThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#FF79C6] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#777777] block">
                {formatDisplayCopy(
                  `Drives H_q Hazard & ${qStats?.cnot_depth_per_tile ?? 0} CNOT/tile operator`
                )}
              </span>
            </div>
          </div>

          {/* Real 3D Three.js WebGL Viewport */}
          <div className="w-full h-[540px] rounded-xl overflow-hidden border border-[#313131] bg-[#080A0F]">
            <ThreeLunarTerrain
              heightsGrid={terrainData?.heights_grid}
              lommelGrid={terrainData?.lommel_grid}
              slopeGrid={terrainData?.slope_grid}
              psrGrid={terrainData?.psr_grid}
              quantumEdgesGrid={terrainData?.quantum_edges_grid}
              edgeOverlayColor={edgeColor}
              edgeThreshold={edgeThreshold}
              verticalExaggeration={verticalExaggeration}
              showEdgeOverlay={showEdgeOverlay}
              shaderMode={shaderMode}
              onShaderModeChange={setShaderMode}
              betaCritDeg={safety?.beta_crit_deg ?? 8.5}
              minElevationM={siteMeta?.min_elevation_m}
              maxElevationM={siteMeta?.max_elevation_m}
              landingZones={topZones}
              activeLandingEval={safety}
              transectSamples={transect?.samples_256}
              selectedCrater={selectedCrater}
              presetName={siteMeta?.display_name || "Apollo 16 Descartes Highlands"}
              isLoading={loading}
              onSelectTerrainCoord={(xPx, yPx) => {
                setCandidateCoord({ x_px: xPx, y_px: yPx });
                setIsCustomProbe(true);
              }}
            />
          </div>

          {/* Photometry & Quantum GIS Coupling Strip */}
          <GisTheoryFormulaStrip
            title="Lommel Seeliger Photometry & Horizon Ray Casting"
            accentColor="#FFD700"
            roleSummary="Unlike terrestrial Lambertian surfaces, lunar regolith scatters isotropically under single scattering radiative transfer. Vectorized ray marching computes V_occ horizon blocking to map Permanently Shadowed Regions (PSR < 110 K cold traps), while Quantum Edge operators extract rock rims directly from orbital radiance."
            symbolicMath={String.raw`R(\mu_0, \mu) = \frac{V_{\text{occ}} \cdot \mu_0}{V_{\text{occ}} \cdot \mu_0 + \mu + \epsilon}, \qquad \mu_0 = \max(0, \hat{n}\cdot\hat{s}), \quad \mu = \hat{n}_z`}
            liveSubstitutionMath={
              photMeta
                ? String.raw`e_\odot = ${photMeta.sun_elevation_deg}^\circ,\; \phi_\odot = ${photMeta.sun_azimuth_deg}^\circ \implies \overline{R} = ${photMeta.mean_reflectance},\; \text{PSR} = ${photMeta.psr_fraction_pct}\%`
                : undefined
            }
          />
        </div>

        {/* Middle Split: Artemis Touchdown LSI & Rover Transect Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module 1: Artemis Touchdown Safety Index (LSI) Analyzer */}
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#39D353]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {formatDisplayCopy("Artemis Touchdown Safety Analyzer")}
                    </h2>
                    <span className="text-xs font-mono text-[#888888]">
                      {formatDisplayCopy("Landing Safety Index (LSI in 0 to 100)")}
                    </span>
                  </div>
                </div>

                {/* Lander Footprint Selector */}
                <div className="flex items-center gap-1 bg-[#1F1F1F] p-1 rounded-lg border border-[#313131]">
                  {LANDER_OPTIONS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanderProfile(l.id)}
                      className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                        landerProfile === l.id
                          ? "bg-[#272727] text-white font-semibold border border-[#00F0FF]"
                          : "text-[#888888] hover:text-white border border-transparent"
                      }`}
                    >
                      {formatDisplayCopy(l.label)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pad Scale Selector (Resolves 50m vs 15m vs 12m Radii) */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#141414] border border-[#2B2B2B] rounded-lg px-3 py-2 text-[11px] font-mono">
                <span className="text-[#888888]">
                  {formatDisplayCopy("Pad Sampling Resolution")}:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { val: 2.0, label: "2 m/px NAC" },
                    { val: 5.0, label: "5 m/px Pad" },
                    { val: 59.0, label: "59 m/px Global" },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setPadGsd(g.val)}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        padGsd === g.val
                          ? "bg-[#272727] text-[#00F0FF] border-[#00F0FF]"
                          : "bg-[#181818] text-[#888888] border-[#313131] hover:text-white"
                      }`}
                    >
                      {formatDisplayCopy(g.label)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Evaluated Landing Pad Card */}
              {safety && (
                <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {formatDisplayCopy(safety.zone_name)}
                        </span>
                        {isCustomProbe && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40">
                            {formatDisplayCopy("Custom Surface Probe")}
                          </span>
                        )}
                        {safety.in_psr_shadow && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40">
                            {formatDisplayCopy("PSR Dark")}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#888888] block mt-0.5">
                        {safety.selenographic_label} | px ({safety.coord.x_px}, {safety.coord.y_px}) | {safety.elevation_m} m
                      </span>
                    </div>
                    <span
                      className="text-xs font-mono font-bold px-3 py-1 rounded border"
                      style={{
                        color: safety.status_color,
                        backgroundColor: `${safety.status_color}18`,
                        borderColor: `${safety.status_color}50`,
                      }}
                    >
                      LSI {safety.landing_safety_index} / 100 ({formatDisplayCopy(safety.status_label)})
                    </span>
                  </div>

                  {/* Three Physical Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="bg-[#1F1F1F] p-2 rounded-lg border border-[#313131]">
                      <span className="text-[10px] text-[#888888] block">
                        {formatDisplayCopy("Max Slope")}
                      </span>
                      <span className="text-xs font-bold text-white">{safety.max_slope_deg}°</span>
                      <span className="text-[9px] text-[#777777] block">
                        {formatDisplayCopy(`Limit ${safety.beta_crit_deg}°`)}
                      </span>
                    </div>
                    <div className="bg-[#1F1F1F] p-2 rounded-lg border border-[#313131]">
                      <span className="text-[10px] text-[#888888] block">
                        {formatDisplayCopy("Quantum Hazard")}
                      </span>
                      <span className="text-xs font-bold text-[#FF79C6]">
                        {safety.quantum_rim_hazard_pct}%
                      </span>
                      <span className="text-[9px] text-[#777777] block">
                        {formatDisplayCopy(`Weight ${safety.gamma_q}`)}
                      </span>
                    </div>
                    <div className="bg-[#1F1F1F] p-2 rounded-lg border border-[#313131]">
                      <span className="text-[10px] text-[#888888] block">
                        {formatDisplayCopy("RMS Roughness")}
                      </span>
                      <span className="text-xs font-bold text-white">{safety.rms_roughness_m} m</span>
                      <span className="text-[9px] text-[#777777] block">
                        {formatDisplayCopy(`Limit ${safety.sigma_crit_m} m`)}
                      </span>
                    </div>
                  </div>

                  {/* Stacked Penalty Attribution Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#888888]">
                      <span>{formatDisplayCopy("Hazard Penalty Attribution")}</span>
                      <span>
                        P = {safety.total_penalty.toFixed(2)} (rad {safety.footprint_radius_px} px)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#1F1F1F] overflow-hidden flex border border-[#313131]">
                      <div
                        style={{ width: `${slopePct}%`, backgroundColor: "#FFD700" }}
                        title={`Slope Penalty: ${safety.slope_penalty}`}
                      />
                      <div
                        style={{ width: `${hazardPct}%`, backgroundColor: "#FF79C6" }}
                        title={`Quantum Edge Hazard: ${safety.hazard_penalty}`}
                      />
                      <div
                        style={{ width: `${roughPct}%`, backgroundColor: "#00F0FF" }}
                        title={`Roughness Penalty: ${safety.roughness_penalty}`}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-[#888888]">
                      <span className="text-[#FFD700]">Slope {safety.slope_penalty.toFixed(2)}</span>
                      <span className="text-[#FF79C6]">Quantum {safety.hazard_penalty.toFixed(2)}</span>
                      <span className="text-[#00F0FF]">Roughness {safety.roughness_penalty.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Cross-Lander Comparison Strip for Active Spot */}
                  {landerComps.length > 0 && (
                    <div className="pt-2 border-t border-[#242424] grid grid-cols-3 gap-1.5">
                      {landerComps.map((c) => (
                        <button
                          key={c.lander_profile}
                          type="button"
                          onClick={() => setLanderProfile(c.lander_profile)}
                          className={`p-1.5 rounded-lg border text-left font-mono transition-colors ${
                            landerProfile === c.lander_profile
                              ? "bg-[#1F1F1F] border-[#00F0FF]"
                              : "bg-[#161616] border-[#292929] hover:bg-[#1F1F1F]"
                          }`}
                        >
                          <span className="text-[9px] text-[#888888] block">
                            {formatDisplayCopy(c.lander_short)}
                          </span>
                          <span className="text-[11px] font-bold" style={{ color: c.status_color }}>
                            LSI {c.landing_safety_index}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ranked Candidate Touchdown Zones */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                  <span>{formatDisplayCopy("Discovered Terrain Landing Candidates")}:</span>
                  {isCustomProbe && (
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateCoord(null);
                        setIsCustomProbe(false);
                      }}
                      className="text-[10px] text-[#00F0FF] hover:underline"
                    >
                      {formatDisplayCopy("Snap to Top Zone")}
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {topZones.map((z) => {
                    const isSelected =
                      !isCustomProbe &&
                      safety &&
                      z.coord.x_px === safety.coord.x_px &&
                      z.coord.y_px === safety.coord.y_px;
                    return (
                      <button
                        key={`${z.rank}_${z.coord.x_px}_${z.coord.y_px}`}
                        type="button"
                        onClick={() => {
                          setCandidateCoord(z.coord);
                          setIsCustomProbe(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs font-mono transition-colors ${
                          isSelected
                            ? "bg-[#1F1F1F] border-[#00F0FF] text-white"
                            : "bg-[#181818] border-[#313131] text-[#888888] hover:bg-[#1F1F1F] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: z.status_color }}
                          />
                          <span>
                            #{z.rank}: {formatDisplayCopy(z.zone_name)}
                          </span>
                          <span className="text-[10px] text-[#666666]">
                            ({z.max_slope_deg}°)
                          </span>
                        </div>
                        <span className="font-bold shrink-0" style={{ color: z.status_color }}>
                          LSI {z.landing_safety_index}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <GisTheoryFormulaStrip
              title="Artemis Composite Safety Equation (LSI)"
              accentColor="#39D353"
              roleSummary="Spacecraft leg span R determines how wide the quantum boulder map and planar detrended roughness are sampled. Smaller landers tolerate steeper tilts (higher beta_crit) and avoid straddling crater micro boulders."
              symbolicMath={String.raw`\text{LSI} = 100 \exp\!\left[-\left(\left(\frac{\beta_{\max}}{\beta_{\text{crit}}}\right)^2 + \gamma_q H_q + \gamma_r \frac{\sigma_h}{\sigma_{\text{crit}}}\right)\right]`}
              liveSubstitutionMath={
                safety
                  ? String.raw`\text{LSI} = 100\,\exp\!\left(-[${safety.slope_penalty.toFixed(2)} + ${safety.hazard_penalty.toFixed(2)} + ${safety.roughness_penalty.toFixed(2)}]\right) = ${safety.landing_safety_index}`
                  : undefined
              }
            />
          </div>

          {/* Module 2: Elevation Transect Slicer & Rover Mobility Planner */}
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#00F0FF]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {formatDisplayCopy("Elevation Transect & Rover Mobility Planner")}
                    </h2>
                    <span className="text-xs font-mono text-[#888888]">
                      {formatDisplayCopy("Cross Section Slicer & A Star Quantum Safe Path")}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono bg-[#1F1F1F] border border-[#313131] text-[#00F0FF] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-[#39D353]" />
                  {transect ? `${transect.rover_energy_wh} Wh` : "0.0 Wh"}
                </span>
              </div>

              {/* Rover Spec & Routing Mode Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-1 bg-[#1F1F1F] p-1 rounded-lg border border-[#313131]">
                  {ROVER_OPTIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoverProfile(r.id)}
                      className={`flex-1 text-[10px] font-mono py-1 px-1.5 rounded transition-colors ${
                        roverProfile === r.id
                          ? "bg-[#272727] text-white font-semibold border border-[#00F0FF]"
                          : "text-[#888888] hover:text-white border border-transparent"
                      }`}
                    >
                      {formatDisplayCopy(r.label)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-[#1F1F1F] p-1 rounded-lg border border-[#313131]">
                  <button
                    type="button"
                    onClick={() => setRouteMode("direct")}
                    className={`flex-1 text-[10px] font-mono py-1 px-2 rounded transition-colors ${
                      routeMode === "direct"
                        ? "bg-[#272727] text-white font-semibold border border-[#00F0FF]"
                        : "text-[#888888] hover:text-white border border-transparent"
                    }`}
                  >
                    {formatDisplayCopy("Direct Geodesic")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouteMode("safe_detour")}
                    className={`flex-1 text-[10px] font-mono py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors ${
                      routeMode === "safe_detour"
                        ? "bg-[#272727] text-[#39D353] font-semibold border border-[#39D353]"
                        : "text-[#888888] hover:text-white border border-transparent"
                    }`}
                  >
                    <Route className="w-3 h-3" />
                    <span>{formatDisplayCopy("A Star Safe Detour")}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Transect Endpoints A & B Sliders */}
              <div className="grid grid-cols-2 gap-3 bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 text-[10px] font-mono">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#39D353]">{formatDisplayCopy("Start A (x, y)")}</span>
                    <span className="text-white">({startA[0]}, {startA[1]})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#666666]">X</span>
                    <input
                      type="range"
                      min="6"
                      max="88"
                      value={startA[0]}
                      onChange={(e) => setStartA([parseInt(e.target.value, 10), startA[1]])}
                      className="w-full accent-[#39D353] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#666666]">Y</span>
                    <input
                      type="range"
                      min="6"
                      max="88"
                      value={startA[1]}
                      onChange={(e) => setStartA([startA[0], parseInt(e.target.value, 10)])}
                      className="w-full accent-[#39D353] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#FFD700]">{formatDisplayCopy("Target B (x, y)")}</span>
                    <span className="text-white">({endB[0]}, {endB[1]})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#666666]">X</span>
                    <input
                      type="range"
                      min="6"
                      max="88"
                      value={endB[0]}
                      onChange={(e) => setEndB([parseInt(e.target.value, 10), endB[1]])}
                      className="w-full accent-[#FFD700] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#666666]">Y</span>
                    <input
                      type="range"
                      min="6"
                      max="88"
                      value={endB[1]}
                      onChange={(e) => setEndB([endB[0], parseInt(e.target.value, 10)])}
                      className="w-full accent-[#FFD700] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Backend-Driven SVG Transect Graph */}
              <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-4">
                <div className="flex justify-between text-[10px] font-mono text-[#888888] mb-2">
                  <span>
                    {formatDisplayCopy(`Relief: ${transectSvg.minE} m to ${transectSvg.maxE} m`)}
                  </span>
                  <span className="text-[#FF79C6]">
                    {hoverSample
                      ? `${hoverSample.dist_km} km | ${hoverSample.elevation_m} m | ${hoverSample.slope_deg}° | P ${hoverSample.quantum_edge_prob}`
                      : formatDisplayCopy("Pink Bars: Quantum Boulder Edges")}
                  </span>
                </div>

                <div className="h-32 w-full relative">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 320 112"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      const samples = transect?.samples_256;
                      if (!samples || samples.length === 0) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
                      setHoverSampleIdx(Math.round(frac * (samples.length - 1)));
                    }}
                    onMouseLeave={() => setHoverSampleIdx(null)}
                  >
                    <line
                      x1="0"
                      y1={transectSvg.zeroY}
                      x2="320"
                      y2={transectSvg.zeroY}
                      stroke="#313131"
                      strokeDasharray="3,3"
                    />
                    {transectSvg.areaD && (
                      <path d={transectSvg.areaD} fill="#00F0FF" fillOpacity={0.09} />
                    )}
                    {transectSvg.spikes.map((sp, i) => (
                      <line
                        key={i}
                        x1={sp.x}
                        y1={sp.yBase}
                        x2={sp.x}
                        y2={Math.max(4, sp.yBase - sp.prob * 32)}
                        stroke="#FF79C6"
                        strokeWidth="1.6"
                      />
                    ))}
                    {transectSvg.pathD && (
                      <path
                        d={transectSvg.pathD}
                        fill="none"
                        stroke={routeMode === "safe_detour" ? "#39D353" : "#00F0FF"}
                        strokeWidth="2"
                      />
                    )}
                    {hoverSampleIdx !== null && transect?.samples_256 && (
                      <line
                        x1={(hoverSampleIdx / Math.max(1, transect.samples_256.length - 1)) * 320}
                        y1="0"
                        x2={(hoverSampleIdx / Math.max(1, transect.samples_256.length - 1)) * 320}
                        y2="112"
                        stroke="#FFD700"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#666666] pt-1 border-t border-[#222222]">
                  <span>0.0 km (Start A)</span>
                  <span>
                    {transect ? (transect.total_distance_km / 2).toFixed(2) : "0.00"} km
                  </span>
                  <span>{transect?.total_distance_km ?? 0} km (End B)</span>
                </div>
              </div>

              {/* Direct vs A* Safe Detour Telemetry Comparison */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-[#1F1F1F] p-2.5 rounded-lg border border-[#313131]">
                  <span className="text-[10px] text-[#888888] block">
                    {formatDisplayCopy("Traverse Dist")}
                  </span>
                  <span className="font-bold text-white">
                    {transect?.total_distance_km ?? 0} km
                  </span>
                  {transectComp && (
                    <span className="text-[9px] text-[#777777] block">
                      {formatDisplayCopy(
                        routeMode === "safe_detour"
                          ? `Direct ${transectComp.direct.total_distance_km} km`
                          : `Detour ${transectComp.safe_detour.total_distance_km} km`
                      )}
                    </span>
                  )}
                </div>
                <div className="bg-[#1F1F1F] p-2.5 rounded-lg border border-[#313131]">
                  <span className="text-[10px] text-[#888888] block">
                    {formatDisplayCopy("Max Climb Grade")}
                  </span>
                  <span className="font-bold text-[#FFD700]">
                    {transect?.max_grade_deg ?? 0}°
                  </span>
                  {transectComp && (
                    <span className="text-[9px] text-[#777777] block">
                      {formatDisplayCopy(
                        routeMode === "safe_detour"
                          ? `Direct ${transectComp.direct.max_grade_deg}°`
                          : `Detour ${transectComp.safe_detour.max_grade_deg}°`
                      )}
                    </span>
                  )}
                </div>
                <div className="bg-[#1F1F1F] p-2.5 rounded-lg border border-[#313131]">
                  <span className="text-[10px] text-[#888888] block">
                    {formatDisplayCopy("Energy Budget")}
                  </span>
                  <span className="font-bold text-[#39D353]">
                    {transect?.rover_energy_wh ?? 0} Wh
                  </span>
                  {transectComp && (
                    <span className="text-[9px] text-[#FF79C6] block">
                      {formatDisplayCopy(`${transect?.edge_crossings_count ?? 0} Boulder Hits`)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <GisTheoryFormulaStrip
              title="Rover Mobility Work & Quantum Slip Drag"
              accentColor="#00F0FF"
              roleSummary="Mechanical power integrates rolling resistance and uphill gravity component along segments with zero downhill regeneration. Quantum edge detections along wheels raise effective slip resistance mu_eff."
              symbolicMath={String.raw`E_{\text{mech}} = \frac{1}{3600}\sum_{i} \max\!\Big(0,\; m\,g_{\text{moon}}\big(\mu_r(1 + 1.6\,P_{\text{edge}})\cos\theta_i + \sin\theta_i\big)\Big)\Delta s_i`}
              liveSubstitutionMath={
                transect
                  ? String.raw`m = ${transect.rover_mass_kg}\text{ kg},\; \theta_{\max} = ${transect.max_grade_deg}^\circ \implies E_{\text{mech}} = ${transect.rover_energy_wh}\text{ Wh}`
                  : undefined
              }
            />
          </div>
        </div>

        {/* Bottom Split: Fitzgibbon Crater Chronology & Temporal Phase Interferometry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CraterMorphometryCard
            craters={chronology?.craters ?? []}
            chronology={chronology ?? null}
            geojsonObj={chronology?.geojson}
            presetId={preset}
            selectedCraterId={selectedCrater?.crater_id ?? null}
            onSelectCrater={(c) => setSelectedCrater(c)}
          />
          <TemporalInterferometryView />
        </div>
      </div>
    </div>
  );
}
