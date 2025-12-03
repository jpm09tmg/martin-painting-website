/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
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
