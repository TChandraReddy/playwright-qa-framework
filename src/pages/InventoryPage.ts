import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Add/remove buttons are keyed by a slug derived from the product name
 * (e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack"), not by a stable
 * numeric id. Centralizing the slug derivation here means a product rename
 * only breaks one line, not every test that touches that product.
 */
function slugify(productName: string): string {
  return productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export class InventoryPage extends BasePage {
  readonly itemNames: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  addToCartButton(productName: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${slugify(productName)}"]`);
  }

  removeButton(productName: string): Locator {
    return this.page.locator(`[data-test="remove-${slugify(productName)}"]`);
  }

  async addToCart(productName: string) {
    await this.addToCartButton(productName).click();
  }

  async removeFromCart(productName: string) {
    await this.removeButton(productName).click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
