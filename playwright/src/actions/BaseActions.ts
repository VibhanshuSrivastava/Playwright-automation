import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';
import { setupData } from '../config/timeouts';

export interface ScreenshotOptions {
  /** Screenshot a specific locator instead of the whole page. */
  locator?: Locator;
  /** Elements to black out before comparing — for content that legitimately varies between runs. */
  mask?: Locator[];
  fullPage?: boolean;
  maxDiffPixelRatio?: number;
}

export interface PlaywrightElementOptions {
  timeout?: number;
  getByText?: string;
  exact?: boolean;
  delay?: number;
  getByLabel?: string;
  getByRole?: {
    role: Parameters<Locator['getByRole']>[0];
    name?: string | RegExp;
    exact?: boolean;
  };
  getByPlaceholder?: string;
  getByTestId?: string;
  getByAltText?: string;
  getByTitle?: string;
  force?: boolean;
  chainSelector?: string;
  index?: number;
  clear?: boolean;
  iframe?: string | FrameLocator;
  nestedIframe?: string;
  waitForState?: 'visible' | 'hidden' | 'attached' | 'detached';
  hardAssert?: boolean;
  silent?: boolean;
}

type AssertFn = (fn: () => Promise<void>, description: string) => Promise<void>;

const toEngineSelector = (selector: string): string =>
  selector.startsWith('//') || selector.startsWith('.//') ? `xpath=${selector}` : selector;

/**
 * Single wrapper layer around raw Playwright calls. Every page object goes
 * through `getElement` (directly or via the action/`getElementBy*` helpers
 * below) instead of calling `page.locator()` / `locator.click()` etc.
 * directly — so a framework-wide behavior change (retry policy, iframe
 * handling, timeout defaults, a future self-healing hook) only has to
 * happen in one place.
 *
 * Assertion mode is controlled per-call via options:
 *  - default (soft):   failure is recorded, execution continues
 *  - hardAssert: true: failure throws immediately, fails the test
 *  - silent: true:     failure is swallowed entirely (existence probes)
 */
export class BaseActions {
  private softErrors: string[] = [];

  constructor(protected readonly page: Page) {}

  protected hardAssert: AssertFn = async (fn, description) => {
    await test.step(description, fn);
  };

  protected softAssert: AssertFn = async (fn, description) => {
    try {
      await test.step(description, fn);
    } catch (error) {
      this.softErrors.push(`${description}: ${(error as Error).message}`);
    }
  };

  protected silentAssert: AssertFn = async (fn) => {
    try {
      await fn();
    } catch {
      // intentionally swallowed — used for optional/existence probes
    }
  };

  /** Throws if any soft assertions failed since the last call. Call from afterEach. */
  assertNoSoftFailures() {
    if (this.softErrors.length) {
      const failures = this.softErrors.join('\n');
      this.softErrors = [];
      throw new Error(`Soft assertion failure(s):\n${failures}`);
    }
  }

  /**
   * Resolves a selector (or existing Locator) to a Locator — handling
   * iframes/nested iframes, `getByText`/`getByLabel`/`getByRole`/etc.
   * narrowing, an optional `chainSelector` sub-selector, and an optional
   * `index` — then waits for it, run under the chosen assertion mode.
   * Returns `undefined` if the wait failed under soft/silent mode.
   */
  async getElement(
    primarySelector?: string | Locator,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    let locator: Locator | undefined;
    let assertFn: AssertFn = this.softAssert;
    if (options?.silent) assertFn = this.silentAssert;
    else if (options?.hardAssert) assertFn = this.hardAssert;

    await assertFn(async () => {
      let resolved: Locator;

      if (options?.iframe) {
        let frame = typeof options.iframe === 'string' ? this.page.frameLocator(options.iframe) : options.iframe;
        if (options.nestedIframe) frame = frame.frameLocator(options.nestedIframe);
        resolved =
          typeof primarySelector === 'string'
            ? frame.locator(toEngineSelector(primarySelector))
            : (primarySelector ?? frame.locator(':root'));
      } else if (typeof primarySelector === 'string') {
        resolved = this.page.locator(toEngineSelector(primarySelector));
      } else if (primarySelector) {
        resolved = primarySelector;
      } else {
        resolved = this.page.locator(':root');
      }

      if (options?.getByText) {
        resolved =
          options.exact === true
            ? resolved.getByText(options.getByText, { exact: true })
            : resolved.getByText(options.getByText);
      }
      if (options?.getByLabel) {
        resolved =
          options.exact === true
            ? resolved.getByLabel(options.getByLabel, { exact: true })
            : resolved.getByLabel(options.getByLabel);
      }
      if (options?.getByRole) {
        resolved = resolved.getByRole(options.getByRole.role, {
          name: options.getByRole.name,
          exact: options.getByRole.exact,
        });
      }
      if (options?.getByPlaceholder) {
        resolved =
          options.exact === true
            ? resolved.getByPlaceholder(options.getByPlaceholder, { exact: true })
            : resolved.getByPlaceholder(options.getByPlaceholder);
      }
      if (options?.getByTestId) {
        resolved = resolved.getByTestId(options.getByTestId);
      }
      if (options?.getByAltText) {
        resolved =
          options.exact === true
            ? resolved.getByAltText(options.getByAltText, { exact: true })
            : resolved.getByAltText(options.getByAltText);
      }
      if (options?.getByTitle) {
        resolved =
          options.exact === true
            ? resolved.getByTitle(options.getByTitle, { exact: true })
            : resolved.getByTitle(options.getByTitle);
      }
      if (options?.chainSelector) {
        resolved = resolved.locator(toEngineSelector(options.chainSelector));
      }
      if (options?.index !== undefined) {
        resolved = resolved.nth(options.index);
      }

      await resolved.first().waitFor({
        state: options?.waitForState || 'visible',
        timeout: options?.timeout || setupData.MIN_TIMEOUT,
      });
      locator = resolved;
    }, description || 'Get element');

    return locator;
  }

