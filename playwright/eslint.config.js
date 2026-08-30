import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/*-snapshots/**', 'playwright-report', 'test-results', '.auth']),
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, playwright.configs['flat/recommended']],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // Test titles/fixture wiring intentionally live across page objects,
      // fixtures, and specs — this rule fights that structure more than it helps.
      'playwright/no-standalone-expect': 'off',
      // Assertions live inside domain methods (loginPage.login(),
      // projectsApi.expectStatus(), ...), not as bare expect() calls in the
      // test body — this rule's static "no expect() call found" heuristic
      // can't see through that, so it false-positives on every test here.
      'playwright/expect-expect': 'off',
    },
  },
]);
