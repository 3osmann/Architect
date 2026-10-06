import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Monochrome palette — brutalist ink, slate and a concrete accent.
        ink: "#0a0a0a",
        carbon: "#141414",
        slate950: "#0d1117",
        ash: "#1c1c1c",
        steel: "#6b6b6b",
        fog: "#a3a3a3",
        concrete: "#c9c7c1",
        paper: "#f2f1ee",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        brutal: "0.35em",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        pulseLine: "pulseLine 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
