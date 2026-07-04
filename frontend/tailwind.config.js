/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8dfff',
          300: '#7cc4ff',
          400: '#38a5ff',
          500: '#0c87eb',
          600: '#006ac7',
          700: '#0054a1',
          800: '#034885',
          900: '#083c6f',
          950: '#05264b',
        },
      },
    },
  },
  plugins: [],
}
