// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['"Montserrat"', "sans-serif"],
      },
      colors: {
        "color-fon": "rgba(89, 89, 89, 0.77)",
        "color-bg": "rgba(243, 241, 241, 1)",
        "custom-green": "#2FBD12",
        "custom-yellow": "#FBBB0A",
        "custom-red": "#EC1515",
      },
    },
  },
  plugins: [],
};
