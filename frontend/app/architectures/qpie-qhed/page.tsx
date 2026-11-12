"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArchitectureSubNav } from "@/components/architectures/ArchitectureSubNav";
import { CircuitInspectorDrawer } from "@/components/architectures/CircuitInspectorDrawer";
import { PatchSandbox } from "@/components/architectures/PatchSandbox";
import { AcademicReadingList } from "@/components/architectures/AcademicReadingList";
import { KaTeXBlock } from "@/components/ui/KaTeXBlock";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { Cpu, ArrowRight, ShieldCheck, Activity, CheckCircle2, Zap, Compass } from "lucide-react";

export default function QPIEQHEDStudyPage() {
  const [passMode, setPassMode] = useState<"horizontal" | "vertical">("horizontal");

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      {/* 1. Sub Navigation Bar */}
      <ArchitectureSubNav />

      {/* 2. Hero Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#313131] bg-[#181818] mb-4">
          <Cpu size={14} className="text-[#00F0FF]" />
          <span className="text-xs font-mono text-[#E1E1E1] uppercase">
            {formatDisplayCopy("Quantum Architecture Encyclopedia & Interactive Study Module")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-4xl">
          {formatDisplayCopy("QPIE QHED: Quantum Probability Image Encoding and Pure Amplitude Interference")}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#9B9B9B] max-w-3xl leading-relaxed">
          {formatDisplayCopy(
            "Complete mathematical derivations, pure spatial amplitude circuits, radiometric L2 norm restoration protocols, and live interactive sandbox for QPIE combined with Quantum Hadamard Edge Detection."
          )}
        </p>
      </div>

      {/* 3. KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Qubits Per 8×8 Patch")}
          </span>
          <span className="text-lg font-bold text-white font-mono">6 Qubits</span>
          <span className="text-[11px] font-mono text-[#00F0FF] block mt-0.5">2n (Theoretical Minimum)</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Color Auxiliary Qubits")}
          </span>
          <span className="text-lg font-bold text-white font-mono">0 Qubits</span>
          <span className="text-[11px] font-mono text-[#30D158] block mt-0.5">Pure Spatial Statevector</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Gradient Response")}
          </span>
          <span className="text-lg font-bold text-white font-mono">Linear |ΔI|</span>
          <span className="text-[11px] font-mono text-[#FFE600] block mt-0.5">Zero Sine Compression</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Simulation Efficiency")}
          </span>
          <span className="text-lg font-bold text-white font-mono">2× Speedup</span>
          <span className="text-[11px] font-mono text-[#BD93F9] block mt-0.5">64 vs 128 Amplitudes (FRQI)</span>
        </Card>
      </div>

      {/* 4. Section 1: Conceptual Foundations & Physical Intuition */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#313131]">
          <Compass size={16} className="text-[#00F0FF]" />
          <h3 className="text-base font-semibold text-white">
            {formatDisplayCopy("1. Conceptual Foundations & Physical Intuition")}
          </h3>
        </div>

        <div className="space-y-4 text-xs text-[#A1A1A1] leading-relaxed">
          <p>
            Introduced by Xi-Wei Yao et al. in 2017 (<em className="text-white font-mono not-italic">Physical Review X</em>),
            <strong className="text-white"> Quantum Probability Image Encoding (QPIE)</strong> eliminates the auxiliary color qubit $|c\rangle$ entirely:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
              <span className="text-xs font-mono font-bold text-[#00F0FF] block">Pure Amplitude Representation</span>
              <p className="text-[11px] text-[#9B9B9B]">
                An 8×8 image patch (64 pixels) is treated as a 64-dimensional classical vector I = [I_0, I_1, ..., I_63]^T.
                By normalizing by its L2 norm ||I||_2, pixel intensities satisfy the quantum unit-probability condition ∑ |α_i|^2 = 1 and reside directly in the statevector of 6 qubits.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
              <span className="text-xs font-mono font-bold text-[#30D158] block">Direct Linear Gradient Response</span>
              <p className="text-[11px] text-[#9B9B9B]">
                When the Hadamard gate H is applied to q0, the difference amplitude is directly proportional to the linear difference (Ia - Ib) / (√2 · ||I||_2) without any trigonometric sine/cosine saturation at extreme brightness.
              </p>
            </div>
          </div>

          <p>
            Because the statevector dimension is only 2^6 = 64 (half of FRQI's 128 amplitudes and 256× smaller than NEQR's 16,384 states), QPIE achieves the fastest classical statevector simulation latency on the platform (~9.8ms per patch).
          </p>
        </div>
      </Card>

      {/* 5. Section 2: Complete Mathematical Formulations & Derivations */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#00F0FF]" />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("2. Complete Mathematical Formulation & L2 Norm Restoration")}
            </h3>
          </div>
          <Badge label="KaTeX Formulations" variant="cyan" size="xs" />
        </div>

        <div className="space-y-4 text-xs text-[#D1D1D1]">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#00F0FF] font-mono font-bold block">
              {formatDisplayCopy("Step 1: Regularized L2 Euclidean Energy Normalization")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto">
              <KaTeXBlock math={String.raw`\gamma_p^{\text{safe}} = \max\!\left(\sqrt{\sum_{i=0}^{63} I_i^2},\; 10^{-6}\right), \qquad \alpha_i = \frac{I_i}{\gamma_p^{\text{safe}}} \implies \sum_{i=0}^{63}|\alpha_i|^2 = 1`} displayMode />
            </div>
            <div className="text-[#9B9B9B] text-[11px] font-mono">
              {formatDisplayCopy("The gamma floor guarantees zero NaN division singularities inside shadowed lunar crater floors.")}
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#00F0FF] font-mono font-bold block">
              {formatDisplayCopy("Step 2: QPIE State Preparation (Mottonen Multiplexing)")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto">
              <KaTeXBlock math={String.raw`|\psi_{\text{QPIE}}\rangle = U_{\text{QPIE}}|0\rangle^{\otimes 6} = \sum_{i=0}^{63}\alpha_i |i\rangle_{YX}`} displayMode />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#00F0FF] font-mono font-bold block">
              {formatDisplayCopy("Step 3: 4 Pass Even & Odd Hadamard Butterfly")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto">
              <KaTeXBlock math={String.raw`(I^{\otimes 5}\otimes H)|\psi_{\text{QPIE}}\rangle = \frac{1}{\sqrt{2}}\sum_{k=0}^{31}|k\rangle \otimes \Big[(\alpha_{2k}+\alpha_{2k+1})|0\rangle + (\alpha_{2k}-\alpha_{2k+1})|1\rangle\Big]`} displayMode />
            </div>
            <div className="text-[#9B9B9B] text-[11px] font-mono">
              {formatDisplayCopy("|q0=0⟩ holds the low pass sum; |q0=1⟩ isolates the high pass difference amplitude.")}
            </div>
          </div>

          {/* Step 4 & 5 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#39D353] font-mono font-bold block">
              {formatDisplayCopy("Step 4 & 5: Global L2 Restoration & Radiometric Shot Amplification Law")}
            </span>
            <div className="p-3 rounded bg-black/70 border border-[#272727] overflow-x-auto space-y-2 text-[#FFE600]">
              <KaTeXBlock math={String.raw`P_{\text{raw}}(A,B) = \left|\frac{\alpha_A - \alpha_B}{\sqrt{2}}\right|^2 = \frac{(I_A - I_B)^2}{2(\gamma_p^{\text{safe}})^2}, \qquad \sigma_{\nabla} \propto \frac{\gamma_p}{\sqrt{S}}`} displayMode />
              <KaTeXBlock math={String.raw`\nabla_x(Y,X) = \frac{\sqrt{2}\,\gamma_p^{\text{safe}}}{255}\sqrt{P_{\text{raw}}} = \frac{|I(Y,X) - I(Y,X+1)|}{255} \in [0, 1]`} displayMode />
            </div>
          </div>
        </div>
      </Card>

      {/* 6. Section 3: Interactive Circuit Explorer */}
      <CircuitInspectorDrawer
        algorithm="qpie"
        passMode={passMode}
        onPassChange={(p) => setPassMode(p)}
      />

      {/* 7. Section 4: Live 8x8 Patch Sandbox */}
      <PatchSandbox algorithm="qpie" />

      {/* 8. Section 5: Concrete Numerical Trace Table */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <h3 className="text-base font-semibold text-white">
            {formatDisplayCopy("5. Concrete Numerical Trace: QPIE Amplitude Butterfly & Norm Restoration")}
          </h3>
          <span className="text-xs font-mono text-[#00F0FF]">Patch Energy ||I||_2 = 1120.0</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#313131] bg-[#141414]">
                <th className="py-2.5 px-3 font-semibold text-[#9B9B9B]">Pipeline Step</th>
                <th className="py-2.5 px-3 font-semibold text-[#9B9B9B]">Mathematical Formula</th>
                <th className="py-2.5 px-3 font-semibold text-[#00F0FF]">Pixel Pair (A, B): Rim Edge (38 vs 218)</th>
                <th className="py-2.5 px-3 font-semibold text-[#30D158]">Pixel Pair (B, C): Flat Rim (218 vs 220)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">1. Input Intensity</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">I ∈ [0, 255]</td>
                <td className="py-2.5 px-3 text-white">I_a = 38, I_b = 218</td>
                <td className="py-2.5 px-3 text-white">I_b = 218, I_c = 220</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">2. Amplitude α_i</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">I_i / ||I||_2</td>
                <td className="py-2.5 px-3 text-[#00F0FF]">α_a = 0.03393, α_b = 0.19464</td>
                <td className="py-2.5 px-3 text-[#30D158]">α_b = 0.19464, α_c = 0.19643</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">3. Sum Branch |0⟩</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">(α_a + α_b) / √2</td>
                <td className="py-2.5 px-3 text-white">+0.16162</td>
                <td className="py-2.5 px-3 text-white">+0.27653</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">4. Diff Branch |1⟩</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">(α_a - α_b) / √2</td>
                <td className="py-2.5 px-3 text-[#FFE600]">-0.11364</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">-0.00126</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">5. Raw Born Prob</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">|α_diff|^2</td>
                <td className="py-2.5 px-3 text-[#00F0FF]">0.012914</td>
                <td className="py-2.5 px-3 text-[#30D158]">0.0000016</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">6. Restored Gradient</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">(√(2·P_raw)·||I||)/255</td>
                <td className="py-2.5 px-3 font-bold text-[#00F0FF]">0.7059 (STRONG EDGE)</td>
                <td className="py-2.5 px-3 font-bold text-[#30D158]">0.0078 (SUPPRESSED)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 9. Section 6: Capabilities & Planetary Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#30D158]" />
            {formatDisplayCopy("Planetary Remote Sensing Strengths")}
          </h4>
          <ul className="list-disc pl-4 space-y-2 text-xs text-[#A1A1A1] leading-relaxed">
            <li><strong className="text-white">Theoretical Minimum Qubit Footprint:</strong> Requires only 6 qubits for an 8×8 patch and 18 qubits for 512×512, cutting circuit simulation memory by 50% compared to FRQI.</li>
            <li><strong className="text-white">Linear Proportionality:</strong> The difference response is linearly proportional to $|I_a - I_b|$, preserving true geological albedo gradients across crater wall slopes.</li>
            <li><strong className="text-white">Zero Aux Qubit Overhead:</strong> No color qubit wire means fewer two-qubit entangling gates during state preparation.</li>
          </ul>
        </Card>

        <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#FFE600]" />
            {formatDisplayCopy("Engineering Trade-Offs & Limitations")}
          </h4>
          <ul className="list-disc pl-4 space-y-2 text-xs text-[#A1A1A1] leading-relaxed">
            <li><strong className="text-white">Global L2 Coupling:</strong> Each pixel amplitude is normalized by the patch norm ||I||_2. If a patch has high total brightness, individual measurement probabilities decrease, requiring higher shot counts.</li>
            <li><strong className="text-white">Dark Shadow Sensitivity:</strong> In near-zero shadow patches, ||I||_2 ≈ 0 requires regularized epsilon-floor filtering to avoid noise amplification.</li>
          </ul>
        </Card>
      </div>

      {/* 10. Section 7: Curated Academic Reading List */}
      <AcademicReadingList algorithm="qpie" />

      {/* 11. Call to Action Footer */}
      <Card surface="card" outerRadius={16} className="p-8 border border-[#313131] text-center space-y-4 bg-gradient-to-b from-[#181818] to-[#0A0A0A]">
        <h3 className="text-2xl font-semibold text-white">
          {formatDisplayCopy("Test QPIE QHED on Live 512×512 Lunar GeoTIFFs")}
        </h3>
        <p className="text-sm text-[#9B9B9B] max-w-2xl mx-auto leading-relaxed">
          {formatDisplayCopy(
            "Execute pure spatial amplitude state preparation and 6-qubit Hadamard interference live in the Quantum Studio."
          )}
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/studio?algo=QPIE-QHED">
            <Button variant="primary" size="lg" icon={<Zap size={18} className="text-black" />}>
              {formatDisplayCopy("Launch QPIE in Live Quantum Studio")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
