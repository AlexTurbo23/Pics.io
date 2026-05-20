import { test } from "@playwright/test";
import { LoginSteps } from "../steps/LoginSteps";
import { VideoPlayerSteps } from "../steps/VideoPlayerSteps";

test.describe.configure({ mode: "serial" });

test.describe("Video Player", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    const loginSteps = new LoginSteps(page);
    await loginSteps.open();
    await loginSteps.acceptAllCookies();
    await loginSteps.openLoginWindow();
    await loginSteps.fillEmail(process.env.TEST_USER_EMAIL!);
    await loginSteps.fillPassword(process.env.TEST_USER_PASSWORD!);
    await loginSteps.logIn();
    await loginSteps.closeIntercomNotification();
  });

  test("Video player loads when opening a video asset", async ({ page }) => {
    const playerSteps = new VideoPlayerSteps(page);

    await playerSteps.openFirstVideoAsset();
    await playerSteps.assertPlayerLoaded();
  });

  test("Play button is visible and video is initially paused", async ({
    page,
  }) => {
    const playerSteps = new VideoPlayerSteps(page);

    await playerSteps.openFirstVideoAsset();
    await playerSteps.assertPlayButtonVisible();
    await playerSteps.assertVideoIsPaused();
  });

  test("Clicking play button starts video playback", async ({ page }) => {
    const playerSteps = new VideoPlayerSteps(page);

    await playerSteps.openFirstVideoAsset();
    await playerSteps.clickPlay();
    await playerSteps.assertVideoIsPlaying();
  });

  test("Clicking play again pauses the video", async ({ page }) => {
    const playerSteps = new VideoPlayerSteps(page);

    await playerSteps.openFirstVideoAsset();
    await playerSteps.clickPlay();
    await playerSteps.assertVideoIsPlaying();
    await playerSteps.clickPlay();
    await playerSteps.assertVideoIsPaused();
  });

  test("Volume and fullscreen controls are visible", async ({ page }) => {
    const playerSteps = new VideoPlayerSteps(page);

    await playerSteps.openFirstVideoAsset();
    await playerSteps.assertVolumeButtonVisible();
    await playerSteps.assertFullscreenButtonVisible();
  });

  test("Space key toggles play/pause", async ({ page }) => {
    const playerSteps = new VideoPlayerSteps(page);

    await playerSteps.openFirstVideoAsset();
    await playerSteps.clickPlay();
    await playerSteps.assertVideoIsPlaying();
    await playerSteps.pressSpaceKey();
    await playerSteps.assertVideoIsPaused();
  });

  test("Seeking changes the playback position", async ({ page }) => {
    const playerSteps = new VideoPlayerSteps(page);

    await playerSteps.openFirstVideoAsset();
    await playerSteps.assertPlayerLoaded();
    await playerSteps.seekToPercent(50);
    await playerSteps.assertCurrentTimeIsAfter(0);
  });
});
