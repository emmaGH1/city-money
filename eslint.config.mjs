import js from '@eslint/js';
import parser from '@typescript-eslint/parser';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  js.configs.recommended,
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { console: 'readonly', fetch: 'readonly', process: 'readonly', Request: 'readonly', Response: 'readonly' },
    },
    rules: { 'no-unused-vars': 'off', 'no-undef': 'off' },
  },
];
