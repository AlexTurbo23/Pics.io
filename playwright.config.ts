import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  timeout: 120 * 1000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,

  reporter: [
    ["html", { open: "never" }],
    ["line"],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],

  use: {
    baseURL: process.env.BASE_URL || "https://pics.io",
    headless: !!process.env.CI,

    actionTimeout: 30_000,
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: process.env.CI ? [] : ["--start-maximized"],
        },
        viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
        deviceScaleFactor: undefined,
      },
    },
  ],
});
