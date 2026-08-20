/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-blue-50', 'text-blue-600', 'text-blue-700', 'bg-blue-100',
    'bg-green-50', 'text-green-600', 'text-green-700', 'bg-green-100',
    'bg-gray-50', 'text-gray-600', 'text-gray-700', 'bg-gray-100',
    'bg-orange-50', 'text-orange-600', 'text-orange-700', 'bg-orange-100',
    'bg-red-50', 'text-red-600', 'text-red-700', 'bg-red-100',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
