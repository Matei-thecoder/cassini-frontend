/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        soil: {
          50: '#fdf6ee',
          100: '#f7e8d0',
          200: '#edcfa0',
          300: '#e0b070',
          400: '#d08840',
          500: '#a86020',
          600: '#7a4015',
          700: '#5c2e0e',
          800: '#3e1e08',
          900: '#201004',
        },
        leaf: {
          50: '#edfaf2',
          100: '#c8f0d8',
          200: '#8de0b0',
          300: '#4fcf84',
          400: '#28b865',
          500: '#169648',
          600: '#0d7035',
          700: '#085026',
          800: '#043518',
          900: '#021a0c',
        },
        sky: {
          50: '#eef6ff',
          100: '#cce4ff',
          200: '#99c9ff',
          300: '#5ca8ff',
          400: '#2484f5',
          500: '#0d5fd4',
          600: '#0846a8',
          700: '#053080',
          800: '#021e5a',
          900: '#010e30',
        },
        drought: '#D97706',
        flood: '#0d5fd4',
        healthy: '#169648',
        warning: '#DC2626',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'grain': 'grain 0.5s steps(2) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        grain: {
          '0%, 100%': { backgroundPosition: '0 0' },
          '25%': { backgroundPosition: '-5% -10%' },
          '50%': { backgroundPosition: '-15% 5%' },
          '75%': { backgroundPosition: '5% -5%' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
