import type { Config } from 'tailwindcss'
import { COLORS } from './src/lib/colors'

/**
 * Surface and foreground colors use CSS custom properties so they switch
 * automatically between dark (default) and light mode via html.light class.
 * Gold (silver) and accent (crimson) are static — same in both modes.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          '900': 'var(--surface-900)',
          '800': 'var(--surface-800)',
          '700': 'var(--surface-700)',
          '600': 'var(--surface-600)',
          '500': 'var(--surface-500)',
        },
        gold:    COLORS.gold,
        accent:  COLORS.accent,
        foreground: {
          DEFAULT: 'var(--fg)',
          dim:     'var(--fg-dim)',
          muted:   'var(--fg-muted)',
        },
      },
      fontFamily: {
        display: ['Oswald', 'Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
