
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        haleha: {
          pink: "#F7A8C4",
          dark: "#E85D91",
          light: "#FFF7FA",
        },
      },
    },
  },
  plugins: [],
};

export default config;
