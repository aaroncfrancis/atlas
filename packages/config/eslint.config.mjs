// Shared ESLint flat config (ESLint v9). Each workspace re-exports this from its
// own eslint.config.mjs so `eslint .` resolves one ruleset everywhere.
//
// Non-type-checked typescript-eslint rules are used deliberately: type-aware
// linting would require wiring `parserOptions.project` to every package's
// tsconfig, which is brittle in a monorepo. `tsc --noEmit` (the typecheck task)
// already provides full type safety; ESLint covers the rest.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.expo/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/babel.config.js",
      "**/metro.config.js",
      "**/tailwind.config.js",
      "**/tailwind-preset.js",
      "**/tokens.js",
      "**/*.config.cjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
