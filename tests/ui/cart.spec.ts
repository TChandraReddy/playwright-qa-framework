import { test, expect } from '@fixtures/test-options';
import { CartPage } from '@pages/CartPage';

test.describe('Cart', () => {
  test(
    'adding items updates the cart badge count',
    { tag: ['@regression'] },
    async ({ authenticatedPage }) => {
      await expect(authenticatedPage.cartBadge).toBeHidden();

      await authenticatedPage.addToCart('Sauce Labs Backpack');
      await expect(authenticatedPage.cartBadge).toHaveText('1');

      await authenticatedPage.addToCart('Sauce Labs Bike Light');
      await expect(authenticatedPage.cartBadge).toHaveText('2');
    }
  );

  test(
    'removing an item decrements the badge and empties the cart view',
    { tag: ['@regression'] },
    async ({ authenticatedPage, page }) => {
      await authenticatedPage.addToCart('Sauce Labs Backpack');
      await expect(authenticatedPage.cartBadge).toHaveText('1');

      await authenticatedPage.removeFromCart('Sauce Labs Backpack');
      await expect(authenticatedPage.cartBadge).toBeHidden();

      await authenticatedPage.cartLink.click();
      const cartPage = new CartPage(page);
      await expect(cartPage.cartItems).toHaveCount(0);
    }
  );

  test(
    'cart contents match what was added, regardless of catalog sort order',
    { tag: ['@regression'] },
    async ({ authenticatedPage, page }) => {
      // Sorting is a display-layer concern; it must never affect which
      // items end up in the cart or in what state they're added.
      await authenticatedPage.sortBy('hilo');
      await authenticatedPage.addToCart('Sauce Labs Fleece Jacket');
      await authenticatedPage.addToCart('Sauce Labs Onesie');

      await authenticatedPage.cartLink.click();
      const cartPage = new CartPage(page);
      await expect(cartPage.cartItems).toHaveCount(2);

      const namesInCart = await cartPage.cartItems
        .locator('[data-test="inventory-item-name"]')
        .allTextContents();
      expect(namesInCart.sort()).toEqual(
        ['Sauce Labs Fleece Jacket', 'Sauce Labs Onesie'].sort()
      );
    }
  );
});
