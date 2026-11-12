"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KaTeXBlock } from "@/components/ui/KaTeXBlock";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import { Zap, Info, X, Layers, Cpu, Compass } from "lucide-react";

export interface GateDetail {
  id: string;
  name: string;
  symbol: string;
  role: string;
  unitary: string;
  stage: string;
  physicalIntuition: string;
}

export const GATE_DATABASE: Record<string, GateDetail> = {
  H: {
    id: "H",
    name: "Hadamard Gate (Spatial Differentiation Interferometer)",
    symbol: "H",
    stage: "Stage 1 Superposition / Stage 4 Spatial Interference",
    unitary: String.raw`H = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}`,
    role: "Maps |0⟩ to (|0⟩ + |1⟩)/√2 and |1⟩ to (|0⟩ - |1⟩)/√2.",
    physicalIntuition:
      "When applied to the least-significant position qubit (q0 for horizontal, q3 for vertical), it causes adjacent pixel amplitudes to interfere. Identical pixel pairs cancel destructively (amplitude zero), while boundary contrast steps reinforce constructively into the |1⟩ difference state."
  },
  Ry: {
    id: "Ry",
    name: "Multi-Controlled Ry Rotation (FRQI Color Dial)",
    symbol: "Ry(2θ)",
    stage: "Stage 2 FRQI Intensity Entanglement",
    unitary: String.raw`R_y(2\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}`,
    role: "Rotates the auxiliary color qubit |c⟩ by 2θ around the Bloch sphere Y-axis, where θ = (π/2) · (I / 255).",
    physicalIntuition:
      "Acts as an analog dial: a dark shadow pixel leaves |c⟩ at the North Pole (|0⟩), while a brilliant sunlit rim crest rotates |c⟩ to the South Pole (|1⟩). Lunar regolith (mid-gray) rotates |c⟩ to the equator ((|0⟩+|1⟩)/√2)."
  },
  U_iso: {
    id: "U_iso",
    name: "Multiplexed Uniformly Controlled Ry Tree (Möttönen Decomposition)",
    symbol: "U_iso",
    stage: "Stage 1 QPIE Amplitude Loading",
    unitary: "64-dimensional unitary state preparation matrix",
    role: "Loads 64 classical pixel intensities directly into the complex probability amplitudes of 6 spatial qubits.",
    physicalIntuition:
      "Eliminates the color qubit entirely. The 6-qubit register holds all 64 pixel values simultaneously as normalized statevector amplitudes α_i = I_i / ||I||_2, cutting simulation memory by 50% compared to FRQI."
  },
  D8: {
    id: "D8",
    name: "Cyclic Decrement Unitary (Odd-Pair Alignment)",
    symbol: "D8",
    stage: "Stage 3 Coordinate Permutation (Odd Boundaries)",
    unitary: "8×8 cyclic permutation matrix shifting |x⟩ to |(x-1) mod 8⟩",
    role: "Decomposed into X(q0) -> CX(q0, q1) -> CCX(q0, q1, q2) ripple-carry logic.",
    physicalIntuition:
      "Shifts the column or row coordinate register by 1 unit in quantum hardware. This shifts odd pixel boundaries (1,2), (3,4), (5,6) into the even slots (0,1), (2,3), (4,5) so the single Hadamard interferometer evaluates all boundaries with zero gaps."
  },
  MC_X: {
    id: "MC_X",
    name: "Multi-Controlled Pauli-X Bitplane Setter (C^6-X)",
    symbol: "C^6-X",
    stage: "Stage 2 NEQR Grayscale Encoding",
    unitary: "[[0, 1], [1, 0]] conditioned on 6-qubit position match",
    role: "Flips grayscale bit qubit c_k from |0⟩ to |1⟩ if and only if the k-th bit of pixel f(Y,X) is 1.",
    physicalIntuition:
      "Stores pixel brightness as exact digital basis states |c7 c6 c5 c4 c3 c2 c1 c0⟩ rather than continuous rotation angles, achieving 100% deterministic precision with zero shot noise on the intensity."
  },
  QFS: {
    id: "QFS",
    name: "Quantum Full Subtractor (QFS Reversible ALU)",
    symbol: "QFS",
    stage: "Stage 3 Reversible Quantum Arithmetic",
    unitary: "GF(2) Reversible Boolean ALU cascade",
    role: "Computes difference bit d_k = a_k ⊕ b_k ⊕ b_in and borrow-out bit b_out = (¬a_k · b_k) ⊕ (¬(a_k ⊕ b_k) · b_in).",
    physicalIntuition:
      "Subtracts neighboring 8-bit digital pixel values in quantum superposition with zero analog approximation, zero sine compression, and zero shot variance on the intensity itself."
  },
  Sign: {
    id: "Sign",
    name: "Sign Comparator & Absolute Value Unitary (U_abs-sub)",
    symbol: "Sign Comp τ",
    stage: "Stage 4 Absolute Magnitude Extraction",
    unitary: "Controlled-Two's-Complement Negation on borrow MSB",
    role: "If MSB borrow b_out,7 = 1, conditionally negates the 8-bit difference register into positive unsigned absolute value |f_a - f_b|.",
    physicalIntuition:
      "Reversible sign extraction ensures gradient symmetry: falling edges (bright to dark) and rising edges (dark to bright) produce identical positive edge magnitudes without information loss."
  },
  M: {
    id: "M",
    name: "Projective Computational Basis Readout (Measurement)",
    symbol: "M",
    stage: "Stage 5 Born Collapse & Reconstruction",
    unitary: "Projective measurement operators P_0 = |0⟩⟨0|, P_1 = |1⟩⟨1|",
    role: "Collapses the quantum superposition according to the Born probability rule.",
    physicalIntuition:
      "Post-selecting outcomes where the least-significant difference bit collapses to |1⟩ extracts the high-pass spatial edge gradient for the entire image patch in O(1) depth."
  }
};

