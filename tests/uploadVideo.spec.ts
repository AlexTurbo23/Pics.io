import { test, expect } from "@playwright/test";
import { CheckVideoSteps } from "../steps/CheckUploadedSteps";
import { LoginSteps } from "../steps/LoginSteps";
import { UploadVideoSteps } from "../steps/UploadVideoSteps";
import { DeleteVideoSteps } from "../steps/DeleteVideoSteps";

const videoNAME = "video.mp4";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }, testInfo) => {
  const loginSteps = new LoginSteps(page);
  console.log(`Running ${testInfo.title}`);

  await loginSteps.open();
  await loginSteps.acceptAllCookies();
  await loginSteps.openLoginWindow();
  await loginSteps.fillEmail(process.env.TEST_USER_EMAIL!);
  await loginSteps.fillPassword(process.env.TEST_USER_PASSWORD!);
  await loginSteps.logIn();
  await loginSteps.closeIntercomNotification();

});

test("Check uploading video", async ({ page }) => {
  const uploadVideoSteps = new UploadVideoSteps(page);
  const checkingVideoSteps = new CheckVideoSteps(page);

  await uploadVideoSteps.setVideo(videoNAME);
  await uploadVideoSteps.clickContinueOrOkButton();
  await uploadVideoSteps.clickImportButton();
  await uploadVideoSteps.waitFileloading(60);
  await checkingVideoSteps.verifyVideoIsUploaded(videoNAME);
});

test("Delete uploaded video", async ({ page }) => {
  const deleteVideoSteps = new DeleteVideoSteps(page);
  await deleteVideoSteps.deleteVideo(videoNAME);
});