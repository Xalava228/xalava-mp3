/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0c29',
          surface: '#1a1a2e',
          card: 'rgba(26, 26, 46, 0.8)',
          hover: 'rgba(102, 126, 234, 0.15)',
          border: 'rgba(118, 75, 162, 0.3)',
          text: '#e5e5e5',
          'text-secondary': '#a0a0a0',
          accent: '#667eea',
          'accent-secondary': '#764ba2',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
}


