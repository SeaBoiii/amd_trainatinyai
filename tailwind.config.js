/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff1ed",
          200: "#ffb499",
          400: "#ff6234",
          500: "#f2431e",
          700: "#9f2a12",
          900: "#3d110a"
        },
        coal: {
          900: "#06080d",
          800: "#10151f",
          700: "#1a2232"
        },
        ice: "#f8faff"
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,98,52,0.3), 0 0 30px rgba(255,98,52,0.2)",
        panel: "0 20px 40px rgba(0,0,0,0.35)"
      },
      keyframes: {
        pulseCore: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.16)", opacity: "1" }
        },
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          from: { backgroundPosition: "0% 0%" },
          to: { backgroundPosition: "200% 0%" }
        }
      },
      animation: {
        pulseCore: "pulseCore 2s ease-in-out infinite",
        rise: "rise .5s ease-out both",
        shimmer: "shimmer 2.4s linear infinite"
      }
    }
  },
  plugins: []
};
