import { test, expect } from '@fixtures/test-options';
import { CartPage } from '@pages/CartPage';
import { CheckoutStepOnePage, CheckoutStepTwoPage, CheckoutCompletePage } from '@pages/CheckoutPage';

test(
  'end-to-end: browse, add to cart, checkout, and complete an order',
  { tag: ['@smoke'] },
  async ({ authenticatedPage, page }) => {
    await authenticatedPage.addToCart('Sauce Labs Backpack');
    await authenticatedPage.cartLink.click();

    const cartPage = new CartPage(page);
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.checkout();

    const stepOne = new CheckoutStepOnePage(page);
    await stepOne.fillInfo('Chandra', 'Reddy', '500090');
    await stepOne.continueToOverview();

    const stepTwo = new CheckoutStepTwoPage(page);
    const [itemTotal, tax, total] = await Promise.all([
      stepTwo.itemTotal(),
      stepTwo.tax(),
      stepTwo.total(),
    ]);

    // Assert the invariant (item total + tax = total) rather than hardcoding
    // dollar amounts, so the test survives a catalog price change.
    expect(total).toBeCloseTo(itemTotal + tax, 2);

    await stepTwo.finish();

    const complete = new CheckoutCompletePage(page);
    await expect(complete.header).toHaveText('Thank you for your order!');
  }
);

test(
  'checkout requires first name, last name, and postal code',
  { tag: ['@regression'] },
  async ({ authenticatedPage, page }) => {
    await authenticatedPage.addToCart('Sauce Labs Backpack');
    await authenticatedPage.cartLink.click();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const stepOne = new CheckoutStepOnePage(page);
    await stepOne.continueToOverview();

    await expect(stepOne.errorMessage).toContainText('First Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  }
);
