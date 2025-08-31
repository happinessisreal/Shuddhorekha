/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bangladesh-green': '#006a4e',
        'bangladesh-red': '#f42a41',
      }
    },
  },
  plugins: [],
}