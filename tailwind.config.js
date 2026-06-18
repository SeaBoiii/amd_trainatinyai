/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // AMD-inspired palette (not official AMD branding)
        amd: {
          red: '#ED1C24',
          orange: '#FF6B00',
          amber: '#FFA500',
          dark: '#0A0E14',
          panel: '#121821',
          panel2: '#1A2230',
          line: '#27313F',
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(237, 28, 36, 0.35)',
        'glow-orange': '0 0 28px rgba(255, 107, 0, 0.40)',
        card: '0 10px 40px rgba(0, 0, 0, 0.45)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(255,107,0,0.35)' },
          '50%': { boxShadow: '0 0 42px rgba(255,107,0,0.75)' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        gridmove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        spinSlow: 'spinSlow 8s linear infinite',
        sweep: 'sweep 2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease-out both',
        ping2: 'ping2 2s ease-out infinite',
        gridmove: 'gridmove 6s linear infinite',
      },
    },
  },
  plugins: [],
};
