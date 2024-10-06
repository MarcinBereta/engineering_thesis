module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react-hooks/exhaustive-deps': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'react-native/no-inline-styles': 'off',
      },
    },
  ],
};
