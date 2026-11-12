"use client";

import React from "react";
import Link from "next/link";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white pt-28 pb-20 px-6 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#313131] pb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} className="mb-4">
            {formatDisplayCopy("Back to Platform")}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] uppercase mb-2">
          <FileText size={14} />
          {formatDisplayCopy("Research Service Terms")}
        </div>
        <h1 className="text-3xl font-semibold text-white">
          {formatDisplayCopy("Terms of Research & Simulation Service")}
        </h1>
        <p className="text-xs font-mono text-[#9B9B9B] mt-2">
          {formatDisplayCopy("Effective Date: November 2026 | Version 3.1.0")}
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#9B9B9B] leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            {formatDisplayCopy("1. Permitted Scientific Use")}
          </h2>
          <p>
            {formatDisplayCopy(
              "The Quantum Edge Vision Platform is provided for academic, astronomical, and space agency research into quantum vision algorithms, crater morphology detection, and comparative image edge localization."
            )}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            {formatDisplayCopy("2. Simulation Accuracy & Quantum Advantage")}
          </h2>
          <p>
            {formatDisplayCopy(
              "Quantum Hadamard edge detection simulations are executed on Qiskit Aer statevector simulators. While simulating idealized quantum state preparation, actual hardware execution on physical NISQ processors is subject to decoherence and gate infidelities."
            )}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            {formatDisplayCopy("3. Open Research Citations")}
          </h2>
          <p>
            {formatDisplayCopy(
              "Benchmark figures, Pratt FOM measurements, and comparative scorecards produced by this platform may be cited in academic publications with attribution to the Quantum Edge Vision Platform."
            )}
          </p>
        </section>
      </div>
    </div>
  );
}

