import { expect, Locator, Page, test } from "@playwright/test";

export class UploadVideoSteps {
  private readonly page: Page;
  private readonly uploadButton: Locator;
  private readonly uploadFileOption: Locator;
  private readonly importButton: Locator;
  private readonly importItemCell: Locator;
  private readonly importFileItemProgress: Locator;
  private readonly assetAlreadyExistText: Locator;
  private readonly acceptAllCookiesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.uploadButton = page.locator("button#button-add");
    this.uploadFileOption = page.locator(
      'li.PicsioMenuItem:has-text("Upload file")',
    );
    this.importButton = page.locator(
      'button.PicsioButton--color--primary:has-text("Import")',
    );
    this.importItemCell = page.locator("div.importItemCell");
    this.importFileItemProgress = page.locator("div.importFileItemProgress");
    this.assetAlreadyExistText = page.locator(
      'span:has-text("Asset already exists")',
    );
    this.acceptAllCookiesButton = page.locator(
      '[data-cky-tag="accept-button"]',
    );
  }

  async acceptAllCookies() {
    await test.step('Click "Accept all" cookies button', async () => {
      await this.acceptAllCookiesButton.click();
    });
  }

  async setVideo(fileName: string) {
    await test.step("Select Video from file system", async () => {
      const fileChooserPromise = this.page.waitForEvent("filechooser");
      await this.uploadButton.click();
      await this.uploadFileOption.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(fileName);
    });
  }

  async clickContinueOrOkButton() {
    await test.step("Select collection and proceed to import", async () => {
      const selectCollectionDialog = this.page
        .locator(".simpleDialogBox")
        .filter({ hasText: "Select collection to import" });

      const isCollectionDialogVisible = await selectCollectionDialog
        .waitFor({ state: "visible", timeout: 8000 })
        .then(() => true)
        .catch(() => false);

      if (isCollectionDialogVisible) {
        await this.page.locator(".dropdownTreeItemName").first().click();
        await selectCollectionDialog
          .locator("button.PicsioButton--color--primary")
          .click();
      } else {
        const isAlreadyExistsVisible = await this.assetAlreadyExistText
          .waitFor({ state: "visible", timeout: 5000 })
          .then(() => true)
          .catch(() => false);
        if (isAlreadyExistsVisible) {
          await this.page.locator('button:has-text("Ok")').click();
        }
      }

      await expect(this.importItemCell).toBeVisible({ timeout: 15000 });
    });
  }

  async clickImportButton() {
    await test.step("Click to 'Import' button", async () => {
      await expect(this.importButton).toBeVisible();
      await this.importButton.click();
    });
  }

  async waitFileloading(timeoutSecond: number) {
    await test.step("Wait till file is loaded", async () => {
      await expect(this.importFileItemProgress).toBeVisible();
      await expect(this.importFileItemProgress).toBeHidden({
        timeout: timeoutSecond * 1000,
      });
    });
  }
}
