/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accentCyan: '#00ffc6',
        accentBlue: '#00c6ff',
        bgDark: '#070b12',
      },
      boxShadow: {
        neon: '0 0 24px rgba(0, 255, 198, 0.35)',
      },
    },
  },
  plugins: [],
};
