module.exports = {
  root: true,
  extends: "@react-native",
  rules: { "no-void": ["error", { allowAsStatement: true }] },
  ignorePatterns: ["node_modules/"],
  overrides: [
    {
      files: ["src/domain/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: ["react", "react-native"],
            patterns: [
              "**/data/**",
              "**/presentation/**",
              "**/di/**",
              "@christopher-peters-dev/investment-platform/di",
              "@christopher-peters-dev/investment-platform/design-system",
              "@christopher-peters-dev/investment-platform/data/*",
            ],
          },
        ],
      },
    },
    {
      files: ["src/presentation/**/*.{ts,tsx}"],
      rules: {
        "no-console": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              "**/data/**",
              "**/di/**",
              "@christopher-peters-dev/investment-platform/di",
              "@christopher-peters-dev/investment-platform/data/*",
            ],
          },
        ],
        "no-restricted-globals": ["error", "fetch", "XMLHttpRequest"],
      },
    },
  ],
};
