"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Box,
  Compass,
  Cpu,
  Layers,
  RefreshCw,
  TrendingDown,
} from "lucide-react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { apiFetch } from "@/lib/apiClient";
import {
  CostFunctionId,
  QcnnAnsatzId,
  QmlPipelineResponse,
  QmlPresetId,
} from "@/lib/qmlTypes";
import { QmlMatrixCanvas } from "@/components/qml/QmlMatrixCanvas";
import { Hilbert3DProjector } from "@/components/qml/Hilbert3DProjector";
import { BarrenPlateauChart } from "@/components/qml/BarrenPlateauChart";
import { GroverOscilloscopePanel } from "@/components/qml/GroverOscilloscopePanel";
import { GisTheoryFormulaStrip } from "@/components/gis/GisTheoryFormulaStrip";

const CLASS_ORDER_META: { name: string; color: string; desc: string }[] = [
  {
    name: "Primary Impact Rim",
    color: "#FF79C6",
    desc: "Steep elevated rim walls identified by elevated high frequency gradient",
  },
  {
    name: "Smooth Mare Basalt",
    color: "#71717A",
    desc: "Low roughness flat volcanic plains with minimal high frequency noise",
  },
  {
    name: "Sinuous Lunar Rille",
    color: "#00F0FF",
    desc: "Volcanic collapsed lava tubes and asymmetric tectonic fractures",
  },
  {
    name: "Bright Ejecta Blanket",
    color: "#FFD700",
    desc: "High albedo radial ejecta scatter from fresh impact events",
  },
  {
    name: "Polar Ice Cold Trap",
    color: "#39D353",
    desc: "Cryogenic PSR reservoir with high SAR circular polarization ratio",
  },
];

const MISSION_PRESETS: { id: QmlPresetId; label: string }[] = [
  { id: "shackleton", label: "Shackleton South Pole PSR" },
  { id: "apollo16", label: "Apollo 16 Descartes" },
  { id: "rille", label: "Aristarchus Sinuous Rille" },
];

const ANSATZ_OPTIONS: { id: QcnnAnsatzId; label: string }[] = [
  { id: "STRONGLY_ENTANGLING_RING", label: "Cyclic CNOT Ring" },
  { id: "HARDWARE_EFFICIENT_LINEAR", label: "Linear CZ Ladder" },
  { id: "ISWAP_IQP_KERNEL", label: "IQP ZZ Kernel" },
];

