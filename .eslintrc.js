module.exports = {
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off', // Allow any for now in React Native
    
    // General rules
    'no-console': 'off', // Allow console.log in React Native development
    'prefer-const': 'error',
    'no-unused-vars': 'off', // Use TypeScript version instead
    'no-undef': 'off', // TypeScript handles this better
    'no-case-declarations': 'off', // Common in React Native switch statements
    'no-constant-condition': 'off', // Sometimes needed for development
  },
  env: {
    es6: true,
    node: true,
  },
  globals: {
    // React Native globals
    '__DEV__': 'readonly',
    'React': 'readonly',
    'NodeJS': 'readonly',
    'requestAnimationFrame': 'readonly',
  },
};
