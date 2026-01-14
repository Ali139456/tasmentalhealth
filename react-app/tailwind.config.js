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
  },
  plugins: [],
}
