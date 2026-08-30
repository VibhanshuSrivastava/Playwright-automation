import { expect, type Locator, type Page } from '@playwright/test';
import { BaseActions } from '../actions/BaseActions';
import { ProjectsPage } from './ProjectsPage';

export class LoginPage extends BaseActions {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/', 'Go to login page');
  }

  /**
   * Fills the credentials, submits, and verifies the outcome:
   *  - no `expectedAlertText`: expects to land on the Projects page.
   *  - `expectedAlertText` given: expects that alert text and that the
   *    Projects page did NOT load.
   */
  async login(email: string, password: string, expectedAlertText?: string) {
    const emailInput = await this.getElementByLabel('Email', 'Find email input', { hardAssert: true });
    await emailInput?.fill(email);

    const passwordInput = await this.getElementByLabel('Password', 'Find password input', { hardAssert: true });
    await passwordInput?.fill(password);

    await this.clickSignIn();

    if (expectedAlertText) {
      await this.expectAlertText(expectedAlertText);
      await new ProjectsPage(this.page).expectNotVisible();
    } else {
      await new ProjectsPage(this.page).expectVisible();
    }
  }

  private async clickSignIn() {
    const signInButton = await this.getElementByRole('button', 'Sign in', 'Find sign in button', { hardAssert: true });
    await signInButton?.click();
  }

  private async alert(description?: string): Promise<Locator> {
    const alert = await this.getElementByRole('alert', undefined, description || 'Find alert message', {
      hardAssert: true,
    });
    if (!alert) throw new Error('Alert element not found');
    return alert;
  }

  private async expectAlertText(text: string, description?: string) {
    await expect(await this.alert(description)).toHaveText(text);
  }
}
