import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4edfa",
          100: "#e4d5f1",
          200: "#c6a9e0",
          300: "#9d76c7",
          400: "#7849ac",
          500: "#542b7c",
          600: "#47246a",
          700: "#3a1d58",
          800: "#2d1745",
          900: "#201033",
          DEFAULT: "#542b7c",
        },
        severity: {
          critical: "#dc2626",
          serious: "#c026d3",
          moderate: "#d97706",
          minor: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
