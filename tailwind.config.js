/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],

  // Use class-based dark mode (you can switch themes with a class on <html> or <body>)
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // These map directly to the CSS variables in globals.css
        background: "var(--bg)",
        "background-dark": "var(--bg-dark)",
        "background-light": "var(--bg-light)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",

        border: "var(--border)",
        "border-muted": "var(--border-muted)",

        primary: "var(--primary)",
        // "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        // "secondary-foreground": "var(--secondary-foreground)",

        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",
        info: "var(--info)",
      },
    },
  },

  plugins: [],
};

export default config;
