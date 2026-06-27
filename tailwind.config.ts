import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'aria-bg': '#0D0D0F',
        'aria-surface': '#141416',
        'aria-border': '#1F1F23',
        'aria-text': '#F5F5F5',
        'aria-muted': '#6B7280',
        'aria-violet': '#6C63FF',
        'aria-violet-dim': '#3D3899',
        'aria-green': '#22C55E',
        'aria-amber': '#F59E0B',
        'aria-red': '#EF4444',
        'aria-blue': '#3B82F6',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%,100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(239,68,68,0.4)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 0 6px rgba(239,68,68,0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
