import { test as base } from './projects-api.fixture';
import { buildProjectPayload } from '../support/test-data';
import type { Project } from '../api/ProjectsApiClient';

interface ProjectFixtures {
  project: Project;
}

export const test = base.extend<ProjectFixtures>({
  project: async ({ projectsApi }, use) => {
    const response = await projectsApi.create(buildProjectPayload());
    await projectsApi.expectStatus(response, 201, 'fixture setup: create project');

    const project: Project = await response.json();

    await use(project);

    const cleanupResponse = await projectsApi.delete(project.id);
    await projectsApi.expectStatusOneOf(cleanupResponse, [204, 404], 'fixture teardown: delete project');
  },
});

export { expect } from '@playwright/test';
