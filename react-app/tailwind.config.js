/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#39B8A6',
          50: '#E6F7F4',
          100: '#CCEFE9',
          200: '#99DFD3',
          300: '#66CFBD',
          400: '#39B8A6',
          500: '#2E9385',
          600: '#236E64',
          700: '#184943',
          800: '#0E2422',
          900: '#050F0E',
        },
      },
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.375rem', { lineHeight: '1.75rem' }], // Reduced from 1.5rem
      '3xl': ['1.625rem', { lineHeight: '2rem' }], // Reduced from 1.875rem
      '4xl': ['1.875rem', { lineHeight: '2.25rem' }], // Reduced from 2.25rem
      '5xl': ['2.25rem', { lineHeight: '2.5rem' }], // Reduced from 3rem
      '6xl': ['2.75rem', { lineHeight: '1' }], // Reduced from 3.75rem
      '7xl': ['3.25rem', { lineHeight: '1' }], // Reduced from 4.5rem
      '8xl': ['3.75rem', { lineHeight: '1' }],
      '9xl': ['4.5rem', { lineHeight: '1' }],
    },
  },
  plugins: [],
}
