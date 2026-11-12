"use client";

import React from "react";
import Link from "next/link";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white pt-28 pb-20 px-6 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#313131] pb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} className="mb-4">
            {formatDisplayCopy("Back to Platform")}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] uppercase mb-2">
          <Shield size={14} />
          {formatDisplayCopy("Institutional Data Privacy")}
        </div>
        <h1 className="text-3xl font-semibold text-white">
          {formatDisplayCopy("Planetary Telemetry Privacy Policy")}
        </h1>
        <p className="text-xs font-mono text-[#9B9B9B] mt-2">
          {formatDisplayCopy("Effective Date: November 2026 | Version 3.1.0")}
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#9B9B9B] leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            {formatDisplayCopy("1. Scientific Imagery Processing")}
          </h2>
          <p>
            {formatDisplayCopy(
              "All planetary orbiter imagery uploaded to the Quantum Edge Vision Platform is processed in volatile POSIX shared memory buffers. Image matrices are never permanently persisted unless explicitly archived by an authenticated researcher session."
            )}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            {formatDisplayCopy("2. Qiskit Aer Telemetry Isolation")}
          </h2>
          <p>
            {formatDisplayCopy(
              "Quantum statevector calculations, gate angles theta, and measurement histograms run inside isolated sandboxed worker processes. No telemetry data is transmitted to external advertising or third party tracking services."
            )}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            {formatDisplayCopy("3. Cryptographic Session Authentication")}
          </h2>
          <p>
            {formatDisplayCopy(
              "Authentication credentials utilize cryptographic Argon2id password hashing, HttpOnly rotating refresh sessions, and HMAC bound CSRF protection so tokens remain inaccessible to browser scripts."
            )}
          </p>
        </section>
      </div>
    </div>
  );
}

