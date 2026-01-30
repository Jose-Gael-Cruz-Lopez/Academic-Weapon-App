/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"VT323"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        paper: '#f8f5f2',
        ink: '#1a1818',
        'pixel-gray': '#e5e5e5',
        'pixel-dark': '#2d2d2d',
        'rpg-red': '#ff6b6b',
        'rpg-blue': '#4d96ff',
        'rpg-green': '#6bcb77',
        'rpg-yellow': '#ffd93d',
        'rpg-purple': '#9d4edd',
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px #1a1818',
        'pixel-sm': '2px 2px 0px 0px #1a1818',
        'pixel-pressed': 'inset 2px 2px 0px 0px #1a1818',
      }
    }
  },
  plugins: [],
}
