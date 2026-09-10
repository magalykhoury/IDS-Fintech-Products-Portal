import { expect, type APIRequestContext, type Page, type Playwright } from "@playwright/test";

export const apiBaseUrl = (process.env.E2E_API_URL ?? "http://localhost:5242/api").replace(/\/$/, "");
export const allowMutations = process.env.E2E_ALLOW_MUTATIONS === "true";
export const e2eDatabaseName = process.env.E2E_DATABASE_NAME ?? "";

if (allowMutations && (e2eDatabaseName !== "IdsFintechPortal_E2E" || apiBaseUrl !== "http://localhost:5243/api")) {
  throw new Error("Mutation tests refuse to run unless E2E_DATABASE_NAME=IdsFintechPortal_E2E and E2E_API_URL=http://localhost:5243/api.");
}

export const accounts = {
  admin: { usernameEnv: "E2E_ADMIN_USERNAME", defaultUsername: "demo.admin", passwordEnv: "E2E_ADMIN_PASSWORD" },
  viewer: { usernameEnv: "E2E_VIEWER_USERNAME", defaultUsername: "demo.viewer", passwordEnv: "E2E_VIEWER_PASSWORD" },
  manager: { usernameEnv: "E2E_MANAGER_USERNAME", defaultUsername: "demo.manager", passwordEnv: "E2E_MANAGER_PASSWORD" },
  implementation: { usernameEnv: "E2E_IMPLEMENTATION_USERNAME", defaultUsername: "demo.implementation", passwordEnv: "E2E_IMPLEMENTATION_PASSWORD" },
  developer: { usernameEnv: "E2E_DEVELOPER_USERNAME", defaultUsername: "demo.developer", passwordEnv: "E2E_DEVELOPER_PASSWORD" },
} as const;

export type AccountName = keyof typeof accounts;

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  lifecycleStatus: string;
  currentVersion: string | null;
  criticality: string | null;
}

export interface Client {
  id: number;
  companyName: string;
}

export interface Deployment {
  id: number;
  clientId: number;
  productId: number;
  clientName: string;
  productName: string;
  productVersion: string;
}

export interface Approval {
  id: number;
  entityId: number;
  title: string;
  status: string;
  requestedByUserId: number;
}

export interface Notification {
  id: number;
  title: string;
  relatedEntityId: number | null;
  isRead: boolean;
  link: string | null;
}

export function hasCredential(account: AccountName): boolean {
  return Boolean(process.env[accounts[account].passwordEnv]);
}

export function username(account: AccountName): string {
  return process.env[accounts[account].usernameEnv] ?? accounts[account].defaultUsername;
}

export function credential(account: AccountName): string {
  const password = process.env[accounts[account].passwordEnv];
  if (!password) {
    throw new Error(`Set ${accounts[account].passwordEnv} locally to run this regression test.`);
  }
  return password;
}

export async function loginApi(api: APIRequestContext, account: AccountName): Promise<LoginResponse> {
  const response = await api.post("auth/login", {
    data: {
      username: username(account),
      password: credential(account),
    },
  });
  expect(response, `API login failed for ${username(account)}`).toBeOK();
  return response.json() as Promise<LoginResponse>;
}

export async function loginPage(page: Page, account: AccountName): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username(account));
  await page.getByLabel("Password").fill(credential(account));
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function createApiContext(playwright: Playwright): Promise<APIRequestContext> {
  return playwright.request.newContext({ baseURL: `${apiBaseUrl}/` });
}

export async function getJson<T>(api: APIRequestContext, path: string, token: string): Promise<T> {
  const response = await api.get(path.replace(/^\/+/, ""), { headers: authHeaders(token) });
  expect(response, `GET ${path} failed`).toBeOK();
  return response.json() as Promise<T>;
}

export async function expectStatus(
  api: APIRequestContext,
  method: "post" | "put" | "delete",
  path: string,
  token: string,
  data?: unknown,
  status = 200,
): Promise<void> {
  const response = await api[method](path.replace(/^\/+/, ""), {
    headers: authHeaders(token),
    ...(data === undefined ? {} : { data }),
  });
  expect(response.status(), `${method.toUpperCase()} ${path}`).toBe(status);
}
