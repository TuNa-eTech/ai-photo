/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0a0a0a",
        "glass-border": "rgba(255, 255, 255, 0.1)",
        "glass-bg": "rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #ec4899 100%)",
        "glass-gradient": "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.5)',
      }
    },
  },
  plugins: [],
}
