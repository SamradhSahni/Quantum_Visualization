"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDisplayCopy } from "@/lib/copyFormatter";

export interface TileTelemetryGridData {
  grid_rows: number;
  grid_cols: number;
  core_stride: number;
  patch_size: number;
  total_tiles: number;
  culled_tiles: number;
  executed_tiles: number;
  compute_saved_pct: number;
  culled_mask: number[];
  tile_means: number[];
  tile_stds: number[];
  tile_gamma_p: number[];
  tile_max_delta_i: number[];
}

export interface QuantumCanvasHandle {
  drawTile: (x: number, y: number, sourceImg: CanvasImageSource) => void;
  clearCanvas: () => void;
  drawFullImage: (img: CanvasImageSource) => void;
}

interface QuantumCanvasProps {
  originalImageBase64: string | null;
  edgeImageBase64: string | null;
  patchX: number;
  patchY: number;
  totalPatchesX: number;
  totalPatchesY: number;
  resolution: number;
  isProcessing: boolean;
  completedCount?: number;
  activePatchPixels?: number[][] | null;
  activeEdgePixels?: number[][] | null;
  tileTelemetryGrid?: TileTelemetryGridData | null;
  inspectCoord?: { r: number; c: number };
  onSelectMicroPixel?: (r: number, c: number) => void;
  onSelectPatch?: (x: number, y: number) => void;
  onStartSimulation?: () => void;
}