export const QmlPipelineWorkbench: React.FC = () => {
  // Mission & QCNN Controls
  const [selectedPreset, setSelectedPreset] = useState<QmlPresetId>("shackleton");
  const [activeAnsatz, setActiveAnsatz] = useState<QcnnAnsatzId>("STRONGLY_ENTANGLING_RING");
  const [selectedPatchId, setSelectedPatchId] = useState<number>(27);

  // Stage 1: Wavelet Equalizer State
  const [speckleNoise, setSpeckleNoise] = useState<number>(0.10);
  const [lhGain, setLhGain] = useState<number>(1.0);
  const [hlGain, setHlGain] = useState<number>(1.0);
  const [hhCut, setHhCut] = useState<number>(0.85);

  // Stage 2: NCQI Multi-Spectral Mixer State
  const [wOpt, setWOpt] = useState<number>(0.20);
  const [wTherm, setWTherm] = useState<number>(0.35);
  const [wSar, setWSar] = useState<number>(0.45);

  // Stage 4: Barren Plateau Diagnostics State
  const [costFunctionType, setCostFunctionType] = useState<CostFunctionId>("LOCAL_PAULI_Z");
  const [bpQubits, setBpQubits] = useState<number>(6);
  const [bpDepth, setBpDepth] = useState<number>(4);

  // Stage 5: Grover Oscilloscope State
  const [groverIter, setGroverIter] = useState<number>(1);

  // Backend Pipeline Response State
  const [pipelineData, setPipelineData] = useState<QmlPipelineResponse | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sumW = Math.max(1e-5, wOpt + wTherm + wSar);
  const normOpt = wOpt / sumW;
  const normTherm = wTherm / sumW;
  const normSar = wSar / sumW;

  const executePipeline = useCallback(
    async (signal?: AbortSignal) => {
      setIsRunning(true);
      setErrorMsg(null);
      try {
        const res = await apiFetch("/api/v1/qml/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({
            preset_id: selectedPreset,
            wavelet_attenuation: { lh_gain: lhGain, hl_gain: hlGain, hh_cut: hhCut },
            speckle_noise: speckleNoise,
            spectral_weights: { optical: normOpt, thermal: normTherm, sar_cpr: normSar },
            qcnn_ansatz: activeAnsatz,
            cost_function_type: costFunctionType,
            num_qubits: bpQubits,
            circuit_depth: bpDepth,
            grover_iterations: groverIter,
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json: QmlPipelineResponse = await res.json();
        setPipelineData(json);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setErrorMsg(err?.message || "QML pipeline request failed");
        }
      } finally {
        setIsRunning(false);
      }
    },
    [
      selectedPreset,
      lhGain,
      hlGain,
      hhCut,
      speckleNoise,
      normOpt,
      normTherm,
      normSar,
      activeAnsatz,
      costFunctionType,
      bpQubits,
      bpDepth,
      groverIter,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      executePipeline(controller.signal);
    }, 85);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [executePipeline]);

  const qwt = pipelineData?.wavelet_telemetry;
  const ncqi = pipelineData?.multi_spectral_fusion;
  const qcnn = pipelineData?.qcnn_classification;
  const bp = pipelineData?.barren_plateau_diagnostics;
  const grover = pipelineData?.grover_oscilloscope;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header, Mission Target Selector & End-to-End Stage Dataflow */}
      <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
              <span className="text-xs uppercase tracking-wider font-mono text-[#00F0FF]">
                {formatDisplayCopy("Pillar 1: Interactive QML & Multi Modal Vision Lab")}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {formatDisplayCopy("Quantum Vision QML Pipeline")}
            </h1>
            <p className="text-sm text-[#A1A1A1] mt-1 max-w-3xl">
              {formatDisplayCopy(
                "Coupled 5 stage quantum imaging architecture: 2D Haar wavelet speckle cleanup, 9 qubit NCQI multi spectral fusion, 4 qubit QCNN Hilbert classifier, QFIM Barren Plateau diagnostics, and Grover amplitude amplification."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#888888] mr-1">
              {formatDisplayCopy("Mission Target")}:
            </span>
            {MISSION_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPreset(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  selectedPreset === p.id
                    ? "bg-[#272727] text-white border-[#00F0FF]"
                    : "bg-[#1F1F1F] text-[#888888] border-[#313131] hover:text-white hover:bg-[#272727]"
                }`}
              >
                {formatDisplayCopy(p.label)}
              </button>
            ))}

            <button
              type="button"
              onClick={() => executePipeline()}
              disabled={isRunning}
              className="ml-1 flex items-center gap-1.5 px-4 py-1.5 bg-[#FF79C6] hover:bg-[#FF92D0] text-black font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>
                {isRunning
                  ? formatDisplayCopy("Simulating States")
                  : formatDisplayCopy("Execute QML Pipeline")}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive 5-Stage Pipeline Architecture Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-[#2A2A2A] font-mono text-[10px]">
          {[
            {
              step: "1. QWT Equalizer",
              val: qwt ? `SNR +${qwt.snr_gain_db} dB` : "6Q Haar",
              color: "#FFD700",
            },
            {
              step: "2. NCQI Fusion",
              val: ncqi ? `${ncqi.qcics_ice_traps_found} Ice Traps` : "9Q Sensor",
              color: "#39D353",
            },
            {
              step: "3. QCNN Hilbert",
              val: qcnn ? `Sil ${qcnn.kernel_silhouette_score}` : "4Q Statevector",
              color: "#FF79C6",
            },
            {
              step: "4. QFIM Landscape",
              val: bp ? `Var ${bp.gradient_variance.toExponential(1)}` : "Trainability",
              color: bp?.is_barren_plateau ? "#EF4444" : "#39D353",
            },
            {
              step: "5. Grover Amplifier",
              val: grover ? `Gain ${grover.amplification_gain}x (r=${grover.grover_iterations})` : "r Oracle",
              color: "#00F0FF",
            },
          ].map((node, i) => (
            <div
              key={node.step}
              className="bg-[#141414] border border-[#2B2B2B] rounded-lg px-2.5 py-2 flex items-center justify-between gap-1"
            >
              <div>
                <span className="text-[#888888] block">{formatDisplayCopy(node.step)}</span>
                <span className="font-bold text-white" style={{ color: node.color }}>
                  {formatDisplayCopy(node.val)}
                </span>
              </div>
              {i < 4 && <ArrowRight className="w-3 h-3 text-[#555562] shrink-0 hidden sm:block" />}
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="bg-[#1F1F1F] border border-[#EF4444] rounded-lg px-3 py-2 text-xs font-mono text-[#EF4444]">
            {formatDisplayCopy(`Pipeline Error: ${errorMsg}`)}
          </div>
        )}
      </div>

      {/* Row 1: Stage 1 (Wavelet Equalizer) & Stage 2 (9-Qubit NCQI Fusion) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage 1: 2D Quantum Haar Wavelet Frequency Equalizer */}
        <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#FFD700]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {formatDisplayCopy("1. Quantum Haar Wavelet Equalizer")}
                  </h2>
                  <span className="text-xs font-mono text-[#888888]">
                    {formatDisplayCopy("2D Sub Band Decomposition & Speckle Filter")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono bg-[#1F1F1F] border border-[#313131] text-[#39D353] px-2.5 py-1 rounded-lg">
                {qwt
                  ? `SNR ${qwt.snr_before_qwt}x -> ${qwt.snr_after_qwt}x (+${qwt.snr_gain_db} dB)`
                  : "SNR Computing"}
              </span>
            </div>

            {/* Orbital Speckle Injector Slider */}
            <div className="bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#CCCCCC]">
                  {formatDisplayCopy("Injected Regolith HH Speckle Noise")}
                </span>
                <span className="text-[#EF4444] font-semibold">
                  {(speckleNoise * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.35"
                step="0.02"
                value={speckleNoise}
                onChange={(e) => setSpeckleNoise(parseFloat(e.target.value))}
                className="w-full accent-[#EF4444] cursor-pointer"
              />
            </div>

            {/* Before vs After QWT Equalized Tile */}
            <div className="grid grid-cols-2 gap-3">
              <QmlMatrixCanvas
                matrix={qwt?.original_patch}
                colormap="gray"
                minVal={0}
                maxVal={255}
                label="Noisy Input Tile (16x16)"
                badgeText={qwt ? `HH ${qwt.energy_hh_speckle_pct}%` : ""}
                badgeColor="#EF4444"
              />
              <QmlMatrixCanvas
                matrix={qwt?.reconstructed_patch}
                colormap="gray"
                minVal={0}
                maxVal={255}
                label="QWT Equalized Output"
                badgeText={qwt ? `Edge ${qwt.directional_edge_boost_pct >= 0 ? "+" : ""}${qwt.directional_edge_boost_pct}%` : ""}
                badgeColor="#39D353"
              />
            </div>

            {/* Live 4-Quadrant Haar Subband Heatmaps & Gain Controls */}
            <div className="grid grid-cols-2 gap-2.5 bg-[#121212] p-3 rounded-xl border border-[#2B2B2B]">
              <div className="space-y-1.5">
                <QmlMatrixCanvas
                  matrix={qwt?.subband_matrices?.ll}
                  colormap="thermal"
                  label="LL Coarse"
                  badgeText={qwt ? `${qwt.energy_ll_pct}% Energy` : ""}
                  badgeColor="#FFD700"
                  sizeClass="w-full h-16"
                />
                <span className="text-[10px] font-mono text-[#777777] block px-1">
                  {formatDisplayCopy("|sY=0, sX=0> Locked 1.0x Gain")}
                </span>
              </div>

              <div className="space-y-1.5">
                <QmlMatrixCanvas
                  matrix={qwt?.subband_matrices?.lh}
                  colormap="bipolar_cyan"
                  symmetric
                  label="LH Horiz Rims"
                  badgeText={`${lhGain.toFixed(1)}x (${qwt?.energy_lh_pct ?? 0}%)`}
                  badgeColor="#00F0FF"
                  sizeClass="w-full h-16"
                />
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={lhGain}
                  onChange={(e) => setLhGain(parseFloat(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <QmlMatrixCanvas
                  matrix={qwt?.subband_matrices?.hl}
                  colormap="bipolar_magenta"
                  symmetric
                  label="HL Vert Rims"
                  badgeText={`${hlGain.toFixed(1)}x (${qwt?.energy_hl_pct ?? 0}%)`}
                  badgeColor="#FF79C6"
                  sizeClass="w-full h-16"
                />
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={hlGain}
                  onChange={(e) => setHlGain(parseFloat(e.target.value))}
                  className="w-full accent-[#FF79C6] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <QmlMatrixCanvas
                  matrix={qwt?.subband_matrices?.hh}
                  colormap="bipolar_red"
                  symmetric
                  label="HH Speckle Cut"
                  badgeText={`${(hhCut * 100).toFixed(0)}% Cut`}
                  badgeColor="#EF4444"
                  sizeClass="w-full h-16"
                />
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={hhCut}
                  onChange={(e) => setHhCut(parseFloat(e.target.value))}
                  className="w-full accent-[#EF4444] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="pt-2 border-t border-[#313131] flex items-center justify-between text-xs text-[#888888] font-mono">
              <span>
                {formatDisplayCopy(
                  `Parseval Residual: ${qwt?.unitarity_residual ?? 0} (${qwt?.is_unitary_conserved ? "Unitary" : "Check"})`
                )}
              </span>
              <span>{formatDisplayCopy("16x16 Tensor (8 Spatial Qubits)")}</span>
            </div>

            <GisTheoryFormulaStrip
              title="Unitary 2D Quantum Haar Transform & SNR Law"
              accentColor="#FFD700"
              roleSummary="Hadamard butterfly gates factor horizontally and vertically across coordinate qubits without losing signal norm. Attenuating the diagonal HH quadrant strips high frequency radar/sensor speckle before edge extraction."
              symbolicMath={String.raw`U_{\text{QHWT}}^{(2D)} = U_Y \otimes U_X, \qquad \|LL\|_F^2 + \|LH\|_F^2 + \|HL\|_F^2 + \|HH\|_F^2 = \|I\|_F^2`}
              liveSubstitutionMath={
                qwt
                  ? String.raw`E_{\text{LL}}=${qwt.energy_ll_pct}\%,\; E_{\text{LH}+ \text{HL}}=${(qwt.energy_lh_pct + qwt.energy_hl_pct).toFixed(1)}\% \implies \Delta\text{SNR} = +${qwt.snr_gain_db}\text{ dB}`
                  : undefined
              }
            />
          </div>
        </div>

        {/* Stage 2: NASA Artemis 9-Qubit NCQI Multi-Spectral Fusion */}
        <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#39D353]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {formatDisplayCopy("2. Artemis NCQI Multi Spectral Fusion")}
                  </h2>
                  <span className="text-xs font-mono text-[#888888]">
                    {formatDisplayCopy("Co Registered Optical, Thermal & SAR CPR")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono bg-[#1F1F1F] border border-[#313131] text-[#39D353] px-2.5 py-1 rounded-lg">
                QCICS: {ncqi?.qcics_ice_traps_found ?? 0} {formatDisplayCopy("Ice Pixels")} (Max {ncqi?.max_ice_score ?? 0})
              </span>
            </div>

            {/* 4-Panel Co-Registered Multi-Spectral Raster Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <QmlMatrixCanvas
                matrix={ncqi?.optical_band}
                colormap="gray"
                minVal={0}
                maxVal={255}
                label="Optical"
                badgeText={`${(normOpt * 100).toFixed(0)}%`}
                badgeColor="#00F0FF"
              />
              <QmlMatrixCanvas
                matrix={ncqi?.thermal_band}
                colormap="thermal"
                minVal={0}
                maxVal={255}
                label="Thermal IR"
                badgeText={`${(normTherm * 100).toFixed(0)}%`}
                badgeColor="#FF79C6"
              />
              <QmlMatrixCanvas
                matrix={ncqi?.sar_band}
                colormap="radar"
                minVal={0}
                maxVal={255}
                label="SAR CPR"
                badgeText={`${(normSar * 100).toFixed(0)}%`}
                badgeColor="#39D353"
              />
              <QmlMatrixCanvas
                matrix={ncqi?.qcics_map}
                colormap="ice"
                minVal={0}
                maxVal={1}
                label="QCICS Ice"
                badgeText={ncqi ? `${ncqi.qcics_ice_traps_found} px` : "0 px"}
                badgeColor="#00F0FF"
              />
            </div>

            {/* Ternary Mixer Sliders */}
            <div className="space-y-3 bg-[#1F1F1F] border border-[#313131] rounded-xl p-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                    {formatDisplayCopy("LRO Optical Albedo Weight")}
                  </span>
                  <span className="font-mono text-[#00F0FF]">{(normOpt * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={wOpt}
                  onChange={(e) => setWOpt(parseFloat(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF79C6]" />
                    {formatDisplayCopy("Diviner Thermal IR Weight")}
                  </span>
                  <span className="font-mono text-[#FF79C6]">{(normTherm * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={wTherm}
                  onChange={(e) => setWTherm(parseFloat(e.target.value))}
                  className="w-full accent-[#FF79C6] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#39D353]" />
                    {formatDisplayCopy("Mini RF SAR CPR Weight")}
                  </span>
                  <span className="font-mono text-[#39D353]">{(normSar * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={wSar}
                  onChange={(e) => setWSar(parseFloat(e.target.value))}
                  className="w-full accent-[#39D353] cursor-pointer"
                />
              </div>
            </div>

            {/* Barycentric Weight Allocation + Fused NCQI Map */}
            <div className="grid grid-cols-3 gap-3 items-center bg-[#141414] border border-[#2B2B2B] rounded-xl p-3">
              <div className="col-span-2 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-[#888888]">
                  <span>{formatDisplayCopy("Normalized Barycentric Mixture")}</span>
                  <span>
                    {ncqi
                      ? `${ncqi.qubit_allocation.spatial_position_qubits} Pos + ${ncqi.qubit_allocation.color_channel_qubits} Color Qubits`
                      : "8 Pos + 3 Color"}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden flex border border-[#313131]">
                  <div style={{ width: `${normOpt * 100}%`, backgroundColor: "#00F0FF" }} />
                  <div style={{ width: `${normTherm * 100}%`, backgroundColor: "#FF79C6" }} />
                  <div style={{ width: `${normSar * 100}%`, backgroundColor: "#39D353" }} />
                </div>
                <span className="text-[10px] font-mono text-[#A1A1A1] block">
                  {formatDisplayCopy(
                    `Mean Multi Spectral Edge Prob: ${ncqi?.mean_multispectral_edge_prob ?? 0}`
                  )}
                </span>
              </div>
              <QmlMatrixCanvas
                matrix={ncqi?.fused_edge_map}
                colormap="phase"
                minVal={0}
                maxVal={1}
                label="Fused Edges"
                sizeClass="w-full h-16"
              />
            </div>
          </div>

          <div className="space-y-3">
            <GisTheoryFormulaStrip
              title="NCQI Multi Band Interferometry & QCICS Ice Trap Law"
              accentColor="#39D353"
              roleSummary="By assigning three spectral qubits in tensor product with spatial coordinates, dark shadowed pixels with cryogenic thermal readings (high cos^2) and high circular polarization radar backscatter (high sin^2) isolate buried water ice deposits."
              symbolicMath={String.raw`P_{\text{NCQI}} = \sum_k \tilde{w}_k \cdot 2\sin^2\!\left(\frac{\Delta\theta_k}{2}\right), \qquad \text{QCICS} = \cos^2(\theta_{\text{opt}})\cos^2(\theta_{\text{th}})\sin^2(\theta_{\text{sar}})`}
              liveSubstitutionMath={
                ncqi
                  ? String.raw`\tilde{w}=(${normOpt.toFixed(2)}, ${normTherm.toFixed(2)}, ${normSar.toFixed(2)}) \implies \text{QCICS}_{\max} = ${ncqi.max_ice_score}`
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      {/* Row 2: Stage 3 — Full-Width 4-Qubit QCNN Classifier & True 3D Three.js Hilbert Projector */}
      <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#FF79C6]">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {formatDisplayCopy("3. 4 Qubit QCNN Classifier & 3D Hilbert Projector")}
              </h2>
              <span className="text-xs font-mono text-[#888888]">
                {formatDisplayCopy("Exact 16 Amplitude Statevector Simulator | 64 Sliding 2x2 Patches")}
              </span>
            </div>
          </div>

          {/* Ansatz Switcher + Real Silhouette */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1F1F1F] p-1 rounded-lg border border-[#313131]">
              {ANSATZ_OPTIONS.map((ans) => (
                <button
                  key={ans.id}
                  type="button"
                  onClick={() => setActiveAnsatz(ans.id)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded transition-colors ${
                    activeAnsatz === ans.id
                      ? "bg-[#272727] text-white font-semibold border border-[#FF79C6]"
                      : "text-[#888888] hover:text-white border border-transparent"
                  }`}
                >
                  {formatDisplayCopy(ans.label)}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono bg-[#1F1F1F] border border-[#313131] text-[#00F0FF] px-2.5 py-1 rounded-lg">
              Silhouette: {qcnn?.kernel_silhouette_score ?? 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Three.js 3D Hilbert Cloud + 8x8 Spatial Class Map + Patch Inspector + Gram */}
          <div className="lg:col-span-7">
            {qcnn && (
              <Hilbert3DProjector
                qcnn={qcnn}
                activeAnsatz={activeAnsatz}
                selectedPatchId={selectedPatchId}
                onSelectPatch={setSelectedPatchId}
              />
            )}
          </div>

          {/* Right 5 cols: Normalized 5-Class Probabilities + Quantum Circuit Telemetry + Theory */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#1F1F1F] border border-[#313131] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-semibold">
                  {formatDisplayCopy("Tile Geomorphological Breakdown")}
                </span>
                <span className="text-[#39D353]">Sum = 100.0%</span>
              </div>
              {CLASS_ORDER_META.map((item) => {
                const prob = qcnn?.class_fractions?.[item.name] ?? 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-white text-[11px]">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {formatDisplayCopy(item.name)}
                      </span>
                      <span className="font-mono text-white text-[11px]">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#272727] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${prob * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-[10px] text-[#888888] block leading-snug">
                      {formatDisplayCopy(item.desc)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-[#141414] border border-[#2B2B2B] rounded-lg p-2">
                <span className="text-[10px] text-[#888888] block">
                  {formatDisplayCopy("Hilbert Dim")}
                </span>
                <span className="font-bold text-white">16 States</span>
              </div>
              <div className="bg-[#141414] border border-[#2B2B2B] rounded-lg p-2">
                <span className="text-[10px] text-[#888888] block">
                  {formatDisplayCopy("2Q Gates")}
                </span>
                <span className="font-bold text-[#FF79C6]">{qcnn?.two_qubit_gates ?? 8}</span>
              </div>
              <div className="bg-[#141414] border border-[#2B2B2B] rounded-lg p-2">
                <span className="text-[10px] text-[#888888] block">
                  {formatDisplayCopy("Depth")}
                </span>
                <span className="font-bold text-[#00F0FF]">{qcnn?.circuit_depth ?? 6}</span>
              </div>
            </div>

            <GisTheoryFormulaStrip
              title="Quantum Kernel Fidelity & Variational Pauli Features"
              accentColor="#FF79C6"
              roleSummary="Each 2x2 patch encodes into 4 qubits via angle embedding and entangles through the chosen ansatz. Measuring single qubit Z expectations and ZZ Ising correlators maps local geology into separable 3D Hilbert clusters."
              symbolicMath={String.raw`K_Q(x, x') = \big|\langle 0|^{\otimes 4} U_{\text{QCNN}}^\dagger(x)\, U_{\text{QCNN}}(x') |0\rangle^{\otimes 4}\big|^2, \qquad f_k = \langle\psi|Z_k|\psi\rangle`}
              liveSubstitutionMath={
                qcnn
                  ? String.raw`\text{Ansatz: } \text{${qcnn.ansatz_display}} \implies \text{Silhouette} = ${qcnn.kernel_silhouette_score}`
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      {/* Row 3: Stage 4 (Barren Plateau & QFIM) + Stage 5 (Grover Amplitude Oscilloscope) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage 4: Barren Plateau & QFIM Diagnostics */}
        <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#39D353]">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {formatDisplayCopy("4. Barren Plateau & QFIM Loss Surface")}
                  </h2>
                  <span className="text-xs font-mono text-[#888888]">
                    {formatDisplayCopy("Optimizer Convergence vs Exponential Variance Collapse")}
                  </span>
                </div>
              </div>
              <Cpu className="w-4 h-4 text-[#888888]" />
            </div>

            {bp && (
              <BarrenPlateauChart
                diagnostics={bp}
                costType={costFunctionType}
                numQubits={bpQubits}
                circuitDepth={bpDepth}
                onChangeCostType={setCostFunctionType}
                onChangeQubits={setBpQubits}
                onChangeDepth={setBpDepth}
              />
            )}
          </div>

          <GisTheoryFormulaStrip
            title="Barren Plateau Scaling & Quantum Fisher Information"
            accentColor="#39D353"
            roleSummary="Global all qubit projector costs scatter gradient variance exponentially in Hilbert space dimension (2^-n), trapping gradient descent on a flat plateau. Local Pauli Z measurements preserve polynomial trainability."
            symbolicMath={String.raw`\text{Var}_\theta[\partial_k \mathcal{L}_{\text{global}}] \in \mathcal{O}(2^{-n}) \quad \text{vs} \quad \text{Var}_\theta[\partial_k \mathcal{L}_{\text{local}}] \in \Omega\!\left(\frac{1}{\text{poly}(n)}\right)`}
            liveSubstitutionMath={
              bp
                ? String.raw`n=${bp.num_qubits},\; L=${bp.circuit_depth} \implies \text{Var} = ${bp.gradient_variance.toExponential(2)},\; \det F = ${bp.qfim_determinant}`
                : undefined
            }
          />
        </div>

        {/* Stage 5: Grover Subspace Amplitude Oscilloscope */}
        <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-[#00F0FF]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {formatDisplayCopy("5. Grover Amplitude Oscilloscope")}
                  </h2>
                  <span className="text-xs font-mono text-[#888888]">
                    {formatDisplayCopy("Subspace Statevector Rotation & Souffle Guard")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono bg-[#1F1F1F] border border-[#313131] text-[#00F0FF] px-2.5 py-1 rounded-lg">
                {grover ? `Gain ${grover.amplification_gain}x` : "Gain 1.0x"}
              </span>
            </div>

            {grover && (
              <GroverOscilloscopePanel
                grover={grover}
                groverIter={groverIter}
                onChangeGroverIter={setGroverIter}
              />
            )}
          </div>

          <GisTheoryFormulaStrip
            title="Grover Subspace Rotation & Souffle Over Rotation"
            accentColor="#00F0FF"
            roleSummary="Each Grover diffusion reflection rotates the statevector by 2 theta_0 toward the marked edge subspace. Exceeding pi/2 passes optimal contrast peak r_opt and causes probability mass to oscillate back toward zero."
            symbolicMath={String.raw`\hat{G}^r\lvert\psi_0\rangle = \cos\theta_r\lvert\psi_\perp\rangle + \sin\theta_r\lvert\psi_{\text{edge}}\rangle, \quad \theta_r = (2r+1)\theta_0, \quad r_{\text{opt}} = \left\lfloor\frac{\pi}{4\theta_0}-\frac{1}{2}\right\rfloor`}
            liveSubstitutionMath={
              grover
                ? String.raw`\theta_0 = ${grover.initial_theta_rad}\text{ rad},\; r=${grover.grover_iterations} \implies P_{\text{edge}} = ${(grover.amplified_prob * 100).toFixed(1)}\%`
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};
