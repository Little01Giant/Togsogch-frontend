import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Дүрмийн ном §4: any, hex өнгө, console.log, dangerouslySetInnerHTML-г хязгаарлана.
 * `no-explicit-any` одоогоор warn (tech debt #2) — шинэ кодод бичихгүй; 0 болмогц error болгоно.
 */
export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'public/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': ['error',
        { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'dangerouslySetInnerHTML хориотой (XSS).' },
        { selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]", message: 'Өнгийг хатуу бичихгүй — токен (bg-primary, var(--chart-1)) ашигла.' },
      ],
    },
  },
  { files: ['src/lib/constants.ts', 'src/**/*.test.ts'], rules: { 'no-restricted-syntax': 'off' } },
);
