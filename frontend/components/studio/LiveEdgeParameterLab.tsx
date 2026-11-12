"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { Sliders, Zap, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

export interface QuantumLabConfig {
  shots: number | null;
  shot_mode: "multinomial_patch" | "binomial_local";
  neqr_bit_depth: number;
  neqr_bitflip_prob: number;
  halo_padding_enabled: boolean;
  variance_cull_threshold: number;
  post_nms_thinning: boolean;
  threshold_mode: "otsu" | "rosin_triangle" | "manual";
  manual_threshold: number;
  noise_gaussian_sigma: number;
  canny_sigma: number;
  canny_low: number;
  canny_high: number;
}

export const DEFAULT_LAB_CONFIG: QuantumLabConfig = {
  shots: null,
  shot_mode: "multinomial_patch",
  neqr_bit_depth: 8,
  neqr_bitflip_prob: 0.0,
  halo_padding_enabled: true,
  variance_cull_threshold: 0.00015,
  post_nms_thinning: false,
  threshold_mode: "otsu",
  manual_threshold: 0.25,
  noise_gaussian_sigma: 0.0,
  canny_sigma: 1.4,
  canny_low: 50,
  canny_high: 150,
};

interface LiveEdgeParameterLabProps {
  config: QuantumLabConfig;
  onChange: (cfg: QuantumLabConfig) => void;
  onApply: () => void;
  loading?: boolean;
}

