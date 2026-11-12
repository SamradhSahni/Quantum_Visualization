/**
 * Preset Famous Circuits Library for the 1-to-8 Qubit Quantum Circuit Composer
 */
import { CircuitStep } from "../engine/tensorSimulator";

export interface PresetCircuit {
  id: string;
  name: string;
  description: string;
  numQubits: number;
  steps: CircuitStep[];
}

export const FAMOUS_PRESETS: PresetCircuit[] = [
  {
    id: "bell_state",
    name: "Bell State Phi+",
    description: "Maximally entangled two-qubit EPR pair creating state (|00> + |11>) / sqrt(2). Demonstrates non-local correlation and zero single-qubit Bloch radius.",
    numQubits: 2,
    steps: [
      {
        stepIndex: 1,
        gates: [{ id: "g1", gate: "H", targets: [0], controls: [], params: [] }]
      },
      {
        stepIndex: 2,
        gates: [{ id: "g2", gate: "X", targets: [1], controls: [0], params: [] }]
      }
    ]
  },
  {
    id: "ghz_state",
    name: "GHZ 3-Qubit Entanglement",
    description: "Greenberger-Horne-Zeilinger state (|000> + |111>) / sqrt(2). Tripartite entanglement with maximum von Neumann entropy on all 3 wires.",
    numQubits: 3,
    steps: [
      {
        stepIndex: 1,
        gates: [{ id: "g1", gate: "H", targets: [0], controls: [], params: [] }]
      },
      {
        stepIndex: 2,
        gates: [{ id: "g2", gate: "X", targets: [1], controls: [0], params: [] }]
      },
      {
        stepIndex: 3,
        gates: [{ id: "g3", gate: "X", targets: [2], controls: [1], params: [] }]
      }
    ]
  },
  {
    id: "walkthrough_interference",
    name: "Phase Interference Walkthrough",
    description: "The complete 5-step concrete trace from Section 4 of the specification: Superposition -> Phase Rotation -> Multi-Qubit Entanglement -> Hadamard Interference.",
    numQubits: 3,
    steps: [
      {
        stepIndex: 1,
        gates: [
          { id: "w1_1", gate: "H", targets: [0], controls: [], params: [] },
          { id: "w1_2", gate: "H", targets: [1], controls: [], params: [] }
        ]
      },
      {
        stepIndex: 2,
        gates: [
          { id: "w2_1", gate: "P", targets: [0], controls: [], params: [Math.PI / 2] },
          { id: "w2_2", gate: "RY", targets: [1], controls: [], params: [Math.PI / 2] }
        ]
      },
      {
        stepIndex: 3,
        gates: [
          { id: "w3_1", gate: "X", targets: [1], controls: [0], params: [] },
          { id: "w3_2", gate: "X", targets: [2], controls: [0, 1], params: [] }
        ]
      },
      {
        stepIndex: 4,
        gates: [
          { id: "w4_1", gate: "H", targets: [0], controls: [], params: [] }
        ]
      }
    ]
  },
  {
    id: "frqi_4px",
    name: "FRQI 4-Pixel Crater Rim (3 Qubits)",
    description: "Flexible Representation of Quantum Images on a 2x2 crater patch. q0 and q1 represent row/col position, and q2 encodes optical intensity as rotation angle Ry(2*theta).",
    numQubits: 3,
    steps: [
      {
        stepIndex: 1,
        gates: [
          { id: "f1_1", gate: "H", targets: [0], controls: [], params: [] },
          { id: "f1_2", gate: "H", targets: [1], controls: [], params: [] }
        ]
      },
      {
        stepIndex: 2,
        gates: [
          { id: "f2_1", gate: "RY", targets: [2], controls: [], antiControls: [0, 1], params: [0.46] }
        ]
      },
      {
        stepIndex: 3,
        gates: [
          { id: "f3_1", gate: "RY", targets: [2], controls: [0], antiControls: [1], params: [2.68] }
        ]
      },
      {
        stepIndex: 4,
        gates: [
          { id: "f4_1", gate: "RY", targets: [2], controls: [1], antiControls: [0], params: [0.52] }
        ]
      },
      {
        stepIndex: 5,
        gates: [
          { id: "f5_1", gate: "RY", targets: [2], controls: [0, 1], params: [2.76] }
        ]
      },
      {
        stepIndex: 6,
        gates: [
          { id: "f6_1", gate: "H", targets: [0], controls: [], params: [] }
        ]
      }
    ]
  },
  {
    id: "qpie_4px",
    name: "QPIE 4-Pixel Crater Rim (2 Qubits)",
    description: "Quantum Probability Image Encoding: 4 pixels directly mapped into 4 complex amplitudes, followed by QHED Hadamard differentiation.",
    numQubits: 2,
    steps: [
      {
        stepIndex: 1,
        gates: [
          { id: "qp1_1", gate: "H", targets: [0], controls: [], params: [] },
          { id: "qp1_2", gate: "H", targets: [1], controls: [], params: [] }
        ]
      },
      {
        stepIndex: 2,
        gates: [
          { id: "qp2_1", gate: "RY", targets: [0], controls: [], params: [1.42] }
        ]
      },
      {
        stepIndex: 3,
        gates: [
          { id: "qp3_1", gate: "H", targets: [0], controls: [], params: [] }
        ]
      }
    ]
  },
  {
    id: "qft_3qubit",
    name: "Quantum Fourier Transform (3 Qubits)",
    description: "3-qubit discrete Quantum Fourier Transform mapping computational basis into Fourier phase basis via Hadamards and controlled phase rotations.",
    numQubits: 3,
    steps: [
      {
        stepIndex: 1,
        gates: [{ id: "qft1", gate: "H", targets: [0], controls: [], params: [] }]
      },
      {
        stepIndex: 2,
        gates: [{ id: "qft2", gate: "P", targets: [0], controls: [1], params: [Math.PI / 2] }]
      },
      {
        stepIndex: 3,
        gates: [{ id: "qft3", gate: "P", targets: [0], controls: [2], params: [Math.PI / 4] }]
      },
      {
        stepIndex: 4,
        gates: [{ id: "qft4", gate: "H", targets: [1], controls: [], params: [] }]
      },
      {
        stepIndex: 5,
        gates: [{ id: "qft5", gate: "P", targets: [1], controls: [2], params: [Math.PI / 2] }]
      },
      {
        stepIndex: 6,
        gates: [{ id: "qft6", gate: "H", targets: [2], controls: [], params: [] }]
      },
      {
        stepIndex: 7,
        gates: [{ id: "qft7", gate: "SWAP", targets: [0, 2], controls: [], params: [] }]
      }
    ]
  },
  {
    id: "neqr_subtractor",
    name: "NEQR 4-Qubit Subtractor Cell",
    description: "Reversible Quantum Full Subtractor (QFS) borrow propagation stage used in NEQR gradient arithmetic.",
    numQubits: 4,
    steps: [
      {
        stepIndex: 1,
        gates: [
          { id: "nq1", gate: "H", targets: [0], controls: [], params: [] },
          { id: "nq2", gate: "H", targets: [1], controls: [], params: [] }
        ]
      },
      {
        stepIndex: 2,
        gates: [
          { id: "nq3", gate: "X", targets: [2], controls: [0], params: [] },
          { id: "nq4", gate: "X", targets: [3], controls: [1], params: [] }
        ]
      },
      {
        stepIndex: 3,
        gates: [
          { id: "nq5", gate: "X", targets: [3], controls: [0, 2], params: [] }
        ]
      }
    ]
  }
];

