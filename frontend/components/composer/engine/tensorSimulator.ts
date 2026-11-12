/**
 * High-Performance Client-Side Quantum Tensor Simulator (1 to 8 Qubits)
 * Computes exact statevectors, amplitudes, Born probabilities, phases,
 * partial traces (reduced density matrices), 3D Bloch vectors, and von Neumann entanglement entropy.
 */

export interface Complex {
  re: number;
  im: number;
}

export const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const cSub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
export const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re
});
export const cScale = (a: Complex, s: number): Complex => ({ re: a.re * s, im: a.im * s });
export const cMag = (a: Complex): number => Math.sqrt(a.re * a.re + a.im * a.im);
export const cPhase = (a: Complex): number => (cMag(a) < 1e-9 ? 0 : Math.atan2(a.im, a.re));

export interface GateInstance {
  id: string;
  gate: string; // "H", "X", "Y", "Z", "S", "SDG", "T", "TDG", "SX", "RX", "RY", "RZ", "P", "U3", "CX", "CY", "CZ", "CRX", "CRY", "CRZ", "CP", "SWAP", "CCX", "D_SHIFT", "QFT", "M"
  targets: number[];
  controls: number[];
  antiControls?: number[];
  params: number[]; // e.g. [theta]
}

export interface CircuitStep {
  stepIndex: number;
  gates: GateInstance[];
}

export interface StatevectorEntry {
  index: number;
  ket: string;
  decIndex: number;
  re: number;
  im: number;
  mag: number;
  prob: number;
  phaseRad: number;
}

export interface BlochVector {
  qubit: number;
  rx: number;
  ry: number;
  rz: number;
  purity: number;
  entropyBits: number;
}

export interface ButterflyTransition {
  pairKets: [string, string];
  gateApplied: string;
  equationLatex: string;
  effectType: "CONSTRUCTIVE_INTERFERENCE" | "DESTRUCTIVE_CANCELLATION" | "PHASE_ROTATION" | "BASIS_FLIP";
}

export interface MutualInfoPair {
  qubitA: number;
  qubitB: number;
  mutualInfo: number;
}

export interface StepTelemetry {
  stepIndex: number;
  desc: string;
  statevector: StatevectorEntry[];
  blochVectors: BlochVector[];
  butterflies: ButterflyTransition[];
  mutualInfoPairs: MutualInfoPair[];
}

// 2x2 Single-Qubit Unitary Matrices
export const get2x2Matrix = (gate: string, params: number[] = []): [[Complex, Complex], [Complex, Complex]] => {
  const g = gate.toUpperCase();
  const invSqrt2 = 1 / Math.SQRT2;

  switch (g) {
    case "I":
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 1, im: 0 }]
      ];
    case "X":
      return [
        [{ re: 0, im: 0 }, { re: 1, im: 0 }],
        [{ re: 1, im: 0 }, { re: 0, im: 0 }]
      ];
    case "Y":
      return [
        [{ re: 0, im: 0 }, { re: 0, im: -1 }],
        [{ re: 0, im: 1 }, { re: 0, im: 0 }]
      ];
    case "Z":
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: -1, im: 0 }]
      ];
    case "H":
      return [
        [{ re: invSqrt2, im: 0 }, { re: invSqrt2, im: 0 }],
        [{ re: invSqrt2, im: 0 }, { re: -invSqrt2, im: 0 }]
      ];
    case "S":
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 1 }]
      ];
    case "SDG":
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: -1 }]
      ];
    case "T":
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: Math.cos(Math.PI / 4), im: Math.sin(Math.PI / 4) }]
      ];
    case "TDG":
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: Math.cos(-Math.PI / 4), im: Math.sin(-Math.PI / 4) }]
      ];
    case "SX":
      return [
        [{ re: 0.5, im: 0.5 }, { re: 0.5, im: -0.5 }],
        [{ re: 0.5, im: -0.5 }, { re: 0.5, im: 0.5 }]
      ];
    case "RX": {
      const th = (params[0] ?? Math.PI / 2) / 2;
      return [
        [{ re: Math.cos(th), im: 0 }, { re: 0, im: -Math.sin(th) }],
        [{ re: 0, im: -Math.sin(th) }, { re: Math.cos(th), im: 0 }]
      ];
    }
    case "RY": {
      const th = (params[0] ?? Math.PI / 2) / 2;
      return [
        [{ re: Math.cos(th), im: 0 }, { re: -Math.sin(th), im: 0 }],
        [{ re: Math.sin(th), im: 0 }, { re: Math.cos(th), im: 0 }]
      ];
    }
    case "RZ": {
      const ph = (params[0] ?? Math.PI / 2) / 2;
      return [
        [{ re: Math.cos(-ph), im: Math.sin(-ph) }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: Math.cos(ph), im: Math.sin(ph) }]
      ];
    }
    case "P": {
      const lam = params[0] ?? Math.PI / 2;
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: Math.cos(lam), im: Math.sin(lam) }]
      ];
    }
    case "U3": {
      const th = (params[0] ?? Math.PI / 2) / 2;
      const phi = params[1] ?? 0;
      const lam = params[2] ?? 0;
      return [
        [{ re: Math.cos(th), im: 0 }, { re: -Math.cos(lam) * Math.sin(th), im: -Math.sin(lam) * Math.sin(th) }],
        [{ re: Math.cos(phi) * Math.sin(th), im: Math.sin(phi) * Math.sin(th) }, { re: Math.cos(phi + lam) * Math.cos(th), im: Math.sin(phi + lam) * Math.cos(th) }]
      ];
    }
    default:
      return [
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 1, im: 0 }]
      ];
  }
};

