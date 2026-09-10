import { test, expect } from "@playwright/test";
import { allowMutations, authHeaders, createApiContext, getJson, hasCredential, loginApi, loginPage, type Client, type Deployment, type Product } from "./fixtures";

test.describe("portal records and relationships", () => {
  test("loads products, details, and implemented search/filter behavior", async ({ page, playwright }) => {
    test.skip(!hasCredential("admin"), "Set E2E_ADMIN_PASSWORD locally to run credentialed tests.");
    const api = await createApiContext(playwright);
    const admin = await loginApi(api, "admin");
    const products = await getJson<Product[]>(api, "/products", admin.token);
    const product = products[0];
    expect(product).toBeTruthy();

    await loginPage(page, "admin");
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByRole("link", { name: product.name, exact: true })).toBeVisible();

    await page.getByPlaceholder("Search products...").fill(product.name);
    await expect(page.getByRole("link", { name: product.name, exact: true })).toBeVisible();
    await page.locator("select").nth(0).selectOption({ label: product.lifecycleStatus });
    if (product.criticality) {
      await page.locator("select").nth(1).selectOption({ label: product.criticality });
    }
    await page.getByRole("link", { name: product.name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/products/${product.id}$`));
    await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Modules" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Clients Using This Product" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Repositories" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Documentation" })).toBeVisible();
    await api.dispose();
  });

  test("creates, edits, and deletes a controlled product through the UI", async ({ page, playwright }) => {
    test.skip(!hasCredential("admin") || !allowMutations, "Set E2E_ADMIN_PASSWORD and E2E_ALLOW_MUTATIONS=true against an isolated database.");
    const name = `Playwright Product ${Date.now()}`;
    let productId: string | undefined;
    const api = await createApiContext(playwright);
    const admin = await loginApi(api, "admin");

    try {
      await loginPage(page, "admin");
      await page.goto("/products/new");
      await page.locator(".form-group").filter({ hasText: "Product Name" }).locator("input").fill(name);
      await page.locator(".form-group").filter({ hasText: "Current Version" }).locator("input").fill("9.9.9");
      await page.locator(".form-group").filter({ hasText: "Supported Markets" }).locator("input").fill("Regression");
      await page.getByRole("button", { name: "Create Product" }).click();
      await expect(page).toHaveURL(/\/products\/\d+$/);
      productId = page.url().match(/\/products\/(\d+)$/)?.[1];
      await expect(page.getByRole("heading", { name })).toBeVisible();

      await page.getByRole("link", { name: "Edit Product" }).click();
      await page.locator(".form-group").filter({ hasText: "Current Version" }).locator("input").fill("9.9.10");
      await page.getByRole("button", { name: "Save Changes" }).click();
      await expect(page.getByText("Version 9.9.10", { exact: true })).toBeVisible();

      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Delete Product" }).click();
      await expect(page).toHaveURL(/\/products$/);
      await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
      productId = undefined;
    } finally {
      if (productId) {
        const response = await api.delete(`products/${productId}`, { headers: authHeaders(admin.token) });
        expect([204, 404]).toContain(response.status());
      }
      await api.dispose();
    }
  });

  test("loads client, deployment, environment, and module relationships", async ({ page, playwright }) => {
    test.skip(!hasCredential("admin"), "Set E2E_ADMIN_PASSWORD locally to run credentialed tests.");
    const api = await createApiContext(playwright);
    const admin = await loginApi(api, "admin");
    const clients = await getJson<Client[]>(api, "/clients", admin.token);
    const deployments = await getJson<Deployment[]>(api, "/deployments", admin.token);
    const client = clients[0];
    const deployment = deployments.find((item) => item.clientId === client.id) ?? deployments[0];
    expect(client).toBeTruthy();
    expect(deployment).toBeTruthy();

    await loginPage(page, "admin");
    await page.goto(`/clients/${client.id}`);
    await expect(page.getByRole("heading", { name: client.companyName })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Client Deployments" })).toBeVisible();
    await expect(page.getByText(deployment.productName, { exact: true })).toBeVisible();
    await expect(page.getByText("Environments", { exact: true }).first()).toBeVisible();

    await page.goto(`/deployments/${deployment.id}`);
    await expect(page.getByRole("heading", { name: /Deployment/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enabled Modules" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Environments" })).toBeVisible();
    await api.dispose();
  });
});
