/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx,js,jsx}",
        // Ruta crítica para HeroUI
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                // Colores base de shadcn/ui (mantenidos para compatibilidad)
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: '#0367A6', // Color azul principal de guia-estilos
                    foreground: '#F2F2F2',
                },
                secondary: {
                    DEFAULT: '#F2F2F2',
                    foreground: '#000000',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                // Colores personalizados de guia-estilos-frontend
                'white': '#F2F2F2',
                'black': '#000000',
                'blue': '#0367A6',
                'lightblue': '#13C9F2',
                'lightgrey': '#AEC7E4',
                'greebblue': '#79F2F2',
                'greenlight': '#50F2E2',
                'navyblue': '#002834',
                'beach': '#8EA9C1',
                'circlebg': 'rgba(77, 213, 143, 0.25)',
                'darkblue': '#000321',
                'offwhite': 'rgba(255, 255, 255, 0.75)',
                'bordertop': 'rgba(196, 196, 196, 0.5)',
                'blue-500': '#0075FF',
                'darkgray': '#90A3B4',
                'babyblue': '#E2F3F9',
                'grey500': '#ECECEC',
                'bluegray': '#7D82A1',
                'bluegrey': '#7C8F9E',
                'midnightblue': '#183B56',
                'midblue': '#00276F',
                'bluebg': 'rgba(47, 184, 227, 0.2)',
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
                '7xl': ['4.5rem', { lineHeight: '1' }],
                '8xl': ['6rem', { lineHeight: '1' }],
                '9xl': ['8rem', { lineHeight: '1' }],
                '65xl': ['65px', { lineHeight: '1' }],
                '80xl': ['80px', { lineHeight: '6rem' }],
            },
        }
    },
    plugins: [
        require("tailwindcss-animate"),
        heroui(),
    ],
}
