// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Expo SDK 52+ auto-configures monorepo `watchFolders` / `nodeModulesPaths`, so
// no manual wiring is needed here. If a workspace package ever fails to resolve
// through pnpm's store, the escape hatch is:
//   const path = require("path");
//   const monorepoRoot = path.resolve(__dirname, "../..");
//   config.watchFolders = [monorepoRoot];
//   config.resolver.nodeModulesPaths = [
//     path.resolve(__dirname, "node_modules"),
//     path.resolve(monorepoRoot, "node_modules"),
//   ];
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
