/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg))',
        card: 'hsl(var(--card))',
        popover: 'hsl(var(--popover))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        fg: 'hsl(var(--fg))',
        muted: 'hsl(var(--muted))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          fg: 'hsl(var(--primary-fg))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          fg: 'hsl(var(--destructive-fg))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          fg: 'hsl(var(--success-fg))',
        },
      },
      borderRadius: {
        xl: '16px',
        lg: '14px',
        md: '12px',
        sm: '10px',
      },
      boxShadow: {
        soft: '0 18px 60px -28px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}

