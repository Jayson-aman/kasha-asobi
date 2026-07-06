import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0D1B3E',
        gold: '#C9A050',
      },
    },
  },
  plugins: [],
};
export default config;
