import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Custom colors for Verxio
        verxio: {
          dark: '#11171f', // Dark background color
          purple: '#9d4edd', // Purple accent
          blue: '#4361ee', // Blue accent
          cyan: '#4cc9f0', // Cyan accent
          pink: '#f72585', // Pink accent
          green: '#2fc6a4', // Green accent
          neon: {
            purple: '#b14aff',
            blue: '#3772ff',
            green: '#3bf0bb',
            pink: '#ff49db',
            yellow: '#fffc4b',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'neon-purple': '0 0 5px #b14aff, 0 0 20px #b14aff',
        'neon-blue': '0 0 5px #3772ff, 0 0 20px #3772ff',
        'neon-green': '0 0 5px #3bf0bb, 0 0 20px #3bf0bb',
        'neon-pink': '0 0 5px #ff49db, 0 0 20px #ff49db',
        'neon-cyan': '0 0 5px #4cc9f0, 0 0 20px #4cc9f0',
        'card-glow': '0 0 15px rgba(131, 56, 236, 0.4), 0 0 30px rgba(131, 56, 236, 0.15)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
        float: 'float 6s ease-in-out infinite',
        gradient: 'gradient 3s linear infinite',
        slideInLeft: 'slideInLeft 0.5s ease-out forwards',
        slideOutLeft: 'slideOutLeft 0.5s ease-in forwards',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xs: '0.125rem',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      maxWidth: {
        '3xs': '16rem',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)'],
        'pixel-font': ['var(--font-press-start-2p)'],
        kalam: ['var(--font-kalam)'],
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('tailwind-gradient-mask-image')],
} satisfies Config
