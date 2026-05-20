import { expect, Locator, Page, test } from "@playwright/test";

export class DeleteVideoSteps {
  private readonly page: Page;
  private readonly videoCheckbox: Locator;
  private readonly deleteButton: Locator;
  private readonly deleteConfirmButton: Locator;
  private readonly deleteDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.videoCheckbox = page.locator(
      ".catalogItem.isVideo .catalogItem__checkbox",
    );
    this.deleteButton = page.locator('[data-testid="assetsDelete"]');
    this.deleteConfirmButton = page
      .locator(".simpleDialogBox")
      .locator('button.PicsioButton--color--primary:has-text("Delete")');
    this.deleteDialog = page.locator(".simpleDialogBox");
  }

  private getVideoCheckboxByName(fileName: string): Locator {
    return this.page.locator(
      `.catalogItem.isVideo:has-text("${fileName}") .catalogItem__checkbox`,
    );
  }

  async deleteVideo(fileName: string) {
    await test.step(`Delete video asset: ${fileName}`, async () => {
      await test.step("Wait for catalog page to load", async () => {
        await this.page.waitForURL("**/search**", { timeout: 30000 });
        await this.page.waitForSelector(".catalogItem.isVideo", {
          timeout: 30000,
        });
      });

      await test.step("Select video asset", async () => {
        const checkbox = this.getVideoCheckboxByName(fileName);
        await expect(checkbox).toBeVisible({ timeout: 10000 });
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
