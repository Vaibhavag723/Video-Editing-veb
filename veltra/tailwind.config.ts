import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060d",
          925: "#070813",
          900: "#0a0c18",
          850: "#0d0f1c",
          800: "#12142a",
          700: "#1a1d36",
          600: "#232749",
        },
        primary: {
          DEFAULT: "#a3e635",
          bright: "#c0f34f",
          dim: "#84cc16",
          dark: "#1d2908",
        },
        accent: {
          DEFAULT: "#22d3ee",
          soft: "#67e8f9",
        },
        "lime-soft": "#a8ff78",
        grape: {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          deep: "#6d28d9",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter Variable",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-space)",
          "Space Grotesk Variable",
          "Space Grotesk",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 80px -24px rgba(139,92,246,0.7)",
        "glow-soft": "0 0 60px -28px rgba(139,92,246,0.55)",
        "glow-lime": "0 10px 40px -12px rgba(163,230,53,0.55)",
        "glow-cyan": "0 0 48px -18px rgba(34,211,238,0.55)",
        card: "0 24px 70px -40px rgba(0,0,0,0.85)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.5s ease both",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-glow": "pulse-glow 3.2s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;