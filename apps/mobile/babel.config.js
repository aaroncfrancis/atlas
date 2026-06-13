module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // NOTE: for SDK 54+ the reanimated babel plugin is bundled into
    // babel-preset-expo — do NOT add "react-native-reanimated/plugin" here.
  };
};
