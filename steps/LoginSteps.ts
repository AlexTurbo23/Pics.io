import { expect, Locator, Page, test } from "@playwright/test";

export class LoginSteps {
  private readonly page: Page;
  private readonly login: Locator;
  private readonly loginWindow: Locator;
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly loginButton: Locator;
  private readonly acceptAllCookiesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.login = page.locator('[data-popup-opener="login"]').first();
    this.loginWindow = page.locator('[data-popup="login"]');
    this.email = page.locator('[id="login-email"]');
    this.password = page.locator('[id="login-password"]');
    this.loginButton = page.locator('//button[contains(text(),"Log in")]');
    this.acceptAllCookiesButton = page.locator(
      '[data-cky-tag="accept-button"]',
    );
  }

  async open() {
    await test.step("Open main page", async () => {
      await this.page.goto("https://pics.io");
      await this.page.waitForLoadState("networkidle");
    });
  }

  async acceptAllCookies() {
    await test.step('Click "Accept all" cookies button', async () => {
      const isVisible = await this.acceptAllCookiesButton
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      if (isVisible) {
        await this.acceptAllCookiesButton.click();
      }
    });
  }

  async openLoginWindow() {
    await test.step("Click to Log in and open modal window", async () => {
      await this.login.click();
      await expect(this.loginWindow).toBeVisible();
    });
  }

  async fillEmail(email: string) {
    await test.step("Fill out Email field", async () => {
      await this.email.click();
      await this.email.fill(email);
    });
  }
  async fillPassword(password: string) {
    await test.step("Fill out Password field", async () => {
      await this.password.click();
      await this.password.fill(password);
    });
  }

  async logIn() {
    await test.step("Click to Log in button", async () => {
      await expect(this.loginButton).toBeVisible();
      await this.loginButton.click();
    });
  }

  async closeIntercomNotification() {
    await test.step("Close Intercom notification if visible", async () => {
      const notificationFrame = this.page.locator(
        'iframe[name="intercom-notification-stack-frame"]',
      );
      const isVisible = await notificationFrame
        .waitFor({ state: "visible", timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (isVisible) {
        await notificationFrame
          .contentFrame()
          .getByTestId("notification-close-desktop")
          .click();
      }
    });
  }
}
