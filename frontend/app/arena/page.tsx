import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Swords, Bot, Sparkles, Terminal } from 'lucide-react';
import { CustomQasmArena } from '@/components/arena/CustomQasmArena';
import { formatDisplayCopy } from '@/lib/copyFormatter';

export const metadata: Metadata = {
  title: 'Quantum Algorithm Arena | Quantum Vision Studio',
  description: 'Submit custom OpenQASM 3.0 circuits and rank against quantum and classical edge detection benchmarks.',
};

export default function ArenaPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#888888] hover:text-white bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-lg transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {formatDisplayCopy('Back to Live Studio')}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#00F0FF] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#00F0FF]" />
              {formatDisplayCopy('FastMCP Quantum Copilot Enabled')}
            </span>
            <span className="text-xs font-mono text-[#888888] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg">
              OpenQASM 3.0 Spec
            </span>
          </div>
        </div>

        {/* Master Header Card */}
        <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider font-mono text-[#00F0FF]">
                  {formatDisplayCopy('Suite 5: Custom Unitary & OpenQASM 3.0 Algorithm Arena')}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {formatDisplayCopy('Quantum Vision Algorithm Arena')}
              </h1>
              <p className="text-sm text-[#A1A1A1] mt-1 max-w-2xl">
                {formatDisplayCopy(
                  'Write or paste custom OpenQASM 3.0 quantum circuits, synthesize novel edge ansatzes, and benchmark your custom unitary directly against FRQI, QPIE, NEQR, and classical Canny operators on Apollo 16 lunar imagery.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-[#1F1F1F] border border-[#313131] px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#FF79C6]" />
                <span className="text-xs font-mono text-white">4096 Shots / Pass</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Custom QASM Arena Component */}
        <CustomQasmArena />
      </div>
    </div>
  );
}

