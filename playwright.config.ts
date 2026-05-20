import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  timeout: 240 * 1000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ["html", { open: "never" }],
    ["line"],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],

  use: {
    baseURL: process.env.BASE_URL || "https://pics.io",
    headless: !!process.env.CI,

    actionTimeout: 0,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--start-maximized"],
        },
        viewport: null,
        deviceScaleFactor: undefined,
      },
    },
  ],
});
