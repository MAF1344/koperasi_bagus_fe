/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFBC54',
        secondary: '#E06100',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
