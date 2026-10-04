module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/?(*.)+(test|spec).[jt]s?(x)'],
  // The platform publishes TypeScript source, so Jest must transform it too.
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@company/|@react-native/|@christopher-peters-dev/investment-platform/))',
  ],
};
