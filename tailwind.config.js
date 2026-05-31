/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: scan all .tsx/.ts files in src/
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Enable dark mode via NativeWind's 'class' strategy
  // (driven by the 'dark' class on the root View in App.tsx)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand palette ─────────────────────────────
        primary: {
          DEFAULT: '#2563EB', // Blue-600
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#F97316', // Orange-500
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        success: {
          DEFAULT: '#16A34A', // Green-600
          light: '#DCFCE7',
        },
        danger: {
          DEFAULT: '#DC2626', // Red-600
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#D97706', // Amber-600
          light: '#FEF3C7',
        },
        // ── Surface / Background ──────────────────────
        surface: {
          DEFAULT: '#F8FAFC',  // Slate-50 (light)
          card:    '#FFFFFF',
          muted:   '#F1F5F9',  // Slate-100
          // Dark variants
          dark:         '#0F172A', // Slate-900
          'dark-card':  '#1E293B', // Slate-800
          'dark-muted': '#334155', // Slate-700
        },
        // ── Text ─────────────────────────────────────
        text: {
          primary:   '#1E293B', // Slate-800
          secondary: '#64748B', // Slate-500
          muted:     '#94A3B8', // Slate-400
          inverse:   '#FFFFFF',
          // Dark variants
          'dark-primary':   '#F1F5F9', // Slate-100
          'dark-secondary': '#94A3B8', // Slate-400
          'dark-muted':     '#64748B', // Slate-500
        },
        border: '#E2E8F0',        // Slate-200 (light)
        'border-dark': '#334155', // Slate-700 (dark)
      },
      fontFamily: {
        sans:   ['System'],
        mono:   ['Courier'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        18: '72px',
        22: '88px',
      },
    },
  },
  plugins: [],
};
