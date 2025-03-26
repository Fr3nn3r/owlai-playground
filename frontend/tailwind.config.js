/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Professional blue
          light: '#60A5FA',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#7C3AED', // Professional purple
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        accent: {
          success: '#059669', // Professional green
          warning: '#D97706', // Professional amber
          error: '#DC2626',   // Professional red
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(37, 99, 235, 0.2)',
      },
      borderRadius: {
        'xl': '12px',
        'pill': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.4s ease-out',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'bounce': 'bounce 0.5s cubic-bezier(0.36, 0, 0.66, -0.56)',
        'float': 'float 3s ease-in-out infinite',
        'slideIn': 'slideIn 0.3s ease-out',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'blink': 'blink 2s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      width: {
        '25': '25%',
        '20': '20%',
        '55': '55%',
      },
    },
  },
  plugins: [],
};
