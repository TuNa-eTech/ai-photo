/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        primary: {
          1: '#F5E6D3', // Warm Linen
          2: '#D4C4B0', // Soft Taupe
        },
        accent: {
          1: '#F4E4C1', // Champagne
          2: '#E8D5D0', // Dusty Rose
        },
        text: {
          primary: '#4A3F35',   // Dark Brown
          secondary: '#7A6F5D', // Soft Brown
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem', // 72px - Standard header height
        '88': '22rem',
        '128': '32rem',
      },
      height: {
        '18': '4.5rem', // 72px - Standard header height
      },
      borderRadius: {
        'glass-sm': '16px',
        'glass': '22px',
        'glass-lg': '28px',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '30px',
      },
      boxShadow: {
        'glass': '0 8px 18px rgba(0, 0, 0, 0.15)',
        'glass-lg': '0 12px 24px rgba(0, 0, 0, 0.2)',
        'glass-xl': '0 16px 32px rgba(0, 0, 0, 0.25)',
      },
    },
  },
}

