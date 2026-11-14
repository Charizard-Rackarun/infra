import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#718096",
        brand: "#3157D5",
        canvas: "#F5F7FB"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(23, 32, 51, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
