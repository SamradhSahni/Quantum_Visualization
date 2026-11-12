"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  Compass,
  Crosshair,
  Eye,
  Grid,
  Layers,
  MapPin,
  Mountain,
  RotateCcw,
  Tag,
} from "lucide-react";
import { formatDisplayCopy } from "@/lib/copyFormatter";
import {
  CraterRecord,
  LandingZoneEvaluation,
  TerrainShaderMode,
  TransectSample,
} from "@/lib/gisTypes";

interface ThreeLunarTerrainProps {
  heightsGrid?: number[][];
  lommelGrid?: number[][];
  slopeGrid?: number[][];
  psrGrid?: number[][];
  quantumEdgesGrid?: number[][];
  edgeOverlayColor?: string;
  edgeThreshold?: number;
  verticalExaggeration?: number;
  showEdgeOverlay?: boolean;
  shaderMode?: TerrainShaderMode;
  onShaderModeChange?: (mode: TerrainShaderMode) => void;
  betaCritDeg?: number;
  minElevationM?: number;
  maxElevationM?: number;
  landingZones?: LandingZoneEvaluation[];
  activeLandingEval?: LandingZoneEvaluation | null;
  transectSamples?: TransectSample[];
  selectedCrater?: CraterRecord | null;
  onSelectTerrainCoord?: (xPx: number, yPx: number) => void;
  presetName?: string;
  isLoading?: boolean;
}

interface ProjectedTagItem {
  id: string;
  worldX: number;
  worldY: number;
  worldZ: number;
  text: string;
  color: string;
  variant: "zone" | "probe" | "waypoint" | "crater";
  coord?: { x_px: number; y_px: number };
}

const WORLD_SPAN = 100.0;
const RELIEF_WORLD_HEIGHT = 12.5;

const SHADER_MODE_INT: Record<TerrainShaderMode, number> = {
  lommel: 0,
  elevation: 1,
  slope_hazard: 2,
  psr: 3,
  quantum_edge: 4,
};

function hexToThreeColor(hex: string): THREE.Color {
  try {
    return new THREE.Color(hex);
  } catch {
    return new THREE.Color("#FF79C6");
  }
}

function generateFallbackGrid(res = 48): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < res; r++) {
    const row: number[] = [];
    for (let c = 0; c < res; c++) {
      const dx = c - res / 2;
      const dy = r - res / 2;
      const dist = Math.sqrt(dx * dx + dy * dy) / (res / 2);
      let h = 0;
      if (dist >= 0.35) {
        h = 900 * Math.exp(-Math.pow((dist - 0.35) / 0.25, 1.5));
      } else {
        const nr = dist / 0.35;
        h = -1400 + 2300 * Math.pow(nr, 2.2) + 550 * Math.exp(-Math.pow(dist / 0.08, 2));
      }
      row.push(h);
    }
    grid.push(row);
  }
  return grid;
}

