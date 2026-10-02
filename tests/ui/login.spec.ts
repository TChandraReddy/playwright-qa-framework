import { test, expect } from '@fixtures/test-options';
import users from '@fixtures/users.json';

/**
 * Data-driven login matrix instead of one hardcoded test per account.
 * Adding a new role/credential case means adding a row to users.json,
 * not writing a new test — this is the same pattern used for configurable,
 * multi-tenant-style forms where the fields are fixed but the data isn't.
 */
for (const user of users) {
  const tag = user.expected === 'success' ? '@smoke' : '@regression';

  test(
    `login as "${user.role}" -> expect ${user.expected} (${user.description})`,
    { tag: [tag] },
    async ({ loginPage, page }) => {
      await loginPage.open();
      await loginPage.login(user.role, user.password);

      if (user.expected === 'success') {
        await expect(page).toHaveURL(/inventory\.html/);
      } else {
        await expect(page).toHaveURL(/saucedemo\.com\/?$/);
        await expect(loginPage.errorMessage).toContainText(user.errorContains!, {
          ignoreCase: true,
        });
      }
    }
  );
}
