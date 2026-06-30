import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'neutral-primary-soft': 'var(--color-neutral-primary-soft)',
        'neutral-primary': 'var(--color-neutral-primary)',
        'neutral-secondary-soft': 'var(--color-neutral-secondary-soft)',
        'neutral-secondary-medium': 'var(--color-neutral-secondary-medium)',
        'neutral-tertiary-soft': 'var(--color-neutral-tertiary-soft)',
        'neutral-tertiary-medium': 'var(--color-neutral-tertiary-medium)',
        
        'brand': 'var(--color-brand)',
        'brand-soft': 'var(--color-brand-soft)',
        'brand-strong': 'var(--color-brand-strong)',
        
        'success': 'var(--color-success)',
        'danger': 'var(--color-danger)',
        'warning': 'var(--color-warning)',
        'dark': 'var(--color-dark)',
        'disabled': 'var(--color-disabled)',
        
        'heading': 'var(--color-heading)',
        'body': 'var(--color-body)',
        'body-subtle': 'var(--color-body-subtle)',
        'fg-disabled': 'var(--color-fg-disabled)',
        'fg-brand': 'var(--color-fg-brand)',
        
        'border-default': 'var(--color-border-default)',
        'border-light': 'var(--color-border-light)',
        'border-brand': 'var(--color-border-brand)',
        'border-danger': 'var(--color-border-danger)',
        'border-success': 'var(--color-border-success)',
        'border-warning': 'var(--color-border-warning)',
      },
      boxShadow: {
        '2xs': '1px 1px 0 0 var(--color-border-default)',
        'xs': '2px 2px 0 0 var(--color-border-default)',
        'sm': '3px 3px 0 0 var(--color-border-default)',
        'md': '4px 4px 0 0 var(--color-border-default)',
        'lg': '6px 6px 0 0 var(--color-border-default)',
        'xl': '10px 10px 0 1px var(--color-border-default)',
        '2xl': '16px 16px 0 1px var(--color-border-default)',
      },
      fontFamily: {
        head: ['var(--font-head)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        'base': '0px',
        'default': '0px',
        'sm': '0px',
      }
    },
  },
  plugins: [],
}
export default config