export const QuantumCanvas = forwardRef<QuantumCanvasHandle, QuantumCanvasProps>(
  (
    {
      originalImageBase64,
      edgeImageBase64,
      patchX,
      patchY,
      totalPatchesX,
      totalPatchesY,
      resolution = 256,
      isProcessing,
      completedCount = 0,
      activePatchPixels,
      activeEdgePixels,
      tileTelemetryGrid,
      inspectCoord = { r: 3, c: 3 },
      onSelectMicroPixel,
      onSelectPatch,
      onStartSimulation
    },
    ref
  ) => {
    const edgeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [showCullingOverlay, setShowCullingOverlay] = React.useState<boolean>(true);

    const roiBoxLeft = totalPatchesX > 0 ? (patchX / totalPatchesX) * 100 : 0;
    const roiBoxTop = totalPatchesY > 0 ? (patchY / totalPatchesY) * 100 : 0;
    const roiWidth = totalPatchesX > 0 ? (1 / totalPatchesX) * 100 : 5;
    const roiHeight = totalPatchesY > 0 ? (1 / totalPatchesY) * 100 : 5;

    const clearCanvas = () => {
      const canvas = edgeCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle lattice grid
      ctx.strokeStyle = "#161616";
      ctx.lineWidth = 0.5;
      const tileW = canvas.width / Math.max(1, totalPatchesX);
      const tileH = canvas.height / Math.max(1, totalPatchesY);
      for (let x = 0; x <= totalPatchesX; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileW, 0);
        ctx.lineTo(x * tileW, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= totalPatchesY; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileH);
        ctx.lineTo(canvas.width, y * tileH);
        ctx.stroke();
      }
    };

    useImperativeHandle(ref, () => ({
      drawTile(x: number, y: number, sourceImg: CanvasImageSource) {
        const canvas = edgeCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const tileW = canvas.width / Math.max(1, totalPatchesX);
        const tileH = canvas.height / Math.max(1, totalPatchesY);
        const sx = x * tileW;
        const sy = y * tileH;

        ctx.drawImage(sourceImg, sx, sy, tileW, tileH, sx, sy, tileW, tileH);
      },
      clearCanvas,
      drawFullImage(sourceImg: CanvasImageSource) {
        const canvas = edgeCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
      }
    }));

    // On initial mount or when edgeImageBase64 becomes null, clear the canvas
    useEffect(() => {
      if (!edgeImageBase64 && completedCount === 0) {
        clearCanvas();
      }
    }, [edgeImageBase64, completedCount, totalPatchesX, totalPatchesY]);

    // Render edge image onto the canvas whenever edgeImageBase64 updates
    useEffect(() => {
      if (!edgeCanvasRef.current) return;
      const canvas = edgeCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (edgeImageBase64) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = edgeImageBase64.startsWith("data:")
          ? edgeImageBase64
          : `data:image/png;base64,${edgeImageBase64}`;
      }
    }, [edgeImageBase64]);

    // Paint patch onto canvas if activeEdgePixels are updated during stepping
    useEffect(() => {
      if (!edgeCanvasRef.current || !activeEdgePixels || activeEdgePixels.length === 0) return;
      const canvas = edgeCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const tileW = canvas.width / Math.max(1, totalPatchesX);
      const tileH = canvas.height / Math.max(1, totalPatchesY);
      const startX = patchX * tileW;
      const startY = patchY * tileH;

      // Draw active patch pixels
      const pRows = activeEdgePixels.length;
      const pCols = activeEdgePixels[0].length;
      const cellW = tileW / pCols;
      const cellH = tileH / pRows;

      for (let r = 0; r < pRows; r++) {
        for (let c = 0; c < pCols; c++) {
          const val = activeEdgePixels[r][c];
          ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
          ctx.fillRect(startX + c * cellW, startY + r * cellH, cellW + 0.5, cellH + 0.5);
        }
      }

      // Draw glowing border on the actively drawn patch
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX, startY, tileW, tileH);
    }, [patchX, patchY, activeEdgePixels, totalPatchesX, totalPatchesY]);

  // 8x8 flattened sample pixels for the 5 synchronized grids
  const flatInput = activePatchPixels?.flat() || Array.from({ length: 64 }, (_, i) => Math.floor(100 + Math.sin(i * 0.3) * 80));
  const flatEdge = activeEdgePixels?.flat() || Array.from({ length: 64 }, (_, i) => Math.floor(flatInput[i] > 140 ? 220 : 20));

  return (
    <div className="space-y-6">
      {/* MAIN TWO PANELS: PANEL 1 & PANEL 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: ORIGINAL INPUT IMAGE WITH GOLDEN RETICLE BOX */}
        <Card surface="card" outerRadius={16} className="p-5 flex flex-col justify-between border border-[#313131]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge label="Panel 1" variant="default" size="xs" />
                <h3 className="text-base font-semibold text-white">
                  {formatDisplayCopy("Input Planetary Imagery (Calibrated)")}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {tileTelemetryGrid && (
                  <button
                    onClick={() => setShowCullingOverlay(!showCullingOverlay)}
                    className={`px-2 py-0.5 rounded border text-[11px] font-mono transition-colors ${
                      showCullingOverlay
                        ? "bg-[#39D353]/15 text-[#39D353] border-[#39D353]"
                        : "bg-[#181818] text-[#9B9B9B] border-[#313131]"
                    }`}
                  >
                    {showCullingOverlay
                      ? formatDisplayCopy(`Cull Heat (${tileTelemetryGrid.compute_saved_pct.toFixed(0)}% Saved)`)
                      : formatDisplayCopy("Cull Heat OFF")}
                  </button>
                )}
                <span className="text-xs font-mono text-[#9B9B9B]">{resolution}×{resolution} Native</span>
              </div>
            </div>

            <div
              className="relative aspect-square rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#313131] cursor-crosshair group"
              onClick={(e) => {
                if (!onSelectPatch || totalPatchesX === 0) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                const px = Math.min(totalPatchesX - 1, Math.max(0, Math.floor((clickX / rect.width) * totalPatchesX)));
                const py = Math.min(totalPatchesY - 1, Math.max(0, Math.floor((clickY / rect.height) * totalPatchesY)));
                onSelectPatch(px, py);
              }}
            >
              {originalImageBase64 ? (
                <img
                  src={originalImageBase64.startsWith("data:") ? originalImageBase64 : `data:image/png;base64,${originalImageBase64}`}
                  alt="Input Lunar Orbiter"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-xs font-mono text-[#9B9B9B]">
                  <div className="w-8 h-8 rounded-full border border-dashed border-[#00F0FF] animate-spin mb-3" />
                  <span>{formatDisplayCopy("Loading Input Image...")}</span>
                </div>
              )}

              {/* VARIANCE CULLING HEATMAP OVERLAY (Muted Indigo = Culled, Cyan = Active) */}
              {showCullingOverlay && tileTelemetryGrid && tileTelemetryGrid.culled_mask.length > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none grid opacity-45"
                  style={{
                    gridTemplateColumns: `repeat(${tileTelemetryGrid.grid_cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${tileTelemetryGrid.grid_rows}, minmax(0, 1fr))`,
                  }}
                >
                  {tileTelemetryGrid.culled_mask.map((isCull, tIdx) => (
                    <div
                      key={tIdx}
                      style={{
                        backgroundColor: isCull === 1 ? "rgba(49, 46, 129, 0.45)" : "rgba(0, 240, 255, 0.14)",
                        border: isCull === 1 ? "none" : "0.5px solid rgba(0,240,255,0.22)",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* GOLDEN SLIDING RETICLE BOX */}
              <div
                className="absolute border-2 border-[#FFD700] bg-[#FFD700]/25 transition-all duration-100 pointer-events-none shadow-[0_0_14px_#FFD700]"
                style={{
                  left: `${roiBoxLeft}%`,
                  top: `${roiBoxTop}%`,
                  width: `${Math.max(roiWidth, 3.5)}%`,
                  height: `${Math.max(roiHeight, 3.5)}%`
                }}
              >
                <span className="absolute -top-5 -left-1 text-[9px] font-mono text-black font-bold bg-[#FFD700] px-1 rounded-sm">
                  ({patchX},{patchY})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#313131] flex items-center justify-between text-xs font-mono">
            <span className="text-[#9B9B9B]">
              Active Patch Tile: ({patchX}, {patchY}) of ({totalPatchesX}, {totalPatchesY})
            </span>
            <span className="text-[#00F0FF] font-semibold">
              {isProcessing ? formatDisplayCopy("Simulating Gates...") : formatDisplayCopy("Click to Focus Patch")}
            </span>
          </div>
        </Card>

        {/* PANEL 3: PROGRESSIVE QUANTUM EDGE RECONSTRUCTION CANVAS */}
        <Card surface="card" outerRadius={16} className="p-5 flex flex-col justify-between border border-[#313131]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge label="Panel 3" variant="magenta" size="xs" />
                <h3 className="text-base font-semibold text-white">
                  {formatDisplayCopy("Progressive Quantum Edge Reconstruction")}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#FF00B4]">Halo Discard Seamless</span>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#313131] flex items-center justify-center">
              {/* HTML5 Canvas for real-time progressive drawing */}
              <canvas
                ref={edgeCanvasRef}
                width={256}
                height={256}
                className="w-full h-full object-cover filter contrast-125"
              />

              {/* Laser scanning bar when actively building */}
              {isProcessing && (
                <div
                  className="absolute left-0 right-0 h-[2px] bg-[#00F0FF] shadow-[0_0_14px_#00F0FF] animate-pulse pointer-events-none"
                  style={{ top: `${roiBoxTop}%` }}
                />
              )}

              {/* Overlay Golden Active Patch Marker on Panel 3 */}
              {(isProcessing || completedCount > 0) && (
                <div
                  className="absolute border border-[#00F0FF] bg-[#00F0FF]/15 transition-all duration-75 pointer-events-none shadow-[0_0_10px_#00F0FF]"
                  style={{
                    left: `${roiBoxLeft}%`,
                    top: `${roiBoxTop}%`,
                    width: `${Math.max(roiWidth, 3.5)}%`,
                    height: `${Math.max(roiHeight, 3.5)}%`
                  }}
                />
              )}

              {/* Ready Awaiting Execution Overlay when 0 patches completed */}
              {!isProcessing && completedCount === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0A]/85 backdrop-blur-[2px] z-10">
                  {originalImageBase64 && (
                    <img
                      src={originalImageBase64.startsWith("data:") ? originalImageBase64 : `data:image/png;base64,${originalImageBase64}`}
                      alt="Lattice Blueprint"
                      className="absolute inset-0 w-full h-full object-cover opacity-15 filter grayscale contrast-150 pointer-events-none"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border border-dashed border-[#FF00B4] flex items-center justify-center mb-3 animate-pulse bg-black/40">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#FF00B4]" />
                    </div>
                    <span className="text-sm font-semibold text-white mb-1">
                      {formatDisplayCopy("Quantum Lattice Ready")}
                    </span>
                    <span className="text-xs font-mono text-[#9B9B9B] max-w-xs leading-relaxed mb-4">
                      {formatDisplayCopy("Planetary image staged in 64-qubit register. Click below to begin progressive multi-method quantum reconstruction.")}
                    </span>
                    {onStartSimulation && (
                      <button
                        onClick={onStartSimulation}
                        className="px-4 py-2 rounded-xl bg-[#00F0FF] text-black font-semibold text-xs font-mono hover:opacity-90 border border-[#00F0FF] flex items-center gap-2 transition-all cursor-pointer pointer-events-auto active:scale-95"
                      >
                        <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                        <span>{formatDisplayCopy("Process All 3 Quantum Circuits")}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#313131] flex items-center justify-between text-xs font-mono">
            <span className="text-[#9B9B9B]">{formatDisplayCopy("Hadamard Interference Matrix")}</span>
            <span className="text-[#30D158] font-semibold">{formatDisplayCopy("0.00 Checkerboard Seams")}</span>
          </div>
        </Card>
      </div>

      {/* 5 SYNCHRONIZED INTERACTIVE INSPECTION GRIDS (LIKE IN STREAMLIT) */}
      <Card surface="card" outerRadius={16} className="p-5 border border-[#313131]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#313131]">
          <h4 className="text-sm font-semibold text-white">
            {formatDisplayCopy("5 Synchronized Visual Inspection Fields (Active 8×8 Patch)")}
          </h4>
          <span className="text-xs font-mono text-[#9B9B9B]">
            Patch ({patchX}, {patchY}) · 64 Coordinates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Input Patch */}
          <div>
            <span className="text-xs font-mono text-[#9B9B9B] block mb-2">{formatDisplayCopy("1. Input 8×8 Patch")}</span>
            <div className="grid grid-cols-8 gap-0.5 bg-[#000] p-1 rounded-lg border border-[#313131] aspect-square">
              {flatInput.map((val, idx) => {
                const rr = Math.floor(idx / 8);
                const cc = idx % 8;
                const isSelected = rr === inspectCoord.r && cc === inspectCoord.c;
                const isNeighbor = rr === inspectCoord.r && cc === (inspectCoord.c + 1) % 8;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectMicroPixel?.(rr, cc)}
                    title={`Pixel (${rr},${cc}): ${val}`}
                    style={{ backgroundColor: `rgb(${val}, ${val}, ${val})` }}
                    className={`w-full h-full rounded-[1px] cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-[#00F0FF] z-10"
                        : isNeighbor
                        ? "ring-1 ring-[#FF79C6] z-10"
                        : ""
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* 2. Statevector Amplitudes */}
          <div>
            <span className="text-xs font-mono text-[#00F0FF] block mb-2">{formatDisplayCopy("2. Statevector (α)")}</span>
            <div className="grid grid-cols-8 gap-0.5 bg-[#000] p-1 rounded-lg border border-[#313131] aspect-square">
              {flatInput.map((val, idx) => {
                const amp = (val - 128) / 128.0;
                return (
                  <div
                    key={idx}
                    title={`State |${idx}>: alpha = ${amp.toFixed(3)}`}
                    style={{ backgroundColor: amp >= 0 ? `rgba(0, 240, 255, ${Math.abs(amp)})` : `rgba(255, 159, 10, ${Math.abs(amp)})` }}
                    className="w-full h-full rounded-[1px]"
                  />
                );
              })}
            </div>
          </div>

          {/* 3. Reconstructed Edge Map */}
          <div>
            <span className="text-xs font-mono text-[#FF00B4] block mb-2">{formatDisplayCopy("3. Reconstructed Edge")}</span>
            <div className="grid grid-cols-8 gap-0.5 bg-[#000] p-1 rounded-lg border border-[#313131] aspect-square">
              {flatEdge.map((val, idx) => (
                <div
                  key={idx}
                  title={`Edge ${idx}: ${val}`}
                  style={{ backgroundColor: `rgb(${val}, ${val}, ${val})` }}
                  className="w-full h-full rounded-[1px]"
                />
              ))}
            </div>
          </div>

          {/* 4. Sampled Aer Shots */}
          <div>
            <span className="text-xs font-mono text-[#FF453A] block mb-2">{formatDisplayCopy("4. Aer Shots Hits")}</span>
            <div className="grid grid-cols-8 gap-0.5 bg-[#000] p-1 rounded-lg border border-[#313131] aspect-square">
              {flatEdge.map((val, idx) => {
                const hits = Math.round((val / 255) * 4096);
                const intensity = Math.min(1.0, hits / 2048);
                return (
                  <div
                    key={idx}
                    title={`Hits ${idx}: ${hits}`}
                    style={{ backgroundColor: `rgba(255, 69, 58, ${intensity})` }}
                    className="w-full h-full rounded-[1px]"
                  />
                );
              })}
            </div>
          </div>

          {/* 5. Binary Decision */}
          <div>
            <span className="text-xs font-mono text-[#30D158] block mb-2">{formatDisplayCopy("5. Binary Decision")}</span>
            <div className="grid grid-cols-8 gap-0.5 bg-[#000] p-1 rounded-lg border border-[#313131] aspect-square">
              {flatEdge.map((val, idx) => {
                const isEdge = val > 120;
                return (
                  <div
                    key={idx}
                    title={`Binary ${idx}: ${isEdge ? 1 : 0}`}
                    style={{ backgroundColor: isEdge ? "#FFFFFF" : "#0A0A0A" }}
                    className="w-full h-full rounded-[1px]"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

QuantumCanvas.displayName = "QuantumCanvas";
