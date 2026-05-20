# Pics.io — Test Automation Suite

> End-to-end automated tests for the [Pics.io](https://pics.io) Digital Asset Management platform, built with **Playwright** and **TypeScript**.

---

## 📋 Documentation

| Resource                  | Link                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| Video Player Testing Plan | [`docs/testing-plan-video-player.md`](docs/testing-plan-video-player.md) |

---

## 🗂 Project Structure

```
├── tests/
│   ├── uploadVideo.spec.ts        # Upload and delete video asset
│   └── videoPlayer.spec.ts        # Video player controls
├── steps/
│   ├── LoginSteps.ts              # Authentication actions
│   ├── UploadVideoSteps.ts        # Upload flow actions
│   ├── CheckUploadedSteps.ts      # Post-upload verification
│   ├── DeleteVideoSteps.ts        # Asset deletion actions
│   └── VideoPlayerSteps.ts        # Video player actions
├── docs/
│   └── testing-plan-video-player.md
└── playwright.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Chromium (installed automatically by Playwright)
- Java 11+ (required by Allure CLI to generate reports)

### Install

```bash
npm install
npx playwright install chromium
```

### Configure credentials

Create a `.env.test` file in the project root (do **not** commit it):

```env
TEST_USER_EMAIL=your@email.com
TEST_USER_PASSWORD=yourpassword
```

---

## ▶️ Running Tests

| Command                                         | Description                     |
| ----------------------------------------------- | ------------------------------- |
| `npm test`                                      | Run all tests                   |
| `npm run test:line`                             | Run with compact console output |
| `npx playwright test tests/uploadVideo.spec.ts` | Run a specific file             |
| `npm run report:html`                           | Open Playwright HTML report     |
| `npm run report:allure`                         | Generate and open Allure report |

---

## 📊 Allure Report

Allure provides a rich visual report with test history, steps, attachments, and retry details.

After running tests, results are saved to `allure-results/`. To generate and view the report:

```bash
npm run report:allure
```

> ⚠️ Requires **Java 11+** installed and available in `PATH`.  
> Download: [Java 11 JDK](https://www.oracle.com/es/java/technologies/javase/jdk11-archive-downloads.html) (free, LTS build recommended).  
> If Java is not available, use the Playwright HTML report instead: `npm run report:html`

---

## 🔍 Linting

ESLint is configured with TypeScript and Playwright-specific rules.

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `npm run lint`     | Check for lint errors        |
| `npm run lint:fix` | Auto-fix fixable lint errors |

Key rules enforced:

- `playwright/no-focused-test` — prevents accidentally committed `test.only` (error)
- `playwright/valid-expect` — ensures `expect()` is always awaited (error)
- `playwright/no-wait-for-timeout` — discourages hard-coded waits (warning)
- `playwright/prefer-web-first-assertions` — encourages `toBeVisible()` over `isVisible()` (warning)
- `@typescript-eslint/no-unused-vars` — flags unused variables (warning)

---

## ✅ Implemented Tests

| Test                                        | File                        | Status  |
| ------------------------------------------- | --------------------------- | ------- |
| Upload video asset                          | `tests/uploadVideo.spec.ts` | ✅ Done |
| Delete video asset                          | `tests/uploadVideo.spec.ts` | ✅ Done |
| Video player loads for video asset          | `tests/videoPlayer.spec.ts` | ✅ Done |
| Play button visible, video initially paused | `tests/videoPlayer.spec.ts` | ✅ Done |
| Click play → video starts playing           | `tests/videoPlayer.spec.ts` | ✅ Done |
| Click play again → video pauses             | `tests/videoPlayer.spec.ts` | ✅ Done |
| Volume and fullscreen controls visible      | `tests/videoPlayer.spec.ts` | ✅ Done |

---

## 🤖 AI Tools Used

**GitHub Copilot** was used throughout the project in the following areas:

| Area                      | How it helped                                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test plan structure**   | Generated the initial skeleton for `docs/testing-plan-video-player.md` — sections, priority tables, and edge case lists — which were then reviewed and refined manually                   |
| **Locator strategy**      | Suggested CSS and ARIA-based selectors (`getByRole`, `data-popup-opener`, `.simpleDialogBox`) during live inspection of the Pics.io DOM; reduced trial-and-error in headless mode         |
| **Debugging dialog flow** | Identified the double-dialog sequence (collection picker → asset-exists) by analysing Playwright trace output and suggesting the two-step `detectDialog` pattern in `UploadVideoSteps.ts` |
| **CI configuration**      | Proposed fixes for the headless viewport issue (`viewport: null` → `1920×1080`), `retries`, `actionTimeout`, and the large-file cleanup step in the GitHub Actions workflow               |
| **Code review**           | Flagged `acceptAllCookies` as a hard failure point when the cookie banner is absent, and suggested the `waitFor + catch` guard pattern                                                    |
