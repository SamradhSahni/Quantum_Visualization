"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TaglineReveal } from "@/components/landing/TaglineReveal";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import {
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Binary
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Release Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#313131] bg-[#181818] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
          <span className="text-xs font-mono text-[#E1E1E1] tracking-wider uppercase">
            {formatDisplayCopy("Version 3.1.0 Online: Quantum Edge Platform")}
          </span>
        </div>

        {/* Hero Heading with #FFFFFF to #9B9B9B Text Gradient */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-wrap-balance max-w-3xl leading-[1.08]"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 30%, #9B9B9B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {formatDisplayCopy("Quantum Vision Platform for Planetary Exploration")}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-[#9B9B9B] max-w-2xl text-wrap-pretty font-normal leading-relaxed">
          {formatDisplayCopy(
            "Execute true Hadamard interference circuits on calibrated lunar orbiter imagery. Compare FRQI, QPIE, NEQR, and classical spatial operators in real time."
          )}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/studio">
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles size={18} className="text-black" />}
            >
              {formatDisplayCopy("Launch Live Quantum Studio")}
            </Button>
          </Link>
          <Link href="/architectures">
            <Button
              variant="secondary"
              size="lg"
              icon={<Cpu size={18} />}
            >
              {formatDisplayCopy("Explore Quantum Architectures")}
            </Button>
          </Link>
        </div>

        {/* Quick Spec Bar */}
        <div className="mt-16 pt-8 border-t border-[#313131] w-full grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="p-3">
            <div className="text-xs font-mono text-[#9B9B9B] uppercase">
              {formatDisplayCopy("Resolution")}
            </div>
            <div className="text-xl font-mono font-semibold text-white mt-1">
              {formatDisplayCopy("512×512 Native")}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs font-mono text-[#9B9B9B] uppercase">
              {formatDisplayCopy("Seam Discontinuity")}
            </div>
            <div className="text-xl font-mono font-semibold text-[#00F0FF] mt-1">
              {formatDisplayCopy("0.00 Checkerboard")}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs font-mono text-[#9B9B9B] uppercase">
              {formatDisplayCopy("Variance Culling")}
            </div>
            <div className="text-xl font-mono font-semibold text-[#30D158] mt-1">
              {formatDisplayCopy("68 Percent Faster")}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs font-mono text-[#9B9B9B] uppercase">
              {formatDisplayCopy("Sim Engine")}
            </div>
            <div className="text-xl font-mono font-semibold text-[#BD93F9] mt-1">
              {formatDisplayCopy("Qiskit Aer C++")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. TAGLINE REVEAL */}
      <TaglineReveal />

      {/* 3. THREE-STEP WORKFLOW */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full border border-[#313131] bg-[#181818] text-[#9B9B9B] text-xs font-mono uppercase tracking-wider mb-4">
            {formatDisplayCopy("Execution Workflow")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            {formatDisplayCopy("From Raw Orbiter Image to Quantum Boundary")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card surface="card" outerRadius={16} className="p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#313131] flex items-center justify-center font-mono font-semibold text-[#00F0FF] mb-6">
                01
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {formatDisplayCopy("Halo Padded Slicing")}
              </h3>
              <p className="text-sm text-[#9B9B9B] leading-relaxed">
                {formatDisplayCopy(
                  "Slices lunar images into 6x6 cores with 1 pixel reflective halos (8x8 quantum tiles). Fast variance culling discards uniform basalt plains before circuit synthesis."
                )}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#313131] text-xs font-mono text-[#9B9B9B]">
              {formatDisplayCopy("Reflective Boundary Reflection")}
            </div>
          </Card>

          <Card surface="card" outerRadius={16} className="p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#313131] flex items-center justify-center font-mono font-semibold text-[#FF00B4] mb-6">
                02
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {formatDisplayCopy("Hadamard Interference")}
              </h3>
              <p className="text-sm text-[#9B9B9B] leading-relaxed">
                {formatDisplayCopy(
                  "Pre transpiled statevectors execute cyclic permutation D64 and Hadamard gate H on q0, causing constructive interference on crater rims and destructive cancellation on flat surfaces."
                )}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#313131] text-xs font-mono text-[#9B9B9B]">
              {formatDisplayCopy("Constant Depth Circuit")}
            </div>
          </Card>

          <Card surface="card" outerRadius={16} className="p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#313131] flex items-center justify-center font-mono font-semibold text-[#30D158] mb-6">
                03
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {formatDisplayCopy("Six Method Scorecard")}
              </h3>
              <p className="text-sm text-[#9B9B9B] leading-relaxed">
                {formatDisplayCopy(
                  "Compares quantum edge maps against Sobel, Canny, and Robinson baselines using Pratt Figure of Merit, SSIM, PSNR, and Shannon entropy."
                )}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#313131] text-xs font-mono text-[#9B9B9B]">
              {formatDisplayCopy("Sub Pixel Localization")}
            </div>
          </Card>
        </div>
      </section>

      {/* 4. SIX-ARCHITECTURES BENTO GRID */}
      <BentoGrid />

      {/* 5. FAQ ACCORDION */}
      <FaqAccordion />

      {/* 6. FINAL CALL TO ACTION */}
      <section className="py-24 px-6 border-t border-[#313131] bg-[#181818] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight">
            {formatDisplayCopy("Experience Quantum Edge Vision in Real Time")}
          </h2>
          <p className="mt-4 text-base text-[#9B9B9B] max-w-xl mx-auto">
            {formatDisplayCopy(
              "Inspect quantum wire states, observe constructive phase cancellation, and benchmark planetary crater localization precision."
            )}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/studio">
              <Button variant="primary" size="lg" icon={<Sparkles size={18} className="text-black" />}>
                {formatDisplayCopy("Open Quantum Studio Workspace")}
              </Button>
            </Link>
            <Link href="/benchmark">
              <Button variant="secondary" size="lg" icon={<Activity size={18} />}>
                {formatDisplayCopy("View Multi Method Benchmark")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

