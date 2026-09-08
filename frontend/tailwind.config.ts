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
      },
    },
  },
  plugins: [],
};
export default config;
