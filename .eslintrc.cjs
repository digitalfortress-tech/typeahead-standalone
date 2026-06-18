module.exports = {
  // Note: the lint scripts only target ./src, so the Cypress plugin (flat-config only,
  // requires eslint>=9) is intentionally not extended here.
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    // enable additional rules
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],

    // override default options for rules from base configurations
    'no-cond-assign': ['error', 'always'],

    // the codebase intentionally uses short-circuit/ternary expressions for side effects
    // (e.g. `local && addToIndex(local)`), so allow them
    '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],

    // disable rules from base configurations
    'no-console': 'warn',

    'prettier/prettier': 2, // 2 means error, 1 means warn and 0 means off
  },
};
