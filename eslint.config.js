import eslintjs from '@eslint/js';
import {configs as tseslintConfigs} from 'typescript-eslint';

const {configs: eslintConfigs} = eslintjs;

export default [
  {
    ...eslintConfigs.recommended,
    files: ['src/**/*.ts']
  },
  ...tseslintConfigs.strict,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {varsIgnorePattern: '^[A-Z_]'}
      ]
    }
  },
  {
    files: ['src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
];
