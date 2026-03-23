/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2c5282",
        accent: "#b91c1c",
        'bg-light': "#f9f9f9",
        'border-color': "#ddd",
        'gov-red': '#be1e2d',
        'gov-red-dark': '#9a1824',
        'gov-red-light': '#fdf3f4',
        'gov-yellow': '#ffcd00',
        'gov-text': '#1e293b',
        'gov-text-sub': '#64748b',
        'gov-bg-body': '#f1f5f9',
        'gov-border': '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
