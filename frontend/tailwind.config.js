/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#101827',
          surface: '#172235',
          border: '#233045',
        },
        brand: {
          50: '#F0F7F7',
          100: '#D7EBEA',
          200: '#B0D7D5',
          300: '#7FBDBC',
          400: '#4D9F9D',
          500: '#2A8582',
          600: '#0F6B68',
          700: '#0B5754',
          800: '#084341',
          900: '#053130',
          DEFAULT: '#0F6B68',
          hover: '#0B5754',
          soft: '#EAF6F5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1F3F1',
          background: '#F7F7F4',
        },
        borderline: '#D9DEDA',
        inktext: {
          primary: '#111827',
          secondary: '#4B5563',
          muted: '#6B7280',
        },
        appsuccess: {
          DEFAULT: '#15803D',
          soft: '#EAF6EC',
        },
        appwarning: {
          DEFAULT: '#B7791F',
          soft: '#FFF5DA',
        },
        apperror: {
          DEFAULT: '#B42318',
          soft: '#FDECEC',
        },
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
        '2xl': '12px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(16, 24, 39, 0.04)',
        'sm': '0 1px 3px 0 rgba(16, 24, 39, 0.06), 0 1px 2px -1px rgba(16, 24, 39, 0.04)',
        'md': '0 4px 6px -1px rgba(16, 24, 39, 0.05), 0 2px 4px -2px rgba(16, 24, 39, 0.03)',
      },
    },
  },
  plugins: [],
}
