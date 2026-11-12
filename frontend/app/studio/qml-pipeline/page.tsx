import React from 'react';
import { Metadata } from 'next';
import { QmlPipelineWorkbench } from '@/components/qml/QmlPipelineWorkbench';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Layers } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

export const metadata: Metadata = {
  title: 'Quantum ML Pipeline | Quantum Vision Studio',
  description: 'Quantum Wavelet Denoising, QCNN Geological Classification, NCQI Multi Spectral Fusion, and Grover Oracle.',
};

export default function QmlPipelinePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#888888] hover:text-white bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {formatDisplayCopy('Back to Live Studio')}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#888888] bg-[#181818] border border-[#313131] px-2.5 py-1 rounded-lg">
              {formatDisplayCopy('Aer Simulator 1.15')}
            </span>
          </div>
        </div>

        {/* Workbench */}
        <QmlPipelineWorkbench />
      </div>
    </div>
  );
}

