/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ← indispensable pour activer dark:*
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // 'tablet': { 'min': '1200px', 'max': '1360px' },
        // 'tablet-md': { 'min': '1190px', 'max': '1200px' },
        // 'tablet-sm': { 'min': '960px', 'max': '1190px' },
        // 'tablet-sm-2': { 'min': '830px', 'max': '960px' },
        // 'tablet-sm-3': { 'min': '700px', 'max': '830px' },
        // 'tablet-sm-4': { 'min': '500px', 'max': '700px' },
        // 'tablet-sm-5': { 'min': '200px', 'max': '500px' },
        'mobile': { 'max': '1145px' },
        'desktop': '1145px',
      },
      colors: {
        // Déclare les couleurs basées sur tes variables CSS
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        ring: "hsl(var(--ring))",
        // Tes couleurs brand
        brand: {
          50: "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
          800: "hsl(var(--brand-800))",
          900: "hsl(var(--brand-900))",
          950: "hsl(var(--brand-950))",
        },
        orange: {
          50: "hsl(var(--orange-50))",
          100: "hsl(var(--orange-100))",
          200: "hsl(var(--orange-200))",
          300: "hsl(var(--orange-300))",
          400: "hsl(var(--orange-400))",
          500: "hsl(var(--orange-500))",
          600: "hsl(var(--orange-600))",
          700: "hsl(var(--orange-700))",
          800: "hsl(var(--orange-800))",
          900: "hsl(var(--orange-900))",
          950: "hsl(var(--orange-950))",
        },
        gray: {
          50: 'hsl(0, 0%, 98%)',
          100: 'hsl(0, 0%, 96%)',
          200: 'hsl(0, 0%, 90%)',
          300: 'hsl(0, 0%, 83%)',
          400: 'hsl(0, 0%, 64%)',
          500: 'hsl(0, 0%, 45%)',
          600: 'hsl(0, 0%, 32%)',
          700: 'hsl(0, 0%, 25%)',
          800: 'hsl(0, 0%, 15%)',
          900: 'hsl(0, 0%, 9%)',
          950: 'hsl(0, 0%, 4%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};