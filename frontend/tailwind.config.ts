import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        dark: {
          base: '#000000',
          deep: '#181818',
          surface: '#1F1F1F',
          card: '#272727',
          border: '#313131',
          goldtint: '#131209'
        },
        quantum: {
          frqi: '#FF79C6',      // Electric Magenta
          qpie: '#00F0FF',      // Neon Cyan
          neqr: '#BD93F9',      // Laser Purple
          gold: '#FFD700',      // Phase angle wire |c>
          green: '#39D353',     // Measurement collapsed state
          blue: '#388BFD'       // Column register wire
        }
      },
      spacing: {
        '0': '0px',
        '25': '2px',
        '50': '4px',
        '75': '8px',
        '100': '12px',
        '200': '16px',
        '300': '24px',
        '400': '32px',
        '500': '40px',
        '600': '48px',
        '700': '64px',
        '800': '80px',
        '900': '96px',
      },
      transitionTimingFunction: {
        'decel': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '500': '500ms',
        '300': '300ms',
      }
    },
  },
  plugins: [],
}
export default config

