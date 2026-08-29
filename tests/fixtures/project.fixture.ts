import { test as base, expect } from '@playwright/test';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
}

type ProjectFixture = {
  project: Project;
};

export const test = base.extend<ProjectFixture>({
  project: async ({ request }, use) => {
    const projectData = {
      name: `Automation Project ${Date.now()}`,
      description: 'Created by Playwright fixture',
    };

    const response = await request.post(
      'http://localhost:3000/api/projects',
      {
        data: projectData,
      }
    );

    expect(response.status()).toBe(201);

    const project: Project = await response.json();

    await use(project);

    const cleanupResponse = await request.delete(
  `http://localhost:3000/api/projects/${project.id}`
);

if (
  cleanupResponse.status() !== 204 &&
  cleanupResponse.status() !== 404
) {
  throw new Error(
    `Project cleanup failed with status ${cleanupResponse.status()}`
  );
}
  },
});

export { expect };