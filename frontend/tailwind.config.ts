import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bdd2ff',
          300: '#8fb2ff',
          400: '#5f89ff',
          500: '#365ff8',
          600: '#2748db',
          700: '#213cb0',
          800: '#22388d',
          900: '#22336f'
        }
      },
      boxShadow: {
        soft: '0 10px 40px rgba(31, 47, 70, 0.12)'
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
} satisfies Config;
