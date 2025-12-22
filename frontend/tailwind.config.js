/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a24',
          hover: '#252532',
          border: '#2a2a3a',
          text: '#f5f5f7',
          'text-secondary': '#9898a6',
          'text-muted': '#5a5a6e',
          accent: '#a855f7',
          'accent-hover': '#9333ea',
          'accent-secondary': '#ec4899',
          'accent-glow': 'rgba(168, 85, 247, 0.3)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at top, #1a1a24 0%, #0a0a0f 100%)',
        'gradient-accent': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(168,85,247,0.05) 0%, transparent 100%)',
      },
      borderRadius: {
        'card': '12px',
        'xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.15)',
        'glow-lg': '0 0 40px rgba(168, 85, 247, 0.2)',
      },
    },
  },
  plugins: [],
}
