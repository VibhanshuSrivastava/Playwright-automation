import { test } from '../../src/fixtures';
import { DEMO_CREDENTIALS } from '../../src/support/constants';
import { STORAGE_STATE_PATH } from '../../src/config/paths';

test('authenticate as the demo user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
