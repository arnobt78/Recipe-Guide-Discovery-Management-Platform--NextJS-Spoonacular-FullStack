module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist', 
    '.eslintrc.cjs',
    '**/*.md',
    'node_modules',
    'prisma/migrations',
    '.next',
    'DEVELOPMENT_RULES.md',
    'REACT_QUERY_SETUP_GUIDE.md',
    'README.md'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['api/**/*', 'lib/**/*'],
      env: {
        node: true,
        browser: false,
      },
    },
    {
      files: ['src/**/*', 'app/**/*'],
      env: {
        browser: true,
        node: false,
      },
    },
  ],
}
