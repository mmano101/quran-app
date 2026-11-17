/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: { xs: '380px' },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'accent-soft': 'var(--accent-soft)',
        line: 'var(--line)',
      },
      fontFamily: {
        arabic: ['"Amiri"', '"Scheherazade New"', 'serif'],
        scheherazade: ['"Scheherazade New"', '"Amiri"', 'serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        ui: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.18)',
        pill: '0 6px 30px -8px rgba(0,0,0,.30)',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(.22,.61,.36,1)',
      },
    },
  },
  plugins: [],
}
