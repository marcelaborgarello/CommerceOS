/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-color)",
        card: "var(--card-bg)",
        input: "var(--input-bg)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        accent: "var(--accent-color)", // #38bdf8
        success: "var(--success-color)", // #4ade80
        error: "var(--error-color)", // #ef4444
        warning: "var(--warning-color)", // #fbbf24
        border: "var(--border-color)",

        // Brand Colors
        brand: {
          cream: "#F0EDD8",
          green: "#557A2A",
          peach: "#FFDEB8",
        }
      },
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif'],
        brand: ['var(--font-brand)', 'serif'],
      }
    },
  },
  plugins: [],
}

