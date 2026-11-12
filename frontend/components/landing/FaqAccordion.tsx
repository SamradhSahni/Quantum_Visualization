"use client";

import React, { useState } from "react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does FRQI QHED detect image edges using quantum mechanics?",
    a: "FRQI encodes the 64 pixel brightness values of an 8x8 tile into the quantum rotation angle theta of a single color qubit |c>. A cyclic coordinate decrement unitary D64 shifts adjacent pixels into interference position, and a Hadamard gate causes constructive interference on boundary edges and destructive cancellation on uniform flat surfaces."
  },
  {
    q: "Why use Halo Padded tile extraction instead of standard 8x8 non overlapping patches?",
    a: "Standard non overlapping patches suffer from cyclic wrap around discontinuities at the right and bottom boundaries (index 7 wrapping to index 0). The Halo Padded protocol extracts 6x6 inner cores with a 1 pixel reflective halo (forming an 8x8 quantum tile) and discards the boundary ring post measurement to guarantee zero checkerboard seams across 512x512 images."
  },
  {
    q: "How does QPIE prevent radiometric contrast collapse across dark shadow patches?",
    a: "Standard QPIE normalizes pixel vectors by their local L2 norm, which artificially amplifies faint noise in uniform black lunar shadows to maximum white edge intensity. Version 3.1.0 scales post measurement edge probabilities by gamma_p = ||I_p||_2, preserving accurate photometric contrast across the full scene."
  },
  {
    q: "What is the difference between FRQI and NEQR representation?",
    a: "FRQI uses 1 color qubit and encodes grayscale values continuously in probability amplitudes via trigonometric angles. NEQR uses 8 dedicated qubits to store exact 8 bit grayscale integers in computational basis states, allowing reversible arithmetic ALU addition and subtraction at the cost of higher qubit counts (14 qubits total)."
  },
  {
    q: "How does flat patch variance culling accelerate 512x512 processing?",
    a: "Over 60% of lunar mare orbiter tiles are uniform basalt plains with near zero local gradient. The tiler computes the patch variance in O(1) time and bypasses full quantum circuit simulation if variance is below 1.5e-4, slashing execution latency by up to 68%."
  },
  {
    q: "Can I inspect individual quantum gates step by step?",
    a: "Yes. The Live Quantum Studio allows you to step through all 6 execution stages (Superposition Init, State Encoding, Cyclic Subtraction, Hadamard Interference, Phase Cancellation, and Measurement Collapse) while watching wire states toggle between |0> and |1> in real time."
  },
  {
    q: "What quantitative metrics are used to compare quantum and classical edge detection?",
    a: "We compute Pratt Figure of Merit (FOM) for boundary localization precision, Structural Similarity Index (SSIM), Peak Signal to Noise Ratio (PSNR), Shannon Edge Entropy, Signal to Noise Ratio (SNR), and Boundary Thinness."
  },
  {
    q: "How is this platform deployed for high throughput production on AWS?",
    a: "The frontend is compiled into a lightweight standalone Next.js Alpine container (<150 MB) on AWS ECS Fargate, while the FastAPI backend runs async Qiskit Aer worker pools with zero copy POSIX shared memory buffers and Redis pub sub backplanes."
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 rounded-full border border-[#313131] bg-[#181818] text-[#9B9B9B] text-xs font-mono uppercase tracking-wider mb-4">
          {formatDisplayCopy("Technical FAQ")}
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
          {formatDisplayCopy("Frequently Asked Questions")}
        </h2>
        <p className="mt-3 text-base text-[#9B9B9B]">
          {formatDisplayCopy("Detailed insights into quantum circuit topologies, mathematical formulations, and system architecture.")}
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[#313131] bg-[#181818] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full py-4 px-6 text-left flex items-center justify-between text-white font-medium text-base hover:bg-[#1F1F1F] transition-colors"
              >
                <span>{formatDisplayCopy(faq.q)}</span>
                <ChevronDown
                  size={18}
                  className={`text-[#9B9B9B] transition-transform duration-200 flex-shrink-0 ml-4 ${
                    isOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-sm text-[#9B9B9B] leading-relaxed border-t border-[#272727]">
                  {formatDisplayCopy(faq.a)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

