import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  itemName(index: number): Locator {
    return this.cartItems.nth(index).locator('[data-test="inventory-item-name"]');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
