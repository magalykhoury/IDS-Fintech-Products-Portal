import { test, expect } from "@playwright/test";
import { hasCredential, loginPage } from "./fixtures";

test.describe("responsive smoke", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("key pages remain usable at 390px without horizontal overflow", async ({ page }) => {
    test.skip(!hasCredential("admin"), "Set E2E_ADMIN_PASSWORD locally to run credentialed tests.");
    await loginPage(page, "admin");

    for (const path of ["/dashboard", "/products", "/clients", "/deployments", "/approvals", "/notifications"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(hasOverflow, `Horizontal overflow on ${path}`).toBe(false);
    }
  });
});
