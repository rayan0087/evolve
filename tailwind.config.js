/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F17',
          surface: '#121824',
          card: '#182030',
          border: '#222E46',
          text: '#F1F5F9',
          muted: '#94A3B8'
        },
        quest: {
          emerald: '#10B981',
          blue: '#0EA5E9',
          purple: '#8B5CF6',
          gold: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
