module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true 
  },
  extends: [
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
    'DEVELOPMENT_RULES.md',
    'REACT_QUERY_SETUP_GUIDE.md',
    'README.md'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { 
        allowConstantExport: true,
        allowExportNames: ['buttonVariants', 'badgeVariants', 'useAuth', 'useRecipeContext'],
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
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
      files: ['src/**/*'],
      env: {
        browser: true,
        node: false,
      },
    },
  ],
}
