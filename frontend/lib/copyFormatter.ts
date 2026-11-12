/**
 * Copy Formatter - Zero-Hyphen Rule Enforcement
 * SKILL.md & ui-ux-pro-max Compliance
 * Replaces all literal hyphens in visible rendered copy with spaces or clean typography.
 */

const REPLACEMENTS: Record<string, string> = {
  "FRQI-QHED": "FRQI QHED",
  "QPIE-QHED": "QPIE QHED",
  "NEQR-Gradient": "NEQR Gradient",
  "Sobel 3x3": "Sobel 3×3",
  "Sobel 3-by-3": "Sobel 3×3",
  "Canny 5-Stage": "Canny 5 Stage",
  "Robinson 8-Compass": "Robinson 8 Compass",
  "Real-Time": "Real Time",
  "real-time": "real time",
  "Zero-Hyphen": "Zero Hyphen",
  "zero-copy": "zero copy",
  "Multi-Method": "Multi Method",
  "multi-method": "multi method",
  "Halo-Padded": "Halo Padded",
  "halo-padded": "halo padded",
  "Step-by-Step": "Step by Step",
  "step-by-step": "step by step",
  "Side-by-Side": "Side by Side",
  "side-by-side": "side by side",
  "High-Performance": "High Performance",
  "high-performance": "high performance",
  "High-Contrast": "High Contrast",
  "high-contrast": "high contrast",
  "Pre-transpiled": "Pre transpiled",
  "pre-transpiled": "pre transpiled",
  "State-of-the-Art": "State of the Art",
  "state-of-the-art": "state of the art",
  "End-to-End": "End to End",
  "end-to-end": "end to end",
  "Two-Pass": "Two Pass",
  "Four-Pass": "Four Pass",
  "second-place": "Second Place",
  "first-place": "First Place",
  "third-place": "Third Place"
};

export function formatDisplayCopy(text: string): string {
  if (!text) return "";
  let formatted = text;
  for (const [key, val] of Object.entries(REPLACEMENTS)) {
    formatted = formatted.replaceAll(key, val);
  }
  // Replace any residual isolated hyphens between words
  formatted = formatted.replace(/([a-zA-Z0-9])\-([a-zA-Z0-9])/g, "$1 $2");
  return formatted;
}

