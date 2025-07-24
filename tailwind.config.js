const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class", // Enable dark mode based on class
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"], // Configure files to scan for Tailwind classes
  theme: {
    extend: {
      screens: {
        xs: '390px', // Custom breakpoint for smaller phones like iPhone 12 Pro
      },
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
        ruwudu: ['Ruwudu', 'sans-serif'],
        lateef: ['Lateef', 'serif'],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      colors: {
        gold: "#FFD700", // Gold
        "dark-gold": "#DAA520", // Goldenrod
        "perfume-gold": "rgb(210 169 57)", // Custom color for "Luxury Perfume Collection"
        primary: {
          DEFAULT: "#FFD700", // Gold
          hover: "#DAA520", // Goldenrod
        },
        secondary: {
          DEFAULT: "#B8860B", // DarkGoldenrod
          hover: "#A52A2A", // Brown
        },
        accent: {
          DEFAULT: "#FFBF00", // Amber
          hover: "#CC9900", // Darker Amber
        },
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
      fontSize: {
        'base': ['1rem', { lineHeight: '1.5rem' }], // Default base font size
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // Default lg font size
        'xl': ['1.25rem', { lineHeight: '1.75rem' }], // Default xl font size
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // Default 2xl font size
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // Default 3xl font size
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // Default 4xl font size
        '5xl': ['3rem', { lineHeight: '1' }], // Default 5xl font size
        '6xl': ['3.75rem', { lineHeight: '1' }], // Default 6xl font size
        // Custom larger sizes for general text
        'body-sm': ['1rem', { lineHeight: '1.6' }], // Larger sm
        'body-base': ['1.15rem', { lineHeight: '1.7' }], // Larger base
        'body-lg': ['1.3rem', { lineHeight: '1.8' }], // Larger lg
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
    },
  },
};
