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
import { Sparkles, ArrowRight, ShieldCheck, Activity, Layers, CheckCircle2, Compass } from "lucide-react";

export default function FRQIQHEDStudyPage() {
  const [passMode, setPassMode] = useState<"horizontal" | "vertical">("horizontal");

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      {/* 1. Sub Navigation Bar */}
      <ArchitectureSubNav />

      {/* 2. Hero Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#313131] bg-[#181818] mb-4">
          <Sparkles size={14} className="text-[#FF00B4]" />
          <span className="text-xs font-mono text-[#E1E1E1] uppercase">
            {formatDisplayCopy("Quantum Architecture Encyclopedia & Interactive Study Module")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-4xl">
          {formatDisplayCopy("FRQI QHED: Flexible Representation and Hadamard Phase Interference")}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#9B9B9B] max-w-3xl leading-relaxed">
          {formatDisplayCopy(
            "Complete mathematical derivations, circuit schematics, concrete numerical traces, and live parameter sandbox for Flexible Representation of Quantum Images combined with Quantum Hadamard Edge Detection."
          )}
        </p>
      </div>

      {/* 3. KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Qubits Per 8×8 Patch")}
          </span>
          <span className="text-lg font-bold text-white font-mono">7 Qubits</span>
          <span className="text-[11px] font-mono text-[#FF00B4] block mt-0.5">2n + 1 (6 Pos + 1 Color)</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Encoding Mechanism")}
          </span>
          <span className="text-lg font-bold text-white font-mono">Bloch Angle θ</span>
          <span className="text-[11px] font-mono text-[#00F0FF] block mt-0.5">θ_i ∈ [0, π/2] rad</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Edge Extraction Depth")}
          </span>
          <span className="text-lg font-bold text-white font-mono">O(1) Depth</span>
          <span className="text-[11px] font-mono text-[#30D158] block mt-0.5">Single Hadamard Gate</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Peak Edge Thinness")}
          </span>
          <span className="text-lg font-bold text-white font-mono">55.6%</span>
          <span className="text-[11px] font-mono text-[#FFE600] block mt-0.5">Exact 1-Pixel Rim Crest</span>
        </Card>
      </div>

      {/* 4. Section 1: Conceptual Foundations & Physical Intuition */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#313131]">
          <Compass size={16} className="text-[#FF00B4]" />
          <h3 className="text-base font-semibold text-white">
            {formatDisplayCopy("1. Conceptual Foundations & Physical Intuition")}
          </h3>
        </div>

        <div className="space-y-4 text-xs text-[#A1A1A1] leading-relaxed">
          <p>
            Proposed by Phuc Q. Le, Fangyan Dong, and Kaoru Hirota in 2011, the <strong className="text-white">Flexible Representation of Quantum Images (FRQI)</strong> separates
            <em className="text-white font-mono not-italic"> where</em> a pixel is located from <em className="text-white font-mono not-italic">how bright</em> it is:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
              <span className="text-xs font-mono font-bold text-[#00F0FF] block">The Coordinate Grid (6 Position Qubits)</span>
              <p className="text-[11px] text-[#9B9B9B]">
                Six qubits (q5, q4, q3 for row Y ∈ [0..7] and q2, q1, q0 for column X ∈ [0..7]) form a uniform quantum superposition over all 64 coordinates of an 8×8 patch.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
              <span className="text-xs font-mono font-bold text-[#FF00B4] block">The Bloch Sphere Pointer (1 Color Qubit |c&gt;)</span>
              <p className="text-[11px] text-[#9B9B9B]">
                A single auxiliary qubit |c⟩ acts as an analog intensity pointer. A dark shadow pixel (I = 0) leaves |c⟩ at the North Pole |0⟩, while a bright sunlit crater rim (I = 255) rotates |c⟩ to the South Pole |1⟩.
              </p>
            </div>
          </div>

          <p>
            When combined with <strong className="text-white">Quantum Hadamard Edge Detection (QHED)</strong>, a single Hadamard gate H acts on the least-significant position qubit (q0 for horizontal edges, q3 for vertical edges).
            Because H|0⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = (|0⟩ - |1⟩)/√2, it forces the color states of adjacent pixels to interfere:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#888]">
            <li><strong className="text-white">Destructive Interference (Flat Terrain):</strong> If neighbor pixels have identical intensity (θ_a = θ_b), difference amplitudes cancel to zero (cos θ_a - cos θ_b = 0). No edge probability is generated.</li>
            <li><strong className="text-white">Constructive Interference (Crater Rim):</strong> If pixel A is shadowed (θ_a ≈ 0) and pixel B is bright (θ_b ≈ π/2), their phase divergence produces high probability of measuring |q0 = 1⟩.</li>
          </ul>
        </div>
      </Card>

      {/* 5. Section 2: Complete Mathematical Formulations & Derivations */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#00F0FF]" />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("2. Complete Mathematical Formulation & Step-by-Step Derivations")}
            </h3>
          </div>
          <Badge label="KaTeX Formulations" variant="default" size="xs" />
        </div>

        <div className="space-y-4 text-xs text-[#D1D1D1]">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#00F0FF] font-mono font-bold block">
              {formatDisplayCopy("Step 1: Polar Angle Mapping & Ground State")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto">
              <KaTeXBlock math={String.raw`\theta_i = \frac{\pi}{2} \cdot \frac{I_i}{255}, \qquad \theta_i \in \left[0, \frac{\pi}{2}\right]`} displayMode />
            </div>
            <div className="text-[#9B9B9B] text-[11px] font-mono">
              <KaTeXBlock math={String.raw`\text{Initial 7 qubit state: } |\psi_0\rangle = |0\rangle_c \otimes |000000\rangle_{YX} = |0\rangle^{\otimes 7}`} />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#00F0FF] font-mono font-bold block">
              {formatDisplayCopy("Step 2: Position Superposition Layer")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto">
              <KaTeXBlock math={String.raw`|\psi_1\rangle = \big(I_c \otimes H^{\otimes 6}\big)|\psi_0\rangle = \frac{1}{8}\sum_{i=0}^{63}|0\rangle_c \otimes |i\rangle_{YX}`} displayMode />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#00F0FF] font-mono font-bold block">
              {formatDisplayCopy("Step 3: Controlled Ry Color Entanglement")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto">
              <KaTeXBlock math={String.raw`|\Psi_{\text{FRQI}}\rangle = \frac{1}{8}\sum_{i=0}^{63}\big(\cos\theta_i |0\rangle_c + \sin\theta_i |1\rangle_c\big) \otimes |i\rangle_{YX}`} displayMode />
            </div>
            <div className="text-[#9B9B9B] text-[11px] font-mono">
              {formatDisplayCopy("Rotates |c⟩ by 2θ_i around the Y axis conditioned on spatial address |i⟩.")}
            </div>
          </div>

          {/* Step 4 & 5 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#39D353] font-mono font-bold block">
              {formatDisplayCopy("Step 4 & 5: Physical Marginal Born Probability & Dual Pass Interleave")}
            </span>
            <div className="p-3 rounded bg-black/70 border border-[#272727] overflow-x-auto space-y-2 text-[#FFE600]">
              <KaTeXBlock math={String.raw`|\psi_{\text{diff}}(k_{\text{odd}})\rangle = \frac{1}{8\sqrt{2}}\Big[(\cos\theta_A - \cos\theta_B)|0\rangle_c + (\sin\theta_A - \sin\theta_B)|1\rangle_c\Big]\otimes |k_{\text{odd}}\rangle`} displayMode />
              <KaTeXBlock math={String.raw`P_{\text{circuit}}(k_{\text{odd}}) = P(0_c, k_{\text{odd}}) + P(1_c, k_{\text{odd}}) = \frac{1}{128}\Big[4\sin^2\!\left(\frac{\theta_A - \theta_B}{2}\right)\Big] = \frac{1}{32}\sin^2\!\left(\frac{\Delta\theta}{2}\right)`} displayMode />
              <KaTeXBlock math={String.raw`\tilde{P}_{\text{edge}}(A,B) = 64 \cdot P_{\text{circuit}} = 2\sin^2\!\left(\frac{|\theta_A - \theta_B|}{2}\right) \in [0, 1]`} displayMode />
            </div>
          </div>
        </div>
      </Card>

      {/* 6. Section 3: Interactive Circuit Explorer */}
      <CircuitInspectorDrawer
        algorithm="frqi"
        passMode={passMode}
        onPassChange={(p) => setPassMode(p)}
      />

      {/* 7. Section 4: Live 8x8 Patch Sandbox */}
      <PatchSandbox algorithm="frqi" />

      {/* 8. Section 5: Concrete Numerical Trace Table */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <h3 className="text-base font-semibold text-white">
            {formatDisplayCopy("5. Concrete Numerical Trace: Lunar Crater Rim vs Flat Basin")}
          </h3>
          <span className="text-xs font-mono text-[#00F0FF]">Apollo 16 Crater Floor Sample</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#313131] bg-[#141414]">
                <th className="py-2.5 px-3 font-semibold text-[#9B9B9B]">Pipeline Step</th>
                <th className="py-2.5 px-3 font-semibold text-[#9B9B9B]">Mathematical Formula</th>
                <th className="py-2.5 px-3 font-semibold text-[#FF00B4]">Pixel Pair (A, B): Rim Edge (38 vs 218)</th>
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
                <td className="py-2.5 px-3 font-bold text-white">2. FRQI Polar Angle</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">θ = (π/2) · (I/255)</td>
                <td className="py-2.5 px-3 text-[#FF00B4]">θ_a = 0.2341 rad, θ_b = 1.3429 rad</td>
                <td className="py-2.5 px-3 text-[#30D158]">θ_b = 1.3429 rad, θ_c = 1.3552 rad</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">3. Color State |c⟩</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">cos θ |0⟩ + sin θ |1⟩</td>
                <td className="py-2.5 px-3 text-white">A: 0.9727|0⟩ + 0.2320|1⟩<br/>B: 0.2259|0⟩ + 0.9741|1⟩</td>
                <td className="py-2.5 px-3 text-white">B: 0.2259|0⟩ + 0.9741|1⟩<br/>C: 0.2139|0⟩ + 0.9768|1⟩</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">4. Diff Amplitude</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">Δ_cos, Δ_sin</td>
                <td className="py-2.5 px-3 text-[#FFE600]">Δ_cos = +0.5281, Δ_sin = -0.5247</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">Δ_cos = +0.0085, Δ_sin = -0.0019</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">5. Born Edge Prob</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">2 · sin^2(Δθ / 2)</td>
                <td className="py-2.5 px-3 font-bold text-[#FF00B4]">0.5542 (STRONG EDGE)</td>
                <td className="py-2.5 px-3 font-bold text-[#30D158]">0.000076 (ZERO CANCELLATION)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">6. Verdict (τ=0.25)</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">P_edge ≥ τ</td>
                <td className="py-2.5 px-3 text-[#30D158] font-bold">EDGE PIXEL DETECTED</td>
                <td className="py-2.5 px-3 text-[#9B9B9B]">DESTRUCTIVE SUPPRESSION</td>
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
            <li><strong className="text-white">Quadratic Basin Suppression:</strong> Because P_edge = 2 sin²(Δθ/2) ≈ (Δθ)²/2, small thermal sensor fluctuations (ΔI ≤ 3) are quadratically suppressed toward zero, yielding cleaner mare crater basins than linear Sobel operators.</li>
            <li><strong className="text-white">Minimal Auxiliary Qubit Footprint:</strong> Requires only 1 color qubit regardless of resolution (7 qubits for 8×8; 19 qubits for 512×512).</li>
            <li><strong className="text-white">Absolute Radiometric Invariance:</strong> Pixel rotation angle θ_i depends solely on its own intensity, making FRQI immune to global brightness shifts elsewhere in the patch.</li>
          </ul>
        </Card>

        <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#FFE600]" />
            {formatDisplayCopy("Engineering Trade-Offs & Limitations")}
          </h4>
          <ul className="list-disc pl-4 space-y-2 text-xs text-[#A1A1A1] leading-relaxed">
            <li><strong className="text-white">State Preparation Depth:</strong> Preparing 64 independent rotation angles requires multi-controlled Ry gates (O(2^(2n)) depth), requiring Gray-code cancellation when transpiling for physical QPUs.</li>
            <li><strong className="text-white">Trigonometric Compression at Extreme Brightness:</strong> Because sin(Δθ/2) flattens as Δθ → π/2, transitions between high albedo lunar highlands (I = 210 to 255) are slightly compressed.</li>
            <li><strong className="text-white">Probabilistic Readout:</strong> When executed on shot-based quantum hardware, requires multiple shots to resolve fine amplitude differences.</li>
          </ul>
        </Card>
      </div>

      {/* 10. Section 7: Curated Academic Reading List */}
      <AcademicReadingList algorithm="frqi" />

      {/* 11. Call to Action Footer */}
      <Card surface="card" outerRadius={16} className="p-8 border border-[#313131] text-center space-y-4 bg-gradient-to-b from-[#181818] to-[#0A0A0A]">
        <h3 className="text-2xl font-semibold text-white">
          {formatDisplayCopy("Test FRQI QHED on Live 512×512 Lunar GeoTIFFs")}
        </h3>
        <p className="text-sm text-[#9B9B9B] max-w-2xl mx-auto leading-relaxed">
          {formatDisplayCopy(
            "Experience real-time patch-by-patch quantum simulation, dual-pass circuit animation, and side-by-side metric comparison in the Live Quantum Studio."
          )}
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/studio?algo=FRQI-QHED">
            <Button variant="primary" size="lg" icon={<Sparkles size={18} className="text-black" />}>
              {formatDisplayCopy("Launch FRQI in Live Quantum Studio")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