/**
 * Executes a full step-by-step tensor simulation for 1-to-8 qubits.
 */
export function simulateCircuitClient(
  numQubits: number,
  initialStates: string[] = [],
  steps: CircuitStep[]
): StepTelemetry[] {
  const n = Math.min(8, Math.max(1, numQubits));
  const dim = 1 << n;

  // 1. Initial Statevector |psi^(0)>
  let currentSV: Complex[] = new Array(dim).fill(null).map(() => ({ re: 0, im: 0 }));
  let initIndex = 0;
  for (let q = 0; q < n; q++) {
    const st = initialStates[q] || "|0>";
    if (st === "|1>") {
      initIndex |= 1 << q;
    }
  }
  currentSV[initIndex] = { re: 1, im: 0 };

  const timeline: StepTelemetry[] = [];

  // Helper to extract telemetry from a statevector
  const extractSnapshot = (sv: Complex[], stepIdx: number, desc: string, prevSV?: Complex[]): StepTelemetry => {
    const svEntries: StatevectorEntry[] = sv.map((c, i) => {
      const mag = cMag(c);
      const prob = mag * mag;
      const phase = cPhase(c);
      const ket = i.toString(2).padStart(n, "0");
      return {
        index: i,
        ket,
        decIndex: i,
        re: Math.round(c.re * 100000) / 100000,
        im: Math.round(c.im * 100000) / 100000,
        mag: Math.round(mag * 100000) / 100000,
        prob: Math.round(prob * 100000) / 100000,
        phaseRad: Math.round(phase * 10000) / 10000
      };
    });

    // Bloch vectors via partial trace on each single qubit
    const blochVectors: BlochVector[] = [];
    const entropies: number[] = [];

    for (let q = 0; q < n; q++) {
      let rho00 = 0;
      let rho11 = 0;
      let rho01_re = 0;
      let rho01_im = 0;

      for (let k0 = 0; k0 < dim; k0++) {
        if ((k0 & (1 << q)) === 0) {
          const k1 = k0 | (1 << q);
          const a0 = sv[k0];
          const a1 = sv[k1];

          rho00 += a0.re * a0.re + a0.im * a0.im;
          rho11 += a1.re * a1.re + a1.im * a1.im;

          // rho01 = a0 * conj(a1)
          rho01_re += a0.re * a1.re + a0.im * a1.im;
          rho01_im += a0.im * a1.re - a0.re * a1.im;
        }
      }

      const rx = 2.0 * rho01_re;
      const ry = -2.0 * rho01_im;
      const rz = rho00 - rho11;
      const normR = Math.sqrt(rx * rx + ry * ry + rz * rz);
      const purity = (1.0 + normR * normR) / 2.0;

      // Von Neumann entropy S = - lam+ log2 lam+ - lam- log2 lam-
      const lamPlus = (1.0 + Math.min(1.0, normR)) / 2.0;
      const lamMinus = (1.0 - Math.min(1.0, normR)) / 2.0;
      let ent = 0;
      if (lamPlus > 1e-12) ent -= lamPlus * Math.log2(lamPlus);
      if (lamMinus > 1e-12) ent -= lamMinus * Math.log2(lamMinus);

      blochVectors.push({
        qubit: q,
        rx: Math.round(rx * 1000) / 1000,
        ry: Math.round(ry * 1000) / 1000,
        rz: Math.round(rz * 1000) / 1000,
        purity: Math.round(purity * 1000) / 1000,
        entropyBits: Math.round(ent * 1000) / 1000
      });
      entropies.push(ent);
    }

    // Pairwise mutual information for adjacent/entangled pairs
    const mutualInfoPairs: MutualInfoPair[] = [];
    if (n >= 2) {
      for (let qa = 0; qa < n; qa++) {
        for (let qb = qa + 1; qb < n; qb++) {
          // Approximate mutual info: if both are entangled, mutual info > 0
          const entA = entropies[qa];
          const entB = entropies[qb];
          const mi = Math.min(2.0, Math.max(0, entA + entB));
          if (mi > 0.05) {
            mutualInfoPairs.push({
              qubitA: qa,
              qubitB: qb,
              mutualInfo: Math.round(mi * 100) / 100
            });
          }
        }
      }
    }

    // Butterfly transitions from prevSV
    const butterflies: ButterflyTransition[] = [];
    if (prevSV) {
      const changedIndices = [];
      for (let k = 0; k < dim; k++) {
        if (cMag(cSub(sv[k], prevSV[k])) > 1e-4) {
          changedIndices.push(k);
        }
      }

      for (let i = 0; i < Math.min(6, changedIndices.length); i += 2) {
        const ka = changedIndices[i];
        const kb = changedIndices[i + 1] ?? ka;
        const ketA = ka.toString(2).padStart(n, "0");
        const ketB = kb.toString(2).padStart(n, "0");

        const magBeforeA = cMag(prevSV[ka]);
        const magAfterA = cMag(sv[ka]);
        let effect: ButterflyTransition["effectType"] = "PHASE_ROTATION";

        if (Math.abs(magAfterA - magBeforeA) > 1e-3) {
          effect = magAfterA > magBeforeA ? "CONSTRUCTIVE_INTERFERENCE" : "DESTRUCTIVE_CANCELLATION";
        }

        butterflies.push({
          pairKets: [ketA, ketB],
          gateApplied: desc,
          equationLatex: `\\alpha_{${ketA}}^{(${stepIdx})} = ${sv[ka].re >= 0 ? "+" : ""}${sv[ka].re.toFixed(3)} ${sv[ka].im >= 0 ? "+" : ""}${sv[ka].im.toFixed(3)}i`,
          effectType: effect
        });
      }
    }

    return {
      stepIndex: stepIdx,
      desc,
      statevector: svEntries,
      blochVectors,
      butterflies,
      mutualInfoPairs
    };
  };

  // Step 0 Telemetry
  timeline.push(extractSnapshot(currentSV, 0, "Initial State |0⟩^n"));

  // Execute each time slice
  for (const step of steps) {
    const prevSV = currentSV.map((c) => ({ ...c }));
    let stepDesc = "";

    for (const g of step.gates) {
      const target = g.targets[0] ?? 0;
      const controls = g.controls ?? [];
      const antiControls = g.antiControls ?? [];
      const gateName = g.gate.toUpperCase();
      stepDesc += `${gateName} on q${target} `;

      if (gateName === "SWAP" && g.targets.length >= 2) {
        const t1 = g.targets[0];
        const t2 = g.targets[1];
        const nextSV = new Array(dim).fill(null).map(() => ({ re: 0, im: 0 }));
        for (let k = 0; k < dim; k++) {
          const b1 = (k >> t1) & 1;
          const b2 = (k >> t2) & 1;
          let swappedK = k;
          if (b1 !== b2) {
            swappedK ^= (1 << t1) | (1 << t2);
          }
          nextSV[swappedK] = currentSV[k];
        }
        currentSV = nextSV;
        continue;
      }

      // Single-qubit or controlled single-qubit butterfly update
      const u2 = get2x2Matrix(gateName, g.params);
      const nextSV = new Array(dim).fill(null).map(() => ({ re: 0, im: 0 }));

      for (let k0 = 0; k0 < dim; k0++) {
        // Look at basis state where target bit is 0
        if ((k0 & (1 << target)) === 0) {
          const k1 = k0 | (1 << target);

          // Check controls
          let active = true;
          for (const c of controls) {
            if (((k0 >> c) & 1) !== 1) {
              active = false;
              break;
            }
          }
          for (const ac of antiControls) {
            if (((k0 >> ac) & 1) !== 0) {
              active = false;
              break;
            }
          }

          if (active) {
            // Apply 2x2 butterfly
            const a0 = currentSV[k0];
            const a1 = currentSV[k1];

            // next0 = u00 * a0 + u01 * a1
            const next0 = cAdd(cMul(u2[0][0], a0), cMul(u2[0][1], a1));
            // next1 = u10 * a0 + u11 * a1
            const next1 = cAdd(cMul(u2[1][0], a0), cMul(u2[1][1], a1));

            nextSV[k0] = next0;
            nextSV[k1] = next1;
          } else {
            nextSV[k0] = currentSV[k0];
            nextSV[k1] = currentSV[k1];
          }
        }
      }
      currentSV = nextSV;
    }

    timeline.push(extractSnapshot(currentSV, step.stepIndex, stepDesc.trim() || `Step ${step.stepIndex}`, prevSV));
  }

  return timeline;
}

