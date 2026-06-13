// EXPO_PUBLIC_* values are inlined by Expo's Babel transform at bundle time.
// Minimal ambient typing for `process.env` so this package typechecks in
// isolation without depending on @types/node.
declare const process: {
  readonly env: Record<string, string | undefined>;
};
