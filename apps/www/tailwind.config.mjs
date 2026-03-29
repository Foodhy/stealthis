/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        accent: {
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
        },
        surface: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#030712",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.1)",
      },
      opacity: {
        6: "0.06",
        8: "0.08",
        14: "0.14",
      },
    },
  },
  plugins: [],
};