export const LiveEdgeParameterLab: React.FC<LiveEdgeParameterLabProps> = ({
  config,
  onChange,
  onApply,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  const update = <K extends keyof QuantumLabConfig>(key: K, val: QuantumLabConfig[K]) => {
    onChange({ ...config, [key]: val });
  };

  return (
    <Card surface="card" outerRadius={16} className="p-5 border border-[#313131] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#181818] border border-[#313131] text-[#00F0FF]">
            <Sliders size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">
                {formatDisplayCopy("Live Quantum & Classical Parameter Lab")}
              </h3>
              <Badge label="Real Time Tuning" variant="cyan" size="xs" />
            </div>
            <p className="text-xs text-[#9B9B9B]">
              {formatDisplayCopy(
                "Adjust shot noise, NEQR bitplane depth, Halo seam protection, NMS ridge thinning, Rosin thresholding, and regolith sensor noise."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="accent"
            size="sm"
            onClick={onApply}
            disabled={loading}
            icon={<Zap size={14} />}
          >
            {loading ? formatDisplayCopy("Simulating...") : formatDisplayCopy("Apply & Re Evaluate All 6")}
          </Button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg bg-[#181818] border border-[#313131] text-[#9B9B9B] hover:text-white"
            aria-label="Toggle Parameter Lab"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-[#313131] text-xs font-mono">
          {/* Column 1: Shot Sampling & Mode */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-3">
            <span className="text-[#FF79C6] font-bold block uppercase text-[11px]">
              {formatDisplayCopy("1. Quantum Shot Budget")}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: "Exact ∞", val: null },
                { label: "128", val: 128 },
                { label: "512", val: 512 },
                { label: "1024", val: 1024 },
                { label: "4096", val: 4096 },
                { label: "8192", val: 8192 },
              ].map((opt) => {
                const active = config.shots === opt.val;
                return (
                  <button
                    key={opt.label}
                    onClick={() => update("shots", opt.val)}
                    className={`py-1 rounded border text-[11px] transition-colors ${
                      active
                        ? "bg-[#FF79C6] text-black border-[#FF79C6] font-bold"
                        : "bg-[#0A0A0A] text-[#9B9B9B] border-[#313131] hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[#9B9B9B] text-[11px]">{formatDisplayCopy("Sampling Law:")}</span>
              <select
                value={config.shot_mode}
                onChange={(e) =>
                  update("shot_mode", e.target.value as "multinomial_patch" | "binomial_local")
                }
                className="px-2 py-1 rounded bg-[#0A0A0A] border border-[#313131] text-[11px] text-white"
              >
                <option value="multinomial_patch">Multinomial (1/32 Dilution)</option>
                <option value="binomial_local">Binomial Local</option>
              </select>
            </div>
          </div>

          {/* Column 2: NEQR QFS Width & Pauli-X Error */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-3">
            <span className="text-[#BD93F9] font-bold block uppercase text-[11px]">
              {formatDisplayCopy("2. NEQR QFS Architecture")}
            </span>
            <div>
              <div className="flex justify-between text-[#9B9B9B] mb-1">
                <span>{formatDisplayCopy("Bit Depth q:")}</span>
                <span className="text-white font-bold">
                  {config.neqr_bit_depth}b ({6 + config.neqr_bit_depth} Store / {6 + 2 * config.neqr_bit_depth + 2} QFS)
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="2"
                value={config.neqr_bit_depth}
                onChange={(e) => update("neqr_bit_depth", parseInt(e.target.value, 10))}
                className="w-full accent-[#BD93F9] cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[#9B9B9B] mb-1">
                <span>{formatDisplayCopy("Bitplane Flip Prob:")}</span>
                <span className="text-[#FFE600] font-bold">
                  {(config.neqr_bitflip_prob * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.01"
                value={config.neqr_bitflip_prob}
                onChange={(e) => update("neqr_bitflip_prob", parseFloat(e.target.value))}
                className="w-full accent-[#FFE600] cursor-pointer"
              />
            </div>
          </div>

          {/* Column 3: Thresholding & Ridge Parity */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-3">
            <span className="text-[#00F0FF] font-bold block uppercase text-[11px]">
              {formatDisplayCopy("3. Threshold & Ridge Parity")}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  ["otsu", "Otsu"],
                  ["rosin_triangle", "Rosin"],
                  ["manual", "Manual"],
                ] as const
              ).map(([mVal, mLbl]) => (
                <button
                  key={mVal}
                  onClick={() => update("threshold_mode", mVal)}
                  className={`py-1 rounded border text-[11px] ${
                    config.threshold_mode === mVal
                      ? "bg-[#00F0FF] text-black border-[#00F0FF] font-bold"
                      : "bg-[#0A0A0A] text-[#9B9B9B] border-[#313131]"
                  }`}
                >
                  {mLbl}
                </button>
              ))}
            </div>

            {config.threshold_mode === "manual" && (
              <div>
                <div className="flex justify-between text-[#9B9B9B] mb-1">
                  <span>{formatDisplayCopy("Manual Tau:")}</span>
                  <span className="text-white font-bold">{config.manual_threshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.75"
                  step="0.02"
                  value={config.manual_threshold}
                  onChange={(e) => update("manual_threshold", parseFloat(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>
            )}

            <button
              onClick={() => update("post_nms_thinning", !config.post_nms_thinning)}
              className={`w-full py-1.5 px-2.5 rounded border flex items-center justify-between text-[11px] ${
                config.post_nms_thinning
                  ? "bg-[#39D353]/15 border-[#39D353] text-[#39D353] font-bold"
                  : "bg-[#0A0A0A] border-[#313131] text-[#9B9B9B]"
              }`}
            >
              <span>{formatDisplayCopy("NMS 1px Thinning Parity")}</span>
              <span>{config.post_nms_thinning ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Column 4: Halo Padding, Variance Culling & Noise */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#313131] space-y-3">
            <span className="text-[#39D353] font-bold block uppercase text-[11px]">
              {formatDisplayCopy("4. Tiling & Sensor Noise")}
            </span>
            <button
              onClick={() => update("halo_padding_enabled", !config.halo_padding_enabled)}
              className={`w-full py-1.5 px-2.5 rounded border flex items-center justify-between text-[11px] ${
                config.halo_padding_enabled
                  ? "bg-[#39D353]/15 border-[#39D353] text-[#39D353] font-bold"
                  : "bg-[#FF5555]/15 border-[#FF5555] text-[#FF5555] font-bold"
              }`}
            >
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} />
                {formatDisplayCopy("Halo Seam Protection")}
              </span>
              <span>{config.halo_padding_enabled ? "ON (6×6 Core)" : "OFF (Seams)"}</span>
            </button>

            <div>
              <div className="flex justify-between text-[#9B9B9B] mb-1">
                <span>{formatDisplayCopy("Regolith Noise σ:")}</span>
                <span className="text-white font-bold">{config.noise_gaussian_sigma.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={config.noise_gaussian_sigma}
                onChange={(e) => update("noise_gaussian_sigma", parseFloat(e.target.value))}
                className="w-full accent-[#FF5555] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#9B9B9B] mb-1">
                <span>{formatDisplayCopy("Variance Cull Floor:")}</span>
                <span className="text-[#00F0FF] font-bold">
                  {config.variance_cull_threshold === 0
                    ? "Disabled"
                    : config.variance_cull_threshold.toExponential(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.002"
                step="0.0001"
                value={config.variance_cull_threshold}
                onChange={(e) => update("variance_cull_threshold", parseFloat(e.target.value))}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

