import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#7A5CA8',
          secondary: '#E07BE0',
          accent: '#63C9E4',
          neutral: '#15151D',
          'base-100': '#0A0A0F',
          'base-200': '#15151D',
          'base-200': '#1C1C27',
          info: '#2A6DB6',
          success: '#83D882',
          warning: '#F8A63B',
          error: '#D6455D',
        },
      },
    ],
  },
  plugins: [daisyui],
}
