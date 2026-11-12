export type GisPresetId = "apollo_16" | "shackleton" | "tycho" | "lro_wac_real";

export type GisEdgeAlgorithm =
  | "FRQI_QHED"
  | "QPIE_QHED"
  | "NEQR_GRADIENT"
  | "SOBEL_CLASSICAL";

export type GisLanderProfileId =
  | "ARTEMIS_HLS_STARSHIP_50M"
  | "BLUE_MOON_MK1_15M"
  | "CHANDRAYAAN_VIKRAM_12M";

export type GisRoverProfileId = "VIPER" | "LTV" | "PRAGYAN";

export type TerrainShaderMode =
  | "lommel"
  | "elevation"
  | "slope_hazard"
  | "psr"
  | "quantum_edge";

export interface LandingZoneEvaluation {
  rank?: number;
  lander_profile: GisLanderProfileId;
  lander_display: string;
  lander_short: string;
  radius_m: number;
  footprint_radius_px: number;
  pad_gsd_m_px: number;
  beta_crit_deg: number;
  sigma_crit_m: number;
  gamma_q: number;
  gamma_r: number;
  coord: { x_px: number; y_px: number };
  selenographic_label: string;
  lat: number;
  lon: number;
  elevation_m: number;
  zone_name: string;
  in_psr_shadow: boolean;
  max_slope_deg: number;
  quantum_rim_hazard_pct: number;
  rms_roughness_m: number;
  slope_penalty: number;
  hazard_penalty: number;
  roughness_penalty: number;
  total_penalty: number;
  landing_safety_index: number;
  status: "CERTIFIED_SAFE" | "MARGINAL_CAUTION" | "ABORT_HAZARD";
  status_label: string;
  status_color: string;
}

export interface LanderComparisonItem {
  lander_profile: GisLanderProfileId;
  lander_short: string;
  radius_m: number;
  beta_crit_deg: number;
  landing_safety_index: number;
  status_label: string;
  status_color: string;
}

export interface TransectSample {
  dist_km: number;
  x_px: number;
  y_px: number;
  elevation_m: number;
  slope_deg: number;
  quantum_edge_prob: number;
}

export interface TransectProfileResponse {
  status: string;
  route_mode: "direct" | "safe_detour";
  rover_mass_kg: number;
  total_distance_km: number;
  nominal_energy_wh: number;
  rover_energy_wh: number;
  max_grade_deg: number;
  edge_crossings_count: number;
  start_coord: { x: number; y: number };
  end_coord: { x: number; y: number };
  samples_256: TransectSample[];
}

export interface TransectComparisonSummary {
  direct: {
    total_distance_km: number;
    rover_energy_wh: number;
    max_grade_deg: number;
    edge_crossings_count: number;
  };
  safe_detour: {
    total_distance_km: number;
    rover_energy_wh: number;
    max_grade_deg: number;
    edge_crossings_count: number;
  };
  rover_display: string;
  rover_mass_kg: number;
  mu_roll: number;
}

export interface CraterRecord {
  crater_id: string;
  center_x_px: number;
  center_y_px: number;
  semi_major_px?: number;
  semi_minor_px?: number;
  orientation_deg?: number;
  diameter_km: number;
  depth_m: number;
  depth_to_diameter_ratio: number;
  ellipticity: number;
  terrain_class: string;
  rim_confidence: number;
}

export interface CsfdRPlotBin {
  diam_km_mean: number;
  bin_label?: string;
  count: number;
  r_value: number;
  error_plus: number;
}

export interface CraterChronologyResponse {
  status: string;
  preset_id: string;
  craters_detected: number;
  craters: CraterRecord[];
  fresh_bowl_count: number;
  degraded_count: number;
  cumulative_n1_km2: number;
  neukum_model_age_ga: number;
  geological_epoch: string;
  csfd_r_plot_bins: CsfdRPlotBin[];
  total_area_km2: number;
  geojson: any;
}

export interface AnalyzeTerrainResponse {
  status: string;
  preset_id: GisPresetId;
  resolution: number;
  site_metadata: {
    preset_id: GisPresetId;
    display_name: string;
    center_lat: number;
    center_lon: number;
    region_class: string;
    epoch_hint: string;
    resolution: number;
    min_elevation_m: number;
    max_elevation_m: number;
    relief_m: number;
    crs: string;
    gsd_m_px: number;
    has_real_albedo: boolean;
  };
  quantum_edge_stats: {
    algorithm: GisEdgeAlgorithm;
    algorithm_display: string;
    edge_density_pct: number;
    mean_edge_prob: number;
    threshold_used: number;
    latency_ms: number;
    qubits: number;
    storage_qubits: number;
    active_qubits: number;
    cnot_depth_per_tile: number;
  };
  photometry_meta: {
    mean_slope_deg: number;
    max_slope_deg: number;
    sun_azimuth_deg: number;
    sun_elevation_deg: number;
    psr_fraction_pct: number;
    mean_reflectance: number;
  };
  landing_safety_analysis: LandingZoneEvaluation & {
    top_5_safe_zones: LandingZoneEvaluation[];
    lander_comparison: LanderComparisonItem[];
  };
  transect_profile: TransectProfileResponse;
  transect_comparison: TransectComparisonSummary;
  crater_chronology: CraterChronologyResponse;
  heights_grid: number[][];
  lommel_grid: number[][];
  slope_grid: number[][];
  psr_grid: number[][];
  quantum_edges_grid: number[][];
}

