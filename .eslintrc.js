/**
 * ESLint configuration for RiseRank mobile app.
 *
 * Stack: TypeScript + React Native + React Hooks
 * Run: npm run lint
 *
 * Required devDependencies (add to package.json):
 *   @typescript-eslint/eslint-plugin
 *   @typescript-eslint/parser
 *   eslint
 *   eslint-plugin-react
 *   eslint-plugin-react-hooks
 *   eslint-plugin-react-native
 */

module.exports = {
  root: true,

  // ── Parsers ────────────────────────────────────────────────────────────────
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // Enable type-aware rules (slower but catches more bugs)
    // project: './tsconfig.json',
  },

  // ── Environments ───────────────────────────────────────────────────────────
  env: {
    'react-native/react-native': true,
    es2022: true,
  },

  // ── Plugins ────────────────────────────────────────────────────────────────
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
  ],

  // ── Extends ────────────────────────────────────────────────────────────────
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
  ],

  // ── Settings ───────────────────────────────────────────────────────────────
  settings: {
    react: {
      version: 'detect',
    },
  },

  // ── Rules ──────────────────────────────────────────────────────────────────
  rules: {
    // ── TypeScript ───────────────────────────────────────────────────────────
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-require-imports': 'warn',

    // ── React ────────────────────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off',          // Not needed in React 17+
    'react/prop-types': 'off',                  // TypeScript handles this
    'react/display-name': 'off',
    'react/no-unstable-nested-components': 'warn',

    // ── React Hooks ──────────────────────────────────────────────────────────
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── React Native ─────────────────────────────────────────────────────────
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'off',     // NativeWind uses className, inline OK for dynamic
    'react-native/no-color-literals': 'off',    // Colors defined in tailwind.config.js
    'react-native/no-raw-text': 'off',          // Allow text inside View (NativeWind pattern)
    'react-native/sort-styles': 'off',

    // ── General ──────────────────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'object-shorthand': 'warn',
  },

  // ── Ignore patterns ────────────────────────────────────────────────────────
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '*.config.js',           // metro, babel, tailwind, etc.
    '.eslintrc.js',
    'global.d.ts',
  ],
};
