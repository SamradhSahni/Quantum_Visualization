'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Code, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LatexQuantikzPreview } from '@/components/publish/LatexQuantikzPreview';
import { PolyglotTranspilerDrawer } from '@/components/publish/PolyglotTranspilerDrawer';
import { formatDisplayCopy } from '@/lib/copyFormatter';

export default function PublishPage() {
  const [permalink, setPermalink] = useState<string>('https://quantum-vision.org/snap/sha256:7f4a9b2c3d');
  const [permalinkCopied, setPermalinkCopied] = useState<boolean>(false);
  const [downloadBundleLoading, setDownloadBundleLoading] = useState<boolean>(false);

  const handleCopyPermalink = () => {
    navigator.clipboard.writeText(permalink);
    setPermalinkCopied(true);
    setTimeout(() => setPermalinkCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    setDownloadBundleLoading(true);
    setTimeout(() => {
      // Create a text file bundle representing the publication payload
      const content = `% Quantum Vision Platform - Academic LaTeX Bundle
% SHA-256 Checksum: 7f4a9b2c3d8e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a

\\documentclass[journal]{IEEEtran}
\\usepackage{amsmath,amssymb}
\\usepackage{quantikz}
\\usepackage{booktabs}
\\usepackage{graphicx}

\\title{Comparative Benchmark of Quantum Hadamard Edge Detection on Lunar Orbiter Surface Topography}
\\author{Lunar Quantum Vision Consortium}

\\begin{document}
\\maketitle
\\begin{abstract}
We benchmark FRQI, NEQR, and QPIE quantum image representation models against classical Canny and Sobel operators.
\\end{abstract}
\\end{document}`;

      const blob = new Blob([content], { type: 'application/x-tex' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quantum_vision_academic_bundle.tex';
      a.click();
      URL.revokeObjectURL(url);
      setDownloadBundleLoading(false);
    }, 600);
  };

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
            <span className="text-xs font-mono text-[#00F0FF] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg">
              IEEE / Springer Format Ready
            </span>
            <span className="text-xs font-mono text-[#888888] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg">
              Quantikz v0.7
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
                  {formatDisplayCopy('Suite 4: Scientific Reproducibility & Publication')}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {formatDisplayCopy('Academic LaTeX Exporter & Polyglot Transpiler')}
              </h1>
              <p className="text-sm text-[#A1A1A1] mt-1 max-w-2xl">
                {formatDisplayCopy(
                  'Export camera ready IEEE and Springer LaTeX publication bundles with quantikz circuits, booktabs scorecards, polyglot transpiled code across 5 quantum frameworks, and deterministic SHA 256 permalinks.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZip}
                disabled={downloadBundleLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#00F0FF] hover:bg-[#33F3FF] text-black font-semibold text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {downloadBundleLoading ? formatDisplayCopy('Packaging Bundle') : formatDisplayCopy('Download LaTeX Bundle')}
              </button>
            </div>
          </div>

          {/* Experiment Permalink Generator Bar */}
          <div className="mt-6 pt-4 border-t border-[#313131] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1F1F1F] p-3 rounded-xl border border-[#313131]">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-xs font-mono text-[#888888]">{formatDisplayCopy('Reproducible Experiment Permalink')}:</span>
              <code className="text-xs font-mono text-white bg-[#121212] px-2 py-1 rounded border border-[#2B2B2B]">
                {permalink}
              </code>
            </div>

            <button
              onClick={handleCopyPermalink}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 bg-[#272727] hover:bg-[#313131] text-white rounded-lg border border-[#313131] transition-all"
            >
              {permalinkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#30D158]" />
                  <span className="text-[#30D158]">{formatDisplayCopy('Copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{formatDisplayCopy('Copy Permalink')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 1: LaTeX Quantikz and Booktabs Exporter */}
        <LatexQuantikzPreview />

        {/* Section 2: Polyglot Quantum Transpiler Drawer */}
        <PolyglotTranspilerDrawer />
      </div>
    </div>
  );
}

