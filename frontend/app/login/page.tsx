"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";

function resolveSafeRedirect(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//") || rawNext.includes("://")) {
    return "/studio";
  }
  return rawNext;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please enter both your email and password.");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      const params =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const target = resolveSafeRedirect(params?.get("next") || null);
      router.push(target);
      router.refresh();
    } else {
      setErrorMsg(result.error || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#313131] bg-[#181818] mb-4">
            <Shield size={14} className="text-[#00F0FF]" />
            <span className="text-xs font-mono text-[#E1E1E1]">
              {formatDisplayCopy("Quantum Identity Gateway")}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {formatDisplayCopy("Sign In to Quantum Vision")}
          </h1>
          <p className="mt-2 text-sm text-[#9B9B9B]">
            {formatDisplayCopy("Access protected Qiskit compute workspaces, saved artifacts, and telemetry pipelines.")}
          </p>
        </div>

        <div className="flex border border-[#313131] rounded-lg bg-[#181818] p-1 mb-6">
          <button
            type="button"
            className="flex-1 py-2 text-sm font-medium rounded-md bg-white text-black transition-colors"
          >
            {formatDisplayCopy("Sign In")}
          </button>
          <Link
            href="/signup"
            className="flex-1 py-2 text-sm font-medium text-center text-[#9B9B9B] hover:text-white transition-colors"
          >
            {formatDisplayCopy("Create Account")}
          </Link>
        </div>

        <Card surface="card" outerRadius={16} className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#272727] border border-[#EF4444] text-xs text-[#FCA5A5]">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#EF4444]" />
                <span>{formatDisplayCopy(errorMsg)}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#9B9B9B] uppercase mb-1.5">
                {formatDisplayCopy("Institutional Email")}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@lab.nasa.gov"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#313131] text-white text-sm focus:outline-none focus:border-[#00F0FF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#9B9B9B] uppercase mb-1.5">
                {formatDisplayCopy("Password")}
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#313131] text-white text-sm focus:outline-none focus:border-[#00F0FF] transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading}
              icon={<ArrowRight size={16} className="text-black" />}
            >
              {loading ? formatDisplayCopy("Authenticating...") : formatDisplayCopy("Sign In")}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-[#9B9B9B] leading-relaxed">
          {formatDisplayCopy("Protected by Argon2id password hashing, HttpOnly rotating sessions, and HMAC CSRF verification.")}
        </p>
      </div>
    </div>
  );
}
