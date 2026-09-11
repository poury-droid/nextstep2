/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#58a2ff',
          500: '#2f7eff',
          600: '#195ff5',
          700: '#124ae1',
          800: '#153db6',
          900: '#17368f',
          950: '#112257',
        }
      }
    },
  },
  plugins: [],
}
