/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        flower: {
          pink: '#ffb3d9',
          purple: '#d9b3ff',
          yellow: '#ffd9b3',
          blue: '#b3d9ff',
          green: '#b3ffd9',
        }
      },
      animation: {
        'bloom': 'bloom 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bloom: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
