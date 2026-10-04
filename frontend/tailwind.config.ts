import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f3",
          100: "#d7ecdf",
          500: "#1f7a5c",
          600: "#186349",
          700: "#134c39",
        },
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e7e7e7",
          300: "#d3d3d3",
          400: "#bfbfbf",
          500: "#888888",
          600: "#595959",
          700: "#2c2c2c",
          800: "#181818",
          900: "#0f0f0f",
        },
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite ease-in-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
