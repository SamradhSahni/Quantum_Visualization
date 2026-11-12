"use client";

import React, { useEffect, useRef } from "react";
import { formatDisplayCopy } from "@/lib/copyFormatter";

export type MatrixColormap =
  | "gray"
  | "thermal"
  | "radar"
  | "ice"
  | "bipolar_cyan"
  | "bipolar_magenta"
  | "bipolar_red"
  | "phase";

interface QmlMatrixCanvasProps {
  matrix?: number[][];
  colormap: MatrixColormap;
  minVal?: number;
  maxVal?: number;
  symmetric?: boolean;
  label?: string;
  badgeText?: string;
  badgeColor?: string;
  sizeClass?: string;
}

function mapScalarToRgb(t: number, colormap: MatrixColormap): [number, number, number] {
  const c = Math.max(0, Math.min(1, t));
  if (colormap === "thermal") {
    if (c < 0.45) {
      const k = c / 0.45;
      return [Math.round(16 + 150 * k), Math.round(18 + 40 * k), Math.round(52 - 30 * k)];
    }
    const k = (c - 0.45) / 0.55;
    return [Math.round(166 + 89 * k), Math.round(58 + 165 * k), Math.round(22 + 120 * k)];
  }
  if (colormap === "radar") {
    if (c < 0.5) {
      const k = c / 0.5;
      return [Math.round(18 + 30 * k), Math.round(24 + 90 * k), Math.round(40 + 80 * k)];
    }
    const k = (c - 0.5) / 0.5;
    return [Math.round(48 + 15 * k), Math.round(114 + 125 * k), Math.round(120 - 40 * k)];
  }
  if (colormap === "ice") {
    if (c < 0.45) {
      const v = Math.round(14 + c * 55);
      return [v, v + 4, v + 12];
    }
    const k = (c - 0.45) / 0.55;
    return [Math.round(10 + 10 * k), Math.round(190 + 50 * k), Math.round(230 - 110 * k)];
  }
  if (colormap === "phase") {
    if (c < 0.35) {
      const k = c / 0.35;
      return [Math.round(16 + 20 * k), Math.round(20 + 160 * k), Math.round(35 + 190 * k)];
    }
    const k = (c - 0.35) / 0.65;
    return [Math.round(36 + 219 * k), Math.round(180 - 60 * k), Math.round(225 - 27 * k)];
  }
  if (colormap === "bipolar_cyan" || colormap === "bipolar_magenta" || colormap === "bipolar_red") {
    const dev = Math.abs(c - 0.5) * 2.0;
    const base = 18;
    if (colormap === "bipolar_cyan") {
      return [base, Math.round(base + 218 * dev), Math.round(base + 235 * dev)];
    }
    if (colormap === "bipolar_magenta") {
      return [Math.round(base + 235 * dev), Math.round(base + 105 * dev), Math.round(base + 180 * dev)];
    }
    return [Math.round(base + 225 * dev), Math.round(base + 55 * dev), Math.round(base + 55 * dev)];
  }
  const g = Math.round(c * 255);
  return [g, g, Math.min(255, g + 4)];
}

export const QmlMatrixCanvas: React.FC<QmlMatrixCanvasProps> = ({
  matrix,
  colormap,
  minVal,
  maxVal,
  symmetric = false,
  label,
  badgeText,
  badgeColor = "#00F0FF",
  sizeClass = "w-full aspect-square",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !matrix || matrix.length === 0 || matrix[0].length === 0) return;

    const h = matrix.length;
    const w = matrix[0].length;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lo = typeof minVal === "number" ? minVal : Infinity;
    let hi = typeof maxVal === "number" ? maxVal : -Infinity;
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      let dataMin = Infinity;
      let dataMax = -Infinity;
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          const v = matrix[r][c];
          if (v < dataMin) dataMin = v;
          if (v > dataMax) dataMax = v;
        }
      }
      if (symmetric) {
        const absMax = Math.max(1e-6, Math.abs(dataMin), Math.abs(dataMax));
        lo = -absMax;
        hi = absMax;
      } else {
        lo = dataMin;
        hi = Math.max(dataMin + 1e-6, dataMax);
      }
    }

    const span = Math.max(1e-6, hi - lo);
    const imgData = ctx.createImageData(w, h);
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const norm = (matrix[r][c] - lo) / span;
        const [R, G, B] = mapScalarToRgb(norm, colormap);
        const idx = (r * w + c) * 4;
        imgData.data[idx] = R;
        imgData.data[idx + 1] = G;
        imgData.data[idx + 2] = B;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [matrix, colormap, minVal, maxVal, symmetric]);

  return (
    <div className="bg-[#141414] border border-[#2B2B2B] rounded-lg p-2 space-y-1.5">
      {(label || badgeText) && (
        <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
          {label && <span className="text-[#CCCCCC] truncate">{formatDisplayCopy(label)}</span>}
          {badgeText && (
            <span className="font-semibold shrink-0" style={{ color: badgeColor }}>
              {formatDisplayCopy(badgeText)}
            </span>
          )}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`${sizeClass} rounded border border-[#242424] bg-[#0B0B0E] block`}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};

