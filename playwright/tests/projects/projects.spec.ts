import { test } from '../../src/fixtures';
import { buildProjectPayload } from '../../src/support/test-data';

// Runs with the "setup" project's saved storage state (see playwright.config.ts),
// so the demo user is already authenticated — no login step needed here.
// "chromium-authenticated" also depends on the "api" project, so those tests
// have already finished mutating the shared backend by the time these run;
// resetting before each test on top of that gives a fully deterministic
// starting dataset regardless of run order.
test.describe('Projects page (authenticated)', () => {
  // Each test resets the shared in-memory backend to a known state — if two
  // of these ran in parallel, one test's reset could wipe out data another
  // test just created mid-flight. Serial keeps that reset-per-test approach
  // race-free.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ projectsApi, projectsPage }) => {
    await projectsApi.reset();
    await projectsPage.goto();
  });

  test('shows the projects page without logging in', async ({ projectsPage }) => {
    await projectsPage.expectVisible();
  });

  test('matches the projects page screenshot', async ({ projectsPage }) => {
    await projectsPage.expectPageScreenshot();
  });

  test('creates a new project', async ({ projectsPage }) => {
    const { name, description } = buildProjectPayload({ name: `UI Project ${Date.now()}` });

    await projectsPage.createProject(name, description);

    await projectsPage.expectProjectVisible(name);
  });

  test('edits an existing project', async ({ projectsPage }) => {
    const { name, description } = buildProjectPayload({ name: `UI Project ${Date.now()}` });
    await projectsPage.createProject(name, description);

    const updatedName = `Renamed Project ${Date.now()}`;
    await projectsPage.editProject(name, {
      name: updatedName,
      description: 'Updated through the UI',
      status: 'completed',
    });

    await projectsPage.expectProjectVisible(updatedName);
    await projectsPage.expectProjectNotVisible(name);
  });

  test('deletes an existing project', async ({ projectsPage }) => {
    const { name, description } = buildProjectPayload({ name: `UI Project ${Date.now()}` });
    await projectsPage.createProject(name, description);
    await projectsPage.expectProjectVisible(name);

    await projectsPage.deleteProject(name);

    await projectsPage.expectProjectNotVisible(name);
  });
});
