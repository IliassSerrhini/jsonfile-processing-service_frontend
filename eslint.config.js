export default [
  {
    ignores: ['**/*.html', 'projects/**/*'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: null // Setting to null to avoid requiring tsconfig
      }
    },
    files: ['**/*.ts'],
    rules: {
      'no-console': 'warn'
    }
  }
];
