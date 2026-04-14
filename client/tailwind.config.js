/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        premium: "0 24px 80px rgba(15, 23, 42, 0.12)",
        soft: "0 12px 40px rgba(37, 99, 235, 0.12)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.75s ease-out both",
        floatSlow: "floatSlow 8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