const TERRAIN_VERTEX_SHADER = `
  attribute float aElevM;
  varying vec2 vUv;
  varying vec3 vNormalDir;
  varying float vElevM;
  varying float vWorldY;

  void main() {
    vUv = uv;
    vNormalDir = normalize(normal);
    vElevM = aElevM;
    vWorldY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TERRAIN_FRAGMENT_SHADER = `
  uniform sampler2D uDataTex;
  uniform int uShaderMode;
  uniform float uMinElev;
  uniform float uMaxElev;
  uniform float uBetaCrit;
  uniform float uEdgeThresh;
  uniform vec3 uEdgeColor;
  uniform float uShowEdges;
  uniform float uShowContours;
  uniform float uShowGrid;
  uniform vec2 uGridCount;

  varying vec2 vUv;
  varying vec3 vNormalDir;
  varying float vElevM;
  varying float vWorldY;

  vec3 elevationRamp(float t) {
    float c = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.11, 0.19, 0.48); // Deep crater floor blue
    vec3 c1 = vec3(0.08, 0.48, 0.62); // Lower basin teal
    vec3 c2 = vec3(0.46, 0.56, 0.45); // Flat mare olive sand
    vec3 c3 = vec3(0.84, 0.58, 0.20); // Uplands amber ochre
    vec3 c4 = vec3(0.95, 0.96, 0.98); // Rim peak crest white
    if (c < 0.25) return mix(c0, c1, c / 0.25);
    if (c < 0.52) return mix(c1, c2, (c - 0.25) / 0.27);
    if (c < 0.80) return mix(c2, c3, (c - 0.52) / 0.28);
    return mix(c3, c4, (c - 0.80) / 0.20);
  }

  void main() {
    vec4 data = texture2D(uDataTex, vUv);
    float lum = data.r;
    float slopeDeg = data.g * 45.0;
    float psr = data.b;
    float qEdge = data.a;

    // 3D sculpted studio key + cool rim hillshade so relief stays legible in every shader mode
    vec3 n = normalize(vNormalDir);
    vec3 keyDir = normalize(vec3(0.62, 0.72, 0.48));
    vec3 fillDir = normalize(vec3(-0.55, 0.40, -0.50));
    float diffKey = max(0.0, dot(n, keyDir));
    float diffFill = max(0.0, dot(n, fillDir));
    float studioShade = 0.42 + 0.52 * diffKey + 0.16 * diffFill;

    float elevSpan = max(1.0, uMaxElev - uMinElev);
    float tElev = clamp((vElevM - uMinElev) / elevSpan, 0.0, 1.0);

    vec3 baseCol = vec3(0.5);

    if (uShaderMode == 0) {
      // Lommel-Seeliger Photometry + PSR ambient cooling
      vec3 sunlit = vec3(0.24 + pow(max(0.03, lum), 0.78) * 0.72);
      sunlit *= vec3(0.97, 0.98, 1.02);
      vec3 shadowTint = vec3(0.11, 0.16, 0.28) * (0.65 + 0.35 * diffFill);
      baseCol = mix(sunlit * (0.68 + 0.32 * studioShade), shadowTint, step(0.5, psr));
    } else if (uShaderMode == 1) {
      // Hypsometric Elevation Ramp sculpted with hillshade
      baseCol = elevationRamp(tElev) * studioShade;
    } else if (uShaderMode == 2) {
      // Lander Slope Limit Trafficability sculpted with hillshade
      vec3 safeC = vec3(0.20, 0.82, 0.36);
      vec3 warnC = vec3(0.98, 0.78, 0.14);
      vec3 abortC = vec3(0.93, 0.24, 0.24);
      vec3 hazardCol;
      if (slopeDeg <= uBetaCrit * 0.65) {
        hazardCol = mix(safeC * 0.85, safeC, slopeDeg / max(0.1, uBetaCrit * 0.65));
      } else if (slopeDeg <= uBetaCrit) {
        hazardCol = mix(safeC, warnC, (slopeDeg - uBetaCrit * 0.65) / max(0.1, uBetaCrit * 0.35));
      } else {
        hazardCol = mix(warnC, abortC, clamp((slopeDeg - uBetaCrit) / max(1.0, uBetaCrit * 0.7), 0.0, 1.0));
      }
      baseCol = hazardCol * (0.58 + 0.42 * studioShade);
    } else if (uShaderMode == 3) {
      // PSR Cold Traps (< 110K) highlighted over shaded topography
      vec3 regolith = vec3(0.26 + lum * 0.56) * studioShade;
      vec3 iceTrap = vec3(0.04, 0.84, 0.98) * (0.72 + 0.28 * diffFill);
      baseCol = mix(regolith, iceTrap, step(0.5, psr));
    } else {
      // Quantum Edge mode: keep 3D topography crisp in steel-slate while glowing detected edges
      vec3 topoSlate = mix(vec3(0.16, 0.20, 0.28), vec3(0.36, 0.42, 0.54), tElev) * studioShade;
      float edgeGlow = smoothstep(uEdgeThresh * 0.45, 0.85, qEdge);
      baseCol = mix(topoSlate, uEdgeColor * 1.15, clamp(edgeGlow * 1.15, 0.0, 1.0));
    }

    // Crisp anti-aliased Iso-Elevation Contours every 200 m (major line every 1000 m)
    if (uShowContours > 0.5) {
      float minorStep = vElevM / 200.0;
      float minorDist = abs(fract(minorStep - 0.5) - 0.5) / max(0.0001, fwidth(minorStep));
      float minorLine = 1.0 - smoothstep(0.0, 1.35, minorDist);

      float majorStep = vElevM / 1000.0;
      float majorDist = abs(fract(majorStep - 0.5) - 0.5) / max(0.0001, fwidth(majorStep));
      float majorLine = 1.0 - smoothstep(0.0, 1.85, majorDist);

      baseCol = mix(baseCol, baseCol * 0.55 + vec3(0.12, 0.16, 0.22), minorLine * 0.45);
      baseCol = mix(baseCol, vec3(0.95, 0.97, 1.0), majorLine * 0.55);
    }

    // Surface Metric Coordinate Grid projected cleanly onto terrain
    if (uShowGrid > 0.5) {
      vec2 coord = vUv * 12.0;
      vec2 grid = abs(fract(coord - 0.5) - 0.5) / max(vec2(0.0001), fwidth(coord));
      float line = 1.0 - min(min(grid.x, grid.y), 1.0);
      baseCol = mix(baseCol, vec3(0.55, 0.72, 0.88), line * 0.20);
    }

    // Quantum Edge Overlay Draping across other analytical shaders
    if (uShowEdges > 0.5 && uShaderMode != 4 && qEdge >= uEdgeThresh) {
      float intensity = clamp((qEdge - uEdgeThresh) / max(0.1, 1.0 - uEdgeThresh), 0.0, 1.0);
      baseCol = mix(baseCol, uEdgeColor, 0.45 + 0.50 * intensity);
    }

    gl_FragColor = vec4(clamp(baseCol, 0.0, 1.0), 1.0);
  }
