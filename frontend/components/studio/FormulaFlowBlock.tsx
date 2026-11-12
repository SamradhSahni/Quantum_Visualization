"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KaTeXBlock } from "@/components/ui/KaTeXBlock";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import {
  analyzeLocalPatchPair,
  LocalPatchAnalysis,
} from "@/lib/quantumEdgeMath";
import { ArrowRight, Compass, Cpu, Layers, Sparkles, Waves } from "lucide-react";

export type EdgeMethodKey = "frqi" | "qpie" | "neqr" | "sobel" | "canny" | "robinson";

interface FormulaFlowBlockProps {
  patch8x8: number[][];
  inspectRow: number;
  inspectCol: number;
  threshold?: number;
  shots?: number | null;
  bitDepth?: number;
  phaseGain?: number;
  cannyLow?: number;
  cannyHigh?: number;
  activeMethod?: EdgeMethodKey;
  onSelectMethod?: (m: EdgeMethodKey) => void;
  activeStageIdx?: number;
  onSelectStageIdx?: (idx: number) => void;
  showMethodSwitcher?: boolean;
}

const METHOD_META: Record<
  EdgeMethodKey,
  { label: string; color: string; badge: string }
> = {
  frqi: { label: "FRQI QHED", color: "#FF79C6", badge: "7 Qubits" },
  qpie: { label: "QPIE QHED", color: "#00F0FF", badge: "6 Qubits" },
  neqr: { label: "NEQR QFS", color: "#BD93F9", badge: "14 Storage / 24 QFS" },
  sobel: { label: "Sobel 3×3", color: "#38BDF8", badge: "Classical Conv" },
  canny: { label: "Canny 5 Stage", color: "#FFE600", badge: "Classical NMS" },
  robinson: { label: "Robinson 8 Compass", color: "#39D353", badge: "Classical Azimuth" },
};

