/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0c0d10',
          soft: '#16181d',
          muted: '#23262e',
        },
        paper: '#f6f5f1',
        accent: {
          DEFAULT: '#e8503a', // productive
          sleep: '#5b6cff',
          other: '#f2b441',
        },
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: { 'fade-up': 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both' },
    },
  },
  plugins: [],
};
