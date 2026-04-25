import type { Config } from 'tailwindcss'

export default {
  content: ['./app/renderer/index.html', './app/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: 'rgb(var(--color-base-950) / <alpha-value>)',
          900: 'rgb(var(--color-base-900) / <alpha-value>)',
          850: 'rgb(var(--color-base-850) / <alpha-value>)',
          800: 'rgb(var(--color-base-800) / <alpha-value>)',
          700: 'rgb(var(--color-base-700) / <alpha-value>)',
          600: 'rgb(var(--color-base-600) / <alpha-value>)',
          500: 'rgb(var(--color-base-500) / <alpha-value>)',
          400: 'rgb(var(--color-base-400) / <alpha-value>)',
          300: 'rgb(var(--color-base-300) / <alpha-value>)',
          200: 'rgb(var(--color-base-200) / <alpha-value>)',
          100: 'rgb(var(--color-base-100) / <alpha-value>)'
        },
        accent: {
          cyan: 'rgb(var(--color-accent-cyan) / <alpha-value>)',
          green: 'rgb(var(--color-accent-green) / <alpha-value>)',
          amber: 'rgb(var(--color-accent-amber) / <alpha-value>)',
          rose: 'rgb(var(--color-accent-rose) / <alpha-value>)'
        }
      },
      boxShadow: {
        panel: 'var(--shadow-panel)'
      }
    }
  },
  plugins: []
} satisfies Config
