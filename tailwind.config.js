/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Czech healthcare specific colors
        health: {
          primary: "hsl(var(--health-primary))",
          secondary: "hsl(var(--health-secondary))",
          accent: "hsl(var(--health-accent))",
          emergency: "hsl(var(--health-emergency))",
          success: "hsl(var(--health-success))",
          warning: "hsl(var(--health-warning))",
          info: "hsl(var(--health-info))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        czech: ["Inter", "system-ui", "sans-serif"], // Czech diacritics support
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "pulse-health": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
        "skeleton": {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "pulse-health": "pulse-health 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "skeleton": "skeleton 1.4s ease-in-out infinite",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      screens: {
        'xs': '475px',
      },
      typography: {
        DEFAULT: {
          css: {
            'font-feature-settings': '"kern" 1, "liga" 1, "calt" 1',
            'text-rendering': 'optimizeLegibility',
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    // Custom plugin for Czech healthcare utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.czech-text': {
          'font-feature-settings': '"kern" 1, "liga" 1, "calt" 1',
          'font-variant-ligatures': 'common-ligatures',
          'text-rendering': 'optimizeLegibility',
        },
        '.health-gradient': {
          background: `linear-gradient(135deg, ${theme('colors.health.primary')} 0%, ${theme('colors.health.info')} 100%)`,
        },
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.safe-area-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}