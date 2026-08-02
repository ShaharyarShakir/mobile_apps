module.exports = {
  extends: ['universe', 'universe/shared/typescript-analysis'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/order': 'off', // Let prettier/standard imports handle it
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
  env: {
    node: true,
  },
};
