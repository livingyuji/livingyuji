/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1686DC',
          50: '#EBF5FC',
          100: '#D0E9F8',
          200: '#A2D3F1',
          300: '#74BDE9',
          400: '#46A7E2',
          500: '#1686DC',
          600: '#126CB0',
          700: '#0D5184',
          800: '#093658',
          900: '#041B2C',
        },
        deep: '#173651',
        surface: '#FFFFFF',
        'soft-bg': '#F4F9FD',
        border: '#DCE8F1',
        secondary: '#61758A',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        window: '0 8px 32px rgba(23, 54, 81, 0.12), 0 2px 8px rgba(23, 54, 81, 0.08)',
        'window-active': '0 12px 40px rgba(22, 134, 220, 0.16), 0 4px 12px rgba(23, 54, 81, 0.1)',
        card: '0 2px 8px rgba(23, 54, 81, 0.08)',
        taskbar: '0 -2px 16px rgba(23, 54, 81, 0.08)',
        dock: '0 8px 32px rgba(23, 54, 81, 0.15)',
      },
      borderRadius: {
        window: '12px',
        app: '16px',
      },
      backdropBlur: {
        taskbar: '24px',
      },
      animation: {
        'window-open': 'windowOpen 0.2s ease-out',
        'window-close': 'windowClose 0.15s ease-in',
        'window-minimize': 'windowMinimize 0.2s ease-in',
        'app-open': 'appOpen 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-soft': 'bounceSoft 0.4s ease-out',
        'launcher-open': 'launcherOpen 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        windowOpen: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        windowClose: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.92)' },
        },
        windowMinimize: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.6) translateY(40px)' },
        },
        appOpen: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        launcherOpen: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
