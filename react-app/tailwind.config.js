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
        terracotta: {
          DEFAULT: '#E2725B',
          50: '#FDF4F2',
          100: '#FAE8E3',
          200: '#F5D1C7',
          300: '#F0BAAB',
          400: '#EBA38F',
          500: '#E2725B',
          600: '#D85A3F',
          700: '#B84A33',
          800: '#983A27',
          900: '#782A1B',
        },
      },
    },
  },
  plugins: [],
}
