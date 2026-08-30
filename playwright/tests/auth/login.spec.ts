import { test } from '../../src/fixtures';
import { DEMO_CREDENTIALS } from '../../src/support/constants';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in successfully with valid credentials', async ({ loginPage }) => {
    await loginPage.login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
  });

  test('shows an error for invalid credentials', async ({ loginPage }) => {
    await loginPage.login(DEMO_CREDENTIALS.email, 'WrongPassword', 'Invalid email or password');
  });

  test('validates required login fields', async ({ loginPage }) => {
    await loginPage.login('', '', 'Email and password are required');
  });

  test('matches the login page screenshot', async ({ loginPage }) => {
    await loginPage.expectScreenshot('login-page.png');
  });
});
