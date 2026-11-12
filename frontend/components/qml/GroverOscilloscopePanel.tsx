"use client";

import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { GroverOscilloscopeData } from "@/lib/qmlTypes";
import { QmlMatrixCanvas } from "@/components/qml/QmlMatrixCanvas";

interface GroverOscilloscopePanelProps {
  grover: GroverOscilloscopeData;
  groverIter: number;
  onChangeGroverIter: (r: number) => void;
}

export const GroverOscilloscopePanel: React.FC<GroverOscilloscopePanelProps> = ({
  grover,
  groverIter,
  onChangeGroverIter,
}) => {
  const angleRad = grover.subspace_compass?.angle_rad ?? 0.3;
  const cx = 80;
  const cy = 84;
  const radius = 58;

  // Map angle theta_r from horizontal (|psi_non_edge>) upward toward vertical (|psi_edge>)
  const vx = cx + radius * Math.cos(angleRad);
  const vy = cy - radius * Math.sin(angleRad);
  const initTheta = grover.initial_theta_rad ?? 0.25;
  const ix = cx + radius * Math.cos(initTheta);
  const iy = cy - radius * Math.sin(initTheta);

  const curve = grover.oscillation_curve || [];
  const isOver = grover.over_rotation_warning;

  return (
    <div className="space-y-3">
      {/* Top Row: SVG Compass + Sine Amplification Oscilloscope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Annotated SVG 2D Subspace Unit Circle */}
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-3 flex flex-col items-center relative">
          <div className="w-full flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-[#888888]">{formatDisplayCopy("2D Subspace Compass")}</span>
            {isOver ? (
              <span className="text-[#EF4444] flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3 h-3" /> {formatDisplayCopy("Souffle Collapse")}
              </span>
            ) : (
              <span className="text-[#39D353] flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> {formatDisplayCopy("Optimal Quadrant")}
              </span>
            )}
          </div>

          <svg viewBox="0 0 180 155" className="w-full h-36">
            {/* Danger over-rotation quadrant (theta > pi/2 -> left quadrant) */}
            <path
              d={`M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 0 0 ${cx - radius} ${cy} Z`}
              fill="#EF4444"
              fillOpacity="0.12"
            />
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#313131" strokeWidth="1" />
            <line x1={cx - radius - 8} y1={cy} x2={cx + radius + 12} y2={cy} stroke="#383844" />
            <line x1={cx} y1={cy + 20} x2={cx} y2={cy - radius - 14} stroke="#383844" />

            {/* Threshold pi/2 dashed line */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius}
              stroke="#FF79C6"
              strokeWidth="1.2"
              strokeDasharray="3,2"
            />

            {/* Initial r=0 statevector (thin amber) */}
            <line x1={cx} y1={cy} x2={ix} y2={iy} stroke="#FFD700" strokeWidth="1.2" strokeDasharray="2,2" />
            <circle cx={ix} cy={iy} r="2.5" fill="#FFD700" />

            {/* Active Grover statevector arrow */}
            <line
              x1={cx}
              y1={cy}
              x2={vx}
              y2={vy}
              stroke={isOver ? "#EF4444" : "#00F0FF"}
              strokeWidth="2.4"
            />
            <circle cx={vx} cy={vy} r="4" fill={isOver ? "#EF4444" : "#00F0FF"} stroke="#FFFFFF" strokeWidth="1" />

            <text x={cx + 6} y="14" fill="#FF79C6" fontSize="8" fontFamily="monospace">
              |psi_edge&gt; (90°)
            </text>
            <text x={cx + radius + 3} y={cy - 4} fill="#888888" fontSize="7.5" fontFamily="monospace">
              |non edge&gt;
            </text>
            <text x="12" y={cy - radius + 10} fill="#EF4444" fontSize="7" fontFamily="monospace">
              Over Rotation Zone
            </text>
          </svg>

          <div className="text-[10px] font-mono text-[#A1A1A1] text-center">
            θ_r = {grover.subspace_compass?.angle_deg}° | r_opt = {grover.optimal_iterations} | Gain {grover.amplification_gain}x
          </div>
        </div>

        {/* Grover Sine Amplification Curve P(r) */}
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-white">{formatDisplayCopy("Oscillation P(r) Curve")}</span>
            <span className="text-[#00F0FF]">{(grover.amplified_prob * 100).toFixed(1)}%</span>
          </div>

          <svg viewBox="0 0 220 112" className="w-full h-28 bg-[#181818] border border-[#2A2A2A] rounded my-1">
            <line x1="22" y1="92" x2="206" y2="92" stroke="#313131" />
            <line x1="22" y1="12" x2="22" y2="92" stroke="#313131" />
            <line x1="22" y1="16" x2="206" y2="16" stroke="#39D353" strokeOpacity="0.3" strokeDasharray="2,2" />

            {curve.length > 1 && (
              <>
                <path
                  d={curve
                    .map((pt, idx) => {
                      const x = 28 + (idx / Math.max(1, curve.length - 1)) * 170;
                      const y = 92 - pt.prob * 76;
                      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#00F0FF"
                  strokeWidth="2"
                />
                {curve.map((pt, idx) => {
                  const x = 28 + (idx / Math.max(1, curve.length - 1)) * 170;
                  const y = 92 - pt.prob * 76;
                  const isAct = pt.r === groverIter;
                  const isOpt = pt.r === grover.optimal_iterations;
                  return (
                    <g key={pt.r}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isAct ? 4.5 : 2.5}
                        fill={pt.over_rotated ? "#EF4444" : isOpt ? "#39D353" : "#00F0FF"}
                        stroke={isAct ? "#FFFFFF" : "none"}
                        strokeWidth="1.2"
                      />
                      <text x={x} y="104" textAnchor="middle" fill={isAct ? "#FFFFFF" : "#777777"} fontSize="7.5" fontFamily="monospace">
                        r={pt.r}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </svg>

          <div className="flex justify-between text-[10px] font-mono text-[#888888]">
            <span>{formatDisplayCopy(`Initial: ${(grover.initial_prob * 100).toFixed(1)}%`)}</span>
            <span className="text-[#39D353]">{formatDisplayCopy(`Optimal Peak r=${grover.optimal_iterations}`)}</span>
          </div>
        </div>
      </div>

      {/* Iteration Buttons r = 0..6 */}
      <div className="grid grid-cols-7 gap-1 bg-[#1F1F1F] p-1.5 rounded-xl border border-[#313131]">
        {[0, 1, 2, 3, 4, 5, 6].map((r) => {
          const optPt = curve.find((c) => c.r === r);
          const collapsed = optPt?.over_rotated;
          return (
            <button
              key={r}
              type="button"
              onClick={() => onChangeGroverIter(r)}
              className={`py-1.5 rounded text-xs font-mono transition-colors border ${
                groverIter === r
                  ? collapsed
                    ? "bg-[#EF4444] text-white font-bold border-white"
                    : "bg-[#00F0FF] text-black font-bold border-white"
                  : "bg-[#181818] text-[#888888] border-[#2A2A2A] hover:text-white"
              }`}
            >
              r={r}
            </button>
          );
        })}
      </div>

      {/* Spatial Edge Map Comparison: r=0 Input vs Post-Grover Amplified */}
      <div className="grid grid-cols-2 gap-3">
        <QmlMatrixCanvas
          matrix={grover.input_edge_map}
          colormap="phase"
          minVal={0}
          maxVal={1}
          label="Pre Grover Edge (r=0)"
          badgeText={`${(grover.initial_prob * 100).toFixed(1)}%`}
          badgeColor="#FFD700"
        />
        <QmlMatrixCanvas
          matrix={grover.amplified_edge_map}
          colormap="phase"
          minVal={0}
          maxVal={1}
          label={`Post Grover (r=${groverIter})`}
          badgeText={`${(grover.amplified_prob * 100).toFixed(1)}%`}
          badgeColor={isOver ? "#EF4444" : "#39D353"}
        />
      </div>
    </div>
  );
};

