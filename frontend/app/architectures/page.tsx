"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArchitectureSubNav } from "@/components/architectures/ArchitectureSubNav";
import { AcademicReadingList } from "@/components/architectures/AcademicReadingList";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Binary,
  Compass,
  Activity,
  Maximize2
} from "lucide-react";

export default function ArchitecturesOverviewPage() {
  const [hoverPixel, setHoverPixel] = useState<{ r: number; c: number; val: number }>({
    r: 3,
    c: 3,
    val: 180
  });

  // Sample 8x8 pixel matrix for interactive inspector
  const sample8x8 = [
    [38, 40, 42, 215, 218, 220, 221, 219],
    [39, 41, 44, 212, 219, 222, 220, 218],
    [37, 39, 41, 216, 220, 221, 219, 217],
    [36, 38, 38, 218, 220, 223, 221, 220],
    [35, 37, 40, 214, 217, 219, 218, 216],
    [38, 40, 43, 210, 215, 218, 217, 215],
    [37, 39, 41, 208, 214, 216, 215, 214],
    [36, 38, 40, 205, 212, 215, 214, 212]
  ];

  // Mathematical variables for currently hovered pixel
  const thetaRad = ((hoverPixel.val / 255.0) * (Math.PI / 2.0)).toFixed(4);
  const qpieAmp = (hoverPixel.val / 1150.0).toFixed(4);
  const binCoord = `${hoverPixel.r.toString(2).padStart(3, "0")} ${hoverPixel.c.toString(2).padStart(3, "0")}`;
  const binVal = hoverPixel.val.toString(2).padStart(8, "0");

  const TAXONOMIC_MATRIX = [
    {
      dimension: "Full Name",
      frqi: "Flexible Representation of Quantum Images + QHED",
      qpie: "Quantum Probability Image Encoding + QHED",
      neqr: "Novel Enhanced Quantum Representation + Gradient"
    },
    {
      dimension: "Seminal Authors",
      frqi: "Le, Dong & Hirota (2011) + Yao et al. (2017)",
      qpie: "Yao, Wang, Liao, Chen, Pan et al. (2017)",
      neqr: "Zhang, Lu, Gao & Wang (2013)"
    },
    {
      dimension: "Intensity Encoding Mechanism",
      frqi: "Single qubit polar rotation angle θ on |c>",
      qpie: "Normalized statevector amplitude α_i = I_i / ||I||_2",
      neqr: "q bit binary computational basis state |c7..c0>"
    },
    {
      dimension: "Qubit Formula (2^n × 2^n Image)",
      frqi: "2n + 1 Qubits",
      qpie: "2n Qubits (Theoretical Minimum)",
      neqr: "2n + q Qubits (q = 8 for Grayscale)"
    },
    {
      dimension: "Qubits for 8×8 Patch (n = 3)",
      frqi: "7 Qubits (6 Position + 1 Color)",
      qpie: "6 Qubits (6 Position + 0 Color)",
      neqr: "14 Qubits (6 Position + 8 Gray)"
    },
    {
      dimension: "Qubits for 512×512 Image (n = 9)",
      frqi: "19 Qubits",
      qpie: "18 Qubits",
      neqr: "26 Qubits"
    },
    {
      dimension: "Edge Extraction Mechanism",
      frqi: "Trigonometric phase interference via Hadamard H",
      qpie: "Linear amplitude interference via Hadamard H",
      neqr: "Digital binary subtraction via Reversible ALU"
    },
    {
      dimension: "Edge Detection Gate Complexity",
      frqi: "O(poly(n)) for shift + O(1) for Hadamard",
      qpie: "O(poly(n)) for shift + O(1) for Hadamard",
      neqr: "O(q + n) Toffoli and CNOT arithmetic depth"
    },
    {
      dimension: "Analytical Edge Response",
      frqi: "P_edge ∝ 2 sin^2(|θ_a - θ_b| / 2)",
      qpie: "P_edge ∝ (I_a - I_b)^2 / (2 ||I||_2^2)",
      neqr: "|ΔI| = |I_a - I_b| (Exact 8 Bit Integer)"
    },
    {
      dimension: "Intensity Retrieval Accuracy",
      frqi: "Probabilistic (shot sampling variance)",
      qpie: "Probabilistic (requires L2 norm restoration)",
      neqr: "100% Deterministic (exact in 1 readout)"
    },
    {
      dimension: "Contrast Normalization Behavior",
      frqi: "Absolute per pixel mapping (independent θ)",
      qpie: "Global patch L2 norm restoration required",
      neqr: "Exact digital bit level invariance"
    },
    {
      dimension: "Primary Planetary Vision Strength",
      frqi: "Quadratic noise suppression in flat dark basins",
      qpie: "Minimum qubit footprint (6 Qubits); fast simulation",
      neqr: "Zero phase distortion; exact radiometric step"
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      {/* 1. Sub Navigation Bar */}
      <ArchitectureSubNav />

      {/* 2. Hero Title & Metadata */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#313131] bg-[#181818] mb-4">
          <Cpu size={14} className="text-[#00F0FF]" />
          <span className="text-xs font-mono text-[#E1E1E1] uppercase">
            {formatDisplayCopy("Quantum Architecture Encyclopedia & Theoretical Foundations")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-4xl">
          {formatDisplayCopy("Foundations of Quantum Image Processing (QIP)")}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#9B9B9B] max-w-3xl leading-relaxed">
          {formatDisplayCopy(
            "Explore how quantum image representations eliminate classical convolution bottlenecks by mapping spatial coordinates into superposition and achieving exponential gradient speedup through unitary interference."
          )}
        </p>
      </div>

      {/* 3. Classical vs. Quantum Paradigm Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
          <div className="flex items-center gap-2 text-[#9B9B9B] pb-3 border-b border-[#313131]">
            <Compass size={16} className="text-[#FFE600]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {formatDisplayCopy("The Classical Spatial Convolution Bottleneck")}
            </h3>
          </div>
          <div className="space-y-3 text-xs text-[#A1A1A1] leading-relaxed">
            <p>
              In classical computer vision, a grayscale image of resolution N = 2ⁿ × 2ⁿ is stored in RAM as a discrete matrix I with integer intensities [0 to 255].
            </p>
            <p>
              Classical spatial operators (Sobel, Canny, Robinson) must compute finite-difference weighted sums over every pixel coordinate (Y, X):
            </p>
            <div className="p-3 rounded-lg bg-[#141414] font-mono text-white text-[11px] border border-[#272727]">
              G(Y, X) = ∑_(u,v) K(u, v) · I(Y + u, X + v)
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[#888]">
              <li><strong className="text-white">O(2^(2n)) Computational Complexity:</strong> Every pixel must be fetched and multiplied sequentially or across bounded SIMD cores.</li>
              <li><strong className="text-white">Kernel Smearing &amp; Noise Amplification:</strong> 3×3 spatial kernels blur sharp 1-pixel geological fracture lines into 3-pixel bands while amplifying sensor noise in shadowed basins.</li>
            </ul>
          </div>
        </Card>

        <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
          <div className="flex items-center gap-2 text-[#9B9B9B] pb-3 border-b border-[#313131]">
            <Sparkles size={16} className="text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {formatDisplayCopy("The Quantum Hilbert Space Advantage")}
            </h3>
          </div>
          <div className="space-y-3 text-xs text-[#A1A1A1] leading-relaxed">
            <p>
              Quantum Image Processing maps the entire 2ⁿ × 2ⁿ image into a coherent quantum state |ψ⟩ residing in complex Hilbert space H.
            </p>
            <p>
              Because k qubits span a 2^k-dimensional complex vector space, an image containing 2^(2n) pixels requires only <strong className="text-white">2n position qubits</strong> to index every coordinate in superposition:
            </p>
            <div className="p-3 rounded-lg bg-[#141414] font-mono text-[#00F0FF] text-[11px] border border-[#272727]">
              |Y⟩|X⟩ = (1/2^n) ∑_(Y,X) |y_(n-1)..y0⟩ ⊗ |x_(n-1)..x0⟩
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[#888]">
              <li><strong className="text-white">Exponential Spatial Parallelism:</strong> For an 8×8 patch, only 2n = 6 position qubits index all 64 coordinates simultaneously!</li>
              <li><strong className="text-white">O(1) Gradient Interference Depth:</strong> A single Hadamard gate on the least-significant position qubit calculates the spatial gradient across all pixel pairs in one unitary operation.</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* 4. Three Physical Stages of Quantum Vision Pipeline */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#FF00B4]" />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("The Three Physical Stages of Every Quantum Vision Pipeline")}
            </h3>
          </div>
          <Badge label="End to End Architecture" variant="default" size="xs" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00F0FF]">Stage 1</span>
              <Badge label="State Preparation" variant="cyan" size="xs" />
            </div>
            <h4 className="text-sm font-semibold text-white">Classical to Quantum Encoding</h4>
            <p className="text-xs text-[#9B9B9B] leading-relaxed">
              Maps classical pixel intensities $I(Y,X) \in [0, 255]$ into quantum amplitudes or rotation angles:
              FRQI (Bloch angle $\theta_i$), QPIE (statevector amplitude $\alpha_i$), or NEQR (computational basis $|c_7..c_0\rangle$).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#FF00B4]">Stage 2</span>
              <Badge label="Unitary Interference" variant="magenta" size="xs" />
            </div>
            <h4 className="text-sm font-semibold text-white">Parallel Spatial Differentiation</h4>
            <p className="text-xs text-[#9B9B9B] leading-relaxed">
              Applies cyclic coordinate shifts $D_8$ and single-qubit Hadamard interference $H$.
              Identical neighboring pixels cancel destructively ($\alpha_a - \alpha_b = 0$), while contrast edges reinforce constructively.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#30D158]">Stage 3</span>
              <Badge label="Measurement" variant="default" size="xs" />
            </div>
            <h4 className="text-sm font-semibold text-white">Born Collapse & Reconstruction</h4>
            <p className="text-xs text-[#9B9B9B] leading-relaxed">
              Measuring the register collapses the superposition according to $P = |\langle 1 | \psi \rangle|^2$.
              Combining horizontal and vertical passes across $10\times10$ halo-padded tiles reconstructs a seamless $512\times512$ edge map.
            </p>
          </div>
        </div>
      </Card>

      {/* 5. Master Taxonomic Comparison Table */}
      <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
          <div>
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy("Master Taxonomic Comparison: FRQI vs QPIE vs NEQR")}
            </h3>
            <p className="text-xs text-[#9B9B9B] mt-0.5">
              {formatDisplayCopy("Detailed 12 dimension architectural analysis comparing quantum representations and edge detection operators.")}
            </p>
          </div>
          <span className="text-xs font-mono text-[#00F0FF]">Peer Reviewed Benchmark</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#313131] bg-[#141414]">
                <th className="py-3 px-4 font-semibold text-[#9B9B9B]">Architectural Dimension</th>
                <th className="py-3 px-4 font-semibold text-[#FF00B4]">FRQI QHED</th>
                <th className="py-3 px-4 font-semibold text-[#00F0FF]">QPIE QHED</th>
                <th className="py-3 px-4 font-semibold text-[#BD93F9]">NEQR Gradient</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {TAXONOMIC_MATRIX.map((row, i) => (
                <tr key={i} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{row.dimension}</td>
                  <td className="py-3 px-4 text-[#D1D1D1]">{row.frqi}</td>
                  <td className="py-3 px-4 text-[#D1D1D1]">{row.qpie}</td>
                  <td className="py-3 px-4 text-[#D1D1D1]">{row.neqr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. Three Dedicated Architecture Deep-Dive Entry Cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {formatDisplayCopy("Explore Dedicated Architecture Study Modules")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FRQI Card */}
          <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] flex flex-col justify-between hover:border-[#FF00B4] transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge label="7 Qubits" variant="magenta" size="xs" />
                <span className="text-xs font-mono text-[#9B9B9B]">Le et al. 2011</span>
              </div>
              <h4 className="text-lg font-semibold text-white group-hover:text-[#FF00B4] transition-colors">
                {formatDisplayCopy("FRQI QHED")}
              </h4>
              <p className="text-xs text-[#9B9B9B] leading-relaxed">
                Flexible Representation of Quantum Images. Encodes intensities into single-qubit Bloch rotation angles θ on an auxiliary color qubit |c&gt;.
              </p>
              <div className="pt-2 text-xs font-mono text-[#D1D1D1] space-y-1">
                <div>· Polar angle θ ∈ [0, π/2]</div>
                <div>· Quadratic noise suppression</div>
                <div>· Hadamard phase interference</div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/architectures/frqi-qhed">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight size={14} />}>
                  {formatDisplayCopy("Enter FRQI Study Module")}
                </Button>
              </Link>
            </div>
          </Card>

          {/* QPIE Card */}
          <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] flex flex-col justify-between hover:border-[#00F0FF] transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge label="6 Qubits" variant="cyan" size="xs" />
                <span className="text-xs font-mono text-[#9B9B9B]">Yao et al. 2017</span>
              </div>
              <h4 className="text-lg font-semibold text-white group-hover:text-[#00F0FF] transition-colors">
                {formatDisplayCopy("QPIE QHED")}
              </h4>
              <p className="text-xs text-[#9B9B9B] leading-relaxed">
                Quantum Probability Image Encoding. Stores intensities directly in normalized statevector amplitudes with ZERO auxiliary color qubits.
              </p>
              <div className="pt-2 text-xs font-mono text-[#D1D1D1] space-y-1">
                <div>· Minimum qubit footprint (6 Qubits)</div>
                <div>· Linear difference response</div>
                <div>· Global L2 norm restoration</div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/architectures/qpie-qhed">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight size={14} />}>
                  {formatDisplayCopy("Enter QPIE Study Module")}
                </Button>
              </Link>
            </div>
          </Card>

          {/* NEQR Card */}
          <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] flex flex-col justify-between hover:border-[#BD93F9] transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge label="14 Qubits" variant="default" size="xs" />
                <span className="text-xs font-mono text-[#9B9B9B]">Zhang et al. 2013</span>
              </div>
              <h4 className="text-lg font-semibold text-white group-hover:text-[#BD93F9] transition-colors">
                {formatDisplayCopy("NEQR Gradient")}
              </h4>
              <p className="text-xs text-[#9B9B9B] leading-relaxed">
                Novel Enhanced Quantum Representation. Encodes exact 8-bit digital integers in basis states and executes reversible ripple-borrow subtraction.
              </p>
              <div className="pt-2 text-xs font-mono text-[#D1D1D1] space-y-1">
                <div>· 14 Qubits (6 Pos + 8 Gray)</div>
                <div>· 100% deterministic readout</div>
                <div>· Exact reversible binary ALU</div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/architectures/neqr-gradient">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight size={14} />}>
                  {formatDisplayCopy("Enter NEQR Study Module")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 7. Academic Reading List Section */}
      <AcademicReadingList algorithm="all" />

      {/* 8. Call to Action Footer */}
      <Card surface="card" outerRadius={16} className="p-8 border border-[#313131] text-center space-y-4 bg-gradient-to-b from-[#181818] to-[#0A0A0A]">
        <h3 className="text-2xl font-semibold text-white">
          {formatDisplayCopy("Ready to Test These Architectures on Real Lunar Imagery?")}
        </h3>
        <p className="text-sm text-[#9B9B9B] max-w-2xl mx-auto leading-relaxed">
          {formatDisplayCopy(
            "Launch the Live Quantum Studio to simulate FRQI, QPIE, and NEQR in parallel across full 512×512 Lunar Reconnaissance Orbiter GeoTIFFs with real-time gate telemetry."
          )}
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/studio">
            <Button variant="primary" size="lg" icon={<Sparkles size={18} className="text-black" />}>
              {formatDisplayCopy("Launch Live Quantum Studio")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
