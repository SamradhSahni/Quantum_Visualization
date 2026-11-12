'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface QiskitCodeSyncDrawerProps {
  qiskitCode: string;
  qasmCode: string;
}

export const QiskitCodeSyncDrawer: React.FC<QiskitCodeSyncDrawerProps> = ({
  qiskitCode,
  qasmCode
}) => {
  const [activeTab, setActiveTab] = useState<'qiskit' | 'qasm'>('qiskit');
  const [copied, setCopied] = useState<boolean>(false);

  const activeCode = activeTab === 'qiskit' ? qiskitCode : qasmCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            Live Code Synchronization
          </span>
          <div className="flex items-center gap-1 bg-[#1F1F1F] p-0.5 rounded-lg border border-[#313131]">
            <button
              onClick={() => setActiveTab('qiskit')}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                activeTab === 'qiskit' ? 'bg-[#00F0FF] text-black font-semibold' : 'text-[#9B9B9B]'
              }`}
            >
              Qiskit Python
            </button>
            <button
              onClick={() => setActiveTab('qasm')}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                activeTab === 'qasm' ? 'bg-[#00F0FF] text-black font-semibold' : 'text-[#9B9B9B]'
              }`}
            >
              OpenQASM 3.0
            </button>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2F2F2F] text-xs font-mono text-white flex items-center gap-1.5 border border-[#3A3A3A] transition-all"
        >
          {copied ? <Check className="w-3 h-3 text-[#30D158]" /> : <Copy className="w-3 h-3 text-[#00F0FF]" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="bg-[#121212] p-3 rounded-xl border border-[#262626] max-h-52 overflow-y-auto font-mono text-xs text-[#EDEDED] leading-relaxed select-text">
        <pre>{activeCode}</pre>
      </div>
    </div>
  );
};

