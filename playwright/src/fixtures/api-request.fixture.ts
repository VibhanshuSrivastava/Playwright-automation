import { test as base, request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { env } from '../config/env';

export const API_BASE_URL = env.API_BASE_URL;

interface ApiFixtures {
  api: APIRequestContext;
}

export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const api = await playwrightRequest.newContext({
      baseURL: API_BASE_URL,
    });

    await use(api);

    await api.dispose();
  },
});

export { expect } from '@playwright/test';
