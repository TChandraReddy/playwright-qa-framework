import { Page } from '@playwright/test';

/**
 * Common behavior shared by every page object. Page objects never assert —
 * assertions live in the test, so the same page object can serve a positive
 * and a negative test without branching logic baked into it.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }
}
