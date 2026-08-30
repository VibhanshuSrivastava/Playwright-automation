import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProjectsPage } from '../pages/ProjectsPage';

interface PageFixtures {
  loginPage: LoginPage;
  projectsPage: ProjectsPage;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    loginPage.assertNoSoftFailures();
  },
  projectsPage: async ({ page }, use) => {
    const projectsPage = new ProjectsPage(page);
    await use(projectsPage);
    projectsPage.assertNoSoftFailures();
  },
});

export { expect } from '@playwright/test';
