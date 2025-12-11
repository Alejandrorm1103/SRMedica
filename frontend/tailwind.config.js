/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
  // 1. 🛑 Solución: Añadir la ruta de escaneo de HeroUI
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    
    // 🔥 RUTA CRÍTICA AÑADIDA PARA HEROUI
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // 2. ⚠️ Solución: Mover la configuración de colores a 'extend'
    // Además, definir 'primary' dentro de extend para que HeroUI lo use
    extend: {
      colors: {
        // Mapeo de HeroUI: Define tu color 'blue' como el color 'primary'
        // Esto hace que color="primary" use tu valor '#0367A6'
        primary: {
          DEFAULT: '#0367A6', // Tu color 'blue'
          foreground: '#F2F2F2', // Opcional: Define el color de texto para este fondo
        },

        secondary: {
          DEFAULT: '#F2F2F2',
          foreground: '#000000',
        },
        
        // Tus colores personalizados se fusionan aquí con los de Tailwind/HeroUI
        transparent: 'transparent',
        current: 'currentColor',
        'white': '#F2F2F2',
        'black': '#000000',
        'blue': '#0367A6', // Tu color 'blue'
        "lightblue": "#13C9F2",
        // ... (el resto de tus colores personalizados)
        'lightgrey': '#AEC7E4',
        'greebblue': '#79F2F2',
        'greenlight': '#50F2E2',
        'navyblue': '#002834',
        'beach': '#8EA9C1',
        'circlebg' : "rgba(77, 213, 143, 0.25)",
        'darkblue' : ' #000321',
        'offwhite' : 'rgba(255, 255, 255, 0.75);',
        'bordertop' : 'rgba(196, 196, 196, 0.5);',
        'blue-500' : '#0075FF',
        'darkgray' : '#90A3B4',
        'babyblue' : '#E2F3F9',
        'grey500': '#ECECEC',
        'bluegray' : "#7D82A1",
        'bluegrey' : "#7C8F9E",
        'midnightblue' : '#183B56',
        'midblue' : '#00276F',
        'bluebg' : "rgba(47, 184, 227, 0.2)",
        'border' : "rgba(128, 135, 137, 0.35)"
      },
      // Tus configuraciones de tamaño de fuente son correctas dentro de theme, 
      // pero si quieres que también se fusionen, puedes moverlas aquí:
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
    }, // Cierre de extend
  }, // Cierre de theme
  
  darkMode: "class",
  plugins: [heroui()],
}