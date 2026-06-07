/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Notion-light palette
        canvas: '#ffffff',
        sidebar: '#f7f7f5',
        panel: '#ffffff',
        line: '#ebeae8',
        hover: 'rgba(55,53,47,0.055)',
        active: 'rgba(55,53,47,0.09)',
        ink: {
          DEFAULT: '#37352f', // primary text
          2: '#73726e', // secondary
          3: '#9b9a97', // muted
        },
        accent: {
          DEFAULT: '#e8503a', // productive / brand
          sleep: '#3b5bdb',
          other: '#f08c00',
        },
      },
      boxShadow: {
        notion: '0 1px 2px rgba(15,15,15,0.05), 0 2px 8px rgba(15,15,15,0.04)',
        pop: '0 8px 28px rgba(15,15,15,0.14), 0 2px 6px rgba(15,15,15,0.06)',
      },
      borderRadius: { xl2: '0.875rem' },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease both',
        'slide-up': 'slide-up 0.22s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};