  async click(primarySelector: string | Locator, description?: string, options?: PlaywrightElementOptions) {
    const element = await this.getElement(primarySelector, description || 'Click element', options);
    if (!element) return;
    await element.first().click({
      force: options?.force,
      delay: options?.delay,
      timeout: options?.timeout || setupData.MIN_TIMEOUT,
    });
  }

  async fill(
    primarySelector: string | Locator,
    value: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ) {
    const element = await this.getElement(primarySelector, description || `Fill "${value}"`, options);
    if (!element) return;
    if (options?.clear) await element.first().fill('');
    await element.first().fill(value, { timeout: options?.timeout || setupData.MIN_TIMEOUT });
  }

  async getText(
    primarySelector: string | Locator,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<string> {
    const element = await this.getElement(primarySelector, description || 'Get text', options);
    if (!element) return '';
    return (await element.first().textContent())?.trim() ?? '';
  }

  async isVisible(
    primarySelector: string | Locator,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<boolean> {
    const element = await this.getElement(primarySelector, description || 'Check visibility', {
      ...options,
      silent: true,
    });
    return !!element;
  }

  async selectOption(
    primarySelector: string | Locator,
    value: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ) {
    const element = await this.getElement(primarySelector, description || `Select "${value}"`, options);
    if (!element) return;
    await element.first().selectOption(value, { timeout: options?.timeout || setupData.MIN_TIMEOUT });
  }

  /**
   * `getElementBy*` family — convenience wrappers around `getElement` for
   * the common case of locating by a single Playwright locator strategy
   * (role/label/text/etc.) without a container selector. Each accepts a
   * `description` (for the trace/step name) and the same
   * `PlaywrightElementOptions` accepted everywhere else (timeout, iframe,
   * chainSelector, hardAssert/silent, ...). For scoping within a
   * container, pass the container Locator as `getElement`'s first argument
   * along with the matching `getBy*` option; for combining strategies, use
   * `getElement` directly with more than one `getBy*` option set.
   */
  async getElementByRole(
    role: Parameters<Locator['getByRole']>[0],
    name?: string | RegExp,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    return this.getElement(undefined, description || `Get element by role "${role}"`, {
      ...options,
      getByRole: { role, name, exact: options?.exact },
    });
  }

  async getElementByLabel(
    label: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    return this.getElement(undefined, description || `Get element by label "${label}"`, {
      ...options,
      getByLabel: label,
    });
  }

  async getElementByText(
    text: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    return this.getElement(undefined, description || `Get element by text "${text}"`, {
      ...options,
      getByText: text,
    });
  }

  async getElementByPlaceholder(
    placeholder: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    return this.getElement(undefined, description || `Get element by placeholder "${placeholder}"`, {
      ...options,
      getByPlaceholder: placeholder,
    });
  }

  async getElementByTestId(
    testId: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    return this.getElement(undefined, description || `Get element by test id "${testId}"`, {
      ...options,
      getByTestId: testId,
    });
  }

  async getElementByAltText(
    altText: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    return this.getElement(undefined, description || `Get element by alt text "${altText}"`, {
      ...options,
      getByAltText: altText,
    });
  }

  async getElementByTitle(
    title: string,
    description?: string,
    options?: PlaywrightElementOptions,
  ): Promise<Locator | undefined> {
    return this.getElement(undefined, description || `Get element by title "${title}"`, {
      ...options,
      getByTitle: title,
    });
  }

  async navigate(path: string, description?: string) {
    await this.hardAssert(
      async () => {
        await this.page.goto(path);
      },
      description || `Navigate to "${path}"`,
    );
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Visual regression check — screenshots `page` (or `options.locator`) and diffs against the stored baseline. */
  async expectScreenshot(name: string, options?: ScreenshotOptions) {
    const target = options?.locator ?? this.page;
    await expect(target).toHaveScreenshot(name, {
      mask: options?.mask,
      fullPage: options?.fullPage,
      maxDiffPixelRatio: options?.maxDiffPixelRatio,
    });
  }
}
