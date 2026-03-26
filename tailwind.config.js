/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#2E7D32',
        accent: '#FF6F00',
        surface: '#FFFFFF',
        background: '#F5F5F5',
        muted: '#757575',
        error: '#D32F2F',
        success: '#388E3C',
      },
      fontFamily: {
        heading: ['Libre Baskerville', 'serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}