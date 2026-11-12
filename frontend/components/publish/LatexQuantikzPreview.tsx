'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

interface LatexQuantikzPreviewProps {
  circuitTex?: string;
  tableTex?: string;
  bibtex?: string;
}

export const LatexQuantikzPreview: React.FC<LatexQuantikzPreviewProps> = ({
  circuitTex,
  tableTex,
  bibtex
}) => {
  const [activeTab, setActiveTab] = useState<'circuit' | 'table' | 'bibtex'>('circuit');
  const [copied, setCopied] = useState<boolean>(false);

  const defaultCircuit = `\\begin{quantikz}[row sep=0.35cm, column sep=0.45cm]
  \\lstick{$|0\\rangle_{q_0}$} & \\gate{H} & \\ctrl{1} & \\gate[4]{D_{2^n}} & \\gate{H} & \\meter{} & \\qw \\\\
  \\lstick{$|0\\rangle_{q_1}$} & \\gate{H} & \\ctrl{1} & \\qw & \\qw & \\meter{} & \\qw \\\\
  \\lstick{$|0\\rangle_{q_2}$} & \\gate{H} & \\ctrl{1} & \\qw & \\qw & \\meter{} & \\qw \\\\
  \\lstick{$|0\\rangle_{c}$}   & \\qw      & \\gate{R_y(2\\theta)} & \\qw & \\qw & \\meter{} & \\qw
\\end{quantikz}`;

  const defaultTable = `\\begin{table}[htbp]
\\centering
\\caption{Comparative Benchmark of Quantum and Classical Edge Detection on Lunar Orbiter Imagery.}
\\label{tab:lunar_quantum_benchmark}
\\begin{tabular}{lcccccc}
\\toprule
\\textbf{Algorithm} & \\textbf{Paradigm} & \\textbf{Qubits} & \\textbf{Pratt FOM} & \\textbf{Entropy} & \\textbf{SNR (dB)} & \\textbf{Thinness (\\%)} \\\\
\\midrule
\\textbf{FRQI-QHED} & Quantum & 7 & 0.892 & 4.35 & 26.2 & 88\\% \\\\
\\textbf{QPIE-QHED} & Quantum & 6 & 0.874 & 4.21 & 25.4 & 84\\% \\\\
NEQR-Gradient & Quantum & 14 & 0.842 & 4.05 & 24.1 & 81\\% \\\\
Canny 5-Stage & Classical & - & 0.835 & 3.98 & 23.5 & 80\\% \\\\
Sobel 3x3 & Classical & - & 0.761 & 3.65 & 21.0 & 72\\% \\\\
\\bottomrule
\\end{tabular}
\\end{table}`;

  const defaultBibtex = `@article{yao2017quantum,
  title={Quantum image processing and its application to edge detection: QHED and beyond},
  author={Yao, Xi-Wei and Wang, Heng and Liao, Ze-Hao and Chen, Ming-Cheng and Pan, Jian-Wei},
  journal={Physical Review X},
  volume={7},
  number={3},
  pages={031041},
  year={2017}
}`;

  const codeToShow =
    activeTab === 'circuit'
      ? circuitTex || defaultCircuit
      : activeTab === 'table'
      ? tableTex || defaultTable
      : bibtex || defaultBibtex;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'bibtex' ? 'bib' : 'tex';
    const blob = new Blob([codeToShow], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_vision_${activeTab}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("One Click LaTeX Academic Bundle Generator")}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-[#1F1F1F] p-0.5 rounded-lg border border-[#313131] text-xs font-mono">
            <button
              onClick={() => setActiveTab('circuit')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'circuit' ? 'bg-[#00F0FF] text-black font-semibold' : 'text-[#9B9B9B]'
              }`}
            >
              quantikz Circuit
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'table' ? 'bg-[#00F0FF] text-black font-semibold' : 'text-[#9B9B9B]'
              }`}
            >
              booktabs Table
            </button>
            <button
              onClick={() => setActiveTab('bibtex')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'bibtex' ? 'bg-[#00F0FF] text-black font-semibold' : 'text-[#9B9B9B]'
              }`}
            >
              BibTeX
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2F2F2F] text-xs font-mono text-white flex items-center gap-1 border border-[#3A3A3A] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5 text-[#00F0FF]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2F2F2F] text-xs font-mono text-white flex items-center gap-1 border border-[#3A3A3A] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-[#121212] p-4 rounded-xl border border-[#2B2B2B] max-h-64 overflow-y-auto font-mono text-xs text-[#EDEDED] leading-relaxed select-text">
        <pre>{codeToShow}</pre>
      </div>
    </div>
  );
};

