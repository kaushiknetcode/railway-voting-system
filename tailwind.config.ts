import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      height: {
        '300': '300px',
        '400': '400px',
      }
    },
  },
  plugins: [],
} 

export default config