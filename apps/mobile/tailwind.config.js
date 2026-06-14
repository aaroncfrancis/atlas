/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // CRITICAL (monorepo): without this glob, classNames used inside @atlas/ui
    // components compile to no styles.
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  // nativewind/preset first, then Atlas design tokens (colors, fonts) from
  // @atlas/config so `bg-teal`, `text-overdue`, `font-display`, … resolve.
  presets: [require("nativewind/preset"), require("@atlas/config/tailwind-preset")],
  theme: { extend: {} },
  plugins: [],
};
