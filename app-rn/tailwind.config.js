/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:        '#508c76',
        'primary-dark': '#467b68',
        low:            '#c8a83a',
        medium:         '#c87840',
        high:           '#c45050',
        conc:           '#4a4a5a',
        'conc-light':   '#5c5c6b',
      },
    },
  },
  plugins: [],
};
