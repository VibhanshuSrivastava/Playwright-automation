/// <reference types="node" />

import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE_PATH } from './src/config/paths';
import { env } from './src/config/env';

const chromiumUse = {
  ...devices['Desktop Chrome'],
  viewport: { width: 1920, height: 1080 },
  launchOptions: {
    args: ['--window-size=1920,1080'],
  },
};

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [['list'], ['html', { open: 'never' }]],

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },

  use: {
    baseURL: env.BASE_URL,

    trace: 'retain-on-failure',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    actionTimeout: 10_000,

    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
      use: chromiumUse,
    },
    {
      name: 'api',
      testMatch: '**/*.api.spec.ts',
    },
    {
      name: 'chromium',
      testMatch: '**/*.spec.ts',
      testIgnore: ['**/*.api.spec.ts', 'projects/**/*.spec.ts'],
      use: chromiumUse,
    },
    {
      name: 'chromium-authenticated',
      testMatch: 'projects/**/*.spec.ts',
      // Depending on 'api' too means the API project's tests (which mutate
      // the same in-memory backend) fully finish before these run, instead
      // of racing them — combined with the per-test reset() call in
      // projects.spec.ts, the project list here is fully deterministic.
      dependencies: ['setup', 'api'],
      use: {
        ...chromiumUse,
        storageState: STORAGE_STATE_PATH,
      },
    },
  ],

  webServer: {
    command: 'npm run dev --prefix ../app',
    url: env.BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
