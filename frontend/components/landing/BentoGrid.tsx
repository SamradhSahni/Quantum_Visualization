"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { Cpu, Eye, Zap, Layers, BarChart3, ArrowRight } from "lucide-react";

interface ArchCard {
  id: string;
  name: string;
  type: "quantum" | "classical";
  tag: string;
  qubits: string;
  math: string;
  description: string;
  colorBorder: string;
  accentColor: string;
}

const ARCHITECTURES: ArchCard[] = [
  {
    id: "frqi",
    name: "FRQI QHED",
    type: "quantum",
    tag: "Primary Standard",
    qubits: "7 Qubits (6 Pos + 1 Color)",
    math: "theta_i = (pi/2) * (I_i / 255)",
    description:
      "Encodes spatial coordinates in 6 position qubits and grayscale intensity in the probability amplitude of a single color qubit via controlled Ry rotations.",
    colorBorder: "border-[#FF00B4]/40",
    accentColor: "#FF00B4"
  },
  {
    id: "qpie",
    name: "QPIE QHED",
    type: "quantum",
    tag: "High Efficiency",
    qubits: "6 Qubits (Pure Amplitude)",
    math: "|psi> = (1/||I||) sum I_i |i>",
    description:
      "Directly encodes normalized pixel vectors into 64 statevector amplitudes with L2 norm radiometric preservation, eliminating inter patch contrast collapse.",
    colorBorder: "border-[#00F0FF]/40",
    accentColor: "#00F0FF"
  },
  {
    id: "neqr",
    name: "NEQR Gradient",
    type: "quantum",
    tag: "Bit Accurate",
    qubits: "14 Qubits (6 Pos + 8 Gray)",
    math: "|f(Y,X)> = |c7 c6 ... c0>",
    description:
      "Encodes exact 8 bit grayscale intensities into computational basis registers, executing reversible quantum arithmetic subtractors for exact gradient evaluation.",
    colorBorder: "border-[#BD93F9]/40",
    accentColor: "#BD93F9"
  },
  {
    id: "sobel",
    name: "Sobel 3×3 Operator",
    type: "classical",
    tag: "Spatial Gradient",
    qubits: "0 Qubits (Classical CPU)",
    math: "K_x, K_y 3x3 Convolution",
    description:
      "First order differential operator convolving 3x3 directional kernels across image pixels to approximate horizontal and vertical spatial derivatives.",
    colorBorder: "border-[#38BDF8]/40",
    accentColor: "#38BDF8"
  },
  {
    id: "canny",
    name: "Canny 5 Stage",
    type: "classical",
    tag: "Optimal Filter",
    qubits: "0 Qubits (Classical CPU)",
    math: "Gaussian + NMS + Hysteresis",
    description:
      "Multi stage pipeline featuring Gaussian smoothing, gradient calculation, non maximum suppression, and dual threshold hysteresis edge linking.",
    colorBorder: "border-[#FFE600]/40",
    accentColor: "#FFE600"
  },
  {
    id: "robinson",
    name: "Robinson 8 Compass",
    type: "classical",
    tag: "Directional Compass",
    qubits: "0 Qubits (Classical CPU)",
    math: "8 Directional Mask Convolutions",
    description:
      "Evaluates 8 symmetric directional compass masks (N, NE, E, SE, S, SW, W, NW) to determine peak gradient magnitude and orientation angle.",
    colorBorder: "border-[#30D158]/40",
    accentColor: "#30D158"
  }
];

export const BentoGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "quantum" | "classical">("all");

  const filtered = ARCHITECTURES.filter((arch) => {
    if (activeTab === "all") return true;
    return arch.type === activeTab;
  });

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-block px-3 py-1 rounded-full border border-[#313131] bg-[#181818] text-[#9B9B9B] text-xs font-mono uppercase tracking-wider mb-4">
            {formatDisplayCopy("Architectural Taxonomy")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            {formatDisplayCopy("Six Comparative Edge Architectures")}
          </h2>
          <p className="mt-3 text-base text-[#9B9B9B] max-w-xl">
            {formatDisplayCopy(
              "Benchmark state preparation complexity, qubit register footprints, and noise resilience across quantum and classical vision models."
            )}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-lg border border-[#313131] bg-[#181818] self-start md:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "all" ? "bg-white text-black" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("All Six")}
          </button>
          <button
            onClick={() => setActiveTab("quantum")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "quantum" ? "bg-[#00F0FF] text-black" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Quantum (3)")}
          </button>
          <button
            onClick={() => setActiveTab("classical")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "classical" ? "bg-[#FFB340] text-black" : "text-[#9B9B9B] hover:text-white"
            }`}
          >
            {formatDisplayCopy("Classical (3)")}
          </button>
        </div>
      </div>

      {/* Grid of 6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((arch) => (
          <Card
            key={arch.id}
            surface="card"
            outerRadius={16}
            className={`p-6 flex flex-col justify-between hover:border-[#555555] group transition-all duration-200`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge
                  label={arch.tag}
                  variant={arch.type === "quantum" ? "quantum" : "classical"}
                />
                <span className="text-xs font-mono text-[#9B9B9B]">{arch.qubits}</span>
              </div>

              <h3 className="text-xl font-semibold text-white group-hover:text-[#00F0FF] transition-colors">
                {arch.name}
              </h3>

              <div className="mt-3 py-2 px-3 rounded bg-[#181818] border border-[#313131] font-mono text-xs text-[#00F0FF]/90">
                {arch.math}
              </div>

              <p className="mt-4 text-sm text-[#9B9B9B] leading-relaxed">
                {formatDisplayCopy(arch.description)}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#313131] flex items-center justify-between">
              <Link
                href={`/architectures?tab=${arch.id}`}
                className="text-xs font-medium text-white hover:text-[#00F0FF] flex items-center gap-1.5 transition-colors"
              >
                <span>{formatDisplayCopy("View Quantum Circuit")}</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href={`/studio?algo=${encodeURIComponent(arch.name)}`}
                className="text-xs font-mono text-[#9B9B9B] hover:text-white"
              >
                {formatDisplayCopy("Open In Studio")}
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

