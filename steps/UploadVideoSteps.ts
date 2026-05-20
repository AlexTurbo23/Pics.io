import { expect, Locator, Page, test } from "@playwright/test";

export class UploadVideoSteps {
  private readonly page: Page;

  // Upload controls
  private readonly uploadButton: Locator;
  private readonly uploadFileOption: Locator;
  private readonly acceptAllCookiesButton: Locator;

  // "Asset already exists" dialog
  private readonly assetExistsDialog: Locator;
  private readonly assetExistsOkButton: Locator;

  // "Select collection to import" dialog
  private readonly collectionDialog: Locator;
  private readonly collectionFirstItem: Locator;
  private readonly collectionImportButton: Locator;

  // Import panel (appears after dialog is dismissed)
  private readonly importItemCell: Locator;
  private readonly importButton: Locator;
  private readonly importFileItemProgress: Locator;

  constructor(page: Page) {
    this.page = page;

    this.uploadButton = page.locator("button#button-add");
    this.uploadFileOption = page.locator(
      'li.PicsioMenuItem:has-text("Upload file")',
    );
    this.acceptAllCookiesButton = page.locator(
      '[data-cky-tag="accept-button"]',
    );

    // "Asset already exists" — simpleDialogBox filtered by text (работает в любом сценарии)
    this.assetExistsDialog = page
      .locator(".simpleDialogBox")
      .filter({ hasText: "Asset already exists" });
    this.assetExistsOkButton = this.assetExistsDialog.getByRole("button", {
      name: "Ok",
    });

    // "Select collection to import"
    this.collectionDialog = page
      .locator(".simpleDialogBox")
      .filter({ hasText: "Select collection to import" });
    this.collectionFirstItem = this.collectionDialog
      .locator(".dropdownTreeItemName")
      .first();
    this.collectionImportButton = this.collectionDialog.locator(
      "button.PicsioButton--color--primary",
    );

    // Import panel
    this.importItemCell = page.locator("div.importItemCell");
    this.importButton = page.locator(
      'button.PicsioButton--color--primary:has-text("Import")',
    );
    this.importFileItemProgress = page.locator("div.importFileItemProgress");
  }

  async acceptAllCookies() {
    await test.step('Click "Accept all" cookies button', async () => {
      await this.acceptAllCookiesButton.click();
    });
  }

  async setVideo(fileName: string) {
    await test.step("Select video from file system", async () => {
      const fileChooserPromise = this.page.waitForEvent("filechooser");
      await this.uploadButton.click();
      await this.uploadFileOption.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(fileName);
    });
  }

  /**
   * Определяет, какой диалог появился после выбора файла.
   * Ждёт появления заголовка любого диалога и возвращает его тип.
   */
  private async detectDialog(
    timeout = 15000,
  ): Promise<"exists" | "collection" | null> {
    const dialogTitle = this.page.locator("span.simpleDialogTitle");

    try {
      await dialogTitle.first().waitFor({ state: "visible", timeout });
    } catch {
      console.log("[UploadVideoSteps] No dialog appeared within timeout");
      return null;
    }

    const titleText = (await dialogTitle.first().textContent()) ?? "";
    console.log(`[UploadVideoSteps] Dialog appeared: "${titleText}"`);

    if (titleText.includes("Asset already exists")) return "exists";
    if (titleText.includes("Select collection")) return "collection";

    console.log(`[UploadVideoSteps] Unknown dialog: "${titleText}"`);
    return null;
  }

  /**
   * Нажимает Ok в диалоге "Asset already exists" и ждёт его закрытия.
   */
  async clickOkOnAssetExistsDialog() {
    await test.step('Click "Ok" on "Asset already exists" dialog', async () => {
      await expect(this.assetExistsDialog).toBeVisible({ timeout: 10000 });
      console.log("[UploadVideoSteps] Clicking Ok on 'Asset already exists'");
      await this.assetExistsOkButton.click({ force: true });
      await expect(this.assetExistsDialog).toBeHidden({ timeout: 10000 });
      console.log("[UploadVideoSteps] 'Asset already exists' dialog closed");
    });
  }

  /**
   * Выбирает коллекцию и нажимает Import в диалоге "Select collection to import".
   */
  async clickImportInCollectionDialog() {
    await test.step('Select collection and click "Import"', async () => {
      await expect(this.collectionDialog).toBeVisible({ timeout: 10000 });
      console.log(
        "[UploadVideoSteps] Selecting collection and clicking Import",
      );
      await this.collectionFirstItem.click();
      await this.collectionImportButton.click();
      await expect(this.collectionDialog).toBeHidden({ timeout: 10000 });
      console.log("[UploadVideoSteps] Collection dialog closed");
    });
  }

  /**
   * Обрабатывает диалог после выбора файла.
   * Определяет тип диалога, выполняет нужное действие и ждёт импорт-панели.
   */
  async clickContinueOrOkButton() {
    await test.step("Handle upload dialog and proceed to import", async () => {
      const dialogType = await this.detectDialog();

      if (dialogType === "collection") {
        await this.clickImportInCollectionDialog();
        // После выбора коллекции может появиться "Asset already exists"
        const secondDialog = await this.detectDialog(5000);
        if (secondDialog === "exists") {
          console.log(
            "[UploadVideoSteps] Second dialog after collection: asset exists",
          );
          await this.clickOkOnAssetExistsDialog();
        }
      } else if (dialogType === "exists") {
        await this.clickOkOnAssetExistsDialog();
        // После Ok может появиться диалог выбора коллекции (revision flow)
        const secondDialog = await this.detectDialog(5000);
        if (secondDialog === "collection") {
          console.log("[UploadVideoSteps] Second dialog after Ok: collection");
          await this.clickImportInCollectionDialog();
        }
      } else {
        throw new Error(
          "[UploadVideoSteps] No dialog appeared after file selection",
        );
      }

      console.log("[UploadVideoSteps] Waiting for import panel...");
      await expect(this.importItemCell).toBeVisible({ timeout: 20000 });
      console.log("[UploadVideoSteps] Import panel is visible");
    });
  }

  async clickImportButton() {
    await test.step("Click 'Import' button", async () => {
      await expect(this.importButton).toBeVisible({ timeout: 10000 });
      await this.importButton.click();
    });
  }

  async waitFileloading(timeoutSecond: number) {
    await test.step("Wait for file upload to complete", async () => {
      await expect(this.importFileItemProgress).toBeVisible({ timeout: 30000 });
      await expect(this.importFileItemProgress).toBeHidden({
        timeout: timeoutSecond * 1000,
      });
    });
  }
}
