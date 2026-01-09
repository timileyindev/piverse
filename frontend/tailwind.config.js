/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#3713ec",
        "background-light": "#f6f6f8",
        "background-dark": "#131022",
      },
      fontFamily: {
        "display": ["Space Grotesk", "monospace"]
      },
    },
  },
  plugins: [],
}