export const FormulaFlowBlock: React.FC<FormulaFlowBlockProps> = ({
  patch8x8,
  inspectRow,
  inspectCol,
  threshold = 0.25,
  shots = 4096,
  bitDepth = 8,
  phaseGain = 1.0,
  cannyLow = 50,
  cannyHigh = 150,
  activeMethod: propMethod,
  onSelectMethod,
  activeStageIdx: propStageIdx,
  onSelectStageIdx,
  showMethodSwitcher = true,
}) => {
  const [internalMethod, setInternalMethod] = useState<EdgeMethodKey>("frqi");
  const [internalStage, setInternalStage] = useState<number>(3);
  const [qpieSpecMode, setQpieSpecMode] = useState<"initial" | "even" | "odd">("even");

  const method = propMethod ?? internalMethod;
  const stageIdx = propStageIdx ?? internalStage;

  const setMethod = (m: EdgeMethodKey) => {
    setInternalMethod(m);
    onSelectMethod?.(m);
  };
  const setStage = (i: number) => {
    setInternalStage(i);
    onSelectStageIdx?.(i);
  };

  const analysis: LocalPatchAnalysis = useMemo(
    () =>
      analyzeLocalPatchPair(patch8x8, inspectRow, inspectCol, {
        shots,
        bitDepth,
        phaseGain,
      }),
    [patch8x8, inspectRow, inspectCol, shots, bitDepth, phaseGain]
  );

  // Build 5-node formula chain for active method
  const formulaChain = useMemo(() => {
    const { intensityA, intensityB, frqi, qpie, neqr, sobel, robinson } = analysis;

    if (method === "frqi") {
      return [
        {
          title: "1. Intensity to Polar Angle",
          symbolic: String.raw`\theta_i = \frac{\pi}{2} \cdot \frac{I_i}{255}`,
          numeric: String.raw`\theta_A = \frac{\pi}{2}\cdot\frac{${intensityA}}{255} = \textcolor{#00F0FF}{${frqi.thetaA.toFixed(4)}}\text{ rad}, \quad \theta_B = \textcolor{#FF79C6}{${frqi.thetaB.toFixed(4)}}\text{ rad}`,
        },
        {
          title: "2. FRQI Superposition State",
          symbolic: String.raw`|\Psi_0\rangle = \frac{1}{8}\sum_{i=0}^{63}\big(\cos\theta_i|0\rangle_c + \sin\theta_i|1\rangle_c\big)|i\rangle`,
          numeric: String.raw`|c_A\rangle = ${frqi.cosA.toFixed(3)}|0\rangle + ${frqi.sinA.toFixed(3)}|1\rangle, \quad |c_B\rangle = ${frqi.cosB.toFixed(3)}|0\rangle + ${frqi.sinB.toFixed(3)}|1\rangle`,
        },
        {
          title: "3. Dual Pass Shift + H Interference",
          symbolic: String.raw`|\psi_{\text{diff}}\rangle = \frac{1}{8\sqrt{2}}\Big[(\cos\theta_A{-}\cos\theta_B)|0\rangle_c + (\sin\theta_A{-}\sin\theta_B)|1\rangle_c\Big]|k_{\text{odd}}\rangle`,
          numeric: String.raw`\Delta\theta = |\theta_A - \theta_B| = \textcolor{#FFE600}{${frqi.deltaTheta.toFixed(4)}}\text{ rad}, \quad \text{Chord} = \textcolor{#39D353}{${frqi.chordLength.toFixed(4)}}`,
        },
        {
          title: "4. Physical Marginal Born Prob",
          symbolic: String.raw`P_{\text{circuit}} = P(0_c, k_{\text{odd}}) + P(1_c, k_{\text{odd}}) = \frac{1}{32}\sin^2\!\left(\frac{\Delta\theta}{2}\right)`,
          numeric: String.raw`P_{\text{circuit}} = \frac{1}{32}\sin^2\!\left(\frac{${frqi.deltaTheta.toFixed(4)}}{2}\right) = \textcolor{#00F0FF}{${frqi.pCircuit.toFixed(6)}}`,
        },
        {
          title: "5. Rescaled Contrast & Decision",
          symbolic: String.raw`\tilde{P}_{\text{edge}} = 64 \cdot P_{\text{circuit}} = 2\sin^2\!\left(\frac{|\Delta\theta|}{2}\right)`,
          numeric: String.raw`\tilde{P}_{\text{edge}} = 64 \cdot ${frqi.pCircuit.toFixed(6)} = \textcolor{#39D353}{${frqi.pEdgeX.toFixed(4)}}, \quad E_{2D} = \textcolor{#FF79C6}{${frqi.fused.toFixed(4)}}`,
        },
      ];
    }

    if (method === "qpie") {
      return [
        {
          title: "1. Stabilized L2 Norm Floor",
          symbolic: String.raw`\gamma_p^{\text{safe}} = \max\!\left(\sqrt{\sum_{i=0}^{63} I_i^2},\; 10^{-6}\right)`,
          numeric: String.raw`\gamma_p = \textcolor{#00F0FF}{${qpie.gammaRaw.toFixed(2)}} \implies \gamma_p^{\text{safe}} = ${qpie.gammaSafe.toFixed(2)}`,
        },
        {
          title: "2. 6 Qubit Amplitude Loading",
          symbolic: String.raw`|\psi_p\rangle = \sum_{i=0}^{63} \frac{I_i}{\gamma_p^{\text{safe}}} |i\rangle`,
          numeric: String.raw`\alpha_A = \frac{${intensityA}}{${qpie.gammaSafe.toFixed(1)}} = \textcolor{#00F0FF}{${qpie.alphaA.toFixed(5)}}, \quad \alpha_B = \textcolor{#FF79C6}{${qpie.alphaB.toFixed(5)}}`,
        },
        {
          title: "3. Hadamard Amplitude Butterfly",
          symbolic: String.raw`H_{q_0}|\alpha_A, \alpha_B\rangle = \frac{\alpha_A+\alpha_B}{\sqrt{2}}|0\rangle + \frac{\alpha_A-\alpha_B}{\sqrt{2}}|1\rangle`,
          numeric: String.raw`\alpha_{\text{sum}} = ${qpie.sumBranch.toFixed(5)}, \quad \alpha_{\text{diff}} = \textcolor{#FFE600}{${qpie.diffBranch.toFixed(5)}}`,
        },
        {
          title: "4. Raw Born Prob & Shot Noise Law",
          symbolic: String.raw`P_{\text{raw}} = \frac{(I_A - I_B)^2}{2(\gamma_p^{\text{safe}})^2}, \qquad \sigma_{\nabla} \propto \frac{\gamma_p}{\sqrt{S}}`,
          numeric: String.raw`P_{\text{raw}} = \textcolor{#00F0FF}{${qpie.pRaw.toFixed(6)}}, \quad \sigma_{\nabla} = \textcolor{#F59E0B}{${qpie.shotSigma.toFixed(5)}}`,
        },
        {
          title: "5. Radiometric Energy Restoration",
          symbolic: String.raw`\nabla_x = \frac{\sqrt{2}\,\gamma_p^{\text{safe}}}{255}\sqrt{P_{\text{raw}}} = \frac{|I_A - I_B|}{255}`,
          numeric: String.raw`\nabla_x = \textcolor{#39D353}{${qpie.gradX.toFixed(4)}}, \quad E_{\text{QPIE}} = \textcolor{#00F0FF}{${qpie.fused.toFixed(4)}}`,
        },
      ];
    }

    if (method === "neqr") {
      return [
        {
          title: "1. q Bit Binary Basis State",
          symbolic: String.raw`I^{(q)}_{y,x} = \left\lfloor \frac{I_{y,x}}{2^{8-q}} \right\rfloor = \sum_{k=0}^{q-1} c^{(k)} 2^k`,
          numeric: String.raw`q=${neqr.bitDepth}: \;|A\rangle = |${neqr.binA}\rangle (${neqr.valAq}), \quad |B\rangle = |${neqr.binB}\rangle (${neqr.valBq})`,
        },
        {
          title: "2. Coherent Subtractor Register",
          symbolic: String.raw`Q_{\text{store}} = 2n + q, \qquad Q_{\text{active}} = 2n + 2q + 2`,
          numeric: String.raw`Q_{\text{store}} = \textcolor{#BD93F9}{${neqr.storageQubits}}\text{ qubits} \;\longrightarrow\; Q_{\text{active}} = \textcolor{#00F0FF}{${neqr.activeQubits}}\text{ active QFS wires}`,
        },
        {
          title: "3. Quantum Full Subtractor Boolean",
          symbolic: String.raw`d_k = a_k \oplus b_k \oplus b_{\text{in}}^{(k)}, \quad b_{\text{out}}^{(k)} = (\bar{a}_k b_k) \oplus \big(\overline{(a_k \oplus b_k)}b_{\text{in}}^{(k)}\big)`,
          numeric: String.raw`\text{Cascade } k=0 \dots ${neqr.bitDepth - 1}: \;\text{CCX}=${neqr.toffoliCount}, \;\text{CX}=${neqr.cnotCount}`,
        },
        {
          title: "4. MSB Borrow Two's Complement",
          symbolic: String.raw`|\Delta I^{(q)}| = (d \oplus s^{\otimes q}) + s, \qquad s = b_{\text{out}}^{(q-1)}`,
          numeric: String.raw`s = \textcolor{#FFE600}{${neqr.signBorrow}} \implies |\Delta I^{(q)}| = \textcolor{#39D353}{${neqr.absDiffQ}} \;\;(\text{scale: } ${neqr.absDiff255}/255)`,
        },
        {
          title: "5. Deterministic Euclidean Magnitude",
          symbolic: String.raw`E_{\text{NEQR}} = \frac{1}{2^q - 1}\sqrt{|\Delta_x I|^2 + |\Delta_y I|^2}`,
          numeric: String.raw`G_x = ${neqr.gradX.toFixed(4)}, \quad G_y = ${neqr.gradY.toFixed(4)} \implies E_{\text{NEQR}} = \textcolor{#BD93F9}{${neqr.fused.toFixed(4)}}`,
        },
      ];
    }

    if (method === "sobel") {
      return [
        {
          title: "1. Horizontal Kernel Convolution",
          symbolic: String.raw`G_x = K_x \circledast I = \sum_{u=-1}^{1}\sum_{v=-1}^{1} K_x(u,v) I(y+u, x+v)`,
          numeric: String.raw`G_x = \textcolor{#38BDF8}{${sobel.gx}}`,
        },
        {
          title: "2. Vertical Kernel Convolution",
          symbolic: String.raw`G_y = K_y \circledast I = \sum_{u=-1}^{1}\sum_{v=-1}^{1} K_y(u,v) I(y+u, x+v)`,
          numeric: String.raw`G_y = \textcolor{#FF79C6}{${sobel.gy}}`,
        },
        {
          title: "3. L2 Edge Gradient Magnitude",
          symbolic: String.raw`G = \frac{\sqrt{G_x^2 + G_y^2}}{\max(G)}`,
          numeric: String.raw`\sqrt{(${sobel.gx})^2 + (${sobel.gy})^2} \;\longrightarrow\; \text{Norm Mag} = \textcolor{#39D353}{${sobel.magnitude.toFixed(4)}}`,
        },
        {
          title: "4. Azimuth Orientation Angle",
          symbolic: String.raw`\phi = \operatorname{atan2}(G_y, G_x) \bmod 360^\circ`,
          numeric: String.raw`\phi = \textcolor{#FFE600}{${sobel.angleDeg.toFixed(1)}^\circ}`,
        },
        {
          title: "5. Otsu Variance Threshold",
          symbolic: String.raw`\tau^* = \arg\min_t \big[\omega_0(t)\sigma_0^2(t) + \omega_1(t)\sigma_1^2(t)\big]`,
          numeric: String.raw`\text{Mag } ${sobel.magnitude.toFixed(3)} \ge \tau (${threshold.toFixed(2)}) \implies ${sobel.magnitude >= threshold ? String.raw`\textcolor{#39D353}{\text{EDGE}}` : String.raw`\textcolor{#9B9B9B}{\text{FLAT}}`}`,
        },
      ];
    }

    if (method === "canny") {
      const qAngle = Math.round(sobel.angleDeg / 45) * 45 % 180;
      const gScaled = Math.round(sobel.magnitude * 255);
      const hystState =
        gScaled >= cannyHigh
          ? String.raw`\textcolor{#00F0FF}{\text{STRONG EDGE } (\ge ${cannyHigh})}`
          : gScaled >= cannyLow
          ? String.raw`\textcolor{#F59E0B}{\text{WEAK CANDIDATE } [${cannyLow}, ${cannyHigh})}`
          : String.raw`\textcolor{#737373}{\text{SUPPRESSED } (< ${cannyLow})}`;
      return [
        {
          title: "1. Isotropic Gaussian Smoothing",
          symbolic: String.raw`I_\sigma = G_\sigma * I, \qquad G_\sigma(u,v) = \frac{1}{2\pi\sigma^2}e^{-\frac{u^2+v^2}{2\sigma^2}}`,
          numeric: String.raw`\sigma = 1.4, \; k = 5\times 5 \;\text{kernel removes high frequency speckle}`,
        },
        {
          title: "2. Sobel Derivative Gradient",
          symbolic: String.raw`G = \sqrt{G_x^2 + G_y^2}, \qquad \phi = \operatorname{atan2}(G_y, G_x)`,
          numeric: String.raw`G = \textcolor{#FFE600}{${gScaled}}/255, \quad \phi = ${sobel.angleDeg.toFixed(1)}^\circ`,
        },
        {
          title: "3. 4 Sector Angle Quantization",
          symbolic: String.raw`\theta_q \in \{0^\circ, 45^\circ, 90^\circ, 135^\circ\}`,
          numeric: String.raw`\text{Snapped Direction Sector}: \textcolor{#00F0FF}{${qAngle}^\circ}`,
        },
        {
          title: "4. Non Maximum Suppression Ridge",
          symbolic: String.raw`G_{\text{NMS}}(p) = G(p) \iff G(p) \ge G(p_+) \;\land\; G(p) \ge G(p_-)`,
          numeric: String.raw`\text{Thins oblique } 3\text{px walls to strict } 1\text{px crest along } ${qAngle}^\circ\text{ normal}`,
        },
        {
          title: "5. Dual Threshold Hysteresis",
          symbolic: String.raw`E(p) = 1 \iff G_{\text{NMS}} \ge T_{\text{high}} \;\lor\; (\ge T_{\text{low}} \land \text{8-connected})`,
          numeric: hystState,
        },
      ];
    }

    // Robinson 8-Compass
    return [
      {
        title: "1. 8 Steered Compass Kernels",
        symbolic: String.raw`M_k = \operatorname{Rotate}_{45^\circ k}(M_0), \qquad k \in \{0\text{ (N)} \dots 7\text{ (NE)}\}`,
        numeric: String.raw`\text{Evaluating all 8 directional } 3\times 3\text{ compass masks around } (${inspectRow}, ${inspectCol})`,
      },
      {
        title: "2. Directional Mask Responses",
        symbolic: String.raw`R_k(y,x) = |M_k \circledast I|(y,x)`,
        numeric: String.raw`R_N=${robinson.sectorValues.N}, \; R_E=${robinson.sectorValues.E}, \; R_{NW}=${robinson.sectorValues.NW}, \; R_{NE}=${robinson.sectorValues.NE}`,
      },
      {
        title: "3. Max Directional Envelope",
        symbolic: String.raw`E_{\text{Rob}}(y,x) = \max_{k \in \{0\dots 7\}} R_k(y,x)`,
        numeric: String.raw`E_{\text{Rob}} = \textcolor{#39D353}{${robinson.maxResponse}} \;\;(\text{Norm: } ${(robinson.maxResponse / 1020).toFixed(4)})`,
      },
      {
        title: "4. Dominant Solar Aspect Angle",
        symbolic: String.raw`\phi^*(y,x) = 45^\circ \cdot \arg\max_{k} R_k(y,x)`,
        numeric: String.raw`\text{Winning Sector}: \textcolor{#00F0FF}{\mathbf{${robinson.dominantDir}}} \;(\phi^* = ${robinson.dominantAngleDeg}^\circ)`,
      },
      {
        title: "5. Binary Rim Classification",
        symbolic: String.raw`\frac{E_{\text{Rob}}}{\max E} \ge \tau^*`,
        numeric: String.raw`R_{\text{norm}} = ${(Math.min(1, robinson.maxResponse / 1020)).toFixed(3)} \text{ vs } \tau = ${threshold.toFixed(2)}`,
      },
    ];
  }, [analysis, method, inspectRow, inspectCol, threshold, cannyLow, cannyHigh]);

  const currentFormula = formulaChain[Math.min(stageIdx, formulaChain.length - 1)];
  const activeColor = METHOD_META[method].color;

  // Helpers for Bloch XZ dial (FRQI)
  const blochAx = Math.sin(2 * analysis.frqi.thetaA);
  const blochAz = Math.cos(2 * analysis.frqi.thetaA);
  const blochBx = Math.sin(2 * analysis.frqi.thetaB);
  const blochBz = Math.cos(2 * analysis.frqi.thetaB);

  // QPIE 64-bar spectrum selection
  const spectrumVals =
    qpieSpecMode === "initial"
      ? analysis.qpie.initialProbs
      : qpieSpecMode === "even"
      ? analysis.qpie.evenPostHProbs
      : analysis.qpie.oddPostHProbs;
  const maxSpecVal = Math.max(0.01, ...spectrumVals);

  // Robinson Polar Compass Rose max
  const robMaxPatch = Math.max(1, ...Object.values(analysis.robinson.sectorEnergiesPatch));

  return (
    <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-5">
      {/* Header & Method Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: activeColor }} />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("Mathematical Formula Flow & Physics Dissector")}
            </h3>
            <Badge label={METHOD_META[method].badge} variant="default" size="xs" />
          </div>
          <p className="text-xs text-[#9B9B9B] mt-0.5">
            {formatDisplayCopy(
              "Live symbolic equations paired with real numerical evaluation for Pixel A vs Neighbor B."
            )}
          </p>
        </div>

        {showMethodSwitcher && (
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#181818] border border-[#313131] text-xs font-mono">
            {(Object.keys(METHOD_META) as EdgeMethodKey[]).map((mKey) => {
              const active = method === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => setMethod(mKey)}
                  style={{
                    backgroundColor: active ? METHOD_META[mKey].color : "transparent",
                    color: active ? "#000000" : "#9B9B9B",
                  }}
                  className="px-2.5 py-1 rounded font-semibold transition-colors hover:text-white"
                >
                  {formatDisplayCopy(METHOD_META[mKey].label)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive 5-Node DAG Stepper */}
      <div className="flex flex-wrap items-center gap-1.5">
        {formulaChain.map((step, idx) => {
          const isActive = idx === stageIdx;
          return (
            <React.Fragment key={step.title}>
              <button
                onClick={() => setStage(idx)}
                style={{
                  borderColor: isActive ? activeColor : "#313131",
                  backgroundColor: isActive ? "#272727" : "#181818",
                }}
                className="px-3 py-1.5 rounded-lg border text-left transition-all"
              >
                <span
                  className="text-[11px] font-mono font-semibold block"
                  style={{ color: isActive ? activeColor : "#B4B4B4" }}
                >
                  {formatDisplayCopy(step.title)}
                </span>
              </button>
              {idx < formulaChain.length - 1 && (
                <ArrowRight size={13} className="text-[#555] hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Dual Row KaTeX Panel: Symbolic Law + Live Numerical Substitution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] space-y-2 overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#9B9B9B] uppercase">
              {formatDisplayCopy("Symbolic Law")}
            </span>
            <span style={{ color: activeColor }}>{formatDisplayCopy(currentFormula.title)}</span>
          </div>
          <div className="py-2 text-white text-sm">
            <KaTeXBlock math={currentFormula.symbolic} displayMode />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] space-y-2 overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#9B9B9B] uppercase">
              {formatDisplayCopy("Live Pixel Substitution")}
            </span>
            <span className="text-[#00F0FF]">
              Pixel ({inspectRow}, {inspectCol}) I={analysis.intensityA} vs Neighbor I={analysis.intensityB}
            </span>
          </div>
          <div className="py-2 text-white text-sm">
            <KaTeXBlock math={currentFormula.numeric} displayMode />
          </div>
        </div>
      </div>

      {/* Method Specific Physics Visual Dissector */}
      <div className="pt-2 border-t border-[#313131]">
        {/* 1. FRQI: Dual Vector XZ Bloch Dial & Nonlinearity Transfer Curve */}
        {method === "frqi" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] flex flex-col sm:flex-row items-center gap-4">
              <svg viewBox="0 0 180 180" className="w-40 h-40 flex-shrink-0 bg-[#0A0A0A] rounded-xl border border-[#313131]">
                <circle cx="90" cy="90" r="64" fill="none" stroke="#313131" strokeWidth="1.5" />
                <line x1="90" y1="18" x2="90" y2="162" stroke="#272727" strokeDasharray="3,3" />
                <line x1="18" y1="90" x2="162" y2="90" stroke="#272727" strokeDasharray="3,3" />
                <text x="90" y="14" textAnchor="middle" fill="#9B9B9B" fontSize="9" fontFamily="monospace">|0⟩</text>
                <text x="90" y="174" textAnchor="middle" fill="#9B9B9B" fontSize="9" fontFamily="monospace">|1⟩</text>
                {/* Euclidean Interference Chord connecting Bloch A and Bloch B */}
                <line
                  x1={90 + blochAx * 64}
                  y1={90 - blochAz * 64}
                  x2={90 + blochBx * 64}
                  y2={90 - blochBz * 64}
                  stroke="#39D353"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                />
                {/* Vector A */}
                <line
                  x1="90"
                  y1="90"
                  x2={90 + blochAx * 64}
                  y2={90 - blochAz * 64}
                  stroke="#00F0FF"
                  strokeWidth="2.5"
                />
                <circle cx={90 + blochAx * 64} cy={90 - blochAz * 64} r="4" fill="#00F0FF" />
                {/* Vector B */}
                <line
                  x1="90"
                  y1="90"
                  x2={90 + blochBx * 64}
                  y2={90 - blochBz * 64}
                  stroke="#FF79C6"
                  strokeWidth="2.5"
                />
                <circle cx={90 + blochBx * 64} cy={90 - blochBz * 64} r="4" fill="#FF79C6" />
              </svg>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-white font-semibold">
                  {formatDisplayCopy("XZ Bloch Color Dial & Interference Chord")}
                </div>
                <p className="text-[#9B9B9B] text-[11px] font-sans leading-relaxed">
                  {formatDisplayCopy(
                    "Green dashed chord equals Euclidean vector separation 2 sin(Δθ/2). Squaring chord halves recovers local edge probability."
                  )}
                </p>
                <div className="text-[#00F0FF]">
                  2θ_A = {(2 * analysis.frqi.thetaA).toFixed(3)} rad · 2θ_B = {(2 * analysis.frqi.thetaB).toFixed(3)} rad
                </div>
                <div className="text-[#39D353]">
                  Chord = {analysis.frqi.chordLength.toFixed(4)} · P_circuit = {analysis.frqi.pCircuit.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Nonlinearity Transfer Curve */}
            <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-semibold">
                  {formatDisplayCopy("Nonlinearity Basin Noise Suppression Curve")}
                </span>
                <span className="text-[#FF79C6]">ΔI = {Math.abs(analysis.intensityA - analysis.intensityB)}</span>
              </div>
              <svg viewBox="0 0 280 120" className="w-full h-32 bg-[#0A0A0A] rounded-lg border border-[#313131]">
                {/* Sub-threshold suppression zone Delta I < 20 */}
                <rect x="20" y="10" width="20" height="92" fill="#39D353" fillOpacity="0.12" />
                <line x1="20" y1="102" x2="265" y2="102" stroke="#313131" />
                <line x1="20" y1="10" x2="20" y2="102" stroke="#313131" />
                {/* Linear QPIE / Sobel line */}
                <line x1="20" y1="102" x2="265" y2="10" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="4,3" />
                {/* FRQI 2*sin^2(dtheta/2) S-curve */}
                <polyline
                  fill="none"
                  stroke="#FF79C6"
                  strokeWidth="2.5"
                  points={Array.from({ length: 32 }, (_, idx) => {
                    const di = (idx / 31) * 255;
                    const dt = (di / 255) * (Math.PI / 2);
                    const resp = 2 * Math.sin(dt / 2) ** 2;
                    const x = 20 + (idx / 31) * 245;
                    const y = 102 - resp * 92;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(" ")}
                />
                {/* Current pair dot */}
                {(() => {
                  const di = Math.abs(analysis.intensityA - analysis.intensityB);
                  const x = 20 + (di / 255) * 245;
                  const y = 102 - analysis.frqi.pEdgeX * 92;
                  return <circle cx={x} cy={y} r="4.5" fill="#FFE600" stroke="#000" />;
                })()}
                <text x="45" y="22" fill="#39D353" fontSize="8" fontFamily="monospace">
                  {formatDisplayCopy("Quadratically Suppressed Mare Ripple")}
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* 2. QPIE: 64-State Quantum Amplitude & Probability Spectrum */}
        {method === "qpie" && (
          <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-mono text-white font-semibold flex items-center gap-2">
                <Waves size={14} className="text-[#00F0FF]" />
                {formatDisplayCopy("64 State Probability Spectrum Across All 6 Spatial Qubits")}
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded bg-[#0A0A0A] border border-[#313131] text-[11px] font-mono">
                {(
                  [
                    ["initial", "Stage A: Initial |α_i|²"],
                    ["even", "Stage B: Post H Even"],
                    ["odd", "Stage C: Post H Odd D64"],
                  ] as const
                ).map(([k, lbl]) => (
                  <button
                    key={k}
                    onClick={() => setQpieSpecMode(k)}
                    className={`px-2 py-0.5 rounded ${
                      qpieSpecMode === k ? "bg-[#00F0FF] text-black font-bold" : "text-[#9B9B9B]"
                    }`}
                  >
                    {formatDisplayCopy(lbl)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-28 flex items-end gap-[2px] bg-[#0A0A0A] p-2 rounded-lg border border-[#313131]">
              {spectrumVals.map((v, i) => {
                const hPct = Math.max(3, (v / maxSpecVal) * 100);
                const isOddLsb = i % 2 === 1 && qpieSpecMode !== "initial";
                const isSelectedPair = i === inspectRow * 8 + inspectCol;
                return (
                  <div
                    key={i}
                    title={`Basis |${i.toString(2).padStart(6, "0")}> = ${v.toFixed(5)}`}
                    style={{
                      height: `${hPct}%`,
                      backgroundColor: isSelectedPair
                        ? "#FFE600"
                        : isOddLsb
                        ? "#FF79C6"
                        : "#00F0FF",
                    }}
                    className="flex-1 rounded-t-[1px] transition-all duration-150"
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#9B9B9B]">
              <span>|000000⟩ (Top Left)</span>
              <span className="text-[#FF79C6]">
                {qpieSpecMode === "initial"
                  ? formatDisplayCopy("Normalized Patch Probabilities Sum to 1.0000")
                  : formatDisplayCopy("Odd Bars (Magenta |q0=1⟩) Carry Spatial High Pass Edge Energy")}
              </span>
              <span>|111111⟩ (Bottom Right)</span>
            </div>
          </div>
        )}

        {/* 3. NEQR: 8-Bitplane Slicer + QFS Ripple-Borrow Waterfall */}
        {method === "neqr" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 p-4 rounded-xl bg-[#181818] border border-[#313131] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Layers size={14} className="text-[#BD93F9]" />
                  {formatDisplayCopy("8 Bitplane Register Breakdown")}
                </span>
                <span className="text-[#BD93F9]">q = {analysis.neqr.bitDepth} Bits ({analysis.neqr.activeQubits} Active Q)</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {analysis.neqr.bitplanes.map((plane, idx) => {
                  const bitNum = 7 - idx;
                  const activeBit = bitNum >= 8 - analysis.neqr.bitDepth;
                  return (
                    <div
                      key={bitNum}
                      className={`p-1.5 rounded border text-center ${
                        activeBit ? "bg-[#0A0A0A] border-[#313131]" : "bg-[#0A0A0A]/40 border-[#222] opacity-40"
                      }`}
                    >
                      <span className="text-[10px] font-mono text-[#9B9B9B] block mb-1">
                        |c{bitNum}⟩ {bitNum === 7 ? "MSB" : bitNum === 0 ? "LSB" : ""}
                      </span>
                      <div className="grid grid-cols-8 gap-[1px] aspect-square">
                        {plane.flat().map((b, pIdx) => (
                          <div
                            key={pIdx}
                            style={{ backgroundColor: b === 1 ? "#BD93F9" : "#111111" }}
                            className="w-full h-full"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 p-4 rounded-xl bg-[#181818] border border-[#313131] space-y-2 overflow-x-auto">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-semibold">
                  {formatDisplayCopy("Live Quantum Full Subtractor Ripple Borrow Table")}
                </span>
                <span className="text-[#39D353]">
                  |ΔI| = {analysis.neqr.absDiffQ} (Borrow Flag s = {analysis.neqr.signBorrow})
                </span>
              </div>
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="border-b border-[#313131] text-[#9B9B9B]">
                  <tr>
                    <th className="py-1.5 px-2">k</th>
                    <th className="py-1.5 px-2">2^k</th>
                    <th className="py-1.5 px-2 text-[#00F0FF]">a_k</th>
                    <th className="py-1.5 px-2 text-[#FF79C6]">b_k</th>
                    <th className="py-1.5 px-2">b_in</th>
                    <th className="py-1.5 px-2">d_k</th>
                    <th className="py-1.5 px-2 text-[#FFE600]">b_out</th>
                    <th className="py-1.5 px-2 text-[#39D353]">|ΔI|_k</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {analysis.neqr.waterfall.map((r) => (
                    <tr key={r.bit_k}>
                      <td className="py-1 px-2 text-white font-bold">c{r.bit_k}</td>
                      <td className="py-1 px-2 text-[#9B9B9B]">{r.place_value}</td>
                      <td className="py-1 px-2 text-[#00F0FF]">{r.a_k}</td>
                      <td className="py-1 px-2 text-[#FF79C6]">{r.b_k}</td>
                      <td className="py-1 px-2 text-[#9B9B9B]">{r.b_in}</td>
                      <td className="py-1 px-2 text-white">{r.d_k_raw}</td>
                      <td className="py-1 px-2 text-[#FFE600]">{r.b_out}</td>
                      <td className="py-1 px-2 text-[#39D353] font-bold">{r.abs_k}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Sobel 3x3 Live Kernel MAC Spotlight */}
        {method === "sobel" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {[
              { title: "Local 3×3 Patch Window I", mat: analysis.sobel.window3x3, color: "#FFFFFF" },
              { title: `Kx * I Products (Sum Gx = ${analysis.sobel.gx})`, mat: analysis.sobel.kxProducts, color: "#38BDF8" },
              { title: `Ky * I Products (Sum Gy = ${analysis.sobel.gy})`, mat: analysis.sobel.kyProducts, color: "#FF79C6" },
            ].map((blk) => (
              <div key={blk.title} className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
                <span className="block font-semibold" style={{ color: blk.color }}>
                  {formatDisplayCopy(blk.title)}
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {blk.mat.flat().map((v, i) => (
                    <div
                      key={i}
                      className="py-2 rounded bg-[#0A0A0A] border border-[#313131] text-center text-white font-semibold"
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Canny 4-Sector Orientation Gauge */}
        {method === "canny" && (
          <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div>
              <div className="text-white font-semibold mb-1">
                {formatDisplayCopy("Canny Directional Ridge Sector & Hysteresis Envelope")}
              </div>
              <p className="text-[#9B9B9B] font-sans">
                {formatDisplayCopy(
                  "Non Maximum Suppression compares gradient magnitude against forward and backward neighbors along the snapped 45° normal."
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[0, 45, 90, 135].map((ang) => {
                const snap = Math.round(analysis.sobel.angleDeg / 45) * 45 % 180;
                const active = snap === ang;
                return (
                  <div
                    key={ang}
                    className={`px-3 py-2 rounded-lg border ${
                      active ? "bg-[#FFE600] text-black font-bold border-[#FFE600]" : "bg-[#0A0A0A] text-[#9B9B9B] border-[#313131]"
                    }`}
                  >
                    {ang}°
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Robinson 8-Sector Polar Compass Rose */}
        {method === "robinson" && (
          <div className="p-4 rounded-xl bg-[#181818] border border-[#313131] flex flex-col sm:flex-row items-center gap-6">
            <svg viewBox="0 0 180 180" className="w-40 h-40 flex-shrink-0 bg-[#0A0A0A] rounded-xl border border-[#313131]">
              {[0.33, 0.66, 1.0].map((rFrac) => (
                <circle
                  key={rFrac}
                  cx="90"
                  cy="90"
                  r={60 * rFrac}
                  fill="none"
                  stroke="#272727"
                  strokeWidth="1"
                />
              ))}
              <polygon
                fill="#39D353"
                fillOpacity="0.25"
                stroke="#39D353"
                strokeWidth="2"
                points={analysis.robinson.sectorNames
                  .map((dir, i) => {
                    const ang = (i * 45 * Math.PI) / 180 - Math.PI / 2;
                    const norm = analysis.robinson.sectorEnergiesPatch[dir] / robMaxPatch;
                    const rad = 12 + norm * 48;
                    return `${(90 + Math.cos(ang) * rad).toFixed(1)},${(90 + Math.sin(ang) * rad).toFixed(1)}`;
                  })
                  .join(" ")}
              />
              {analysis.robinson.sectorNames.map((dir, i) => {
                const ang = (i * 45 * Math.PI) / 180 - Math.PI / 2;
                const isDom = dir === analysis.robinson.dominantDir;
                return (
                  <text
                    key={dir}
                    x={90 + Math.cos(ang) * 72}
                    y={93 + Math.sin(ang) * 72}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={isDom ? "#00F0FF" : "#9B9B9B"}
                  >
                    {dir}
                  </text>
                );
              })}
            </svg>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 w-full text-xs font-mono">
              {analysis.robinson.sectorNames.map((dir) => {
                const isDom = dir === analysis.robinson.dominantDir;
                return (
                  <div
                    key={dir}
                    className={`p-2 rounded-lg border ${
                      isDom ? "bg-[#272727] border-[#00F0FF]" : "bg-[#0A0A0A] border-[#313131]"
                    }`}
                  >
                    <span className="text-[#9B9B9B] block text-[10px]">{dir} Sector</span>
                    <span className="text-white font-bold">
                      {analysis.robinson.sectorValues[dir]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
