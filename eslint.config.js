import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '.lighthouseci/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
