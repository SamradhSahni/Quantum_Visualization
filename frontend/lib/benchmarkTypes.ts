export interface GrandSummaryRow {
  Method: string;
  "Representation Ablation": number | null;
  "Geometry Ablation": number | null;
  "SomBench Benchmark": number | null;
}

export interface AerCropSummaryRow {
  method: string;
  shots: number;
  images?: number;
  runs?: number;
  f1_exact: number | null;
  f1_1px?: number | null;
  f1_2px: number | null;
  pr_auc?: number | null;
  ap?: number | null;
  iou?: number | null;
  coverage?: number | null;
  operator_rmse?: number | null;
  elapsed_seconds?: number | null;
}

export interface BootstrapIntervalRow {
  a: string;
  b: string;
  diff: number;
  ci_lo: number;
  ci_hi: number;
}

export interface MatchedAerSuite {
  protocol_totals: {
    total_metric_records: number;
    quantum_runs: number;
    classical_control_runs: number;
    total_circuits: number;
    total_shots: number;
    bootstrap_resamples: number;
    crop_resolution: string;
    max_replay_discrepancy: string;
  };
  primary_8crop: AerCropSummaryRow[];
  subset_6crop: AerCropSummaryRow[];
  bootstrap_intervals: BootstrapIntervalRow[];
}

export interface ExperimentMetricRow {
  method: string;
  f1_exact_mean: number | null;
  f1_exact_std?: number | null;
  f1_1px_mean?: number | null;
  f1_1px_std?: number | null;
  f1_2px_mean?: number | null;
  f1_2px_std?: number | null;
  precision_exact_mean?: number | null;
  precision_mean?: number | null;
  recall_exact_mean?: number | null;
  recall_mean?: number | null;
  iou_mean?: number | null;
  chamfer_mean?: number | null;
  pr_auc_mean?: number | null;
  image?: string;
  geometry?: string;
  shots?: number;
  size?: number;
  time_sec?: number | null;
  degradation?: string;
  noise?: string;
  preprocessing?: string;
  patch?: string;
  category?: string;
  failure_mode?: string;
}

export interface ResourceScalingRow {
  method: string;
  size: number;
  n_qubits: number;
  circuit_depth: number;
  cx_count: number;
}

export interface TimingRow {
  method: string;
  mean_time_ms: number | null;
  std_time_ms: number | null;
  min_time_ms: number | null;
  max_time_ms: number | null;
  size: number;
}

export interface SuiteInterpretation {
  title: string;
  what_it_tests: string;
  what_it_shows: string;
}

export interface ResearchSuitesPayload {
  status: string;
  suite_interpretations: Record<string, SuiteInterpretation>;
  grand_summary: GrandSummaryRow[];
  matched_aer: MatchedAerSuite;
  exp1_geometry: ExperimentMetricRow[];
  exp2_shots: ExperimentMetricRow[];
  exp3_resolution: ExperimentMetricRow[];
  exp4_degradation: ExperimentMetricRow[];
  exp5_nisq_noise: ExperimentMetricRow[];
  exp6_ablation: ExperimentMetricRow[];
  exp7_preprocessing: ExperimentMetricRow[];
  exp8_sombench: ExperimentMetricRow[];
  exp9_resources: ResourceScalingRow[];
  exp10_failure_taxonomy: ExperimentMetricRow[];
  timing_analysis: TimingRow[];
}

