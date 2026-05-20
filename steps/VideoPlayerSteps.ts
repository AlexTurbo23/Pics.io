import { expect, Page, test } from "@playwright/test";

export class VideoPlayerSteps {
  constructor(private readonly page: Page) {}

  async openFirstVideoAsset() {
    await test.step("Navigate to catalog and open first video asset in player", async () => {
      await this.page.goto("https://pics.io/search");
      await this.page.waitForURL("**/search**");
      const videoAsset = this.page.locator(".catalogItem.isVideo").first();
      await expect(videoAsset).toBeVisible({ timeout: 15000 });
      await videoAsset.dblclick();
      await this.page.waitForURL("**/preview/**");
    });
  }

  async assertPlayerLoaded() {
    await test.step("Assert video player container is visible", async () => {
      await expect(this.page.locator(".wrapperVideoTag")).toBeVisible({
        timeout: 10000,
      });
      await expect(this.page.locator("video")).toBeAttached();
    });
  }

  async assertPlayButtonVisible() {
    await test.step("Assert play button is visible", async () => {
      await expect(this.page.locator(".btnPlayVideo")).toBeVisible();
    });
  }

  async assertVideoIsPaused() {
    await test.step("Assert video is paused", async () => {
      await expect(this.page.locator(".btnPlayVideo.playing")).toBeHidden();
      const isPaused = await this.page.evaluate(
        () =>
          (document.querySelector("video") as HTMLVideoElement)?.paused ?? true,
      );
      expect(isPaused, "Expected video.paused to be true").toBe(true);
    });
  }

  async assertVideoIsPlaying() {
    await test.step("Assert video is playing", async () => {
      await expect(this.page.locator(".btnPlayVideo.playing")).toBeVisible({
        timeout: 5000,
      });
      const isPaused = await this.page.evaluate(
        () =>
          (document.querySelector("video") as HTMLVideoElement)?.paused ?? true,
      );
      expect(isPaused, "Expected video.paused to be false").toBe(false);
    });
  }

  async clickPlay() {
    await test.step("Click play/pause button", async () => {
      await this.page.locator(".btnPlayVideo").click();
    });
  }

  async assertVolumeButtonVisible() {
    await test.step("Assert volume button is visible", async () => {
      await expect(this.page.locator(".btnVolumeVideo")).toBeVisible();
    });
  }

  async assertFullscreenButtonVisible() {
    await test.step("Assert fullscreen button is visible", async () => {
      await expect(this.page.locator(".btnFullscreenVideo")).toBeVisible();
    });
  }
}
