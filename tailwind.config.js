/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fdf5e6",
        ink: "#2c1b18",
        stamp: "#8b0000",
      }
    },
  },
  plugins: [],
}
