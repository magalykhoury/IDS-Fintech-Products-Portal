import { defineConfig, devices } from "@playwright/test";

const apiBaseUrl = (process.env.E2E_API_URL ?? "http://localhost:5242/api").replace(/\/$/, "");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host localhost --port 5173 --strictPort",
    url: "http://localhost:5173/login",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  metadata: {
    apiBaseUrl,
  },
});
