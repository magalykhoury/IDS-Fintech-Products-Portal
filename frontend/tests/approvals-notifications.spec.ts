import { test, expect, type APIRequestContext } from "@playwright/test";
import { allowMutations, authHeaders, createApiContext, getJson, hasCredential, loginApi, loginPage, type Approval, type Client, type Deployment, type Notification, type Product } from "./fixtures";

test.describe.serial("approval workflow and notifications", () => {
  test.skip(!hasCredential("admin") || !hasCredential("manager") || !allowMutations, "Set E2E_ADMIN_PASSWORD and E2E_MANAGER_PASSWORD with E2E_ALLOW_MUTATIONS=true against an isolated database.");

  let api: APIRequestContext;
  let adminToken = "";
  let managerToken = "";
  let productId: number | undefined;
  let clientId: number | undefined;
  let deploymentId: number | undefined;
  let approvalId: number | undefined;

  test.beforeAll(async ({ playwright }) => {
    api = await createApiContext(playwright);
    adminToken = (await loginApi(api, "admin")).token;
    managerToken = (await loginApi(api, "manager")).token;

    const suffix = Date.now();
    const productResponse = await api.post("products", {
      headers: authHeaders(adminToken),
      data: { name: `Playwright Approval Product ${suffix}`, lifecycleStatus: "Active", currentVersion: "1.0.0", criticality: "Low" },
    });
    expect(productResponse.status()).toBe(201);
    productId = (await productResponse.json() as Product).id;

    const clientResponse = await api.post("clients", {
      headers: authHeaders(adminToken),
      data: { companyName: `Playwright Approval Client ${suffix}`, country: "Regression", status: "Active" },
    });
    expect(clientResponse.status()).toBe(201);
    clientId = (await clientResponse.json() as Client).id;

    const deploymentResponse = await api.post("deployments", {
      headers: authHeaders(adminToken),
      data: { clientId, productId, productVersion: "1.0.0", status: "Testing", supportTier: "Standard" },
    });
    expect(deploymentResponse.status()).toBe(201);
    deploymentId = (await deploymentResponse.json() as Deployment).id;
  });

  test.afterAll(async () => {
    if (!api) return;
    if (deploymentId) await api.delete(`deployments/${deploymentId}`, { headers: authHeaders(adminToken) });
    if (clientId) await api.delete(`clients/${clientId}`, { headers: authHeaders(adminToken) });
    if (productId) await api.delete(`products/${productId}`, { headers: authHeaders(adminToken) });
    await api.dispose();
  });

  test("permitted user can submit and duplicate pending request is rejected", async ({ page }) => {
    await loginPage(page, "manager");
    await page.goto("/approvals");
    await page.locator("select").first().selectOption(String(deploymentId));
    await page.getByPlaceholder("Explain what needs review...").fill("Playwright approval regression request");
    await page.getByRole("button", { name: "Request approval" }).click();
    await expect(page.getByText(/Deployment approval:/).first()).toBeVisible();

    const approvals = await getJson<Approval[]>(api, "/approvals", managerToken);
    const created = approvals.find((approval) => approval.entityId === deploymentId && approval.status === "Pending");
    expect(created).toBeTruthy();
    approvalId = created?.id;

    const duplicate = await api.post("approvals", {
      headers: authHeaders(managerToken),
      data: { entityType: "Deployment", entityId: deploymentId, description: "Duplicate regression request" },
    });
    expect(duplicate.status()).toBe(400);
  });

  test("requester cannot approve their own pending request", async () => {
    const response = await api.put(`approvals/${approvalId}/decision`, {
      headers: authHeaders(managerToken),
      data: { status: "Approved", comment: "Invalid self-approval regression request" },
    });
    expect(response.status()).toBe(400);
  });

  test("authorized reviewer can approve and requester receives a notification", async ({ page }) => {
    await loginPage(page, "admin");
    await page.goto("/approvals");
    const approval = page.locator(`#approval-${approvalId}`);
    await expect(approval).toBeVisible();
    await approval.getByRole("button", { name: "Approve" }).click();
    await expect(approval.getByText("Approved", { exact: true })).toBeVisible();

    const notifications = await getJson<Notification[]>(api, "/notifications", managerToken);
    const notification = notifications.find((item) => item.link === `/approvals?focus=${approvalId}`);
    expect(notification).toBeTruthy();
    expect(notification?.link).toBe(`/approvals?focus=${approvalId}`);

    const unread = await getJson<{ count: number }>(api, "/notifications/unread-count", managerToken);
    expect(unread.count).toBeGreaterThan(0);
    if (notification) {
      await expect((await api.put(`notifications/${notification.id}/read`, { headers: authHeaders(managerToken) })).status()).toBe(204);
    }
    await expect((await api.put("notifications/read-all", { headers: authHeaders(managerToken) })).status()).toBe(204);
    expect((await getJson<{ count: number }>(api, "/notifications/unread-count", managerToken)).count).toBe(0);

    await loginPage(page, "manager");
    await page.goto("/notifications");
    await expect(page.getByText(notification?.title ?? "", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Open" }).first().click();
    await expect(page).toHaveURL(new RegExp(`/approvals\\?focus=${approvalId}$`));
    await expect(page.locator(`#approval-${approvalId}`)).toBeVisible();
  });
});
