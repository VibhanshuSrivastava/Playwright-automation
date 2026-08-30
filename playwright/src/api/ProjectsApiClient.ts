import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { BaseApiActions } from '../actions/BaseApiActions';
import type { ProjectPayload } from '../support/test-data';

export interface Project extends ProjectPayload {
  id: number;
  status: 'active' | 'completed';
}

export interface UpdateProjectPayload extends ProjectPayload {
  status: 'active' | 'completed';
}

const NOT_FOUND_MESSAGE = 'Project not found';

export class ProjectsApiClient extends BaseApiActions {
  constructor(api: APIRequestContext) {
    super(api);
  }

  list() {
    return this.api.get('projects');
  }

  get(id: number) {
    return this.api.get(`projects/${id}`);
  }

  create(payload: ProjectPayload) {
    return this.api.post('projects', { data: payload });
  }

  /** Bypasses payload typing — for negative tests that send an intentionally malformed body. */
  createRaw(payload: Record<string, unknown>) {
    return this.api.post('projects', { data: payload });
  }

  update(id: number, payload: UpdateProjectPayload) {
    return this.api.put(`projects/${id}`, { data: payload });
  }

  delete(id: number) {
    return this.api.delete(`projects/${id}`);
  }

  /** Restores the backend's in-memory project list to its seed state. Not available when NODE_ENV=production. */
  async reset(): Promise<void> {
    const response = await this.api.post('test/reset');
    await this.expectStatus(response, 204, 'reset project data');
  }

  /** GET /projects — expects 200 and a non-empty list. */
  async expectList(): Promise<APIResponse> {
    const response = await this.list();
    await this.expectStatus(response, 200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    return response;
  }

  /** GET /projects/:id — expects 200 and the body to equal `expected`. */
  async expectProject(id: number, expected: Project): Promise<void> {
    const response = await this.get(id);
    await this.expectStatus(response, 200);
    await this.expectJsonEqual(response, expected);
  }

  /** GET /projects/:id — expects a 404 "not found". */
  async expectGetNotFound(id: number): Promise<void> {
    const response = await this.get(id);
    await this.expectStatus(response, 404);
    await this.expectJsonMatch(response, { message: NOT_FOUND_MESSAGE });
  }

  /** POST /projects — expects 201 and the created project shape; returns it. */
  async createExpectingSuccess(payload: ProjectPayload): Promise<Project> {
    const response = await this.create(payload);
    await this.expectStatus(response, 201);
    const created: Project = await response.json();
    expect(created).toMatchObject({
      name: payload.name,
      description: payload.description,
      status: 'active',
    });
    return created;
  }

  /** POST /projects with a malformed body — expects a 400 with `expectedMessage`. */
  async expectCreateRejected(payload: Record<string, unknown>, expectedMessage: string): Promise<void> {
    const response = await this.createRaw(payload);
    await this.expectStatus(response, 400);
    await this.expectJsonMatch(response, { message: expectedMessage });
  }

  /** PUT /projects/:id — expects 200 and the updated project shape. */
  async updateExpectingSuccess(id: number, payload: UpdateProjectPayload): Promise<void> {
    const response = await this.update(id, payload);
    await this.expectStatus(response, 200);
    await this.expectJsonMatch(response, { id, ...payload });
  }

  /** PUT /projects/:id — expects a 404 "not found". */
  async expectUpdateNotFound(id: number, payload: UpdateProjectPayload): Promise<void> {
    const response = await this.update(id, payload);
    await this.expectStatus(response, 404);
    await this.expectJsonMatch(response, { message: NOT_FOUND_MESSAGE });
  }

  /** DELETE /projects/:id — expects 204. */
  async deleteExpectingSuccess(id: number): Promise<void> {
    const response = await this.delete(id);
    await this.expectStatus(response, 204);
  }

  /** DELETE /projects/:id — expects a 404 "not found". */
  async expectDeleteNotFound(id: number): Promise<void> {
    const response = await this.delete(id);
    await this.expectStatus(response, 404);
    await this.expectJsonMatch(response, { message: NOT_FOUND_MESSAGE });
  }
}
