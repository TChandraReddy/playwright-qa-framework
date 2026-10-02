import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutStepOnePage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async continueToOverview() {
    await this.continueButton.click();
  }
}

export class CheckoutStepTwoPage extends BasePage {
  readonly finishButton: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.locator('[data-test="finish"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
  }

  private parseDollar(text: string): number {
    const match = text.match(/\$([\d.]+)/);
    if (!match) throw new Error(`No dollar amount found in "${text}"`);
    return Number(match[1]);
  }

  async itemTotal(): Promise<number> {
    return this.parseDollar(await this.subtotalLabel.innerText());
  }

  async tax(): Promise<number> {
    return this.parseDollar(await this.taxLabel.innerText());
  }

  async total(): Promise<number> {
    return this.parseDollar(await this.totalLabel.innerText());
  }

  async finish() {
    await this.finishButton.click();
  }
}

export class CheckoutCompletePage extends BasePage {
  readonly header: Locator;
  readonly text: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('.complete-header');
    this.text = page.locator('.complete-text');
  }
}
