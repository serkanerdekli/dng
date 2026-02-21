/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fdf5e6", // Eski kağıt rengi
        ink: "#2c1b18",   // Mürekkep siyahı
        stamp: "#8b0000", // Mühür kırmızısı
        sepia: "#5e4b3c", // Sepya tonu
      },
      fontFamily: {
        serif: ['"Crimson Text"', 'serif'],
        mono: ['"Courier Prime"', 'monospace'],
      }
    },
  },
  plugins: [],
}
