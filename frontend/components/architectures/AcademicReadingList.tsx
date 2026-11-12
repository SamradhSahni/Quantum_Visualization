"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { BookOpen, ExternalLink, Bookmark } from "lucide-react";

interface PaperItem {
  title: string;
  authors: string;
  venue: string;
  year: number;
  significance: string;
}

interface AcademicReadingListProps {
  algorithm?: "frqi" | "qpie" | "neqr" | "all";
}

const ALL_PAPERS: Record<string, PaperItem[]> = {
  frqi: [
    {
      title: "A flexible representation of quantum images for polynomial preparation, image compression, and processing operations",
      authors: "Phuc Q. Le, Fangyan Dong, & Kaoru Hirota",
      venue: "Quantum Information Processing, 10(1), 63-84",
      year: 2011,
      significance: "The seminal paper inventing FRQI, establishing the 2n+1 qubit framework where pixel intensities are encoded into polar rotation angles on an auxiliary color qubit."
    },
    {
      title: "Quantum image processing and its application to edge detection: theory and experiment",
      authors: "Xi-Wei Yao, Heng Wang, Zhaokai Liao, et al.",
      venue: "Physical Review X, 7(3), 031041",
      year: 2017,
      significance: "Demonstrated the first physical experimental execution of Quantum Hadamard Edge Detection (QHED) and cyclic spatial permutation unitaries on multi-qubit NMR processors."
    }
  ],
  qpie: [
    {
      title: "Quantum image processing and its application to edge detection: theory and experiment",
      authors: "Xi-Wei Yao, Heng Wang, Zhaokai Liao, Ming-Cheng Chen, et al.",
      venue: "Physical Review X, 7(3), 031041",
      year: 2017,
      significance: "Invented QPIE, proving that pixel values can be directly mapped into complex probability amplitudes, achieving theoretical minimum qubit footprint (2n qubits) and linear difference responses."
    },
    {
      title: "Transformation of quantum states using uniformly controlled rotations",
      authors: "Mikko Möttönen, Juha J. Vartiainen, Ville Bergholm, & Martti M. Salomaa",
      venue: "Physical Review Letters, 93(13), 130502",
      year: 2004,
      significance: "The foundational mathematical algorithm for synthesizing arbitrary normalized n-qubit statevectors using minimal sequences of CNOT gates and multi-controlled Ry rotations."
    }
  ],
  neqr: [
    {
      title: "NEQR: a novel enhanced quantum representation of digital images",
      authors: "Yi Zhang, Kai Lu, Yinghui Gao, & Mo Wang",
      venue: "Quantum Information Processing, 12(8), 2833-2860",
      year: 2013,
      significance: "Invented NEQR, solving the probabilistic readout limitation of FRQI by storing exact 8-bit digital grayscale integers in computational basis registers."
    },
    {
      title: "Design of efficient reversible logic-based binary and BCD adder circuits",
      authors: "Himanshu Thapliyal & Nagarajan Ranganathan",
      venue: "ACM Journal on Emerging Technologies in Computing Systems (JETC), 9(3), 1-31",
      year: 2010,
      significance: "Derived the reversible quantum full-subtractor (QFS) and ripple-borrow carry networks used to execute exact digital spatial gradients in quantum hardware without classical memory access."
    }
  ]
};

export const AcademicReadingList: React.FC<AcademicReadingListProps> = ({ algorithm = "all" }) => {
  const papers =
    algorithm === "all"
      ? [...ALL_PAPERS["frqi"], ...ALL_PAPERS["qpie"], ...ALL_PAPERS["neqr"]]
      : ALL_PAPERS[algorithm] || ALL_PAPERS["frqi"];

  return (
    <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#00F0FF]" />
          <h3 className="text-base font-semibold text-white">
            {formatDisplayCopy("Curated Academic Reading List & Seminal Literature")}
          </h3>
        </div>
        <span className="text-xs font-mono text-[#9B9B9B]">Peer Reviewed Literature</span>
      </div>

      <div className="space-y-4">
        {papers.map((paper, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#141414] border border-[#272727] hover:border-[#444] transition-all space-y-2"
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-sm font-semibold text-white leading-snug">
                {paper.title}
              </h4>
              <Badge label={`${paper.year}`} variant="default" size="xs" />
            </div>

            <div className="text-xs font-mono text-[#9B9B9B]">
              <span className="text-[#E1E1E1]">{paper.authors}</span> · {paper.venue}
            </div>

            <p className="text-xs text-[#A1A1A1] leading-relaxed pt-1 border-t border-[#222]">
              <strong className="text-white font-mono font-medium">Scientific Significance: </strong>
              {paper.significance}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

