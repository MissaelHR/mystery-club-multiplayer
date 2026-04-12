/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0f172a",
        plum: "#3b1f3b",
        parchment: "#f6f1e7",
        gold: "#d8b25c",
        mist: "#dbe4f0",
      },
      boxShadow: {
        glow: "0 0 40px rgba(216, 178, 92, 0.18)",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Trebuchet MS", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
};

