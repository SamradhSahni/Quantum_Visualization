"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Sigma } from "lucide-react";
import { KaTeXBlock } from "@/components/ui/KaTeXBlock";
import { formatDisplayCopy } from "@/lib/copyFormatter";

interface GisTheoryFormulaStripProps {
  title: string;
  roleSummary: string;
  symbolicMath: string;
  liveSubstitutionMath?: string;
  defaultOpen?: boolean;
  accentColor?: string;
}

export const GisTheoryFormulaStrip: React.FC<GisTheoryFormulaStripProps> = ({
  title,
  roleSummary,
  symbolicMath,
  liveSubstitutionMath,
  defaultOpen = false,
  accentColor = "#00F0FF",
}) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-[#1A1A1A] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sigma className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-[11px] font-mono font-semibold text-white">
            {formatDisplayCopy(title)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#888888]">
          <span>{open ? formatDisplayCopy("Hide Derivation") : formatDisplayCopy("Role & Formula")}</span>
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {open && (
        <div className="px-3.5 pb-3 pt-2 border-t border-[#242424] space-y-2.5">
          <p className="text-[11px] text-[#A1A1A1] leading-relaxed">
            {formatDisplayCopy(roleSummary)}
          </p>
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#777777] block mb-1">
              {formatDisplayCopy("Physical Law")}
            </span>
            <KaTeXBlock math={symbolicMath} displayMode className="text-xs text-white" />
          </div>
          {liveSubstitutionMath && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2">
              <span className="text-[9px] font-mono uppercase tracking-wider block mb-1" style={{ color: accentColor }}>
                {formatDisplayCopy("Live Telemetry Substitution")}
              </span>
              <KaTeXBlock math={liveSubstitutionMath} displayMode className="text-xs text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

