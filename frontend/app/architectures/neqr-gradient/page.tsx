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
import { Binary, ArrowRight, ShieldCheck, Activity, CheckCircle2, Cpu, Compass } from "lucide-react";

export default function NEQRGradientStudyPage() {
  const [passMode, setPassMode] = useState<"horizontal" | "vertical">("horizontal");

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      {/* 1. Sub Navigation Bar */}
      <ArchitectureSubNav />

      {/* 2. Hero Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#313131] bg-[#181818] mb-4">
          <Binary size={14} className="text-[#BD93F9]" />
          <span className="text-xs font-mono text-[#E1E1E1] uppercase">
            {formatDisplayCopy("Quantum Architecture Encyclopedia & Interactive Study Module")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-4xl">
          {formatDisplayCopy("NEQR Gradient: Novel Enhanced Quantum Representation and Exact Digital Subtraction")}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#9B9B9B] max-w-3xl leading-relaxed">
          {formatDisplayCopy(
            "Complete mathematical derivations, 14-qubit digital basis circuits, reversible ripple-borrow subtractor networks, and live bit-depth sandbox for Novel Enhanced Quantum Representation."
          )}
        </p>
      </div>

      {/* 3. KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Storage vs Coherent QFS Qubits")}
          </span>
          <span className="text-lg font-bold text-white font-mono">14 Store / 24 QFS</span>
          <span className="text-[11px] font-mono text-[#BD93F9] block mt-0.5">2n+q Storage vs 2n+2q+2 ALU</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Encoding Mechanism")}
          </span>
          <span className="text-lg font-bold text-white font-mono">Basis State |c⟩</span>
          <span className="text-[11px] font-mono text-[#00F0FF] block mt-0.5">|c7 c6 c5 c4 c3 c2 c1 c0⟩</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Arithmetic Subtractor")}
          </span>
          <span className="text-lg font-bold text-white font-mono">QFS ALU</span>
          <span className="text-[11px] font-mono text-[#30D158] block mt-0.5">Reversible Borrow Carry</span>
        </Card>

        <Card surface="card" outerRadius={12} className="p-4 border border-[#313131] text-left">
          <span className="text-[11px] font-mono text-[#9B9B9B] uppercase block mb-1">
            {formatDisplayCopy("Intensity Accuracy")}
          </span>
          <span className="text-lg font-bold text-white font-mono">100% Exact</span>
          <span className="text-[11px] font-mono text-[#FFE600] block mt-0.5">Zero Shot Noise Variance</span>
        </Card>
      </div>

      {/* 4. Section 1: Conceptual Foundations & Physical Intuition */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#313131]">
          <Compass size={16} className="text-[#BD93F9]" />
          <h3 className="text-base font-semibold text-white">
            {formatDisplayCopy("1. Conceptual Foundations & Physical Intuition")}
          </h3>
        </div>

        <div className="space-y-4 text-xs text-[#A1A1A1] leading-relaxed">
          <p>
            Published by Yi Zhang, Kai Lu, Yinghui Gao, and Mo Wang in 2013, the <strong className="text-white">Novel Enhanced Quantum Representation (NEQR)</strong> resolves
            the two main drawbacks of analog quantum representations (FRQI and QPIE): probabilistic intensity readout and trigonometric/normalization distortion.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
              <span className="text-xs font-mono font-bold text-[#BD93F9] block">Exact Digital Quantum Bits</span>
              <p className="text-[11px] text-[#9B9B9B]">
                Instead of encoding brightness into a continuous rotation angle θ or amplitude α, NEQR encodes the exact 8-bit binary integer of every pixel into an 8-qubit grayscale register |c7 c6 c5 c4 c3 c2 c1 c0⟩.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
              <span className="text-xs font-mono font-bold text-[#30D158] block">Exact Reversible Arithmetic Subtractor</span>
              <p className="text-[11px] text-[#9B9B9B]">
                Because pixel values are stored as digital quantum bits (|0⟩ and |1⟩), we can execute exact reversible quantum digital arithmetic—a Quantum Ripple Borrow Subtractor (U_sub)—to subtract neighboring pixel registers with 100% integer precision.
              </p>
            </div>
          </div>

          <p>
            Measuring a basis state in NEQR yields the exact integer difference |ΔI| in [0 to 255] in a single basis readout, free of shot-noise variance on the intensity itself.
          </p>
        </div>
      </Card>

      {/* 5. Section 2: Complete Mathematical Formulations & Derivations */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#BD93F9]" />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("2. Complete Mathematical Formulation & Ripple Borrow Subtractor")}
            </h3>
          </div>
          <Badge label="KaTeX Formulations" variant="default" size="xs" />
        </div>

        <div className="space-y-4 text-xs text-[#D1D1D1]">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#BD93F9] font-mono font-bold block">
              {formatDisplayCopy("Step 1: Binary Basis Decomposition & Storage vs Coherent Width")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto space-y-1.5">
              <KaTeXBlock math={String.raw`I^{(q)}(Y,X) = \left\lfloor \frac{I(Y,X)}{2^{8-q}} \right\rfloor = \sum_{k=0}^{q-1} c_k(Y,X)\,2^k, \qquad Q_{\text{store}} = 2n + q = 14`} displayMode />
              <KaTeXBlock math={String.raw`Q_{\text{active}} = 2n + 2q + 2 = 6 + 2(8) + 2 = 24 \text{ Coherent QFS Subtractor Qubits}`} displayMode />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#00F0FF] font-mono font-bold block">
              {formatDisplayCopy("Step 2: Reversible Quantum Ripple Borrow Subtractor (QFS Cell Equations)")}
            </span>
            <div className="p-2.5 rounded bg-black/70 border border-[#272727] overflow-x-auto">
              <KaTeXBlock math={String.raw`d_k = a_k \oplus b_k \oplus b_{\text{in}}^{(k)}, \qquad b_{\text{out}}^{(k)} = (\bar{a}_k \cdot b_k) \oplus \Big(\overline{(a_k \oplus b_k)} \cdot b_{\text{in}}^{(k)}\Big), \quad b_{\text{in}}^{(0)} = 0`} displayMode />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-2">
            <span className="text-[#39D353] font-mono font-bold block">
              {formatDisplayCopy("Step 3: MSB Borrow Two's Complement Unsigned Absolute Value")}
            </span>
            <div className="p-3 rounded bg-black/70 border border-[#272727] overflow-x-auto text-[#FFE600]">
              <KaTeXBlock math={String.raw`|\Delta I^{(q)}| = |I_A^{(q)} - I_B^{(q)}| = \big(d \oplus s^{\otimes q}\big) + s, \qquad s = b_{\text{out}}^{(q-1)} \in \{0, 1\}`} displayMode />
            </div>
          </div>
        </div>
      </Card>

      {/* 6. Section 3: Interactive Circuit Explorer */}
      <CircuitInspectorDrawer
        algorithm="neqr"
        passMode={passMode}
        onPassChange={(p) => setPassMode(p)}
      />

      {/* 7. Section 4: Live 8x8 Patch Sandbox */}
      <PatchSandbox algorithm="neqr" />

      {/* 8. Section 5: Concrete Numerical Binary Trace Table */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <h3 className="text-base font-semibold text-white">
            {formatDisplayCopy("5. Concrete Numerical Trace: 8-Bit Quantum Subtractor Bitplane Trace")}
          </h3>
          <span className="text-xs font-mono text-[#BD93F9]">Minuend: 142 (10001110) vs Subtrahend: 108 (01101100)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#313131] bg-[#141414]">
                <th className="py-2.5 px-3 font-semibold text-[#9B9B9B]">Bit Index k</th>
                <th className="py-2.5 px-3 font-semibold text-[#9B9B9B]">Place Value 2^k</th>
                <th className="py-2.5 px-3 font-semibold text-[#00F0FF]">Minuend a_k (142)</th>
                <th className="py-2.5 px-3 font-semibold text-[#FF00B4]">Subtrahend b_k (108)</th>
                <th className="py-2.5 px-3 font-semibold text-[#9B9B9B]">Borrow In b_in</th>
                <th className="py-2.5 px-3 font-semibold text-[#30D158]">Diff Bit d_k</th>
                <th className="py-2.5 px-3 font-semibold text-[#FFE600]">Borrow Out b_out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 0 (LSB)</td>
                <td className="py-2 px-3 text-[#9B9B9B]">1</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">0</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 1</td>
                <td className="py-2 px-3 text-[#9B9B9B]">2</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">1</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 2</td>
                <td className="py-2 px-3 text-[#9B9B9B]">4</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">0</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 3</td>
                <td className="py-2 px-3 text-[#9B9B9B]">8</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">0</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 4</td>
                <td className="py-2 px-3 text-[#9B9B9B]">16</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">0</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 5</td>
                <td className="py-2 px-3 text-[#9B9B9B]">32</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-[#9B9B9B]">0</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">1</td>
                <td className="py-2 px-3 text-[#FFE600] font-bold">1 (Borrows)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 6</td>
                <td className="py-2 px-3 text-[#9B9B9B]">64</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-[#FFE600]">1</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">0</td>
                <td className="py-2 px-3 text-[#FFE600] font-bold">1 (Borrows)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">k = 7 (MSB)</td>
                <td className="py-2 px-3 text-[#9B9B9B]">128</td>
                <td className="py-2 px-3 text-white">1</td>
                <td className="py-2 px-3 text-white">0</td>
                <td className="py-2 px-3 text-[#FFE600]">1</td>
                <td className="py-2 px-3 text-[#30D158] font-bold">0</td>
                <td className="py-2 px-3 text-[#30D158]">0 (Sign = +)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-lg bg-[#141414] border border-[#272727] flex items-center justify-between text-xs font-mono">
          <span className="text-[#9B9B9B]">Quantum Output Basis State |d7..d0⟩:</span>
          <span className="text-[#30D158] font-bold">|00100010⟩_2 = 32 + 2 = 34 (Exact: 142 - 108 = 34)</span>
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
            <li><strong className="text-white">Deterministic Exact Precision:</strong> Unlike analog rotations, every basis state holds an exact binary number, measuring the integer gradient with zero shot variance on the intensity.</li>
            <li><strong className="text-white">Arbitrary Reversible Digital Arithmetic:</strong> Enables bit-plane slicing, exact thresholding, and morphological operations directly in quantum hardware.</li>
            <li><strong className="text-white">Zero Normalization Distortion:</strong> Completely free from patch-energy dependence or trigonometric phase saturation.</li>
          </ul>
        </Card>

        <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#FFE600]" />
            {formatDisplayCopy("Engineering Trade-Offs & Limitations")}
          </h4>
          <ul className="list-disc pl-4 space-y-2 text-xs text-[#A1A1A1] leading-relaxed">
            <li><strong className="text-white">Highest Qubit Footprint:</strong> Requires $2n + q = 14$ qubits for an 8×8 patch (16,384 basis state amplitudes), resulting in higher classical simulation memory than FRQI (7 qubits) or QPIE (6 qubits).</li>
            <li><strong className="text-white">Deep Toffoli Cascades:</strong> Reversible full-subtractor ripple borrow chains require deeper gate networks than single Hadamard interference.</li>
          </ul>
        </Card>
      </div>

      {/* 10. Section 7: Curated Academic Reading List */}
      <AcademicReadingList algorithm="neqr" />

      {/* 11. Call to Action Footer */}
      <Card surface="card" outerRadius={16} className="p-8 border border-[#313131] text-center space-y-4 bg-gradient-to-b from-[#181818] to-[#0A0A0A]">
        <h3 className="text-2xl font-semibold text-white">
          {formatDisplayCopy("Test NEQR Gradient on Live 512×512 Lunar GeoTIFFs")}
        </h3>
        <p className="text-sm text-[#9B9B9B] max-w-2xl mx-auto leading-relaxed">
          {formatDisplayCopy(
            "Execute 14-qubit digital quantum state preparation and reversible ripple-borrow subtraction live in the Quantum Studio."
          )}
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/studio?algo=NEQR-Gradient">
            <Button variant="primary" size="lg" icon={<Binary size={18} className="text-black" />}>
              {formatDisplayCopy("Launch NEQR in Live Quantum Studio")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
