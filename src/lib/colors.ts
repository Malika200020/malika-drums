/**
 * Brand palette — single source of truth for JS/TS inline styles.
 *
 * Tailwind utility classes use CSS custom properties (var(--xxx)) defined in
 * index.css, so surface/foreground colors switch automatically with the theme.
 * The values below are used for inline `style` props only.
 */
export const COLORS = {
  surface: {
    '900': '#0a0a0a',
    '800': '#111111',
    '700': '#1a1a1a',
    '600': '#242424',
    '500': '#333333',
  },
  gold: {
    DEFAULT: '#8b5cf6', // deep violet — primary accent
    light:   '#a78bfa', // violet-400 — highlights
    dim:     '#6d28d9', // violet-700 — scrollbar / subdued
  },
  accent: '#f97316',   // ember orange — energy / CTAs
  foreground: {
    DEFAULT: '#f5f5f5',
    dim:     '#a3a3a3',
    muted:   '#737373',
  },
} as const

export type BrandColors = typeof COLORS
