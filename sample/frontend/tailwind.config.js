/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
