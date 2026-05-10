// Configures Tailwind CSS content scanning and theme options.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ios-indigo": "#6155F5",
      },
    },
  },
  plugins: [],
};
