/// <reference types="nativewind/types" />

// Allow the side-effect import of the Tailwind entry stylesheet (processed by
// NativeWind's Metro transform). Without this, tsc errors TS2882 on `import
// "../global.css"`.
declare module "*.css" {}