/**
 * Converts circuit steps into clean OpenQASM 3.0 code string.
 */
export function generateOpenQASM3(numQubits: number, steps: CircuitStep[]): string {
  const lines = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    `qubit[${numQubits}] q;`
  ];

  for (const step of steps) {
    for (const g of step.gates) {
      const name = g.gate.toLowerCase();
      const t = g.targets[0] ?? 0;
      const c = g.controls[0];

      if (g.controls && g.controls.length > 0) {
        if (g.controls.length === 1) {
          if (name === "x") lines.push(`cx q[${c}], q[${t}];`);
          else if (name === "z") lines.push(`cz q[${c}], q[${t}];`);
          else if (name === "ry") lines.push(`cry(${(g.params[0] ?? 1.57).toFixed(4)}) q[${c}], q[${t}];`);
          else if (name === "p") lines.push(`cp(${(g.params[0] ?? 1.57).toFixed(4)}) q[${c}], q[${t}];`);
        } else if (g.controls.length === 2 && name === "x") {
          lines.push(`ccx q[${g.controls[0]}], q[${g.controls[1]}], q[${t}];`);
        }
      } else {
        if (name === "ry" || name === "rx" || name === "rz" || name === "p") {
          lines.push(`${name}(${(g.params[0] ?? 1.57).toFixed(4)}) q[${t}];`);
        } else if (name === "swap" && g.targets.length >= 2) {
          lines.push(`swap q[${g.targets[0]}], q[${g.targets[1]}];`);
        } else {
          lines.push(`${name} q[${t}];`);
        }
      }
    }
  }

  return lines.join("\n");
}

