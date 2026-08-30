import { test } from '../../src/fixtures';
import { buildProjectPayload } from '../../src/support/test-data';

test.describe('Projects API', () => {
  test('returns the list of projects', async ({ projectsApi }) => {
    await projectsApi.expectList();
  });

  test('returns a project created by the fixture', async ({ projectsApi, project }) => {
    await projectsApi.expectProject(project.id, project);
  });

  test('creates a new project', async ({ projectsApi }) => {
    const payload = buildProjectPayload({ name: `API Project ${Date.now()}` });

    const created = await projectsApi.createExpectingSuccess(payload);
    await projectsApi.deleteExpectingSuccess(created.id);
  });

  test('rejects project creation when required fields are missing', async ({ projectsApi }) => {
    await projectsApi.expectCreateRejected({ name: 'Incomplete Project' }, 'Name and description are required');
  });

  test('updates an existing project', async ({ projectsApi, project }) => {
    await projectsApi.updateExpectingSuccess(project.id, {
      name: `Updated ${project.name}`,
      description: 'Updated through Playwright API test',
      status: 'completed',
    });
  });

  test('returns 404 when updating a non-existent project', async ({ projectsApi }) => {
    await projectsApi.expectUpdateNotFound(999999, {
      name: 'Updated Project',
      description: 'Updated description',
      status: 'completed',
    });
  });

  test('deletes an existing project', async ({ projectsApi, project }) => {
    await projectsApi.deleteExpectingSuccess(project.id);
    await projectsApi.expectGetNotFound(project.id);
  });

  test('returns 404 when deleting a non-existent project', async ({ projectsApi }) => {
    await projectsApi.expectDeleteNotFound(999999);
  });
});
