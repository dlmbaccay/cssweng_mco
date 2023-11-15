/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'raisin_black': '#17171F',
        'snow': '#F5F0F0',
        'light_yellow': '#FFFCDE',
        'jasmine': '#FADA91',
        'xanthous': '#F5B744',
        'citron': '#C3C461',
        'pistachio': '#90D17D',
        'pale_yellow': '#FFEBBE',
        'gray': '#E8E8E8',
        'dark_gray': '#D9D9D9',
        'mustard': '#D18800',
        'grass': '#5C8731'
      }
    },
    plugins: [
      require('tailwind-scrollbar-hide'),
    ],
  },
}
