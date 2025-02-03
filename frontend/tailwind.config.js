// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        'color-fon': 'rgba(231, 231, 231, 1)',
      },
    },
  },
  plugins: [],
};