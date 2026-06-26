import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        line: "#d7dee8",
        paper: "#f8fafc",
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#059669",
          700: "#047857",
          800: "#065f46"
        },
        clay: {
          100: "#fff1e6",
          500: "#d97706",
          700: "#92400e"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(31, 41, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
