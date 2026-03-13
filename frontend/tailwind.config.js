/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        Diagnosis: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
        },
        Symptoms: {
          light: '#FEF08A',
          DEFAULT: '#EAB308',
          dark: '#A16207',
        },
        Prescriptions: {
          light: '#DCFCE7',
          DEFAULT: '#22C55E',
          dark: '#15803D',
        },
        Lab: {
          light: '#DBEAFE',
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
        },
        primary: {
          light: '#F3F4F6',
          DEFAULT: '#111827',
          dark: '#030712'
        }
      }
    },
  },
  plugins: [],
}
