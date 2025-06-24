/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'text': 'rgb(var(--text-color) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary-color) / <alpha-value>)',
        'background': 'rgb(var(--background-start-rgb) / <alpha-value>)',
        'card': 'rgb(var(--card-bg) / <alpha-value>)',
        'accent': 'rgb(var(--accent-color) / <alpha-value>)',
        'button': 'rgb(var(--button-color) / <alpha-value>)',
        'button-hover': 'rgb(var(--button-hover-color) / <alpha-value>)',
        'run-button': 'rgb(var(--run-button-color) / <alpha-value>)',
        'run-button-hover': 'rgb(var(--run-button-hover-color) / <alpha-value>)',
        'reset-button': 'rgb(var(--reset-button-color) / <alpha-value>)',
        'reset-button-hover': 'rgb(var(--reset-button-hover-color) / <alpha-value>)',
        'entry-bg': 'rgb(var(--entry-bg) / <alpha-value>)',
        'entry-border': 'rgb(var(--entry-border) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}; 