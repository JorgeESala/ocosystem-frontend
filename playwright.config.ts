import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env.e2e.local") });
dotenv.config({ path: path.resolve(__dirname, ".env.development") });

const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const useRemoteServer =
  Boolean(remoteBaseURL) &&
  !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(
    remoteBaseURL ?? "",
  );

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: remoteBaseURL || "http://localhost:5173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: useRemoteServer
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          ...process.env,
          VITE_API_URL: process.env.VITE_API_URL || "http://localhost:8080",
        },
      },
});
