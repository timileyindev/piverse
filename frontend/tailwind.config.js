/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#D30000',
          blue: '#00D1FF',
          dark: '#050505',
          gray: '#1A1A1A',
        },
        terminal: {
          green: '#00FF00',
          cyan: '#00D1FF',
          red: '#FF0000',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
        display: ["Orbitron", "sans-serif"]
      },
      boxShadow: {
        'neon-red': '0 0 10px #D30000, 0 0 20px #D30000',
        'neon-blue': '0 0 10px #00D1FF, 0 0 20px #00D1FF',
      }
    },
  },
  plugins: [],
}

