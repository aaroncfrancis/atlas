// Shared Tailwind/NativeWind preset built from the design tokens (CLAUDE.md §9).
// Apps add this AFTER `nativewind/preset` in their tailwind.config.js so every
// component can use `bg-teal`, `text-overdue`, `font-display`, … and never a
// hardcoded hex.
const { colors, fonts } = require("./tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // `content` is intentionally omitted — each app declares its own content globs
  // (including ../../packages/ui so library classNames get compiled).
  content: [],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        foreground: colors.foreground,
        card: colors.card,
        border: colors.border,
        primary: colors.primary,
        teal: colors.teal,
        overdue: colors.overdue,
        amber: colors.amber,
        green: colors.green,
        purple: colors.purple,
        navy: colors.navy,
        muted: colors.textMuted,
        secondary: colors.textSecondary,
      },
      fontFamily: {
        display: [fonts.display],
        body: [fonts.body],
        sans: [fonts.body],
        mono: [fonts.mono],
      },
    },
  },
};
