module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  ignorePatterns: [
    '.next/**/*',
    'node_modules/**/*',
    'public/**/*',
    'storage/**/*',
    'coverage/**/*',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
};

