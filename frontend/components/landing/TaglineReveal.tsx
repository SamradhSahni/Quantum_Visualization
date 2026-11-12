"use client";

import React, { useState, useEffect } from "react";
import { formatDisplayCopy } from "@/lib/copyFormatter";

const WORDS = [
  "Transform", "raw", "lunar", "orbiter", "imagery", "into", "sub", "pixel",
  "boundary", "vectors", "using", "quantum", "superposition.",
  "Achieve", "superior", "structural", "fidelity", "with", "true", "hadamard",
  "phase", "interference", "circuits."
];

export const TaglineReveal: React.FC = () => {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCount((prev) => (prev < WORDS.length ? prev + 1 : prev));
    }, 90);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto text-center">
      <div className="inline-block px-3 py-1 rounded-full border border-[#313131] bg-[#181818] text-[#00F0FF] text-xs font-mono uppercase tracking-wider mb-8">
        {formatDisplayCopy("Quantum Edge Advantage")}
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-wrap-balance">
        {WORDS.map((word, idx) => {
          const isRevealed = idx < activeCount;
          return (
            <span
              key={idx}
              className="inline-block mr-2.5 transition-colors duration-300"
              style={{
                color: isRevealed ? "#FFFFFF" : "#383838",
                textShadow: isRevealed ? "0 0 20px rgba(255,255,255,0.25)" : "none"
              }}
            >
              {word}
            </span>
          );
        })}
      </h2>
      <p className="mt-8 text-base text-[#9B9B9B] max-w-2xl mx-auto font-normal">
        {formatDisplayCopy(
          "By encoding image matrices into unitary quantum states, QHED extracts high frequency gradients in constant circuit depth per tile."
        )}
      </p>
    </section>
  );
};

