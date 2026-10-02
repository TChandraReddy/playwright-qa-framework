import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  /** Logs in as standard_user before the test body runs, for tests that
   *  care about post-login behavior, not the login flow itself. */
  authenticatedPage: InventoryPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');
    await use(new InventoryPage(page));
  },
});

export { expect } from '@playwright/test';
