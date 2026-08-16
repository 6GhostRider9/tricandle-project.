/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        mono:    ['"Share Tech Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        bg:   '#06090f',
        s1:   '#0b1220',
        s2:   '#101a2c',
        s3:   '#162038',
        b1:   '#1a2d42',
        b2:   '#243d56',
        b3:   '#2e5070',
        acc:  '#38bdf8',
        acc2: '#818cf8',
        win:  '#22c55e',
        loss: '#ef4444',
        warn: '#f59e0b',
        t1:   '#dce8f5',
        t2:   '#7da0ba',
        t3:   '#3a5470',
      },
    },
  },
  plugins: [],
}