interface CircuitInspectorDrawerProps {
  algorithm: "frqi" | "qpie" | "neqr";
  passMode: "horizontal" | "vertical";
  onPassChange: (pass: "horizontal" | "vertical") => void;
}

export const CircuitInspectorDrawer: React.FC<CircuitInspectorDrawerProps> = ({
  algorithm,
  passMode,
  onPassChange
}) => {
  const [selectedGateKey, setSelectedGateKey] = useState<string>("H");
  const [neqrSubView, setNeqrSubView] = useState<"full" | "qfs_cell">("full");

  const selectedGate = GATE_DATABASE[selectedGateKey] || GATE_DATABASE["H"];
  const isVertical = passMode === "vertical";
  const color =
    algorithm === "frqi" ? "#FF00B4" : algorithm === "qpie" ? "#00F0FF" : "#BD93F9";

  // Render FRQI 7-qubit interactive circuit diagram
  const renderFRQICircuitSVG = () => {
    const wires = [
      { id: "q0", label: "q0 (col 0)", state: "|0⟩" },
      { id: "q1", label: "q1 (col 1)", state: "|0⟩" },
      { id: "q2", label: "q2 (col 2)", state: "|0⟩" },
      { id: "q3", label: "q3 (row 0)", state: "|0⟩" },
      { id: "q4", label: "q4 (row 1)", state: "|0⟩" },
      { id: "q5", label: "q5 (row 2)", state: "|0⟩" },
      { id: "c", label: "|c⟩ (color)", state: "|0⟩", isColor: true }
    ];
    const wireY = [26, 54, 82, 110, 138, 166, 198];
    const targetQubitIdx = isVertical ? 3 : 0;
    const targetWireY = wireY[targetQubitIdx];

    return (
      <svg
        className="w-full min-w-[760px] h-[235px] bg-[#050505] rounded-xl border border-[#222] p-1 select-none"
        viewBox="0 0 800 235"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="neonGlowFRQI" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 7 Horizontal Wires */}
        {wires.map((w, i) => {
          const y = wireY[i];
          const stroke = w.isColor ? "#E5A93C" : "#FF00B4";
          return (
            <g key={w.id}>
              <line x1="130" y1={y} x2="770" y2={y} stroke="#1A1A1A" strokeWidth="4" />
              <line
                x1="130"
                y1={y}
                x2="770"
                y2={y}
                stroke={stroke}
                strokeWidth={w.isColor ? "1.8" : "1.4"}
                strokeOpacity={w.isColor ? 0.95 : 0.8}
              />
              <text x="8" y={y + 3.5} fill={stroke} fontFamily="monospace" fontSize="9.5" fontWeight="bold">
                {w.label}
              </text>
              <text x="100" y={y + 3.5} fill="#888" fontFamily="monospace" fontSize="9">
                {w.state}
              </text>

              {/* Animated Data Packets */}
              <circle r="3.2" fill={stroke}>
                <animateMotion
                  path={`M 130 ${y} L 770 ${y}`}
                  dur={`${2.0 + i * 0.22}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Stage 1: Position Superposition H^6 */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("H")}
          filter={selectedGateKey === "H" ? "url(#neonGlowFRQI)" : undefined}
        >
          {wireY.slice(0, 6).map((y, i) => (
            <g key={i}>
              <rect
                x="165"
                y={y - 11}
                width="24"
                height="22"
                rx="3.5"
                fill={selectedGateKey === "H" ? "#8957E5" : "#1C1917"}
                stroke="#FFE600"
                strokeWidth={selectedGateKey === "H" ? "2" : "1"}
              />
              <text x="177" y={y + 4} fill="#FFF" fontFamily="monospace" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                H
              </text>
            </g>
          ))}
          <rect x="165" y={wireY[6] - 11} width="24" height="22" rx="3.5" fill="#1C1917" stroke="#444" strokeWidth="1" />
          <text x="177" y={wireY[6] + 4} fill="#777" fontFamily="monospace" fontSize="9" textAnchor="middle">
            I
          </text>
          <text x="177" y="14" fill="#FFE600" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
            H^6
          </text>
        </g>

        {/* Stage 2: FRQI Multi-Controlled Ry Rotation Tree */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("Ry")}
          filter={selectedGateKey === "Ry" ? "url(#neonGlowFRQI)" : undefined}
        >
          {/* Vertical Control Line from q0 down to |c> */}
          <line x1="265" y1="26" x2="265" y2="198" stroke="#FF00B4" strokeWidth="1.6" strokeDasharray="2,2" />
          {wireY.slice(0, 6).map((y, i) => (
            <circle key={i} cx="265" cy={y} r="3.5" fill="#FF00B4" />
          ))}
          <rect
            x="245"
            y={wireY[6] - 13}
            width="40"
            height="26"
            rx="4"
            fill={selectedGateKey === "Ry" ? "#701A75" : "#3B0764"}
            stroke="#FF00B4"
            strokeWidth={selectedGateKey === "Ry" ? "2.2" : "1.2"}
          />
          <text x="265" y={wireY[6] + 4} fill="#FFF" fontFamily="monospace" fontSize="8.5" fontWeight="bold" textAnchor="middle">
            Ry(2θ)
          </text>
          <text x="265" y="14" fill="#FF00B4" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
            FRQI Dial
          </text>
        </g>

        {/* Stage 3: Cyclic Decrement Shift D8 (Odd-Pair Alignment) */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("D8")}
          filter={selectedGateKey === "D8" ? "url(#neonGlowFRQI)" : undefined}
        >
          {/* Active register based on Horizontal vs Vertical */}
          {isVertical ? (
            // Shift on row register q3..q5
            <>
              {/* X on q3 */}
              <rect x="345" y={wireY[3] - 11} width="22" height="22" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <text x="356" y={wireY[3] + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                X
              </text>

              {/* CX(q3 -> q4) */}
              <line x1="395" y1={wireY[3]} x2="395" y2={wireY[4]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="395" cy={wireY[3]} r="3" fill="#38BDF8" />
              <circle cx="395" cy={wireY[4]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 391 ${wireY[4]} h 8 M 395 ${wireY[4] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />

              {/* CCX(q3, q4 -> q5) Toffoli */}
              <line x1="445" y1={wireY[3]} x2="445" y2={wireY[5]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="445" cy={wireY[3]} r="3" fill="#38BDF8" />
              <circle cx="445" cy={wireY[4]} r="3" fill="#38BDF8" />
              <circle cx="445" cy={wireY[5]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 441 ${wireY[5]} h 8 M 445 ${wireY[5] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />

              <rect x="335" y={wireY[3] - 16} width="125" height="96" rx="6" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" />
              <text x="397" y="14" fill="#38BDF8" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
                D8 Row Shift (q3..q5)
              </text>
            </>
          ) : (
            // Shift on column register q0..q2
            <>
              {/* X on q0 */}
              <rect x="345" y={wireY[0] - 11} width="22" height="22" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <text x="356" y={wireY[0] + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                X
              </text>

              {/* CX(q0 -> q1) */}
              <line x1="395" y1={wireY[0]} x2="395" y2={wireY[1]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="395" cy={wireY[0]} r="3" fill="#38BDF8" />
              <circle cx="395" cy={wireY[1]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 391 ${wireY[1]} h 8 M 395 ${wireY[1] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />

              {/* CCX(q0, q1 -> q2) Toffoli */}
              <line x1="445" y1={wireY[0]} x2="445" y2={wireY[2]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="445" cy={wireY[0]} r="3" fill="#38BDF8" />
              <circle cx="445" cy={wireY[1]} r="3" fill="#38BDF8" />
              <circle cx="445" cy={wireY[2]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 441 ${wireY[2]} h 8 M 445 ${wireY[2] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />

              <rect x="335" y={wireY[0] - 16} width="125" height="96" rx="6" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" />
              <text x="397" y="14" fill="#38BDF8" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
                D8 Col Shift (q0..q2)
              </text>
            </>
          )}
        </g>

        {/* Stage 4: Hadamard QHED Interference Gate */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("H")}
          filter={selectedGateKey === "H" ? "url(#neonGlowFRQI)" : undefined}
        >
          <rect
            x="510"
            y={targetWireY - 14}
            width="28"
            height="28"
            rx="4"
            fill="#064E3B"
            stroke="#30D158"
            strokeWidth="2.2"
          />
          <text x="524" y={targetWireY + 4.5} fill="#FFF" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle">
            H
          </text>
          <text x="524" y="14" fill="#30D158" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
            QHED {isVertical ? "q3" : "q0"}
          </text>
        </g>

        {/* Stage 5: Projective Measurement M on all 7 wires */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("M")}
          filter={selectedGateKey === "M" ? "url(#neonGlowFRQI)" : undefined}
        >
          {wireY.map((y, i) => (
            <g key={i}>
              <rect
                x="610"
                y={y - 11}
                width="22"
                height="22"
                rx="3.5"
                fill={selectedGateKey === "M" ? "#6B21A8" : "#262626"}
                stroke={i === targetQubitIdx ? "#30D158" : "#BD93F9"}
                strokeWidth={i === targetQubitIdx ? "1.8" : "1"}
              />
              <text x="621" y={y + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                M
              </text>
            </g>
          ))}
          <text x="621" y="14" fill="#BD93F9" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
            Readout [M]
          </text>
        </g>
      </svg>
    );
  };

  // Render QPIE 6-qubit interactive circuit diagram
  const renderQPIECircuitSVG = () => {
    const wires = [
      { id: "q0", label: "q0 (col 0)", state: "|0⟩" },
      { id: "q1", label: "q1 (col 1)", state: "|0⟩" },
      { id: "q2", label: "q2 (col 2)", state: "|0⟩" },
      { id: "q3", label: "q3 (row 0)", state: "|0⟩" },
      { id: "q4", label: "q4 (row 1)", state: "|0⟩" },
      { id: "q5", label: "q5 (row 2)", state: "|0⟩" }
    ];
    const wireY = [28, 60, 92, 124, 156, 188];
    const targetQubitIdx = isVertical ? 3 : 0;
    const targetWireY = wireY[targetQubitIdx];

    return (
      <svg
        className="w-full min-w-[760px] h-[225px] bg-[#050505] rounded-xl border border-[#222] p-1 select-none"
        viewBox="0 0 800 225"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="neonGlowQPIE" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 6 Spatial Wires */}
        {wires.map((w, i) => {
          const y = wireY[i];
          return (
            <g key={w.id}>
              <line x1="130" y1={y} x2="770" y2={y} stroke="#1A1A1A" strokeWidth="4" />
              <line x1="130" y1={y} x2="770" y2={y} stroke="#00F0FF" strokeWidth="1.5" strokeOpacity="0.85" />
              <text x="8" y={y + 4} fill="#00F0FF" fontFamily="monospace" fontSize="9.5" fontWeight="bold">
                {w.label}
              </text>
              <text x="100" y={y + 4} fill="#888" fontFamily="monospace" fontSize="9">
                {w.state}
              </text>
              <circle r="3.2" fill="#00F0FF">
                <animateMotion
                  path={`M 130 ${y} L 770 ${y}`}
                  dur={`${2.0 + i * 0.25}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Stage 1: Multiplexed Amplitude Preparation Tree U_iso */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("U_iso")}
          filter={selectedGateKey === "U_iso" ? "url(#neonGlowQPIE)" : undefined}
        >
          <rect
            x="160"
            y="14"
            width="120"
            height="188"
            rx="6"
            fill={selectedGateKey === "U_iso" ? "#0E3A4A" : "#0A2533"}
            stroke="#00F0FF"
            strokeWidth={selectedGateKey === "U_iso" ? "2.5" : "1.2"}
          />
          <text x="220" y="98" fill="#FFF" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle">
            U_iso (Möttönen Tree)
          </text>
          <text x="220" y="116" fill="#00F0FF" fontFamily="monospace" fontSize="8.5" textAnchor="middle">
            64 Amplitudes α_i
          </text>
          <text x="220" y="130" fill="#9B9B9B" fontFamily="monospace" fontSize="7.5" textAnchor="middle">
            ∑ |α_i|² = 1
          </text>
          <text x="220" y="12" fill="#00F0FF" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
            Stage 1: Amplitude Prep
          </text>
        </g>

        {/* Stage 2: Cyclic Decrement D8 */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("D8")}
          filter={selectedGateKey === "D8" ? "url(#neonGlowQPIE)" : undefined}
        >
          {isVertical ? (
            <>
              {/* Row Shift on q3..q5 */}
              <rect x="340" y={wireY[3] - 12} width="22" height="22" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <text x="351" y={wireY[3] + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                X
              </text>
              <line x1="390" y1={wireY[3]} x2="390" y2={wireY[4]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="390" cy={wireY[3]} r="3" fill="#38BDF8" />
              <circle cx="390" cy={wireY[4]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 386 ${wireY[4]} h 8 M 390 ${wireY[4] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />
              <line x1="440" y1={wireY[3]} x2="440" y2={wireY[5]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="440" cy={wireY[3]} r="3" fill="#38BDF8" />
              <circle cx="440" cy={wireY[4]} r="3" fill="#38BDF8" />
              <circle cx="440" cy={wireY[5]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 436 ${wireY[5]} h 8 M 440 ${wireY[5] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />
              <rect x="330" y={wireY[3] - 16} width="125" height="88" rx="6" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" />
              <text x="392" y="12" fill="#38BDF8" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
                D8 Row Shift (q3..q5)
              </text>
            </>
          ) : (
            <>
              {/* Col Shift on q0..q2 */}
              <rect x="340" y={wireY[0] - 12} width="22" height="22" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <text x="351" y={wireY[0] + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                X
              </text>
              <line x1="390" y1={wireY[0]} x2="390" y2={wireY[1]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="390" cy={wireY[0]} r="3" fill="#38BDF8" />
              <circle cx="390" cy={wireY[1]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 386 ${wireY[1]} h 8 M 390 ${wireY[1] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />
              <line x1="440" y1={wireY[0]} x2="440" y2={wireY[2]} stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="440" cy={wireY[0]} r="3" fill="#38BDF8" />
              <circle cx="440" cy={wireY[1]} r="3" fill="#38BDF8" />
              <circle cx="440" cy={wireY[2]} r="7" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
              <path d={`M 436 ${wireY[2]} h 8 M 440 ${wireY[2] - 4} v 8`} stroke="#FFF" strokeWidth="1.2" />
              <rect x="330" y={wireY[0] - 16} width="125" height="88" rx="6" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" />
              <text x="392" y="12" fill="#38BDF8" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
                D8 Col Shift (q0..q2)
              </text>
            </>
          )}
        </g>

        {/* Stage 3: Hadamard Butterfly Difference */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("H")}
          filter={selectedGateKey === "H" ? "url(#neonGlowQPIE)" : undefined}
        >
          <rect
            x="510"
            y={targetWireY - 14}
            width="28"
            height="28"
            rx="4"
            fill="#064E3B"
            stroke="#30D158"
            strokeWidth="2.2"
          />
          <text x="524" y={targetWireY + 4.5} fill="#FFF" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle">
            H
          </text>
          <text x="524" y="12" fill="#30D158" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
            QHED {isVertical ? "q3" : "q0"}
          </text>
        </g>

        {/* Stage 4: Projective Measurement M */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("M")}
          filter={selectedGateKey === "M" ? "url(#neonGlowQPIE)" : undefined}
        >
          {wireY.map((y, i) => (
            <g key={i}>
              <rect
                x="610"
                y={y - 11}
                width="22"
                height="22"
                rx="3.5"
                fill={selectedGateKey === "M" ? "#6B21A8" : "#262626"}
                stroke={i === targetQubitIdx ? "#30D158" : "#BD93F9"}
                strokeWidth={i === targetQubitIdx ? "1.8" : "1"}
              />
              <text x="621" y={y + 4} fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
                M
              </text>
            </g>
          ))}
          <text x="621" y="12" fill="#BD93F9" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
            Post-Select |1⟩
          </text>
        </g>
      </svg>
    );
  };

  // Render NEQR Full 14-Qubit Architecture Diagram
  const renderNEQR14QubitCircuitSVG = () => {
    const posWires = [
      { id: "y2", label: "y2 (Row)", state: "|0⟩" },
      { id: "y1", label: "y1 (Row)", state: "|0⟩" },
      { id: "y0", label: "y0 (Row)", state: "|0⟩" },
      { id: "x2", label: "x2 (Col)", state: "|0⟩" },
      { id: "x1", label: "x1 (Col)", state: "|0⟩" },
      { id: "x0", label: "x0 (Col)", state: "|0⟩" }
    ];
    const grayWires = [
      { id: "c7", label: "c7 (MSB 128)", state: "|0⟩" },
      { id: "c6", label: "c6 (Bit 64)", state: "|0⟩" },
      { id: "c5", label: "c5 (Bit 32)", state: "|0⟩" },
      { id: "c4", label: "c4 (Bit 16)", state: "|0⟩" },
      { id: "c3", label: "c3 (Bit 8)", state: "|0⟩" },
      { id: "c2", label: "c2 (Bit 4)", state: "|0⟩" },
      { id: "c1", label: "c1 (Bit 2)", state: "|0⟩" },
      { id: "c0", label: "c0 (LSB 1)", state: "|0⟩" }
    ];

    const posWireY = [24, 44, 64, 84, 104, 124];
    const grayWireY = [156, 176, 196, 216, 236, 256, 276, 296];

    return (
      <svg
        className="w-full min-w-[800px] h-[330px] bg-[#050505] rounded-xl border border-[#222] p-1 select-none"
        viewBox="0 0 850 330"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="neonGlowNEQR" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 6 Position Qubit Wires */}
        {posWires.map((w, i) => {
          const y = posWireY[i];
          return (
            <g key={w.id}>
              <line x1="140" y1={y} x2="810" y2={y} stroke="#1A1A1A" strokeWidth="3" />
              <line x1="140" y1={y} x2="810" y2={y} stroke="#00F0FF" strokeWidth="1.3" strokeOpacity="0.75" />
              <text x="6" y={y + 3.5} fill="#00F0FF" fontFamily="monospace" fontSize="8.5" fontWeight="bold">
                {w.label}
              </text>
              <text x="105" y={y + 3.5} fill="#777" fontFamily="monospace" fontSize="8">
                {w.state}
              </text>
              <circle r="2.6" fill="#00F0FF">
                <animateMotion path={`M 140 ${y} L 810 ${y}`} dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Divider between Position Register & Grayscale Bitplane Register */}
        <line x1="10" y1="140" x2="830" y2="140" stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
        <text x="70" y="143" fill="#666" fontFamily="monospace" fontSize="7.5" textAnchor="middle">
          REGISTER PARTITION
        </text>

        {/* 8 Grayscale Bitplane Qubit Wires */}
        {grayWires.map((w, i) => {
          const y = grayWireY[i];
          return (
            <g key={w.id}>
              <line x1="140" y1={y} x2="810" y2={y} stroke="#1A1A1A" strokeWidth="3" />
              <line x1="140" y1={y} x2="810" y2={y} stroke="#BD93F9" strokeWidth="1.3" strokeOpacity="0.85" />
              <text x="6" y={y + 3.5} fill="#BD93F9" fontFamily="monospace" fontSize="8.5" fontWeight="bold">
                {w.label}
              </text>
              <text x="105" y={y + 3.5} fill="#777" fontFamily="monospace" fontSize="8">
                {w.state}
              </text>
              <circle r="2.6" fill="#BD93F9">
                <animateMotion path={`M 140 ${y} L 810 ${y}`} dur={`${2.0 + (i % 4) * 0.25}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Stage 1: Position Superposition H^6 */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("H")}
          filter={selectedGateKey === "H" ? "url(#neonGlowNEQR)" : undefined}
        >
          <rect
            x="165"
            y="14"
            width="34"
            height="118"
            rx="4"
            fill={selectedGateKey === "H" ? "#0E3A4A" : "#082F3B"}
            stroke="#00F0FF"
            strokeWidth={selectedGateKey === "H" ? "2.2" : "1"}
          />
          <text x="182" y="73" fill="#FFF" fontFamily="monospace" fontSize="8.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 182 73)">
            H^6 (Pos Superpos)
          </text>
          <text x="182" y="12" fill="#00F0FF" fontFamily="monospace" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            Stage 1: H^6
          </text>
        </g>

        {/* Stage 2: Multi-Controlled C^6-X Grayscale Basis Preparation */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("MC_X")}
          filter={selectedGateKey === "MC_X" ? "url(#neonGlowNEQR)" : undefined}
        >
          <line x1="245" y1="24" x2="245" y2="296" stroke="#BD93F9" strokeWidth="1.4" strokeDasharray="2,2" />
          {posWireY.map((y, i) => (
            <circle key={i} cx="245" cy={y} r="3" fill="#00F0FF" />
          ))}
          <rect
            x="225"
            y="148"
            width="40"
            height="156"
            rx="4"
            fill={selectedGateKey === "MC_X" ? "#581C87" : "#3B0764"}
            stroke="#BD93F9"
            strokeWidth={selectedGateKey === "MC_X" ? "2.2" : "1"}
          />
          <text x="245" y="226" fill="#FFF" fontFamily="monospace" fontSize="8.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 245 226)">
            C^6-X (8-Bit Grayscale)
          </text>
          <text x="245" y="12" fill="#BD93F9" fontFamily="monospace" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            Stage 2: Basis Set
          </text>
        </g>

        {/* Stage 3: Coordinate Shift Permutation (Ux+1 or Uy+1) */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("D8")}
          filter={selectedGateKey === "D8" ? "url(#neonGlowNEQR)" : undefined}
        >
          {isVertical ? (
            // Shift on row register (y0..y2)
            <>
              <rect
                x="320"
                y="16"
                width="65"
                height="56"
                rx="4"
                fill="#0C4A6E"
                stroke="#38BDF8"
                strokeWidth={selectedGateKey === "D8" ? "2" : "1"}
              />
              <text x="352" y="48" fill="#FFF" fontFamily="monospace" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                Uy+1 (Row)
              </text>
            </>
          ) : (
            // Shift on column register (x0..x2)
            <>
              <rect
                x="320"
                y="76"
                width="65"
                height="56"
                rx="4"
                fill="#0C4A6E"
                stroke="#38BDF8"
                strokeWidth={selectedGateKey === "D8" ? "2" : "1"}
              />
              <text x="352" y="108" fill="#FFF" fontFamily="monospace" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                Ux+1 (Col)
              </text>
            </>
          )}
          <text x="352" y="12" fill="#38BDF8" fontFamily="monospace" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            Stage 3: Shift
          </text>
        </g>

        {/* Stage 4: Quantum Ripple-Borrow Subtractor (8-Bit QFS ALU) */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("QFS")}
          filter={selectedGateKey === "QFS" ? "url(#neonGlowNEQR)" : undefined}
        >
          <rect
            x="440"
            y="148"
            width="80"
            height="156"
            rx="5"
            fill={selectedGateKey === "QFS" ? "#065F46" : "#064E3B"}
            stroke="#34D399"
            strokeWidth={selectedGateKey === "QFS" ? "2.5" : "1.2"}
          />
          <text x="480" y="226" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90 480 226)">
            8-Bit QFS Subtractor
          </text>
          <text x="480" y="12" fill="#34D399" fontFamily="monospace" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            Stage 4: ALU Diff
          </text>
        </g>

        {/* Stage 5: Sign Comparator & Absolute Value Extractor */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("Sign")}
          filter={selectedGateKey === "Sign" ? "url(#neonGlowNEQR)" : undefined}
        >
          <rect
            x="570"
            y="148"
            width="65"
            height="156"
            rx="5"
            fill={selectedGateKey === "Sign" ? "#713F12" : "#451A03"}
            stroke="#F59E0B"
            strokeWidth={selectedGateKey === "Sign" ? "2.5" : "1.2"}
          />
          <text x="602" y="226" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 602 226)">
            Sign Comp |ΔI|
          </text>
          <text x="602" y="12" fill="#F59E0B" fontFamily="monospace" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            Stage 5: Magnitude
          </text>
        </g>

        {/* Stage 6: Deterministic Measurement M on all 14 wires */}
        <g
          className="cursor-pointer group"
          onClick={() => setSelectedGateKey("M")}
          filter={selectedGateKey === "M" ? "url(#neonGlowNEQR)" : undefined}
        >
          {/* Pos M */}
          {posWireY.map((y, i) => (
            <g key={i}>
              <rect x="680" y={y - 8} width="18" height="16" rx="2.5" fill="#222" stroke="#555" strokeWidth="1" />
              <text x="689" y={y + 3.5} fill="#FFF" fontFamily="monospace" fontSize="8" textAnchor="middle">
                M
              </text>
            </g>
          ))}
          {/* Gray M */}
          {grayWireY.map((y, i) => (
            <g key={i}>
              <rect
                x="680"
                y={y - 8}
                width="18"
                height="16"
                rx="2.5"
                fill={selectedGateKey === "M" ? "#6B21A8" : "#262626"}
                stroke="#30D158"
                strokeWidth="1.2"
              />
              <text x="689" y={y + 3.5} fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
                M
              </text>
            </g>
          ))}
          <text x="689" y="12" fill="#30D158" fontFamily="monospace" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            Exact Readout
          </text>
        </g>
      </svg>
    );
  };

  // Render Single QFS Cell Subtractor (Circuit B from Section 4.3)
  const renderQFSLogicCellSVG = () => {
    const qfsWires = [
      { id: "bin", label: "b_in,k (Borrow In)", role: "Ancilla", y: 35, stroke: "#38BDF8" },
      { id: "ak", label: "a_k (Minuend Bit)", role: "Restored", y: 75, stroke: "#00F0FF" },
      { id: "bk", label: "b_k (Subtrahend)", role: "Diff Output d_k", y: 115, stroke: "#30D158" },
      { id: "bout", label: "b_out,k (Borrow Out)", role: "To Stage k+1", y: 155, stroke: "#FFE600" }
    ];

    return (
      <svg
        className="w-full min-w-[760px] h-[200px] bg-[#050505] rounded-xl border border-[#222] p-1 select-none"
        viewBox="0 0 800 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {qfsWires.map((w) => (
          <g key={w.id}>
            <line x1="160" y1={w.y} x2="760" y2={w.y} stroke="#1A1A1A" strokeWidth="4" />
            <line x1="160" y1={w.y} x2="760" y2={w.y} stroke={w.stroke} strokeWidth="1.5" />
            <text x="8" y={w.y + 4} fill={w.stroke} fontFamily="monospace" fontSize="9.5" fontWeight="bold">
              {w.label}
            </text>
            <text x="660" y={w.y + 4} fill="#888" fontFamily="monospace" fontSize="8.5">
              [{w.role}]
            </text>
          </g>
        ))}

        {/* Gate 1: CX(b_k -> a_k) */}
        <line x1="210" y1="75" x2="210" y2="115" stroke="#00F0FF" strokeWidth="1.5" />
        <circle cx="210" cy="115" r="3.5" fill="#00F0FF" />
        <circle cx="210" cy="75" r="7.5" fill="#0C4A6E" stroke="#00F0FF" strokeWidth="1.2" />
        <path d="M 206 75 h 8 M 210 71 v 8" stroke="#FFF" strokeWidth="1.2" />
        <text x="210" y="20" fill="#9B9B9B" fontFamily="monospace" fontSize="8" textAnchor="middle">
          CX
        </text>

        {/* Gate 2: X on a_k */}
        <rect x="270" y="64" width="22" height="22" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
        <text x="281" y="78" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
          X
        </text>

        {/* Gate 3: CCX Toffoli(a_k, b_k -> b_out) */}
        <line x1="350" y1="75" x2="350" y2="155" stroke="#FFE600" strokeWidth="1.5" />
        <circle cx="350" cy="75" r="3.5" fill="#FFE600" />
        <circle cx="350" cy="115" r="3.5" fill="#FFE600" />
        <circle cx="350" cy="155" r="7.5" fill="#713F12" stroke="#FFE600" strokeWidth="1.2" />
        <path d="M 346 155 h 8 M 350 151 v 8" stroke="#FFF" strokeWidth="1.2" />
        <text x="350" y="20" fill="#FFE600" fontFamily="monospace" fontSize="8" textAnchor="middle">
          CCX
        </text>

        {/* Gate 4: X on a_k (Restoration) */}
        <rect x="420" y="64" width="22" height="22" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
        <text x="431" y="78" fill="#FFF" fontFamily="monospace" fontSize="9" fontWeight="bold" textAnchor="middle">
          X
        </text>

        {/* Gate 5: CX(b_in -> b_k) computes d_k = a_k ^ b_k ^ b_in */}
        <line x1="490" y1="35" x2="490" y2="115" stroke="#30D158" strokeWidth="1.5" />
        <circle cx="490" cy="35" r="3.5" fill="#30D158" />
        <circle cx="490" cy="115" r="7.5" fill="#064E3B" stroke="#30D158" strokeWidth="1.2" />
        <path d="M 486 115 h 8 M 490 111 v 8" stroke="#FFF" strokeWidth="1.2" />
        <text x="490" y="20" fill="#30D158" fontFamily="monospace" fontSize="8" textAnchor="middle">
          CX (Diff)
        </text>

        {/* Gate 6: Second CCX(b_in, borrow -> b_out) */}
        <line x1="570" y1="35" x2="570" y2="155" stroke="#FFE600" strokeWidth="1.5" />
        <circle cx="570" cy="35" r="3.5" fill="#FFE600" />
        <circle cx="570" cy="115" r="3.5" fill="#FFE600" />
        <circle cx="570" cy="155" r="7.5" fill="#713F12" stroke="#FFE600" strokeWidth="1.2" />
        <path d="M 566 155 h 8 M 570 151 v 8" stroke="#FFF" strokeWidth="1.2" />
        <text x="570" y="20" fill="#FFE600" fontFamily="monospace" fontSize="8" textAnchor="middle">
          CCX (Carry)
        </text>
      </svg>
    );
  };

  return (
    <Card surface="card" outerRadius={16} className="p-6 border border-[#313131] space-y-6">
      {/* 1. Circuit Header & Dual Pass Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="text-base font-semibold text-white">
              {formatDisplayCopy(
                algorithm === "frqi"
                  ? "FRQI QHED: Standalone Dual Quantum Circuits (7 Wires: 6 Pos + 1 Color)"
                  : algorithm === "qpie"
                  ? "QPIE QHED: Standalone Dual Quantum Circuits (6 Wires: Pure Spatial Amplitudes)"
                  : "NEQR Gradient: Standalone Dual Quantum Circuits (14 Wires: 6 Pos + 8 Gray Basis)"
              )}
            </h3>
          </div>
          <p className="text-xs text-[#9B9B9B]">
            {formatDisplayCopy(
              "Click any gate in the circuit diagram below to inspect its mathematical unitary matrix and physical quantum role."
            )}
          </p>
        </div>

        {/* Pass Switcher & Sub-view Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {algorithm === "neqr" && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141414] border border-[#313131] text-xs font-mono mr-2">
              <button
                onClick={() => setNeqrSubView("full")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  neqrSubView === "full" ? "bg-[#BD93F9] text-black font-semibold shadow-sm" : "text-[#9B9B9B] hover:text-white"
                }`}
              >
                {formatDisplayCopy("14 Qubit Architecture")}
              </button>
              <button
                onClick={() => setNeqrSubView("qfs_cell")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  neqrSubView === "qfs_cell" ? "bg-[#30D158] text-black font-semibold shadow-sm" : "text-[#9B9B9B] hover:text-white"
                }`}
              >
                {formatDisplayCopy("QFS Subtractor Cell")}
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141414] border border-[#313131] text-xs font-mono">
            <button
              onClick={() => onPassChange("horizontal")}
              className={`px-3 py-1.5 rounded transition-colors ${
                !isVertical ? "bg-white text-black font-semibold shadow-sm" : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("Circuit A: Horizontal Pass (Col q0)")}
            </button>
            <button
              onClick={() => onPassChange("vertical")}
              className={`px-3 py-1.5 rounded transition-colors ${
                isVertical ? "bg-white text-black font-semibold shadow-sm" : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              {formatDisplayCopy("Circuit B: Vertical Pass (Row q3)")}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Quantum Circuit Diagram */}
      <div className="p-4 bg-[#0A0A0A] border border-[#272727] rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-semibold flex items-center gap-1.5" style={{ color }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            {isVertical
              ? formatDisplayCopy(
                  algorithm === "frqi"
                    ? "Circuit B: Vertical Pass (q3, q4, q5 Row Register + Hadamard on q3)"
                    : algorithm === "qpie"
                    ? "Circuit B: Vertical Pass (Stride 8 Row Shift + Hadamard on q3)"
                    : "Circuit B: Vertical Pass (Y Direction Reversible Ripple Borrow Subtractor)"
                )
              : formatDisplayCopy(
                  algorithm === "frqi"
                    ? "Circuit A: Horizontal Pass (q0, q1, q2 Column Register + Hadamard on q0)"
                    : algorithm === "qpie"
                    ? "Circuit A: Horizontal Pass (Column Amplitude Superposition + Hadamard on q0)"
                    : "Circuit A: Horizontal Pass (X Direction Reversible Ripple Borrow Subtractor)"
                )}
          </span>
          <span className="text-[#9B9B9B] text-[11px]">
            Target Interferometer: {isVertical ? "Row LSB q3" : "Column LSB q0"}
          </span>
        </div>

        {/* The Real Visual SVG Circuit */}
        <div className="overflow-x-auto py-2">
          {algorithm === "frqi" && renderFRQICircuitSVG()}
          {algorithm === "qpie" && renderQPIECircuitSVG()}
          {algorithm === "neqr" && (neqrSubView === "full" ? renderNEQR14QubitCircuitSVG() : renderQFSLogicCellSVG())}
        </div>

        {/* Quick Gate Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#222]">
          <span className="text-[11px] font-mono text-[#9B9B9B] mr-1">Select Gate:</span>
          {algorithm === "frqi" && (
            <>
              {["H", "Ry", "D8", "M"].map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedGateKey(k)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    selectedGateKey === k ? "bg-[#FF00B4] text-white font-bold shadow-md shadow-[#FF00B4]/30" : "bg-[#181818] text-[#9B9B9B] hover:text-white border border-[#313131]"
                  }`}
                >
                  [{GATE_DATABASE[k].symbol}] {GATE_DATABASE[k].name.split("(")[0]}
                </button>
              ))}
            </>
          )}

          {algorithm === "qpie" && (
            <>
              {["U_iso", "D8", "H", "M"].map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedGateKey(k)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    selectedGateKey === k ? "bg-[#00F0FF] text-black font-bold shadow-md shadow-[#00F0FF]/30" : "bg-[#181818] text-[#9B9B9B] hover:text-white border border-[#313131]"
                  }`}
                >
                  [{GATE_DATABASE[k].symbol}] {GATE_DATABASE[k].name.split("(")[0]}
                </button>
              ))}
            </>
          )}

          {algorithm === "neqr" && (
            <>
              {["H", "MC_X", "D8", "QFS", "Sign", "M"].map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedGateKey(k)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    selectedGateKey === k ? "bg-[#BD93F9] text-black font-bold shadow-md shadow-[#BD93F9]/30" : "bg-[#181818] text-[#9B9B9B] hover:text-white border border-[#313131]"
                  }`}
                >
                  [{GATE_DATABASE[k].symbol}] {GATE_DATABASE[k].name.split("(")[0]}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 3. Active Gate Inspector Drawer */}
      {selectedGate && (
        <div className="p-4 rounded-xl bg-[#1F1F1F] border border-[#313131] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-black border border-[#313131] text-xs font-mono font-bold text-white">
                {selectedGate.symbol}
              </span>
              <h4 className="text-sm font-semibold text-white">{selectedGate.name}</h4>
              <Badge label={selectedGate.stage} variant="cyan" size="xs" />
            </div>
            <button
              onClick={() => setSelectedGateKey("")}
              className="text-[#9B9B9B] hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-[#313131]">
            <div>
              <span className="text-[#9B9B9B] block mb-1">{formatDisplayCopy("Mathematical Unitary Representation:")}</span>
              <div className="p-2.5 rounded bg-[#121212] border border-[#272727] text-[#00F0FF] leading-relaxed overflow-x-auto">
                {selectedGate.unitary.includes("\\") ? (
                  <KaTeXBlock math={selectedGate.unitary} displayMode />
                ) : (
                  selectedGate.unitary
                )}
              </div>
            </div>
            <div>
              <span className="text-[#9B9B9B] block mb-1">Quantum Physical Intuition:</span>
              <p className="text-[#D1D1D1] font-sans leading-relaxed text-xs">
                {selectedGate.physicalIntuition}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
