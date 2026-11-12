"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#313131] flex items-center justify-center text-[#00F0FF] mb-6">
        <Compass size={32} />
      </div>
      <div className="text-xs font-mono text-[#00F0FF] uppercase mb-2">
        {formatDisplayCopy("404 Error: Coordinate Not Found")}
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
        {formatDisplayCopy("Quantum Statevector Displaced")}
      </h1>
      <p className="text-sm text-[#9B9B9B] max-w-md mb-8">
        {formatDisplayCopy(
          "The requested research page or circuit telemetry artifact does not exist on this planetary node."
        )}
      </p>
      <Link href="/">
        <Button variant="primary" size="md" icon={<ArrowLeft size={16} className="text-black" />}>
          {formatDisplayCopy("Return to Command Deck")}
        </Button>
      </Link>
    </div>
  );
}

