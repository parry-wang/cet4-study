/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
    },
    extend: {
      colors: {
        // 墨纸奶白底色系
        paper: {
          50: "#FBF8F2",
          100: "#F7F3EC",
          200: "#EFE9DC",
          300: "#E2D9C5",
          400: "#C9BC9A",
        },
        // 墨色正文系
        ink: {
          50: "#F5F5F4",
          100: "#E7E5E4",
          400: "#57534E",
          700: "#292524",
          900: "#1A1A1A",
          950: "#0C0A09",
        },
        // 深酒红强调色
        wine: {
          50: "#FBF1F1",
          100: "#F5DDDD",
          500: "#7A2E2E",
          600: "#661F1F",
          700: "#4E1818",
          900: "#2D0E0E",
        },
        // 旧金辅助色
        gold: {
          100: "#F5E6C8",
          400: "#D4A847",
          500: "#B8860B",
          600: "#966B08",
        },
        // 苔绿（已掌握状态）
        moss: {
          100: "#E3ECE2",
          500: "#3E5641",
          600: "#2E4231",
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: "-0.04em",
        editorial: "0.02em",
      },
      boxShadow: {
        paper: "0 1px 0 0 rgba(26,26,26,0.06), 0 0 0 1px rgba(26,26,26,0.05)",
        lift: "0 12px 32px -12px rgba(26,26,26,0.18), 0 0 0 1px rgba(26,26,26,0.06)",
      },
      keyframes: {
        flipIn: {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
        riseIn: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        barWave: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        flipIn: "flipIn 0.5s ease-out",
        riseIn: "riseIn 0.6s ease-out both",
        barWave: "barWave 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
