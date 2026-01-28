/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B', // Orange-red
        secondary: '#FF8E8E', // Light orange-red
        accent: '#FFB3BA', // Light pink
        dark: '#1E293B', // Darker slate
        pink: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FFB3BA',
          300: '#FF8E8E',
          400: '#FF6B6B',
          500: '#FF4757',
          600: '#E63946',
        },
        orange: {
          50: '#FFF4E6',
          100: '#FFE8CC',
          200: '#FFD699',
          300: '#FFB84D',
          400: '#FF9500',
          500: '#FF6B6B',
          600: '#E63946',
        },
        icy: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        winter: {
          blue: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
      },
      backgroundImage: {
        'winter-gradient': 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        'icy-gradient': 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)',
        'snow-gradient': 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)',
        'founder-gradient': 'linear-gradient(135deg, #FFB3BA 0%, #FF6B6B 100%)',
        'cta-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #E63946 100%)',
      },
      animation: {
        'swipe-left': 'swipeLeft 0.5s ease-out',
        'swipe-right': 'swipeRight 0.5s ease-out',
      },
      keyframes: {
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(-150%) rotate(-30deg)', opacity: '0' },
        },
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(150%) rotate(30deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

