/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // Light blue-gray background
        surface: '#FFFFFF',    // Pure white for cards/panels
        primary: '#2563EB',    // Strong blue
        success: '#16A34A',    // Green
        danger: '#DC2626',     // Red
      }
    },
  },
  plugins: [],
}
