/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EAF7EE",
          100: "#CFEBD8",
          200: "#A3D9B5",
          300: "#79C596",
          400: "#4CA873",
          500: "#2F8F52",
          600: "#1F6E3D",
          700: "#175530",
          800: "#123F24",
          900: "#0C2E1A",
        },
        accent: {
          400: "#FFA23E",
          500: "#F5860B",
          600: "#DE6E00",
          700: "#B75700",
        },
        ink: {
          900: "#16231A",
          700: "#2B3A30",
          500: "#5B6B60",
        },
        cream: "#FAF8F3",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 2px 10px rgba(23, 85, 48, 0.08)",
        popover: "0 12px 32px rgba(23, 85, 48, 0.16)",
      },
    },
  },
  plugins: [],
};
