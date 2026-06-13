// Root flat config. Re-exports the shared config from @atlas/config so that
// running `eslint .` from any workspace resolves a single ruleset (ESLint v9
// searches ancestor directories for the nearest config).
import config from "@atlas/config/eslint.config.mjs";

export default config;
