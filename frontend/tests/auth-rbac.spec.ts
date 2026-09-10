import { test, expect } from "@playwright/test";
import { accounts, authHeaders, createApiContext, getJson, hasCredential, loginApi, loginPage, type Product } from "./fixtures";

test.describe("authentication and RBAC", () => {
  test("redirects an unauthenticated user from a protected route", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Products Portal" })).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill(process.env.E2E_ADMIN_USERNAME ?? accounts.admin.defaultUsername);
    await page.getByLabel("Password").fill("definitely-not-the-demo-password");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("alert")).toHaveText("Invalid username or password.");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("allows a valid admin login", async ({ page }) => {
    test.skip(!hasCredential("admin"), "Set E2E_ADMIN_PASSWORD locally to run credentialed tests.");
    await loginPage(page, "admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("admin can access User Management and viewer cannot", async ({ page }) => {
    test.skip(!hasCredential("admin") || !hasCredential("viewer"), "Set E2E_ADMIN_PASSWORD and E2E_VIEWER_PASSWORD locally.");

    await loginPage(page, "admin");
    await page.goto("/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

    await page.getByRole("button", { name: /log out/i }).click();
    await loginPage(page, "viewer");
    await page.goto("/users");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("viewer cannot write protected data and the API returns 403", async ({ playwright }) => {
    test.skip(!hasCredential("viewer"), "Set E2E_VIEWER_PASSWORD locally to run credentialed tests.");
    const api = await createApiContext(playwright);
    const viewer = await loginApi(api, "viewer");
    const products = await getJson<Product[]>(api, "/products", viewer.token);
    const productId = products[0]?.id ?? 1;
    const writePayload = {
      name: "Unauthorized regression request",
      lifecycleStatus: "Active",
      currentVersion: "0.0.0",
      criticality: "Low",
    };

    try {
      const post = await api.post("products", { headers: authHeaders(viewer.token), data: writePayload });
      expect(post.status()).toBe(403);
      const put = await api.put(`products/${productId}`, { headers: authHeaders(viewer.token), data: writePayload });
      expect(put.status()).toBe(403);
      const del = await api.delete(`products/${productId}`, { headers: authHeaders(viewer.token) });
      expect(del.status()).toBe(403);
    } finally {
      await api.dispose();
    }
  });
});
