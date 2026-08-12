/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact amber-gold accent matching screenshot
        amber: {
          50:  "#fcfaf5",
          100: "#f8f3e9",
          200: "#f0e1c8",
          300: "#e7cda4",
          400: "#dfba80",
          500: "#e7b563",   // primary soft gold accent
          600: "#c89a46",
          700: "#9f7734",
          800: "#7b5a28",
          900: "#59401d",
          950: "#32230f",
        },
        // Deep neutral-black backgrounds matching screenshot
        ink: {
          950: "#050505",   // page bg
          900: "#0a0a0a",   // sidebar / panel bg
          850: "#121212",   // card bg
          800: "#1a1a1a",   // elevated card
          700: "#262626",   // border/divider
          600: "#404040",   // hover state
        },
        // Cooler text shades
        sand: {
          100: "#ffffff",   // headings
          200: "#f0f0f0",   // body text
          400: "#a3a3a3",   // muted text
          600: "#737373",   // placeholder / very muted
          800: "#404040",   // dimmed
        },
      },
      fontFamily: {
        display: ["'Times New Roman'", "Calibri", "Georgia", "serif"],
        sans:    ["Calibri", "'Times New Roman'", "Georgia", "serif"],
      },
      backgroundImage: {
        "white-gradient": "linear-gradient(135deg, #ffffff 0%, #d4d4d4 50%, #a3a3a3 100%)",
        "ink-radial": "radial-gradient(140% 140% at 50% 0%, #1c1612 0%, #0e0c0a 45%, #080706 100%)",
      },
      boxShadow: {
        glow:     "0 8px 30px -8px rgba(255, 255, 255, 0.5)",
        glowSoft: "0 0 32px rgba(255, 255, 255, 0.25)",
        card:     "0 1px 0 rgba(255,255,255,0.04), 0 8px 24px -8px rgba(0,0,0,0.9)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s ease forwards",
        floatSlow: "floatSlow 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
