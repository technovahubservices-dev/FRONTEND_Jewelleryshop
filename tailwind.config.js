/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#bdedd2",
        "on-primary-fixed": "#002113",
        "tertiary-fixed-dim": "#f8b6b6",
        "surface-variant": "#e3e2e0",
        "on-secondary-fixed": "#241a00",
        "secondary-fixed": "#ffe088",
        "on-tertiary": "#ffffff",
        "charcoal-text": "#1A1A1A",
        "on-surface": "#1a1c1b",
        "on-secondary-container": "#745c00",
        "surface-container-highest": "#e3e2e0",
        "surface-white": "#FFFFFF",
        "tertiary-fixed": "#ffdad9",
        "on-primary-fixed-variant": "#234f3b",
        "inverse-on-surface": "#f1f1ef",
        "on-tertiary-fixed": "#340f12",
        "secondary-container": "#fed65b",
        "surface-tint": "#3b6751",
        "on-primary-container": "#6f9c84",
        "surface-container-lowest": "#ffffff",
        "inverse-primary": "#a2d1b7",
        "regal-gold": "#D4AF37",
        "on-error": "#ffffff",
        "surface-container-high": "#e9e8e6",
        "primary-container": "#013220",
        "on-error-container": "#93000a",
        "on-background": "#1a1c1b",
        "on-primary": "#ffffff",
        "soft-cream": "#F9F8F6",
        "deep-emerald": "#013220",
        "primary": "#001b0f",
        "surface-dim": "#dadad8",
        "outline-variant": "#c1c8c2",
        "secondary-fixed-dim": "#e9c349",
        "primary-fixed-dim": "#a2d1b7",
        "error-container": "#ffdad6",
        "surface-bright": "#faf9f7",
        "background": "#faf9f7",
        "error": "#ba1a1a",
        "tertiary-container": "#471e20",
        "on-secondary": "#ffffff",
        "surface-container-low": "#f4f3f1",
        "secondary": "#735c00",
        "tertiary": "#2d0a0d",
        "on-secondary-fixed-variant": "#574500",
        "surface": "#faf9f7",
        "outline": "#717973",
        "on-tertiary-fixed-variant": "#68393b",
        "on-tertiary-container": "#be8283",
        "on-surface-variant": "#414943",
        "surface-container": "#efeeec",
        "inverse-surface": "#2f3130"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        unit: "8px",
        "container-max": "1280px",
        "margin-desktop": "64px",
        "margin-mobile": "20px",
        gutter: "24px"
      },
      fontFamily: {
        "headline-lg-mobile": ["Playfair Display"],
        "headline-md": ["Playfair Display"],
        "label-caps": ["Open Sans"],
        "display-lg": ["Playfair Display"],
        "headline-lg": ["Playfair Display"],
        "body-lg": ["Open Sans"],
        "body-md": ["Open Sans"]
      },
      fontSize: {
        "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "500" }],
        "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.1em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-lg": ["36px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }]
      }
    },
    plugins: [
      function ({ addUtilities }) {
        addUtilities({
          '.custom-scrollbar::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
          },
          '.custom-scrollbar::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '.custom-scrollbar::-webkit-scrollbar-thumb': {
            backgroundColor: '#e3e2e0',
            borderRadius: '4px',
          },
          '.table-row-hover:hover': {
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease',
          },
          '.transition-all-custom': {
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          },
        })
      }
    ]
  }
}
