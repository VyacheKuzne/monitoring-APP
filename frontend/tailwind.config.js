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
        'custom-blue': 'rgba(0, 193, 255, 1)',
      },
    },
  },
  plugins: [],
};