import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'gloss': '7pt',
        'verse': '8pt',
        'body': '12pt',
        'chapter': '18pt',
        'title': '24pt',
      },
      spacing: {
        'page-margin': '0.75in',
        'inner-margin': '0.875in',
        'outer-margin': '0.5in',
      },
    },
  },
  plugins: [],
}
export default config
