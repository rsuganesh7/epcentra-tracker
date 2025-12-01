/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        epcentra: {
          navy: '#1E3A5F',
          teal: '#2A8B8B',
          gold: '#D4A84B',
          darkNavy: '#152A45',
          lightTeal: '#3AA5A5',
          lightGold: '#E8C878',
          gray: '#6B7280',
          lightGray: '#F5F7F9'
        }
      }
    },
  },
  plugins: [],
}
