// Atlas design tokens — SINGLE SOURCE OF TRUTH (CLAUDE.md §9).
//
// Plain CommonJS on purpose: both the Tailwind preset (consumed by Node tooling)
// and the React Native app (consumed by Metro) read the exact same values, so a
// token can never drift between styling layers.
//
// NOTE: these hex values approximate the §9 light-theme *intent*. Reconcile the
// precise values against the Lovable reference `src/styles.css` when available.
// The app UI is a LIGHT theme; the deep-space starfield is the BRAND layer only.

/** @type {Record<string, string>} */
const colors = {
  background: "#F7F8FA", // off-white app surface
  foreground: "#0F172A", // near-black text
  card: "#FFFFFF", // card surface
  border: "#E5E7EB", // hairline borders
  primary: "#2563EB", // blue — active nav
  teal: "#0D9488", // primary CTAs: Save / Add / Done
  overdue: "#EF4444", // overdue (red/orange)
  amber: "#F59E0B", // soon / high
  green: "#16A34A", // ahead / success
  purple: "#7C3AED", // auto-paid badges + subscription form section
  navy: "#14213D", // deep-navy desktop sidebar
  textMuted: "#94A3B8", // --text-muted
  textSecondary: "#64748B", // --text-secondary
};

/** @type {Record<string, string>} */
const fonts = {
  display: "Archivo", // headings
  body: "HankenGrotesk", // body copy
  mono: "JetBrainsMono", // numbers / amounts
};

module.exports = { colors, fonts };
