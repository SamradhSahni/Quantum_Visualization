'use client';

import React, { useState } from 'react';
import { Copy, Check, Code, Download } from 'lucide-react';
import { formatDisplayCopy } from '@/lib/copyFormatter';

interface PolyglotTranspilerDrawerProps {
  codeMap?: {
    qiskit?: string;
    pennylane?: string;
    braket?: string;
    cirq?: string;
    openqasm3?: string;
  };
}

export const PolyglotTranspilerDrawer: React.FC<PolyglotTranspilerDrawerProps> = ({ codeMap }) => {
  const [activeLang, setActiveLang] = useState<'qiskit' | 'pennylane' | 'braket' | 'cirq' | 'openqasm3'>('qiskit');
  const [copied, setCopied] = useState<boolean>(false);

  const defaultQiskit = `from qiskit import QuantumCircuit
import numpy as np

qc = QuantumCircuit(7, 7)
# 1. Spatial Superposition
for q in range(6):
    qc.h(q)

# 2. FRQI Color Rotation
qc.cry(np.pi / 3.2, 0, 6)

# 3. QHED Gradient Interference
qc.h(0)
qc.measure_all()`;

  const defaultPennyLane = `import pennylane as qml
import numpy as np

dev = qml.device('default.qubit', wires=7, shots=4096)

@qml.qnode(dev)
def quantum_edge_detector(angles):
    for w in range(6):
        qml.Hadamard(wires=w)
    qml.CRY(angles[0], wires=[0, 6])
    qml.Hadamard(wires=0)
    return qml.probs(wires=range(7))`;

  const defaultBraket = `from braket.circuits import Circuit
import numpy as np

circuit = Circuit()
for q in range(6):
    circuit.h(q)
circuit.ry(6, np.pi / 3.2)
circuit.h(0)`;

  const defaultCirq = `import cirq

qubits = [cirq.LineQubit(i) for i in range(7)]
circuit = cirq.Circuit()
circuit.append([cirq.H(q) for q in qubits[:6]])
circuit.append(cirq.ry(1.047).on(qubits[6]))
circuit.append(cirq.H(qubits[0]))`;

  const defaultQasm = `OPENQASM 3.0;
include "stdgates.inc";

qubit[7] q;
bit[7] c;

for uint i in [0:5] {
    h q[i];
}
ry(1.047) q[6];
h q[0];
c = measure q;`;

  const codeToShow =
    activeLang === 'qiskit'
      ? codeMap?.qiskit || defaultQiskit
      : activeLang === 'pennylane'
      ? codeMap?.pennylane || defaultPennyLane
      : activeLang === 'braket'
      ? codeMap?.braket || defaultBraket
      : activeLang === 'cirq'
      ? codeMap?.cirq || defaultCirq
      : codeMap?.openqasm3 || defaultQasm;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00F0FF]">
            {formatDisplayCopy("Polyglot Quantum SDK Transpiler")}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Framework Tabs */}
          <div className="flex items-center gap-1 bg-[#1F1F1F] p-0.5 rounded-lg border border-[#313131] text-xs font-mono">
            {[
              { id: 'qiskit', label: 'Qiskit 1.x' },
              { id: 'pennylane', label: 'PennyLane' },
              { id: 'braket', label: 'AWS Braket' },
              { id: 'cirq', label: 'Google Cirq' },
              { id: 'openqasm3', label: 'OpenQASM 3.0' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveLang(f.id as any)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeLang === f.id ? 'bg-[#00F0FF] text-black font-semibold' : 'text-[#9B9B9B]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2F2F2F] text-xs font-mono text-white flex items-center gap-1 border border-[#3A3A3A] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5 text-[#00F0FF]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#121212] p-4 rounded-xl border border-[#2B2B2B] max-h-60 overflow-y-auto font-mono text-xs text-[#EDEDED] leading-relaxed select-text">
        <pre>{codeToShow}</pre>
      </div>
    </div>
  );
};

