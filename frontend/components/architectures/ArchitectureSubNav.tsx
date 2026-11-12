"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { Layers, Sparkles, Cpu, Binary, Compass } from "lucide-react";

export const ArchitectureSubNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    {
      href: "/architectures",
      label: "Overview & Taxonomic Comparison",
      icon: <Layers size={14} />,
      color: "#00F0FF"
    },
    {
      href: "/architectures/frqi-qhed",
      label: "FRQI QHED (7 Qubits)",
      icon: <Sparkles size={14} />,
      color: "#FF00B4"
    },
    {
      href: "/architectures/qpie-qhed",
      label: "QPIE QHED (6 Qubits)",
      icon: <Cpu size={14} />,
      color: "#00F0FF"
    },
    {
      href: "/architectures/neqr-gradient",
      label: "NEQR Gradient (14 Qubits)",
      icon: <Binary size={14} />,
      color: "#BD93F9"
    }
  ];

  return (
    <div className="w-full flex items-center justify-start overflow-x-auto pb-4 mb-8 border-b border-[#313131]">
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#141414] border border-[#313131]">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#272727] text-white font-semibold border border-white/20 shadow-sm"
                  : "text-[#9B9B9B] hover:text-white hover:bg-[#1E1E1E]"
              }`}
            >
              <span style={{ color: isActive ? link.color : "#9B9B9B" }}>
                {link.icon}
              </span>
              <span>{formatDisplayCopy(link.label)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