`;

export const ThreeLunarTerrain: React.FC<ThreeLunarTerrainProps> = ({
  heightsGrid,
  lommelGrid,
  slopeGrid,
  psrGrid,
  quantumEdgesGrid,
  edgeOverlayColor = "#FF79C6",
  edgeThreshold = 0.22,
  verticalExaggeration = 2.5,
  showEdgeOverlay = true,
  shaderMode = "lommel",
  onShaderModeChange,
  betaCritDeg = 8.5,
  minElevationM,
  maxElevationM,
  landingZones = [],
  activeLandingEval = null,
  transectSamples = [],
  selectedCrater = null,
  onSelectTerrainCoord,
  presetName = "Apollo 16 Descartes",
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelDomRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const skirtMeshRef = useRef<THREE.Mesh | null>(null);
  const pedestalRef = useRef<THREE.Mesh | null>(null);
  const overlayGroupRef = useRef<THREE.Group | null>(null);
  const dataTexRef = useRef<THREE.DataTexture | null>(null);
  const animFrameRef = useRef<number>(0);

  // Current vs target spherical camera for smooth preset glides
  const camCurrRef = useRef({ theta: 0.70, phi: 0.90, radius: 124.0, tx: 0, ty: 0, tz: 0 });
  const camGoalRef = useRef({ theta: 0.70, phi: 0.90, radius: 124.0, tx: 0, ty: 0, tz: 0 });
  const dragRef = useRef({ active: false, moved: 0, lastX: 0, lastY: 0, mode: "orbit" as "orbit" | "pan" });
  const projectedItemsRef = useRef<ProjectedTagItem[]>([]);

  const [webglError, setWebglError] = useState<string | null>(null);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showSurfaceGrid, setShowSurfaceGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [hoverProbe, setHoverProbe] = useState<{
    x: number;
    y: number;
    elev: number;
    slope: number;
    qEdge: number;
    psr: boolean;
  } | null>(null);
  const [cameraAngles, setCameraAngles] = useState({ az: 40, el: 38 });

  const activeHeights = useMemo(
    () => (heightsGrid && heightsGrid.length >= 8 ? heightsGrid : generateFallbackGrid(48)),
    [heightsGrid]
  );

  const rows = activeHeights.length;
  const cols = activeHeights[0]?.length || 1;

  const elevStats = useMemo(() => {
    let lo = typeof minElevationM === "number" ? minElevationM : Infinity;
    let hi = typeof maxElevationM === "number" ? maxElevationM : -Infinity;
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) {
      lo = Infinity;
      hi = -Infinity;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = activeHeights[r][c];
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
      }
    }
    const mid = 0.5 * (lo + hi);
    const span = Math.max(800.0, hi - lo);
    return { min: lo, max: Math.max(lo + 1, hi), mid, span };
  }, [activeHeights, rows, cols, minElevationM, maxElevationM]);

  const toWorldX = (xPx: number) => (xPx / Math.max(1, cols - 1) - 0.5) * WORLD_SPAN;
  const toWorldZ = (yPx: number) => (yPx / Math.max(1, rows - 1) - 0.5) * WORLD_SPAN;
  const toWorldY = (elevM: number) =>
    ((elevM - elevStats.mid) / elevStats.span) * RELIEF_WORLD_HEIGHT * verticalExaggeration;

  const sampleWorldY = (xPx: number, yPx: number) => {
    const r = Math.max(0, Math.min(rows - 1, Math.round(yPx)));
    const c = Math.max(0, Math.min(cols - 1, Math.round(xPx)));
    return toWorldY(activeHeights[r][c] || 0);
  };

  // Build projected badge descriptors for HTML overlay pins
  const projectedTags = useMemo<ProjectedTagItem[]>(() => {
    if (!showLabels) return [];
    const items: ProjectedTagItem[] = [];

    landingZones.forEach((z) => {
      const shortStatus =
        z.status === "CERTIFIED_SAFE" ? "Safe" : z.status === "MARGINAL_CAUTION" ? "Warn" : "Abort";
      items.push({
        id: `zone_${z.rank}_${z.coord.x_px}_${z.coord.y_px}`,
        worldX: toWorldX(z.coord.x_px),
        worldY: sampleWorldY(z.coord.x_px, z.coord.y_px) + 5.8,
        worldZ: toWorldZ(z.coord.y_px),
        text: `#${z.rank} ${shortStatus} | ${z.landing_safety_index}`,
        color: z.status_color,
        variant: "zone",
        coord: z.coord,
      });
    });

    if (activeLandingEval) {
      const alreadyListed = landingZones.some(
        (z) => z.coord.x_px === activeLandingEval.coord.x_px && z.coord.y_px === activeLandingEval.coord.y_px
      );
      if (!alreadyListed) {
        items.push({
          id: "active_probe",
          worldX: toWorldX(activeLandingEval.coord.x_px),
          worldY: sampleWorldY(activeLandingEval.coord.x_px, activeLandingEval.coord.y_px) + 6.8,
          worldZ: toWorldZ(activeLandingEval.coord.y_px),
          text: `Probe | LSI ${activeLandingEval.landing_safety_index}`,
          color: "#00F0FF",
          variant: "probe",
        });
      }
    }

    if (transectSamples && transectSamples.length >= 2) {
      const pA = transectSamples[0];
      const pB = transectSamples[transectSamples.length - 1];
      const distEnd = pB.dist_km ?? 0;
      items.push({
        id: "waypoint_a",
        worldX: toWorldX(pA.x_px),
        worldY: sampleWorldY(pA.x_px, pA.y_px) + 3.4,
        worldZ: toWorldZ(pA.y_px),
        text: "A Start",
        color: "#39D353",
        variant: "waypoint",
      });
      items.push({
        id: "waypoint_b",
        worldX: toWorldX(pB.x_px),
        worldY: sampleWorldY(pB.x_px, pB.y_px) + 3.4,
        worldZ: toWorldZ(pB.y_px),
        text: `B (${distEnd} km)`,
        color: "#FFD700",
        variant: "waypoint",
      });
    }

    if (selectedCrater) {
      items.push({
        id: `crater_${selectedCrater.crater_id}`,
        worldX: toWorldX(selectedCrater.center_x_px),
        worldY: sampleWorldY(selectedCrater.center_x_px, selectedCrater.center_y_px) + 4.5,
        worldZ: toWorldZ(selectedCrater.center_y_px),
        text: `${selectedCrater.crater_id} | D ${selectedCrater.diameter_km} km`,
        color: "#FFD700",
        variant: "crater",
      });
    }

    return items;
  }, [landingZones, activeLandingEval, transectSamples, selectedCrater, showLabels, activeHeights, verticalExaggeration]);

  useEffect(() => {
    projectedItemsRef.current = projectedTags;
  }, [projectedTags]);

  // Initialize Three.js WebGL context once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setWebglError("WebGL hardware context unavailable in browser");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth || 640, container.clientHeight || 540);
    renderer.setClearColor(0x080a0f, 1);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080a0f, 0.0014);

    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 640) / Math.max(1, container.clientHeight || 540),
      0.5,
      650
    );

    const overlayGroup = new THREE.Group();
    scene.add(overlayGroup);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    overlayGroupRef.current = overlayGroup;

    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 540;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / Math.max(1, h);
      cameraRef.current.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    const tempVec = new THREE.Vector3();

    const renderLoop = () => {
      animFrameRef.current = requestAnimationFrame(renderLoop);

      // Smoothly ease camera parameters toward goal
      const c = camCurrRef.current;
      const g = camGoalRef.current;
      const lerpF = dragRef.current.active ? 0.55 : 0.14;
      c.theta += (g.theta - c.theta) * lerpF;
      c.phi += (g.phi - c.phi) * lerpF;
      c.radius += (g.radius - c.radius) * lerpF;
      c.tx += (g.tx - c.tx) * lerpF;
      c.ty += (g.ty - c.ty) * lerpF;
      c.tz += (g.tz - c.tz) * lerpF;

      camera.position.set(
        c.tx + c.radius * Math.sin(c.phi) * Math.sin(c.theta),
        c.ty + c.radius * Math.cos(c.phi),
        c.tz + c.radius * Math.sin(c.phi) * Math.cos(c.theta)
      );
      camera.lookAt(c.tx, c.ty, c.tz);
      renderer.render(scene, camera);

      // Project 3D label pins onto viewport DOM elements without triggering React re-renders
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 540;
      projectedItemsRef.current.forEach((item) => {
        const el = labelDomRefs.current[item.id];
        if (!el) return;
        tempVec.set(item.worldX, item.worldY, item.worldZ).project(camera);
        if (tempVec.z > 1.0 || tempVec.z < -1.0) {
          el.style.opacity = "0";
          return;
        }
        const sx = (tempVec.x * 0.5 + 0.5) * w;
        const sy = (-tempVec.y * 0.5 + 0.5) * h;
        if (sx < -40 || sx > w + 40 || sy < -20 || sy > h + 20) {
          el.style.opacity = "0";
        } else {
          el.style.opacity = "1";
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        }
      });
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      if (terrainMeshRef.current) {
        terrainMeshRef.current.geometry.dispose();
        (terrainMeshRef.current.material as THREE.Material).dispose();
      }
      if (skirtMeshRef.current) {
        skirtMeshRef.current.geometry.dispose();
        (skirtMeshRef.current.material as THREE.Material).dispose();
      }
      if (pedestalRef.current) {
        pedestalRef.current.geometry.dispose();
        (pedestalRef.current.material as THREE.Material).dispose();
      }
      if (dataTexRef.current) {
        dataTexRef.current.dispose();
      }
      renderer.dispose();
    };
  }, []);

  // Build / Update Terrain Shader Mesh, DataTexture, Geological Cutaway Block & Pedestal
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const numVerts = rows * cols;
    const positions = new Float32Array(numVerts * 3);
    const uvs = new Float32Array(numVerts * 2);
    const elevAttr = new Float32Array(numVerts);
    const texBytes = new Uint8Array(numVerts * 4);

    let minWorldY = Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const hVal = activeHeights[r][c] || 0;
        const wy = toWorldY(hVal);
        if (wy < minWorldY) minWorldY = wy;

        positions[idx * 3] = toWorldX(c);
        positions[idx * 3 + 1] = wy;
        positions[idx * 3 + 2] = toWorldZ(r);

        uvs[idx * 2] = (c + 0.5) / cols;
        uvs[idx * 2 + 1] = (r + 0.5) / rows;
        elevAttr[idx] = hVal;

        const lum = Math.max(0, Math.min(1, lommelGrid?.[r]?.[c] ?? 0.55));
        const slope = Math.max(0, Math.min(45, slopeGrid?.[r]?.[c] ?? 4.0));
        const psr = (psrGrid?.[r]?.[c] ?? 0) === 1 ? 255 : 0;
        const qEdge = Math.max(0, Math.min(1, quantumEdgesGrid?.[r]?.[c] ?? 0));

        texBytes[idx * 4] = Math.round(lum * 255);
        texBytes[idx * 4 + 1] = Math.round((slope / 45.0) * 255);
        texBytes[idx * 4 + 2] = psr;
        texBytes[idx * 4 + 3] = Math.round(qEdge * 255);
      }
    }

    const indices: number[] = [];
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c;
        const b = a + 1;
        const d = (r + 1) * cols + c;
        const e = d + 1;
        indices.push(a, d, b, b, d, e);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute("aElevM", new THREE.BufferAttribute(elevAttr, 1));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    if (dataTexRef.current) {
      dataTexRef.current.dispose();
    }
    const dataTex = new THREE.DataTexture(texBytes, cols, rows, THREE.RGBAFormat, THREE.UnsignedByteType);
    dataTex.minFilter = THREE.LinearFilter;
    dataTex.magFilter = THREE.LinearFilter;
    dataTex.wrapS = THREE.ClampToEdgeWrapping;
    dataTex.wrapT = THREE.ClampToEdgeWrapping;
    dataTex.needsUpdate = true;
    dataTexRef.current = dataTex;

    const edgeColorVec = hexToThreeColor(edgeOverlayColor);
    const shaderUniforms = {
      uDataTex: { value: dataTex },
      uShaderMode: { value: SHADER_MODE_INT[shaderMode] },
      uMinElev: { value: elevStats.min },
      uMaxElev: { value: elevStats.max },
      uBetaCrit: { value: betaCritDeg },
      uEdgeThresh: { value: edgeThreshold },
      uEdgeColor: { value: new THREE.Vector3(edgeColorVec.r, edgeColorVec.g, edgeColorVec.b) },
      uShowEdges: { value: showEdgeOverlay ? 1.0 : 0.0 },
      uShowContours: { value: showContours ? 1.0 : 0.0 },
      uShowGrid: { value: showSurfaceGrid ? 1.0 : 0.0 },
      uGridCount: { value: new THREE.Vector2(cols, rows) },
    };

    if (!terrainMeshRef.current) {
      const mat = new THREE.ShaderMaterial({
        uniforms: shaderUniforms,
        vertexShader: TERRAIN_VERTEX_SHADER,
        fragmentShader: TERRAIN_FRAGMENT_SHADER,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, mat);
      scene.add(mesh);
      terrainMeshRef.current = mesh;
    } else {
      terrainMeshRef.current.geometry.dispose();
      terrainMeshRef.current.geometry = geometry;
      const mat = terrainMeshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uDataTex.value = dataTex;
      mat.uniforms.uShaderMode.value = SHADER_MODE_INT[shaderMode];
      mat.uniforms.uMinElev.value = elevStats.min;
      mat.uniforms.uMaxElev.value = elevStats.max;
      mat.uniforms.uBetaCrit.value = betaCritDeg;
      mat.uniforms.uEdgeThresh.value = edgeThreshold;
      mat.uniforms.uEdgeColor.value.set(edgeColorVec.r, edgeColorVec.g, edgeColorVec.b);
      mat.uniforms.uShowEdges.value = showEdgeOverlay ? 1.0 : 0.0;
      mat.uniforms.uShowContours.value = showContours ? 1.0 : 0.0;
      mat.uniforms.uShowGrid.value = showSurfaceGrid ? 1.0 : 0.0;
    }

    // Build Solid 3D Geological Cutaway Skirt Block around all 4 DEM boundaries down to pedestal baseY
    const baseY = minWorldY - 4.5;
    const skirtPos: number[] = [];
    const skirtCol: number[] = [];
    const pushQuad = (
      x0: number, y0: number, z0: number,
      x1: number, y1: number, z1: number,
      shade: number
    ) => {
      // Top-left, Bottom-left, Top-right | Top-right, Bottom-left, Bottom-right
      skirtPos.push(
        x0, y0, z0, x0, baseY, z0, x1, y1, z1,
        x1, y1, z1, x0, baseY, z0, x1, baseY, z1
      );
      const topC = 0.20 * shade;
      const botC = 0.08 * shade;
      skirtCol.push(
        topC, topC + 0.03, topC + 0.07,
        botC, botC + 0.02, botC + 0.05,
        topC, topC + 0.03, topC + 0.07,
        topC, topC + 0.03, topC + 0.07,
        botC, botC + 0.02, botC + 0.05,
        botC, botC + 0.02, botC + 0.05
      );
    };

    for (let c = 0; c < cols - 1; c++) {
      // North edge (r = 0) & South edge (r = rows - 1)
      pushQuad(
        toWorldX(c), toWorldY(activeHeights[0][c]), toWorldZ(0),
        toWorldX(c + 1), toWorldY(activeHeights[0][c + 1]), toWorldZ(0),
        0.85
      );
      pushQuad(
        toWorldX(c + 1), toWorldY(activeHeights[rows - 1][c + 1]), toWorldZ(rows - 1),
        toWorldX(c), toWorldY(activeHeights[rows - 1][c]), toWorldZ(rows - 1),
        1.10
      );
    }
    for (let r = 0; r < rows - 1; r++) {
      // West edge (c = 0) & East edge (c = cols - 1)
      pushQuad(
        toWorldX(0), toWorldY(activeHeights[r + 1][0]), toWorldZ(r + 1),
        toWorldX(0), toWorldY(activeHeights[r][0]), toWorldZ(r),
        0.95
      );
      pushQuad(
        toWorldX(cols - 1), toWorldY(activeHeights[r][cols - 1]), toWorldZ(r),
        toWorldX(cols - 1), toWorldY(activeHeights[r + 1][cols - 1]), toWorldZ(r + 1),
        1.05
      );
    }

    const skirtGeo = new THREE.BufferGeometry();
    skirtGeo.setAttribute("position", new THREE.Float32BufferAttribute(skirtPos, 3));
    skirtGeo.setAttribute("color", new THREE.Float32BufferAttribute(skirtCol, 3));
    if (!skirtMeshRef.current) {
      const sMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
      const sMesh = new THREE.Mesh(skirtGeo, sMat);
      scene.add(sMesh);
      skirtMeshRef.current = sMesh;
    } else {
      skirtMeshRef.current.geometry.dispose();
      skirtMeshRef.current.geometry = skirtGeo;
    }

    // Grounded Slab Pedestal under Cutaway Block
    if (!pedestalRef.current) {
      const pGeo = new THREE.PlaneGeometry(WORLD_SPAN, WORLD_SPAN);
      pGeo.rotateX(-Math.PI / 2);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x0f131b, side: THREE.DoubleSide });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      scene.add(pMesh);
      pedestalRef.current = pMesh;
    }
    pedestalRef.current.position.y = baseY;
  }, [
    activeHeights,
    lommelGrid,
    slopeGrid,
    psrGrid,
    quantumEdgesGrid,
    rows,
    cols,
    elevStats,
    verticalExaggeration,
    shaderMode,
    betaCritDeg,
    showEdgeOverlay,
    edgeOverlayColor,
    edgeThreshold,
    showContours,
    showSurfaceGrid,
  ]);

  // Rebuild 3D Overlays: Compact Beacons, Scaled Footprint Rings, Rover Ribbon, Crater Ellipse
  useEffect(() => {
    const group = overlayGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children.pop() as THREE.Object3D;
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    }

    // 1. Touchdown Zones Beacons & Scaled Footprint Rings
    landingZones.forEach((zone) => {
      const wx = toWorldX(zone.coord.x_px);
      const wz = toWorldZ(zone.coord.y_px);
      const wy = sampleWorldY(zone.coord.x_px, zone.coord.y_px);
      const colorHex = new THREE.Color(zone.status_color || "#39D353");

      const ringPts: THREE.Vector3[] = [];
      const rad = Math.max(1.8, zone.footprint_radius_px || 2);
      for (let i = 0; i <= 36; i++) {
        const th = (i / 36) * Math.PI * 2;
        const px = Math.max(0, Math.min(cols - 1, zone.coord.x_px + rad * Math.cos(th)));
        const py = Math.max(0, Math.min(rows - 1, zone.coord.y_px + rad * Math.sin(th)));
        ringPts.push(new THREE.Vector3(toWorldX(px), sampleWorldY(px, py) + 0.35, toWorldZ(py)));
      }
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(ringPts),
          new THREE.LineBasicMaterial({ color: colorHex })
        )
      );

      // Sleek pin mast anchored into terrain
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 4.6, 8),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      mast.position.set(wx, wy + 2.3, wz);
      group.add(mast);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 12, 12),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      head.position.set(wx, wy + 4.8, wz);
      group.add(head);
    });

    // 2. Active Selected / Custom Click Probe Reticle
    if (activeLandingEval) {
      const ax = activeLandingEval.coord.x_px;
      const ay = activeLandingEval.coord.y_px;
      const wx = toWorldX(ax);
      const wz = toWorldZ(ay);
      const wy = sampleWorldY(ax, ay);

      const probePts: THREE.Vector3[] = [];
      const rad = Math.max(2.0, activeLandingEval.footprint_radius_px || 3);
      for (let i = 0; i <= 40; i++) {
        const th = (i / 40) * Math.PI * 2;
        const px = Math.max(0, Math.min(cols - 1, ax + rad * Math.cos(th)));
        const py = Math.max(0, Math.min(rows - 1, ay + rad * Math.sin(th)));
        probePts.push(new THREE.Vector3(toWorldX(px), sampleWorldY(px, py) + 0.5, toWorldZ(py)));
      }
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(probePts),
          new THREE.LineBasicMaterial({ color: 0x00f0ff })
        )
      );

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 2.4, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      cone.rotation.x = Math.PI;
      cone.position.set(wx, wy + 6.2, wz);
      group.add(cone);
    }

    // 3. 3D Rover Traverse Path Ribbon
    if (transectSamples && transectSamples.length >= 2) {
      const pathPos: number[] = [];
      const pathCol: number[] = [];
      transectSamples.forEach((pt) => {
        pathPos.push(toWorldX(pt.x_px), sampleWorldY(pt.x_px, pt.y_px) + 0.55, toWorldZ(pt.y_px));
        const haz = pt.quantum_edge_prob >= 0.45 || Math.abs(pt.slope_deg) >= 15.0;
        if (haz) {
          pathCol.push(1.0, 0.27, 0.23);
        } else {
          pathCol.push(0.0, 0.94, 1.0);
        }
      });
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(pathPos, 3));
      lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(pathCol, 3));
      group.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

      const pA = transectSamples[0];
      const pB = transectSamples[transectSamples.length - 1];
      const dotA = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x39d353 })
      );
      dotA.position.set(toWorldX(pA.x_px), sampleWorldY(pA.x_px, pA.y_px) + 1.0, toWorldZ(pA.y_px));
      group.add(dotA);

      const dotB = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
      );
      dotB.position.set(toWorldX(pB.x_px), sampleWorldY(pB.x_px, pB.y_px) + 1.0, toWorldZ(pB.y_px));
      group.add(dotB);
    }

    // 4. Selected Fitzgibbon Crater Ellipse
    if (selectedCrater) {
      const a = selectedCrater.semi_major_px || 10;
      const b = selectedCrater.semi_minor_px || a * (1 - (selectedCrater.ellipticity || 0));
      const phiRad = ((selectedCrater.orientation_deg || 0) * Math.PI) / 180;
      const elPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 48; i++) {
        const th = (i / 48) * Math.PI * 2;
        const lx = a * Math.cos(th);
        const ly = b * Math.sin(th);
        const rx = lx * Math.cos(phiRad) - ly * Math.sin(phiRad);
        const ry = lx * Math.sin(phiRad) + ly * Math.cos(phiRad);
        const px = Math.max(0, Math.min(cols - 1, selectedCrater.center_x_px + rx));
        const py = Math.max(0, Math.min(rows - 1, selectedCrater.center_y_px + ry));
        elPts.push(new THREE.Vector3(toWorldX(px), sampleWorldY(px, py) + 0.75, toWorldZ(py)));
      }
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(elPts),
          new THREE.LineBasicMaterial({ color: 0xffd700 })
        )
      );
    }
  }, [landingZones, activeLandingEval, transectSamples, selectedCrater, activeHeights, rows, cols, verticalExaggeration, elevStats]);

  // Draw Synchronized 2D Nadir Planimetric Minimap
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas || !showMinimap) return;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) * 4;
        const lum = lommelGrid?.[r]?.[c] ?? 0.5;
        const qEdge = quantumEdgesGrid?.[r]?.[c] ?? 0;
        const psr = (psrGrid?.[r]?.[c] ?? 0) === 1;
        const tE = (activeHeights[r][c] - elevStats.min) / Math.max(1, elevStats.max - elevStats.min);

        let R = Math.round(35 + tE * 130);
        let G = Math.round(45 + tE * 130);
        let B = Math.round(65 + tE * 110);

        if (shaderMode === "lommel") {
          const g = Math.round(30 + lum * 200);
          R = psr ? 22 : g;
          G = psr ? 32 : g;
          B = psr ? 58 : g + 6;
        } else if (shaderMode === "psr" && psr) {
          R = 10;
          G = 200;
          B = 240;
        } else if (shaderMode === "slope_hazard") {
          const sl = slopeGrid?.[r]?.[c] ?? 0;
          if (sl <= betaCritDeg * 0.65) {
            R = 50; G = 195; B = 90;
          } else if (sl <= betaCritDeg) {
            R = 240; G = 195; B = 35;
          } else {
            R = 230; G = 60; B = 60;
          }
        }

        if (showEdgeOverlay && qEdge >= edgeThreshold) {
          const k = Math.min(1, 0.5 + (qEdge - edgeThreshold));
          R = Math.round(R * (1 - k) + 255 * k);
          G = Math.round(G * (1 - k) + 121 * k);
          B = Math.round(B * (1 - k) + 198 * k);
        }

        imgData.data[idx] = R;
        imgData.data[idx + 1] = G;
        imgData.data[idx + 2] = B;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw rover path on 2D minimap
    if (transectSamples && transectSamples.length >= 2) {
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      transectSamples.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x_px, p.y_px);
        else ctx.lineTo(p.x_px, p.y_px);
      });
      ctx.stroke();
    }

    // Draw landing zone dots & active target crosshair on 2D minimap
    landingZones.forEach((z) => {
      ctx.fillStyle = z.status_color || "#39D353";
      ctx.beginPath();
      ctx.arc(z.coord.x_px, z.coord.y_px, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    if (activeLandingEval) {
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(
        activeLandingEval.coord.x_px,
        activeLandingEval.coord.y_px,
        Math.max(3, activeLandingEval.footprint_radius_px || 3),
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }, [
    showMinimap,
    activeHeights,
    lommelGrid,
    slopeGrid,
    psrGrid,
    quantumEdgesGrid,
    rows,
    cols,
    shaderMode,
    betaCritDeg,
    showEdgeOverlay,
    edgeThreshold,
    elevStats,
    transectSamples,
    landingZones,
    activeLandingEval,
  ]);

  // Smoothly pan camera when clicking a crater in table
  useEffect(() => {
    if (!selectedCrater) return;
    camGoalRef.current.tx = toWorldX(selectedCrater.center_x_px) * 0.65;
    camGoalRef.current.tz = toWorldZ(selectedCrater.center_y_px) * 0.65;
    camGoalRef.current.radius = 90;
  }, [selectedCrater]);

  const setCameraPreset = (preset: "iso" | "top" | "cutaway" | "focus") => {
    if (preset === "top") {
      camGoalRef.current = { theta: 0.0, phi: 0.14, radius: 126, tx: 0, ty: 0, tz: 0 };
      setCameraAngles({ az: 0, el: 82 });
    } else if (preset === "cutaway") {
      camGoalRef.current = { theta: 0.62, phi: 1.24, radius: 115, tx: 0, ty: 0, tz: 0 };
      setCameraAngles({ az: 36, el: 19 });
    } else if (preset === "focus" && activeLandingEval) {
      camGoalRef.current = {
        theta: 0.65,
        phi: 0.85,
        radius: 68,
        tx: toWorldX(activeLandingEval.coord.x_px) * 0.85,
        ty: sampleWorldY(activeLandingEval.coord.x_px, activeLandingEval.coord.y_px) * 0.5,
        tz: toWorldZ(activeLandingEval.coord.y_px) * 0.85,
      };
    } else {
      camGoalRef.current = { theta: 0.70, phi: 0.90, radius: 124, tx: 0, ty: 0, tz: 0 };
      setCameraAngles({ az: 40, el: 38 });
    }
  };

  const performRaycastAtPointer = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const mesh = terrainMeshRef.current;
    if (!container || !camera || !mesh) return null;

    const rect = container.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -((clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(mesh);
    if (hits.length === 0) return null;

    const pt = hits[0].point;
    const xPx = Math.max(0, Math.min(cols - 1, Math.round((pt.x / WORLD_SPAN + 0.5) * (cols - 1))));
    const yPx = Math.max(0, Math.min(rows - 1, Math.round((pt.z / WORLD_SPAN + 0.5) * (rows - 1))));
    return {
      x: xPx,
      y: yPx,
      elev: Math.round(activeHeights[yPx]?.[xPx] ?? 0),
      slope: Number((slopeGrid?.[yPx]?.[xPx] ?? 0).toFixed(1)),
      qEdge: Number((quantumEdgesGrid?.[yPx]?.[xPx] ?? 0).toFixed(2)),
      psr: (psrGrid?.[yPx]?.[xPx] ?? 0) === 1,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      moved: 0,
      lastX: e.clientX,
      lastY: e.clientY,
      mode: e.button === 2 || e.shiftKey ? "pan" : "orbit",
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.moved += Math.hypot(dx, dy);
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;

      if (dragRef.current.mode === "orbit") {
        camGoalRef.current.theta -= dx * 0.008;
        camGoalRef.current.phi = Math.max(0.14, Math.min(1.48, camGoalRef.current.phi - dy * 0.008));
        setCameraAngles({
          az: Math.round((((camGoalRef.current.theta * 180) / Math.PI) % 360 + 360) % 360),
          el: Math.round(90 - (camGoalRef.current.phi * 180) / Math.PI),
        });
      } else {
        camGoalRef.current.tx = Math.max(-45, Math.min(45, camGoalRef.current.tx - dx * 0.12));
        camGoalRef.current.tz = Math.max(-45, Math.min(45, camGoalRef.current.tz - dy * 0.12));
      }
      return;
    }

    const hit = performRaycastAtPointer(e.clientX, e.clientY);
    setHoverProbe(hit);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasClick = dragRef.current.active && dragRef.current.moved < 5;
    dragRef.current.active = false;
    if (wasClick && onSelectTerrainCoord) {
      const hit = performRaycastAtPointer(e.clientX, e.clientY);
      if (hit) {
        onSelectTerrainCoord(hit.x, hit.y);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    camGoalRef.current.radius = Math.max(
      42,
      Math.min(220, camGoalRef.current.radius + e.deltaY * 0.08)
    );
  };

  const shaderModes: { id: TerrainShaderMode; label: string }[] = [
    { id: "lommel", label: "Photometry" },
    { id: "elevation", label: "Elevation" },
    { id: "slope_hazard", label: "Slope Limit" },
    { id: "psr", label: "PSR Ice Trap" },
    { id: "quantum_edge", label: "Quantum Edge" },
  ];

  return (
    <div className="relative w-full h-full bg-[#080A0F] select-none overflow-hidden">
      {webglError ? (
        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#EF4444]">
          {formatDisplayCopy(webglError)}
        </div>
      ) : (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            dragRef.current.active = false;
            setHoverProbe(null);
          }}
          onContextMenu={(e) => e.preventDefault()}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
      )}

      {/* Projected Floating DOM Pin Labels Layer */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {projectedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              ref={(el) => {
                labelDomRefs.current[tag.id] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (tag.coord && onSelectTerrainCoord) {
                  onSelectTerrainCoord(tag.coord.x_px, tag.coord.y_px);
                }
              }}
              style={{
                opacity: 0,
                borderColor: tag.color,
                color: "#FFFFFF",
              }}
              className={`absolute top-0 left-0 px-2 py-0.5 rounded-md border bg-[#0D1017]/90 text-[10px] font-mono whitespace-nowrap transition-opacity ${
                tag.coord ? "pointer-events-auto cursor-pointer hover:bg-[#1E2533]" : "pointer-events-none"
              }`}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: tag.color }}
              />
              {formatDisplayCopy(tag.text)}
            </button>
          ))}
        </div>
      )}

      {/* Top Left: Shader Switcher & Visual Overlay Toggles */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-auto max-w-[70%]">
        <div className="flex flex-wrap items-center gap-1 bg-[#12151E]/95 border border-[#313131] rounded-lg p-1">
          <span className="text-[10px] font-mono text-[#888888] px-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#00F0FF]" />
            {formatDisplayCopy("Shader")}:
          </span>
          {shaderModes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onShaderModeChange && onShaderModeChange(m.id)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                shaderMode === m.id
                  ? "bg-[#272727] text-white border border-[#00F0FF]"
                  : "text-[#9B9B9B] hover:text-white border border-transparent"
              }`}
            >
              {formatDisplayCopy(m.label)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowContours((v) => !v)}
            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
              showContours
                ? "bg-[#1A202C] text-white border-[#00F0FF]/70"
                : "bg-[#12151E]/90 text-[#888888] border-[#313131]"
            }`}
          >
            <Mountain className="w-3 h-3 text-[#00F0FF]" />
            <span>{formatDisplayCopy("200m Contours")}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSurfaceGrid((v) => !v)}
            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
              showSurfaceGrid
                ? "bg-[#1A202C] text-white border-[#00F0FF]/70"
                : "bg-[#12151E]/90 text-[#888888] border-[#313131]"
            }`}
          >
            <Grid className="w-3 h-3 text-[#39D353]" />
            <span>{formatDisplayCopy("Topo Mesh")}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLabels((v) => !v)}
            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
              showLabels
                ? "bg-[#1A202C] text-white border-[#00F0FF]/70"
                : "bg-[#12151E]/90 text-[#888888] border-[#313131]"
            }`}
          >
            <Tag className="w-3 h-3 text-[#FFD700]" />
            <span>{formatDisplayCopy("Pin Labels")}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMinimap((v) => !v)}
            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
              showMinimap
                ? "bg-[#1A202C] text-white border-[#00F0FF]/70"
                : "bg-[#12151E]/90 text-[#888888] border-[#313131]"
            }`}
          >
            <Compass className="w-3 h-3 text-[#FF79C6]" />
            <span>{formatDisplayCopy("2D Radar")}</span>
          </button>
        </div>
      </div>

      {/* Top Right: Camera View Presets & Angles */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1 bg-[#12151E]/95 border border-[#313131] rounded-lg p-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setCameraPreset("iso")}
            className="px-2 py-1 rounded bg-[#1F1F1F] hover:bg-[#272727] text-white transition-colors"
          >
            {formatDisplayCopy("3D Iso")}
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("top")}
            className="px-2 py-1 rounded bg-[#1F1F1F] hover:bg-[#272727] text-[#00F0FF] transition-colors"
          >
            {formatDisplayCopy("Top Down Map")}
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("cutaway")}
            className="px-2 py-1 rounded bg-[#1F1F1F] hover:bg-[#272727] text-[#FFD700] transition-colors"
          >
            {formatDisplayCopy("Side Cutaway")}
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("focus")}
            className="px-2 py-1 rounded bg-[#1F1F1F] hover:bg-[#272727] text-[#39D353] transition-colors flex items-center gap-1"
          >
            <MapPin className="w-2.5 h-2.5" />
            <span>{formatDisplayCopy("Focus Pad")}</span>
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("iso")}
            title="Reset camera"
            className="px-1.5 py-1 rounded bg-[#181818] hover:bg-[#272727] text-[#A1A1A1]"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#12151E]/95 border border-[#00F0FF] text-[#00F0FF]">
              {formatDisplayCopy("Syncing DEM")}
            </span>
          )}
          <div className="text-[10px] font-mono bg-[#12151E]/95 border border-[#313131] text-[#A1A1A1] px-2.5 py-0.5 rounded flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-[#00F0FF]" />
            <span>Az {cameraAngles.az}° | El {cameraAngles.el}°</span>
          </div>
        </div>
      </div>

      {/* Bottom Left: Legend & Visual Symbol Key */}
      <div className="absolute bottom-3 left-3 bg-[#12151E]/95 border border-[#313131] rounded-lg px-3 py-2 text-[10px] font-mono pointer-events-none space-y-1.5 max-w-md">
        <div className="flex items-center justify-between gap-4 text-white">
          <span className="font-semibold">{formatDisplayCopy(presetName)}</span>
          <span className="text-[#00F0FF]">
            {Math.round(elevStats.min)} m to +{Math.round(elevStats.max)} m
          </span>
        </div>

        {shaderMode === "elevation" && (
          <div className="flex items-center gap-2">
            <span className="text-[#888888]">{Math.round(elevStats.min)} m</span>
            <div className="flex h-2 w-28 rounded overflow-hidden border border-[#313131]">
              <div className="flex-1 bg-[#1c307a]" />
              <div className="flex-1 bg-[#147a9e]" />
              <div className="flex-1 bg-[#758f73]" />
              <div className="flex-1 bg-[#d69433]" />
              <div className="flex-1 bg-[#f2f5fa]" />
            </div>
            <span className="text-[#888888]">+{Math.round(elevStats.max)} m</span>
          </div>
        )}
        {shaderMode === "slope_hazard" && (
          <div className="flex items-center gap-3">
            <span className="text-[#39D353]">&lt; {(betaCritDeg * 0.65).toFixed(1)}° Safe</span>
            <span className="text-[#FFD700]">{betaCritDeg.toFixed(1)}° Limit</span>
            <span className="text-[#EF4444]">&gt; {betaCritDeg.toFixed(1)}° Abort</span>
          </div>
        )}
        {shaderMode === "psr" && (
          <div className="text-[#00F0FF]">
            {formatDisplayCopy("Cyan Zones = Permanent Ray Cast Shadow (< 110 K Ice Cold Traps)")}
          </div>
        )}
        {shaderMode === "lommel" && (
          <div className="text-[#A1A1A1]">
            {formatDisplayCopy("Lommel Seeliger Photometry + 200m Elevation Contours")}
          </div>
        )}
        {shaderMode === "quantum_edge" && (
          <div className="text-[#FF79C6]">
            {formatDisplayCopy("Quantum Rim / Boulder Edge Map Over Shaded Relief")}
          </div>
        )}

        {/* Clear Symbol Legend */}
        <div className="pt-1 border-t border-[#252A36] flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-[#A1A1A1]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#39D353]" />
            {formatDisplayCopy("Safe Pad")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
            {formatDisplayCopy("Marginal")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            {formatDisplayCopy("Slope Abort")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#00F0FF]" />
            {formatDisplayCopy("Rover Route")}
          </span>
          <span className="flex items-center gap-1 text-[#888888]">
            <Crosshair className="w-2.5 h-2.5 text-[#00F0FF]" />
            {formatDisplayCopy("Click mesh to probe")}
          </span>
        </div>
      </div>

      {/* Bottom Right: Synchronized 2D Nadir Minimap + Live Cursor Telemetry */}
      <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 pointer-events-auto">
        {hoverProbe && (
          <div className="bg-[#12151E]/95 border border-[#313131] rounded-lg px-2.5 py-1 text-[10px] font-mono text-white pointer-events-none flex items-center gap-2.5">
            <span>px ({hoverProbe.x}, {hoverProbe.y})</span>
            <span className="text-[#00F0FF]">{hoverProbe.elev} m</span>
            <span className="text-[#FFD700]">{hoverProbe.slope}°</span>
            <span className="text-[#FF79C6]">P {hoverProbe.qEdge}</span>
            {hoverProbe.psr && <span className="text-[#00F0FF]">PSR</span>}
          </div>
        )}

        {showMinimap && (
          <div className="bg-[#12151E]/95 border border-[#313131] rounded-xl p-1.5 space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-[#888888] px-0.5">
              <span>{formatDisplayCopy("2D Nadir Map")}</span>
              <span className="text-[#00F0FF]">{formatDisplayCopy("Click to Probe")}</span>
            </div>
            <canvas
              ref={minimapCanvasRef}
              onClick={(e) => {
                if (!onSelectTerrainCoord) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const xPx = Math.max(0, Math.min(cols - 1, Math.round(((e.clientX - rect.left) / rect.width) * (cols - 1))));
                const yPx = Math.max(0, Math.min(rows - 1, Math.round(((e.clientY - rect.top) / rect.height) * (rows - 1))));
                onSelectTerrainCoord(xPx, yPx);
              }}
              className="w-28 h-28 rounded-lg border border-[#2B2B2B] cursor-crosshair block"
            />
          </div>
        )}
      </div>
    </div>
  );
};
