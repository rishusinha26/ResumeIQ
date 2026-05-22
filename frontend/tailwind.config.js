/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0f172a',
        slateMist: '#e2e8f0',
        sand: '#f8fafc',
        accent: '#0ea5e9',
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139, 92, 246, 0.1), 0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        'glow-dark': '0 0 0 1px rgba(139, 92, 246, 0.2), 0 20px 40px -15px rgba(0, 0, 0, 0.3)',
        highlight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
};
