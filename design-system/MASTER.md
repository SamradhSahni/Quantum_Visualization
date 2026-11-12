# Quantum Vision Master Design System Specification

> **Specification Authority:** `SKILL.md` & `ui-ux-pro-max`  
> **Document Version:** 3.1.0  
> **Enforcement Rule:** All frontend components, styles, copy, and layouts MUST strictly inherit tokens from this file.

---

## 1. Zero Hyphen Copy Rule

**Core Mandate:** Never use hyphens (`-`) inside any visible rendered UI copy, headings, body text, buttons, tooltips, or badges.
- Internal identifiers and data enums use underscores (`FRQI_QHED`, `SECOND_PLACE`).
- All visible strings must be formatted through `formatDisplayCopy()` into hyphen free text (e.g. *FRQI QHED*, *Second Place*, *Real Time Telemetry*, *Multi Method Benchmark*).

---

## 2. Typography Token Scale

All typography strictly snaps to the Geist / Manrope type scale. No italics and no ultra bold (max Semibold 600 or Bold 700).

| Token Name | Scale Step | Size / Line Height | Weight | Usage |
|:---|:---|:---|:---|:---|
| `heading-1` | `text-6xl` | 60px / 60px | Semibold (600) | Hero Headline |
| `heading-2` | `text-5xl` | 48px / 48px | Semibold (600) | Major Section Titles |
| `heading-3` | `text-4xl` | 36px / 40px | Semibold (600) | Subsection / Tagline Reveal |
| `heading-4` | `text-3xl` | 30px / 36px | Semibold (600) | Feature / Panel Headers |
| `heading-5` | `text-2xl` | 24px / 32px | Semibold (600) | Modal / Card Headers |
| `heading-6` | `text-xl` | 20px / 28px | Semibold (600) | Compact Group Headers |
| `title-1` | `text-xl` | 20px / 28px | Medium (500) | Prominent Card Titles |
| `title-2` | `text-lg` | 18px / 28px | Medium (500) | Standard Card Titles |
| `title-3` | `text-base` | 16px / 24px | Medium (500) | Nav Links, Form Labels |
| `title-4` | `text-sm` | 14px / 20px | Medium (500) | Badges, Table Headers |
| `title-5` | `text-xs` | 12px / 16px | Medium (500) | Micro Titles |
| `body-1` | `text-base` | 16px / 24px | Semibold (600) | Lead Paragraph Emphasis |
| `body-2` | `text-base` | 16px / 24px | Medium (500) | Standard Body Text |
| `body-3` | `text-base` | 16px / 24px | Regular (400) | Muted Descriptive Text |
| `body-4` | `text-sm` | 14px / 20px | Semibold (600) | Strong Small Copy |
| `body-5` | `text-sm` | 14px / 20px | Medium (500) | Compact Information |
| `body-6` | `text-sm` | 14px / 20px | Regular (400) | Secondary Compact Copy |
| `button-lg` | `text-lg` | 18px / 28px | Semibold (600) | Hero Primary CTA |
| `button-md` | `text-base` | 16px / 24px | Semibold (600) | Standard Buttons (8px V, 12px H padding) |
| `button-sm` | `text-sm` | 14px / 20px | Semibold (600) | Header / Compact Buttons (6px V, 12px H padding) |
| `caption-1` | `text-sm` | 14px / 20px | Medium (500) | Table Data, Metadata |
| `caption-2` | `text-sm` | 14px / 20px | Regular (400) | Auxiliary Captions |
| `caption-3` | `text-xs` | 12px / 16px | Semibold (600) | Qubit Wire Identifiers |
| `caption-4` | `text-xs` | 12px / 16px | Medium (500) | Timestamp / Status Pills |
| `caption-5` | `text-xs` | 12px / 16px | Regular (400) | Fine Legal Disclaimers |

---

## 3. Flat Color Palette & Surface Hierarchy

Backgrounds are 100% flat solid hex colors. No background gradients anywhere.

- **Base Canvas:** `#000000`
- **Deep Surface:** `#181818`
- **Elevated Card Surface:** `#1F1F1F`
- **Interactive Component / Hover Well:** `#272727`
- **Border Stroke:** `#313131` (always applied to all 4 sides; never single sided borders)
- **Text Primary:** `#FFFFFF`
- **Text Secondary:** `#B4B4B4`
- **Text Muted:** `#737373`
- **Hero Heading Text Gradient (The Only Allowed Gradient):**
  `bg-gradient-to-r from-[#FFFFFF] to-[#9B9B9B] bg-clip-text text-transparent`

### Quantum Accent Palette
- **FRQI Electric Magenta:** `#FF79C6`
- **QPIE Neon Cyan:** `#00F0FF`
- **NEQR Laser Purple:** `#BD93F9`
- **Phase Angle Wire $|c\rangle$:** `#FFD700`
- **Ground Wire $|0\rangle$:** `#272727`
- **Active Wire $|1\rangle$:** `#00F0FF`
- **Measured Collapse:** `#39D353`
- **Anomaly Alert:** `#FF5555`

---

## 4. Spacing, Concentric Radii & Motion

### Spacing Tokens
- `Spacing-0`: 0px
- `Spacing-25`: 2px
- `Spacing-50`: 4px
- `Spacing-75`: 8px
- `Spacing-100`: 12px
- `Spacing-200`: 16px
- `Spacing-300`: 24px
- `Spacing-400`: 32px
- `Spacing-500`: 40px
- `Spacing-600`: 48px
- `Spacing-700`: 64px
- `Spacing-800`: 80px
- `Spacing-900`: 96px

### Concentric Nested Radius Formula
$$\text{inner radius} = \max\left(4\text{px}, \text{outer radius} - \text{gap}\right)$$
*(Example: Outer card at `rounded-2xl` (16px) with 8px internal padding gives inner buttons `rounded-lg` (8px)).*

### Deceleration Motion
`transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);`
- 200ms for micro-interactions and hover states.
- 450ms for layout expansions and drawer reveals.

