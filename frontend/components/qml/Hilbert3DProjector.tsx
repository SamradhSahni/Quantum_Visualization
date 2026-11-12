"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RotateCcw } from "lucide-react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import {
  HilbertUmapPoint,
  QcnnAnsatzId,
  QcnnClassificationData,
} from "@/lib/qmlTypes";

interface Hilbert3DProjectorProps {
  qcnn: QcnnClassificationData;
  activeAnsatz: QcnnAnsatzId;
  selectedPatchId: number;
  onSelectPatch: (patchId: number) => void;
}

const SHORT_CLASS_MAP: Record<string, string> = {
  "Primary Impact Rim": "Rim",
  "Smooth Mare Basalt": "Mare",
  "Sinuous Lunar Rille": "Rille",
  "Bright Ejecta Blanket": "Ejecta",
  "Polar Ice Cold Trap": "Ice",
};

export const Hilbert3DProjector: React.FC<Hilbert3DProjectorProps> = ({
  qcnn,
  activeAnsatz,
  selectedPatchId,
  onSelectPatch,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsGroupRef = useRef<THREE.Group | null>(null);
  const meshListRef = useRef<THREE.Mesh[]>([]);
  const animRef = useRef<number>(0);

  const camRef = useRef({ theta: 0.72, phi: 1.05, radius: 5.4 });
  const dragRef = useRef({ active: false, moved: 0, lastX: 0, lastY: 0 });

  const points: HilbertUmapPoint[] = qcnn.hilbert_umap_3d_points || [];
  const selectedPoint = useMemo(
    () => points.find((p) => p.patch_id === selectedPatchId) || points[0] || null,
    [points, selectedPatchId]
  );

  // Initialize Three.js WebGL context once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth || 300, container.clientHeight || 240);
    renderer.setClearColor(0x0b0d12, 1);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 300) / Math.max(1, container.clientHeight || 240),
      0.1,
      100
    );

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(4, 6, 5);
    scene.add(dir);

    // Wireframe Hilbert state space lattice [-2..2]^3
    const boxGeo = new THREE.BoxGeometry(3.8, 3.8, 3.8);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x262b38 });
    scene.add(new THREE.LineSegments(edgesGeo, edgesMat));
    boxGeo.dispose();

    // Coordinate axes X (<Z0>), Y (<Z1>), Z (<Z2>)
    const makeAxis = (a: [number, number, number], b: [number, number, number], hex: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...a),
        new THREE.Vector3(...b),
      ]);
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: hex })));
    };
    makeAxis([-1.9, 0, 0], [1.9, 0, 0], 0x00f0ff);
    makeAxis([0, -1.9, 0], [0, 1.9, 0], 0xff79c6);
    makeAxis([0, 0, -1.9], [0, 0, 1.9], 0x39d353);

    const ptsGroup = new THREE.Group();
    scene.add(ptsGroup);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    pointsGroupRef.current = ptsGroup;

    const resizeObs = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 240;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / Math.max(1, h);
      cameraRef.current.updateProjectionMatrix();
    });
    resizeObs.observe(container);

    const loop = () => {
      animRef.current = requestAnimationFrame(loop);
      if (!dragRef.current.active) {
        camRef.current.theta += 0.0022;
      }
      const { theta, phi, radius } = camRef.current;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObs.disconnect();
      renderer.dispose();
    };
  }, []);

  // Populate 3D Hilbert spheres when QCNN classification points or selection updates
  useEffect(() => {
    const group = pointsGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const ch = group.children.pop() as THREE.Object3D;
      group.remove(ch);
      if ((ch as THREE.Mesh).geometry) (ch as THREE.Mesh).geometry.dispose();
      if ((ch as THREE.Mesh).material) ((ch as THREE.Mesh).material as THREE.Material).dispose();
    }
    meshListRef.current = [];

    points.forEach((pt) => {
      const isSelected = pt.patch_id === selectedPatchId;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(isSelected ? 0.13 : 0.085, 14, 14),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(pt.color) })
      );
      sphere.position.set(pt.x * 0.85, pt.y * 0.85, pt.z * 0.85);
      sphere.userData = { patchId: pt.patch_id };
      group.add(sphere);
      meshListRef.current.push(sphere);

      if (isSelected) {
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.19, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        );
        halo.position.copy(sphere.position);
        group.add(halo);
      }
    });
  }, [points, selectedPatchId]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, moved: 0, lastX: e.clientX, lastY: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.moved += Math.hypot(dx, dy);
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    camRef.current.theta -= dx * 0.01;
    camRef.current.phi = Math.max(0.25, Math.min(2.85, camRef.current.phi - dy * 0.01));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const isClick = dragRef.current.active && dragRef.current.moved < 5;
    dragRef.current.active = false;
    if (!isClick || !containerRef.current || !cameraRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, cameraRef.current);
    const hits = ray.intersectObjects(meshListRef.current);
    if (hits.length > 0 && typeof hits[0].object.userData?.patchId === "number") {
      onSelectPatch(hits[0].object.userData.patchId);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    camRef.current.radius = Math.max(2.6, Math.min(10.0, camRef.current.radius + e.deltaY * 0.005));
  };

  const gram = qcnn.sample_quantum_kernel_gram || [];
  const gramLabels = qcnn.gram_labels || [];
  const segGrid = qcnn.segmentation_grid || [];
  const pauliLabels = ["<Z0>", "<Z1>", "<Z2>", "<Z3>", "<Z0 Z1>", "<Z1 Z2>"];

  return (
    <div className="space-y-4">
      {/* 3D Hilbert Cloud + 2D Spatial Segmentation Map */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="sm:col-span-3 relative h-56 rounded-xl border border-[#2B2B2B] bg-[#0B0D12] overflow-hidden">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              dragRef.current.active = false;
            }}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />
          <div className="absolute top-2 left-2 text-[10px] font-mono text-[#CCCCCC] bg-[#141414]/90 border border-[#313131] px-2 py-0.5 rounded pointer-events-none">
            {formatDisplayCopy(`3D Hilbert Cloud (${points.length} patches)`)}
          </div>
          <button
            type="button"
            onClick={() => {
              camRef.current = { theta: 0.72, phi: 1.05, radius: 5.4 };
            }}
            title="Reset 3D view"
            className="absolute top-2 right-2 p-1 rounded bg-[#141414]/90 border border-[#313131] text-[#888888] hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[9px] font-mono bg-[#141414]/90 border border-[#313131] px-2 py-0.5 rounded pointer-events-none">
            <span className="text-[#00F0FF]">X: &lt;Z0&gt;</span>
            <span className="text-[#FF79C6]">Y: &lt;Z1&gt;</span>
            <span className="text-[#39D353]">Z: &lt;Z2&gt;</span>
          </div>
        </div>

        {/* 2D Spatial QCNN Segmentation Grid (8x8 patches) */}
        <div className="sm:col-span-2 bg-[#121212] border border-[#2B2B2B] rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] mb-1.5">
            <span>{formatDisplayCopy("8x8 Class Map")}</span>
            <span className="text-[#00F0FF]">{formatDisplayCopy("Click Tile")}</span>
          </div>
          <div
            className="grid gap-0.5 flex-1 aspect-square max-h-44 mx-auto w-full"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, segGrid[0]?.length || 8)}, minmax(0, 1fr))`,
            }}
          >
            {segGrid.flat().map((cell) => {
              const active = cell.patch_id === selectedPatchId;
              return (
                <button
                  key={cell.patch_id}
                  type="button"
                  onClick={() => onSelectPatch(cell.patch_id)}
                  title={`${cell.class} (${(cell.confidence * 100).toFixed(0)}%)`}
                  className={`w-full h-full rounded-[2px] transition-transform ${
                    active ? "ring-2 ring-white scale-110 z-10" : "opacity-85 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: cell.color }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Patch Quantum Inspector + 4-Qubit Ansatz Diagram */}
      {selectedPoint && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#1F1F1F] border border-[#313131] rounded-xl p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-semibold">
                {formatDisplayCopy(`Patch #${selectedPoint.patch_id} (r=${selectedPoint.r}, c=${selectedPoint.c})`)}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded border"
                style={{
                  color: selectedPoint.color,
                  borderColor: `${selectedPoint.color}66`,
                  backgroundColor: `${selectedPoint.color}18`,
                }}
              >
                {formatDisplayCopy(selectedPoint.class)} ({(selectedPoint.confidence * 100).toFixed(0)}%)
              </span>
            </div>

            {/* 2x2 Local Intensities + 4-Qubit Ansatz Gate Schematic */}
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-1 bg-[#141414] border border-[#2A2A2A] p-1.5 rounded-lg text-center font-mono text-[10px] shrink-0">
                {selectedPoint.pixels_2x2.flat().map((px, i) => (
                  <div
                    key={i}
                    className="w-8 h-7 rounded flex items-center justify-center text-white border border-[#313131]"
                    style={{
                      backgroundColor: `rgb(${Math.round(px * 0.45)}, ${Math.round(px * 0.48)}, ${Math.round(px * 0.55)})`,
                    }}
                  >
                    {px}
                  </div>
                ))}
              </div>

              {/* Compact SVG Schematic of Active 4-Qubit Ansatz */}
              <svg viewBox="0 0 180 68" className="w-full h-16 bg-[#141414] border border-[#2A2A2A] rounded-lg">
                {[0, 1, 2, 3].map((q) => {
                  const y = 12 + q * 15;
                  return (
                    <g key={q}>
                      <line x1="8" y1={y} x2="172" y2={y} stroke="#383844" strokeWidth="1" />
                      <text x="2" y={y + 3} fill="#888888" fontSize="7" fontFamily="monospace">
                        q{q}
                      </text>
                      <rect x="20" y={y - 5} width="18" height="10" rx="2" fill="#1F1F1F" stroke="#00F0FF" strokeWidth="1" />
                      <text x="29" y={y + 2.5} textAnchor="middle" fill="#00F0FF" fontSize="6.5" fontFamily="monospace">
                        {activeAnsatz === "ISWAP_IQP_KERNEL" ? "H" : "Ry"}
                      </text>
                      <rect x="116" y={y - 5} width="20" height="10" rx="2" fill="#1F1F1F" stroke="#FFD700" strokeWidth="1" />
                      <text x="126" y={y + 2.5} textAnchor="middle" fill="#FFD700" fontSize="6.5" fontFamily="monospace">
                        Ry
                      </text>
                      <rect x="148" y={y - 5} width="16" height="10" rx="2" fill="#1F1F1F" stroke="#39D353" strokeWidth="1" />
                      <text x="156" y={y + 2.5} textAnchor="middle" fill="#39D353" fontSize="6.5" fontFamily="monospace">
                        Z
                      </text>
                    </g>
                  );
                })}
                {/* Entangler connections */}
                {activeAnsatz === "HARDWARE_EFFICIENT_LINEAR" ? (
                  <>
                    {[0, 1, 2].map((q) => (
                      <g key={q}>
                        <line x1={62 + q * 14} y1={12 + q * 15} x2={62 + q * 14} y2={27 + q * 15} stroke="#FF79C6" strokeWidth="1.2" />
                        <circle cx={62 + q * 14} cy={12 + q * 15} r="2.2" fill="#FF79C6" />
                        <circle cx={62 + q * 14} cy={27 + q * 15} r="2.2" fill="#FF79C6" />
                      </g>
                    ))}
                  </>
                ) : activeAnsatz === "ISWAP_IQP_KERNEL" ? (
                  <>
                    {[0, 1, 2].map((q) => (
                      <rect key={q} x={56 + q * 14} y={10 + q * 15} width="14" height="18" rx="2" fill="#FF79C6" fillOpacity="0.25" stroke="#FF79C6" strokeWidth="1" />
                    ))}
                  </>
                ) : (
                  <>
                    {[0, 1, 2].map((q) => (
                      <g key={q}>
                        <line x1={58 + q * 12} y1={12 + q * 15} x2={58 + q * 12} y2={27 + q * 15} stroke="#00F0FF" strokeWidth="1.1" />
                        <circle cx={58 + q * 12} cy={12 + q * 15} r="2" fill="#00F0FF" />
                        <circle cx={58 + q * 12} cy={27 + q * 15} r="3" fill="none" stroke="#00F0FF" strokeWidth="1" />
                      </g>
                    ))}
                    <line x1="98" y1="57" x2="98" y2="12" stroke="#FF79C6" strokeWidth="1.1" />
                    <circle cx="98" cy="57" r="2" fill="#FF79C6" />
                    <circle cx="98" cy="12" r="3" fill="none" stroke="#FF79C6" strokeWidth="1" />
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* 6 Pauli Expectations Bipolar Bars */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#888888] block">
              {formatDisplayCopy("Measured Pauli Expectations in [-1, +1]")}
            </span>
            {selectedPoint.pauli_z.map((val, idx) => {
              const pct = Math.abs(val) * 50;
              const isPos = val >= 0;
              return (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="w-12 text-[#A1A1A1]">{pauliLabels[idx]}</span>
                  <div className="flex-1 h-2 bg-[#141414] border border-[#2B2B2B] rounded relative overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#444450]" />
                    <div
                      className="absolute top-0 bottom-0"
                      style={{
                        left: isPos ? "50%" : `${50 - pct}%`,
                        width: `${pct}%`,
                        backgroundColor: isPos ? "#00F0FF" : "#FF79C6",
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-white">{val.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic 4x4 Quantum Kernel Gram Matrix */}
      {gram.length > 0 && (
        <div className="bg-[#1F1F1F] border border-[#313131] rounded-xl p-3">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-white font-mono">
              {formatDisplayCopy("Quantum Kernel Fidelity Matrix")} K_Q(x, x&apos;)
            </span>
            <span className="text-[10px] text-[#888888] font-mono">
              |&lt;psi(x)|psi(x&apos;)&gt;|²
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
            <div />
            {gramLabels.map((lbl, idx) => (
              <div key={idx} className="text-[#A1A1A1] truncate py-0.5">
                {SHORT_CLASS_MAP[lbl] || "Cls"}
              </div>
            ))}
            {gram.map((row, ri) => (
              <React.Fragment key={ri}>
                <div className="text-[#A1A1A1] truncate flex items-center justify-end pr-1">
                  {SHORT_CLASS_MAP[gramLabels[ri]] || "Cls"}
                </div>
                {row.map((val, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className="p-1.5 rounded border border-[#2A2A2A] font-semibold"
                    style={{
                      backgroundColor: `rgba(0, 240, 255, ${0.06 + val * 0.34})`,
                      color: val > 0.7 ? "#FFFFFF" : "#A1A1A1",
                    }}
                  >
                    {val.toFixed(2)}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

