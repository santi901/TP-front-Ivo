import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

// Configuración de ESLint (flat config). Linteamos JS/TS/TSX y archivos .astro.
export default [
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'coverage/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      // El proyecto integra una capa BaaS (Supabase) cuyo SDK expone tipos `any`
      // en varios puntos; lo permitimos de forma consciente para no introducir
      // ruido que no aporta a la calidad real del código.
      '@typescript-eslint/no-explicit-any': 'off',
      // Variables sin usar son un warning (no rompen el pipeline), pero quedan
      // visibles para limpiarlas. Ignoramos las que empiezan con "_".
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
