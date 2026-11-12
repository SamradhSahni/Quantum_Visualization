export type QmlPresetId = "shackleton" | "apollo16" | "rille";

export type QcnnAnsatzId =
  | "STRONGLY_ENTANGLING_RING"
  | "HARDWARE_EFFICIENT_LINEAR"
  | "ISWAP_IQP_KERNEL";

export type CostFunctionId = "LOCAL_PAULI_Z" | "GLOBAL_PROJECTOR";

export interface WaveletTelemetry {
  energy_ll_pct: number;
  energy_lh_pct: number;
  energy_hl_pct: number;
  energy_hh_speckle_pct: number;
  directional_edge_boost_pct: number;
  snr_before_qwt: number;
  snr_after_qwt: number;
  snr_gain_db: number;
  is_unitary_conserved: boolean;
  unitarity_residual: number;
  original_patch: number[][];
  reconstructed_patch: number[][];
  subband_matrices: {
    ll: number[][];
    lh: number[][];
    hl: number[][];
    hh: number[][];
  };
}

export interface MultiSpectralFusionData {
  status: string;
  qubit_allocation: {
    spatial_position_qubits: number;
    color_channel_qubits: number;
    total_qubits: number;
  };
  normalized_weights: {
    optical: number;
    thermal: number;
    sar_cpr: number;
  };
  mean_multispectral_edge_prob: number;
  qcics_ice_traps_found: number;
  max_ice_score: number;
  optical_band: number[][];
  thermal_band: number[][];
  sar_band: number[][];
  fused_edge_map: number[][];
  qcics_map: number[][];
}

export interface HilbertUmapPoint {
  patch_id: number;
  r: number;
  c: number;
  x: number;
  y: number;
  z: number;
  class: string;
  confidence: number;
  color: string;
  pixels_2x2: number[][];
  pauli_z: number[];
  class_probs: Record<string, number>;
}

export interface QcnnSegmentationCell {
  patch_id: number;
  class: string;
  color: string;
  confidence: number;
}

export interface QcnnClassificationData {
  status: string;
  ansatz: string;
  ansatz_display: string;
  two_qubit_gates: number;
  circuit_depth: number;
  class_fractions: Record<string, number>;
  hilbert_umap_3d_points: HilbertUmapPoint[];
  segmentation_grid: QcnnSegmentationCell[][];
  kernel_silhouette_score: number;
  sample_quantum_kernel_gram: number[][];
  gram_labels: string[];
  feature_dim: number;
}

export interface OptimizerStep {
  step: number;
  theta1: number;
  theta2: number;
  loss: number;
  grad_norm: number;
}

export interface VarianceScalingPoint {
  qubits: number;
  local_var: number;
  global_var: number;
}

export interface BarrenPlateauDiagnostics {
  cost_function_type: string;
  num_qubits: number;
  circuit_depth: number;
  grid_resolution: number;
  gradient_variance: number;
  is_barren_plateau: boolean;
  qfim_matrix: number[][];
  qfim_determinant: number;
  qfim_eigenvalues: number[];
  loss_surface_grid_21x21: number[][];
  optimizer_trajectory: OptimizerStep[];
  variance_scaling_curve: VarianceScalingPoint[];
  optimal_point: {
    theta1: number;
    theta2: number;
    min_loss: number;
  };
}

export interface GroverCurvePoint {
  r: number;
  prob: number;
  angle_deg: number;
  over_rotated: boolean;
}

export interface GroverOscilloscopeData {
  status: string;
  grover_iterations: number;
  initial_theta_rad: number;
  initial_prob: number;
  amplified_prob: number;
  optimal_iterations: number;
  over_rotation_warning: boolean;
  amplification_gain: number;
  subspace_compass: {
    x_non_edge: number;
    y_edge: number;
    angle_rad: number;
    angle_deg: number;
  };
  oscillation_curve: GroverCurvePoint[];
  input_edge_map: number[][];
  amplified_edge_map: number[][];
}

export interface QmlPipelineResponse {
  status: string;
  preset_id: QmlPresetId;
  tile_resolution: number;
  wavelet_telemetry: WaveletTelemetry;
  multi_spectral_fusion: MultiSpectralFusionData;
  qcnn_classification: QcnnClassificationData;
  barren_plateau_diagnostics: BarrenPlateauDiagnostics;
  grover_oscilloscope: GroverOscilloscopeData;
}

