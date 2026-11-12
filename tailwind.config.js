export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17262B',
        paper: '#F5F7F4',
        line: '#DCE3DF',
        amber: { 400: '#F2A93B', 500: '#E0921A' },
        brand: { 50: '#EAF5F2', 100: '#CDE8E1', 500: '#1B8577', 600: '#0F6E63', 700: '#0B5A51', 900: '#073B36' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
