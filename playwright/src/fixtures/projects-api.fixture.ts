import { test as base } from './api-request.fixture';
import { ProjectsApiClient } from '../api/ProjectsApiClient';

interface ProjectsApiFixtures {
  projectsApi: ProjectsApiClient;
}

export const test = base.extend<ProjectsApiFixtures>({
  projectsApi: async ({ api }, use) => {
    await use(new ProjectsApiClient(api));
  },
});

export { expect } from '@playwright/test';
