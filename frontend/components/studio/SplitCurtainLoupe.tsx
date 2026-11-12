"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { MethodCardData } from "@/components/studio/UnifiedComparisonMatrix";
import { Columns, ZoomIn } from "lucide-react";

interface SplitCurtainLoupeProps {
  cards: MethodCardData[];
  viewMode: "overlay" | "confidence" | "binary";
}

function getCardImageSrc(card: MethodCardData, mode: "overlay" | "confidence" | "binary"): string {
  const raw =
    mode === "overlay"
      ? card.overlay_base64
      : mode === "binary"
      ? card.binary_base64
      : card.edge_base64;
  if (!raw) return "";
  return raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
}

export const SplitCurtainLoupe: React.FC<SplitCurtainLoupeProps> = ({ cards, viewMode }) => {
  const [methodAIdx, setMethodAIdx] = useState<number>(0);
  const [methodBIdx, setMethodBIdx] = useState<number>(Math.min(4, Math.max(0, cards.length - 1)));
  const [splitPct, setSplitPct] = useState<number>(50);
  const [diffMode, setDiffMode] = useState<boolean>(false);
  const [loupeCoord, setLoupeCoord] = useState<{ x: number; y: number }>({ x: 64, y: 64 });
  const [loupeGrids, setLoupeGrids] = useState<{ name: string; color: string; grid: number[][] }[]>([]);

  const splitCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const cardA = cards[methodAIdx];
  const cardB = cards[methodBIdx];

  // Draw split-curtain or |A - B| difference onto shared canvas
  useEffect(() => {
    if (!cardA || !cardB || !splitCanvasRef.current) return;
    const srcA = getCardImageSrc(cardA, viewMode);
    const srcB = getCardImageSrc(cardB, viewMode);
    if (!srcA || !srcB) return;

    const canvas = splitCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgA = new Image();
    const imgB = new Image();
    let loaded = 0;

    const render = () => {
      loaded += 1;
      if (loaded < 2) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (diffMode) {
        const offA = document.createElement("canvas");
        offA.width = w;
        offA.height = h;
        const cA = offA.getContext("2d");
        const offB = document.createElement("canvas");
        offB.width = w;
        offB.height = h;
        const cB = offB.getContext("2d");
        if (!cA || !cB) return;
        cA.drawImage(imgA, 0, 0, w, h);
        cB.drawImage(imgB, 0, 0, w, h);
        const dA = cA.getImageData(0, 0, w, h).data;
        const dB = cB.getImageData(0, 0, w, h).data;
        const out = ctx.createImageData(w, h);
        const od = out.data;

        for (let i = 0; i < dA.length; i += 4) {
          const lumA = (dA[i] + dA[i + 1] + dA[i + 2]) / 3;
          const lumB = (dB[i] + dB[i + 1] + dB[i + 2]) / 3;
          const delta = Math.min(255, Math.abs(lumA - lumB) * 2.2);
          od[i] = lumA > lumB ? delta : Math.floor(delta * 0.2);
          od[i + 1] = Math.floor(delta * 0.85);
          od[i + 2] = lumB >= lumA ? delta : Math.floor(delta * 0.65);
          od[i + 3] = 255;
        }
        ctx.putImageData(out, 0, 0);
      } else {
        const cutX = Math.round((splitPct / 100) * w);
        ctx.drawImage(imgB, 0, 0, w, h);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, cutX, h);
        ctx.clip();
        ctx.drawImage(imgA, 0, 0, w, h);
        ctx.restore();

        // Crisp split handle line
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cutX, 0);
        ctx.lineTo(cutX, h);
        ctx.stroke();
      }
    };

    imgA.onload = render;
    imgB.onload = render;
    imgA.src = srcA;
    imgB.src = srcB;
  }, [cardA, cardB, viewMode, splitPct, diffMode]);

  // Sample synchronized 8x8 pixel neighborhood around loupeCoord across all 6 cards
  useEffect(() => {
    if (cards.length === 0) return;
    let cancelled = false;

    const sampleAll = async () => {
      const results = await Promise.all(
        cards.map(
          (card) =>
            new Promise<{ name: string; color: string; grid: number[][] }>((resolve) => {
              const src = getCardImageSrc(card, "confidence") || getCardImageSrc(card, viewMode);
              if (!src) {
                resolve({
                  name: card.name,
                  color: card.color_hex,
                  grid: Array.from({ length: 8 }, () => Array(8).fill(0)),
                });
                return;
              }
              const img = new Image();
              img.onload = () => {
                const c = document.createElement("canvas");
                c.width = 128;
                c.height = 128;
                const ctx = c.getContext("2d");
                if (!ctx) {
                  resolve({
                    name: card.name,
                    color: card.color_hex,
                    grid: Array.from({ length: 8 }, () => Array(8).fill(0)),
                  });
                  return;
                }
                ctx.drawImage(img, 0, 0, 128, 128);
                const sx = Math.max(0, Math.min(120, loupeCoord.x - 4));
                const sy = Math.max(0, Math.min(120, loupeCoord.y - 4));
                const data = ctx.getImageData(sx, sy, 8, 8).data;
                const grid: number[][] = [];
                for (let r = 0; r < 8; r++) {
                  const row: number[] = [];
                  for (let col = 0; col < 8; col++) {
                    const idx = (r * 8 + col) * 4;
                    row.push(data[idx]);
                  }
                  grid.push(row);
                }
                resolve({ name: card.name, color: card.color_hex, grid });
              };
              img.onerror = () =>
                resolve({
                  name: card.name,
                  color: card.color_hex,
                  grid: Array.from({ length: 8 }, () => Array(8).fill(0)),
                });
              img.src = src;
            })
        )
      );
      if (!cancelled) setLoupeGrids(results);
    };

    sampleAll();
    return () => {
      cancelled = true;
    };
  }, [cards, loupeCoord, viewMode]);

  if (cards.length < 2) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 5 Cols: Split Curtain A/B Comparator */}
      <Card surface="card" outerRadius={16} className="lg:col-span-5 p-5 border border-[#313131] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns size={16} className="text-[#00F0FF]" />
            <h4 className="text-sm font-semibold text-white">
              {formatDisplayCopy("A/B Split Screen Curtain")}
            </h4>
          </div>
          <button
            onClick={() => setDiffMode(!diffMode)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono ${
              diffMode
                ? "bg-[#FF79C6] text-black border-[#FF79C6] font-bold"
                : "bg-[#181818] text-[#9B9B9B] border-[#313131] hover:text-white"
            }`}
          >
            {diffMode ? formatDisplayCopy("Diff Map |A - B|") : formatDisplayCopy("Wipe Mode")}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#9B9B9B] block mb-1">Left / Method A</span>
            <select
              value={methodAIdx}
              onChange={(e) => setMethodAIdx(parseInt(e.target.value, 10))}
              className="w-full px-2 py-1.5 rounded bg-[#181818] border border-[#313131] text-white"
            >
              {cards.map((c, i) => (
                <option key={c.name} value={i}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-[#9B9B9B] block mb-1">Right / Method B</span>
            <select
              value={methodBIdx}
              onChange={(e) => setMethodBIdx(parseInt(e.target.value, 10))}
              className="w-full px-2 py-1.5 rounded bg-[#181818] border border-[#313131] text-white"
            >
              {cards.map((c, i) => (
                <option key={c.name} value={i}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#313131] cursor-crosshair">
          <canvas
            ref={splitCanvasRef}
            width={256}
            height={256}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 127);
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 127);
              setLoupeCoord({ x, y });
            }}
            className="w-full h-full object-cover"
          />
          {/* Loupe target reticle */}
          <div
            className="absolute w-5 h-5 border border-[#FFE600] bg-[#FFE600]/20 pointer-events-none"
            style={{
              left: `${(loupeCoord.x / 128) * 100}%`,
              top: `${(loupeCoord.y / 128) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {!diffMode && (
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-[#9B9B9B]">
              <span>{cardA?.name}</span>
              <span>{splitPct}%</span>
              <span>{cardB?.name}</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={splitPct}
              onChange={(e) => setSplitPct(parseInt(e.target.value, 10))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>
        )}
      </Card>

      {/* Right 7 Cols: 6 Way Synchronized 8x8 Pixel Loupe */}
      <Card surface="card" outerRadius={16} className="lg:col-span-7 p-5 border border-[#313131] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#313131]">
          <div className="flex items-center gap-2">
            <ZoomIn size={16} className="text-[#FF79C6]" />
            <h4 className="text-sm font-semibold text-white">
              {formatDisplayCopy("6 Way Synchronized 8×8 Microscopic Loupe")}
            </h4>
          </div>
          <Badge
            label={`Center (${loupeCoord.x}, ${loupeCoord.y})`}
            variant="cyan"
            size="xs"
          />
        </div>

        <p className="text-xs text-[#9B9B9B]">
          {formatDisplayCopy(
            "Click anywhere on the A/B canvas at left to inspect identical 8×8 sub pixel confidence values across all 6 detectors simultaneously."
          )}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {loupeGrids.map((item) => {
            const centerVal = item.grid[4]?.[4] ?? 0;
            return (
              <div
                key={item.name}
                className="p-3 rounded-xl bg-[#181818] border border-[#313131] space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold truncate" style={{ color: item.color }}>
                    {formatDisplayCopy(item.name)}
                  </span>
                  <span className="text-white">{(centerVal / 255).toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-8 gap-[1px] bg-[#0A0A0A] p-1 rounded border border-[#272727] aspect-square">
                  {item.grid.flat().map((v, pIdx) => {
                    const isCenter = pIdx === 36;
                    return (
                      <div
                        key={pIdx}
                        title={`Val=${v} (${(v / 255).toFixed(3)})`}
                        style={{ backgroundColor: `rgb(${v}, ${v}, ${v})` }}
                        className={`w-full h-full ${isCenter ? "ring-1 ring-[#FFE600]" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

