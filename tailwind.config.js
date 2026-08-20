/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#f9f9ff',
        'surface-base': '#e7ecf2',
        'surface-container': '#e7eeff',
        'surface-container-low': '#f0f3ff',
        'surface-variant': '#d8e3fa',
        'on-surface': '#111c2c',
        'on-surface-variant': '#424752',
        primary: '#005bb2',
        'primary-strong': '#3a7bd5',
        'primary-container': '#3174ce',
        'on-primary': '#ffffff',
        'primary-fixed-dim': '#a9c7ff',
        secondary: '#595f64',
        tertiary: '#8a4c00',
        outline: '#727783',
        'outline-variant': '#c2c6d4',
        error: '#ba1a1a',
        background: '#f9f9ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        raised: '-10px -10px 20px #ffffff, 10px 10px 20px #bfc9d4',
        pressed: 'inset -5px -5px 10px #ffffff, inset 5px 5px 10px #bfc9d4',
        accent: '-5px -5px 15px rgba(255, 255, 255, 0.2), 5px 5px 15px rgba(0, 70, 140, 0.4)',
        island: '-6px -6px 16px rgba(255, 255, 255, 0.9), 6px 6px 16px rgba(191, 201, 212, 0.7)',
      },
      borderRadius: {
        card: '24px',
        btn: '18px',
      },
    },
  },
  plugins: [],
}
