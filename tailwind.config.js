/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--sf-primary)',
        secondary: 'var(--sf-secondary)',
        accent: 'var(--sf-accent)',
        'sf-bg': 'var(--sf-bg)',
        'sf-surface': 'var(--sf-surface)',
        'sf-text': 'var(--sf-text)',
        'sf-muted': 'var(--sf-muted)',
        'sf-border': 'var(--sf-border)',
        navy: { DEFAULT: '#0B2545', dark: '#07192F', light: '#1B4F8A' },
        gold: { DEFAULT: '#C9A84C', light: '#E8C96A' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
