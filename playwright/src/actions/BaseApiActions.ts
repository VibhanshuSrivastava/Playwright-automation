import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

/**
 * API-side counterpart to `BaseActions`: every API client wraps its
 * requests through this base class instead of asserting on responses
 * directly in spec files, so response-shape checks stay in one place.
 */
export class BaseApiActions {
  constructor(protected readonly api: APIRequestContext) {}

  async expectStatus(response: APIResponse, status: number, description?: string) {
    expect(response.status(), description ?? `Expect response status ${status}`).toBe(status);
  }

  async expectStatusOneOf(response: APIResponse, statuses: number[], description?: string) {
    expect(statuses, description ?? `Expect response status to be one of ${statuses.join(', ')}`).toContain(
      response.status(),
    );
  }

  async expectJsonMatch(response: APIResponse, matcher: Record<string, unknown>) {
    await expect(response.json()).resolves.toMatchObject(matcher);
  }

  async expectJsonEqual(response: APIResponse, expected: unknown) {
    await expect(response.json()).resolves.toEqual(expected);
  }
}
