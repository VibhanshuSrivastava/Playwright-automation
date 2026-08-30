import { expect, type Locator, type Page } from '@playwright/test';
import { BaseActions } from '../actions/BaseActions';

export interface ProjectEdits {
  name?: string;
  description?: string;
  status?: 'active' | 'completed';
}

export class ProjectsPage extends BaseActions {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/', 'Go to projects page');
  }

  async expectVisible() {
    await this.getElementByRole('heading', 'Projects', 'Find projects heading', { hardAssert: true });
  }

  async expectNotVisible() {
    const heading = await this.getElementByRole('heading', 'Projects', 'Find projects heading', {
      silent: true,
      timeout: 2_000,
    });
    expect(heading, 'Projects heading should not be visible').toBeUndefined();
  }

  /** The card for a given project name — scoped, so edit-form fields (which share labels with the create form) can be targeted unambiguously. */
  private async projectCard(name: string): Promise<Locator> {
    const list = await this.getElement('.projects-list', 'Find projects list', { hardAssert: true });
    if (!list) throw new Error('Projects list not found');
    return list.locator('.project-card').filter({ hasText: name });
  }

  /**
   * Resolves a project's card via its stable `data-testid` instead of its
   * (name-based) `hasText` filter — needed once a card enters edit mode,
   * since its name is no longer rendered as text at that point (only as an
   * input value), which would silently break a `hasText`-filtered Locator.
   */
  private async projectCardById(name: string): Promise<Locator> {
    const card = await this.projectCard(name);
    const testId = await card.getAttribute('data-testid');
    if (!testId) throw new Error(`Could not resolve a stable id for project "${name}"`);

    const stableCard = await this.getElementByTestId(testId, 'Find project card', { hardAssert: true });
    if (!stableCard) throw new Error(`Project card "${name}" not found`);
    return stableCard;
  }

  private async expectSuccessMessage(text: string) {
    const success = await this.getElementByRole('status', undefined, 'Find success message', { hardAssert: true });
    if (!success) throw new Error('Success message not found');
    await expect(success).toHaveText(text);
  }

  async expectProjectVisible(name: string) {
    await expect(await this.projectCard(name)).toBeVisible();
  }

  async expectProjectNotVisible(name: string) {
    await expect(await this.projectCard(name)).toBeHidden();
  }

  async createProject(name: string, description: string) {
    const nameInput = await this.getElementByLabel('Project name', 'Find project name input', { hardAssert: true });
    await nameInput?.fill(name);

    const descriptionInput = await this.getElementByLabel('Description', 'Find description input', {
      hardAssert: true,
    });
    await descriptionInput?.fill(description);

    const createButton = await this.getElementByRole('button', 'Create project', 'Find create project button', {
      hardAssert: true,
    });
    await createButton?.click();

    await this.expectSuccessMessage('Project created successfully');
  }

  async editProject(currentName: string, edits: ProjectEdits) {
    const card = await this.projectCardById(currentName);

    const editButton = await this.getElement(card, 'Click edit', {
      getByRole: { role: 'button', name: 'Edit' },
      hardAssert: true,
    });
    await editButton?.click();

    if (edits.name) {
      const nameInput = await this.getElement(card, 'Update project name', {
        getByLabel: 'Project name',
        hardAssert: true,
      });
      await nameInput?.fill(edits.name);
    }

    if (edits.description) {
      const descriptionInput = await this.getElement(card, 'Update project description', {
        getByLabel: 'Description',
        hardAssert: true,
      });
      await descriptionInput?.fill(edits.description);
    }

    if (edits.status) {
      const statusSelect = await this.getElement(card, 'Update project status', {
        getByLabel: 'Status',
        hardAssert: true,
      });
      await statusSelect?.selectOption(edits.status);
    }

    const saveButton = await this.getElement(card, 'Click save', {
      getByRole: { role: 'button', name: 'Save' },
      hardAssert: true,
    });
    await saveButton?.click();

    await this.expectSuccessMessage('Project updated successfully');
  }

  async deleteProject(name: string) {
    const card = await this.projectCard(name);

    this.page.once('dialog', (dialog) => dialog.accept());

    const deleteButton = await this.getElement(card, 'Click delete', {
      getByRole: { role: 'button', name: 'Delete' },
      hardAssert: true,
    });
    await deleteButton?.click();

    await this.expectSuccessMessage('Project deleted successfully');
  }

  /**
   * Visual regression check for the projects page. Callers should reset the
   * backend to its seed data first (via `projectsApi.reset()`) so the list
   * is deterministic.
   */
  async expectPageScreenshot() {
    await this.expectScreenshot('projects-page.png');
  }
}
