import type { Config } from "tailwindcss";
import { ColorScale, ConfigTheme, nextui } from "@nextui-org/react";

const primaryColors: ColorScale = {
  "50": "#f3b2c1",
  "100": "#e76684",
  "200": "#e34c6f",
  "300": "#df325a",
  "400": "#db1946",
  "500": "#d80032",
  "600": "#c2002d",
  "700": "#ac0028",
  "800": "#970023",
  "900": "#6c0019",
  DEFAULT: "#d80032",
  foreground: "#fbe5ea",
};

const darkTheme: ConfigTheme = {
  extend: "dark",
  colors: {
    background: {
      "100": "#1a1a1a",
      "200": "#1f1f1f",
      "300": "#242424",
      "400": "#292929",
      "500": "#2e2e2e",
      "600": "#333333",
      "700": "#383838",
      "800": "#3d3d3d",
      "900": "#424242",
      "50": "#151515",
      DEFAULT: "#1a1a1a",
      foreground: "#ffffff",
    },
    primary: primaryColors,
  },
};

const lightTheme: ConfigTheme = {
  extend: "light",
  colors: {
    primary: primaryColors,
  },
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|snippet|code|input).js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: darkTheme,
        light: lightTheme,
      },
    }),
  ],
};
export default config;
