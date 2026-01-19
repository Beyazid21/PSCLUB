/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors for a professional dark/light mode
        sidebar: {
          light: '#f8fafc',
          dark: '#1e293b',
        },
        panel: {
            light: '#ffffff',
            dark: '#0f172a'
        },
        canvas: '#e2e8f0', // Slight gray for canvas bg
        primary: '#3b82f6',
      },
    },
  },
  plugins: [],
}
