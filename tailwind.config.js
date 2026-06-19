/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // AMD-inspired palette (not official AMD branding)
        amd: {
          red: '#ED1C24',
          red2: '#ff2b32',
          orange: '#FF6B00',
          amber: '#FFA21A',
          dark: '#0A0E14',
          panel: '#121821',
          panel2: '#1A2230',
          line: '#27313F',
        },
        // Deep neutral scale shared with the sibling "Build a PC" app for a
        // seamless, professional dark surface.
        ink: {
          950: '#06080f',
          900: '#0a0e1a',
          850: '#0e1426',
          800: '#121a30',
          700: '#1b2542',
          600: '#27365e',
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(237, 28, 36, 0.45)',
        'glow-orange': '0 0 28px -6px rgba(255, 107, 0, 0.50)',
        'glow-soft': '0 0 40px -10px rgba(255, 107, 0, 0.35)',
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
        // Shared motion vocabulary with the sibling "Build a PC" app.
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,107,0,0.45)' },
          '70%': { boxShadow: '0 0 0 14px rgba(255,107,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,107,0,0)' },
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
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'scale-in': 'scale-in 0.4s ease-out both',
        glow: 'glow 2.4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.6s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
