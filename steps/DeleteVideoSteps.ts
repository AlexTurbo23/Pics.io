import { expect, Locator, Page, test } from "@playwright/test";

export class DeleteVideoSteps {
  private readonly page: Page;
  private readonly deleteButton: Locator;
  private readonly deleteConfirmButton: Locator;
  private readonly deleteDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.deleteButton = page.locator('[data-testid="assetsDelete"]');
    this.deleteConfirmButton = page
      .locator(".simpleDialogBox")
      .locator('button.PicsioButton--color--primary:has-text("Delete")');
    this.deleteDialog = page.locator(".simpleDialogBox");
  }

  private getVideoCheckboxByName(fileName: string): Locator {
    return this.page.locator(
      `.catalogItem:has-text("${fileName}") .catalogItem__checkbox`,
    );
  }

  async deleteVideoIfExists(fileName: string) {
    await test.step(`Cleanup: delete "${fileName}" if exists`, async () => {
      await this.page.goto("https://pics.io/search");
      await this.page.waitForURL("**/search**", { timeout: 30000 });
      const videoItem = this.page.locator(
        `.catalogItem:has-text("${fileName}")`,
      );
      const exists = await videoItem
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      if (!exists) return;
      await videoItem.hover();
      await videoItem.locator(".catalogItem__checkbox").click();
      await expect(this.deleteButton).toBeVisible({ timeout: 5000 });
      await this.deleteButton.click();
      await expect(this.deleteDialog).toBeVisible({ timeout: 5000 });
      await this.deleteConfirmButton.click();
      await expect(this.deleteDialog).toBeHidden({ timeout: 10000 });
    });
  }

  async deleteVideo(fileName: string) {
    await test.step(`Delete video asset: ${fileName}`, async () => {
      await test.step("Navigate to search page", async () => {
        await this.page.goto("https://pics.io/search");
        await this.page.waitForURL("**/search**", { timeout: 30000 });
        await this.page
          .locator(`.catalogItem:has-text("${fileName}")`)
          .waitFor({ state: "visible", timeout: 30000 });
      });

      await test.step("Select video asset", async () => {
        const item = this.page.locator(`.catalogItem:has-text("${fileName}")`);
        await item.hover();
        const checkbox = this.getVideoCheckboxByName(fileName);
        await expect(checkbox).toBeVisible({ timeout: 5000 });
        await checkbox.click();
      });

      await test.step("Click Delete button in toolbar", async () => {
        await expect(this.deleteButton).toBeVisible({ timeout: 5000 });
        await this.deleteButton.click();
      });

      await test.step("Confirm deletion in dialog", async () => {
        await expect(this.deleteDialog).toBeVisible({ timeout: 5000 });
        await expect(this.deleteDialog).toContainText(fileName);
        await this.deleteConfirmButton.click();
      });

      await test.step("Verify dialog is closed", async () => {
        await expect(this.deleteDialog).toBeHidden({ timeout: 10000 });
      });
    });
  }
}
