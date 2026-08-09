import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
          accent: "#635BFF",
          lightAccent: "#7C75FF",
        },
        ink: {
          950: "#07070a",
          900: "#0c0d12",
          850: "#12131a",
          800: "#181a24",
          700: "#222533",
          600: "#2d3142",
        },
        gold: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
        },
        mist: {
          100: "#f5f6f7",
          300: "#c7ccd4",
          400: "#9aa1ac",
          500: "#767d89",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #a78bfa 0%, #635bff 45%, #4f46e5 100%)",
        "purple-glow-gradient": "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(99, 91, 255, 0.08) 50%, transparent 80%)",
        "purple-stat-gradient": "linear-gradient(90deg, #5b4dff 0%, #6366f1 50%, #4f46e5 100%)",
        "gold-gradient": "linear-gradient(135deg, #ffffff 0%, #e4e4e7 45%, #a1a1aa 100%)",
        "ink-radial": "radial-gradient(140% 140% at 50% 0%, #161426 0%, #0c0d12 45%, #07070a 100%)",
      },
      boxShadow: {
        purple: "0 10px 35px -8px rgba(99, 91, 255, 0.5)",
        purpleGlow: "0 0 40px rgba(124, 58, 237, 0.35)",
        card: "0 1px 0 rgba(255,255,255,0.06), 0 12px 35px -12px rgba(0,0,0,0.8)",
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
export default config;
