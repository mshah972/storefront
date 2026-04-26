/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f6f4ef',     // warm cream page bg
        surface: '#ffffff',    // cards
        chalk: '#fbfaf7',      // hero / muted surface
        ink: {
          DEFAULT: '#0e1116',  // headings, primary text
          soft: '#26292e',
          muted: '#5c6168',
          subtle: '#8a8f96',
          ghost: '#bec3c8',
        },
        line: {
          DEFAULT: '#e8e4dc',
          strong: '#d3cdc1',
        },
        coral: {
          DEFAULT: '#ff5a36',  // primary accent
          deep: '#e64018',
          tint: '#ffeae3',
          ink: '#a8311a',
        },
        sage: '#7d9a7d',
        emerald: '#0f7a4a',
        amber: '#b8651f',
        rose: '#c2185b',
        danger: '#c4332b',
      },
      fontFamily: {
        sans: ['"Urbanist"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Urbanist"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.18em',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14,17,22,0.04), 0 4px 12px -8px rgba(14,17,22,0.06)',
        lift: '0 2px 4px rgba(14,17,22,0.04), 0 12px 32px -16px rgba(14,17,22,0.12)',
        focus: '0 0 0 3px rgba(255,90,54,0.18)',
      },
    },
  },
  plugins: [],
}