/**
 * Converts circuit steps into executable Qiskit Python code string.
 */
export function generateQiskitPython(numQubits: number, steps: CircuitStep[]): string {
  const lines = [
    'from qiskit import QuantumCircuit',
    'import numpy as np',
    '',
    `qc = QuantumCircuit(${numQubits})`
  ];

  for (const step of steps) {
    lines.push(`\n# Step ${step.stepIndex}`);
    for (const g of step.gates) {
      const name = g.gate.toLowerCase();
      const t = g.targets[0] ?? 0;
      const c = g.controls[0];

      if (g.controls && g.controls.length > 0) {
        if (g.controls.length === 1) {
          if (name === "x") lines.push(`qc.cx(${c}, ${t})`);
          else if (name === "z") lines.push(`qc.cz(${c}, ${t})`);
          else if (name === "ry") lines.push(`qc.cry(${(g.params[0] ?? 1.57).toFixed(4)}, ${c}, ${t})`);
          else if (name === "p") lines.push(`qc.cp(${(g.params[0] ?? 1.57).toFixed(4)}, ${c}, ${t})`);
        } else if (g.controls.length === 2 && name === "x") {
          lines.push(`qc.ccx(${g.controls[0]}, ${g.controls[1]}, ${t})`);
        }
      } else {
        if (name === "ry" || name === "rx" || name === "rz" || name === "p") {
          lines.push(`qc.${name}(${(g.params[0] ?? 1.57).toFixed(4)}, ${t})`);
        } else if (name === "swap" && g.targets.length >= 2) {
          lines.push(`qc.swap(${g.targets[0]}, ${g.targets[1]})`);
        } else {
          lines.push(`qc.${name}(${t})`);
        }
      }
    }
  }

  return lines.join("\n");
}

