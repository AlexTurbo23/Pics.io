# Testing Plan — Video Player (Pics.io)

---

## 1. Feature Overview & Why This Feature

**Feature:** In-browser Video Player  
**Location:** Opens when clicking any video asset in the catalog (`.catalogItem.isVideo`)

The video player is a core value driver of the Pics.io DAM platform. It allows teams to preview, annotate, and review video assets without downloading them. Unlike images, video playback involves streaming, buffering, codec handling, and timeline interaction — all of which are complex surfaces prone to regression. A broken player directly impacts daily creative workflows, making it a high-priority test target.

---

## 2. Scope of Testing

### 2.1 Functional Behaviour

| Scenario                                               | Priority | Notes                                                                |
| ------------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| Play / Pause toggle (button + Space)                   | P1       | Core interaction                                                     |
| Timeline scrubbing (click + drag)                      | P1       | Must seek accurately                                                 |
| Volume control (slider + M mute)                       | P1       |                                                                      |
| Fullscreen mode (F key + button)                       | P1       | Check browser fullscreen API                                         |
| Playback speed change (0.5×, 1×, 1.5×, 2×)             | P2       |                                                                      |
| Loop / autoplay settings                               | P2       |                                                                      |
| Keyboard shortcuts (←/→ to seek ±5s)                   | P2       | Accessibility requirement                                            |
| Download from player                                   | P2       | Check file integrity after download                                  |
| Player opens for all supported formats                 | P1       | MP4, MOV, WebM — see edge cases for others                           |
| Player shows correct metadata (duration, resolution)   | P2       |                                                                      |
| Thumbnail preview on timeline hover                    | P3       | Nice-to-have, often regresses silently                               |
| Frame-by-frame navigation (`,` / `.` keys or buttons)  | P2       | DAM-specific need for editors and reviewers                          |
| Picture-in-Picture (PiP) mode                          | P2       | Browser-native API; verify entry/exit and controls overlay           |
| Timestamp deep link (share video at specific position) | P2       | `?t=42s` param in URL — player must seek to correct position on open |

### 2.2 UI / UX

- **Controls auto-hide:** Controls fade out after ~3s of no interaction during playback; reappear on mouse move
- **Loading / buffering spinner:** Visible during initial load and when seeking on slow network
- **Error state:** Friendly error message for unsupported codec or broken file — not a raw browser error
- **Responsive layout:** Player resizes correctly in side-panel vs. full-panel view
- **Thumbnail strip:** Preview frames shown when hovering over the progress bar
- **Accessibility:** `aria-label` on play button, volume slider, fullscreen button; player usable via keyboard only

### 2.3 API & Networking

- **Video streaming:** Server must honour HTTP Range requests (206 Partial Content) — this is what makes seeking instant without re-downloading the entire file
- **Signed / expiring URLs:** Check that video URLs in the DOM contain auth tokens; verify that a copied raw URL stops working after session expiry (security overlap)
- **Thumbnail generation API:** After upload, `GET /thumbnails/:id` returns frames; test that the player waits for readiness state before showing the timeline strip
- **Network error recovery:** Simulate dropped connection mid-playback — player should show error state, not freeze silently
- **Response codes to verify:** 200 on first load, 206 on seek, 403 on unauthorized direct access

### 2.4 Performance

| Metric                                                           | Target                     | Tool                          |
| ---------------------------------------------------------------- | -------------------------- | ----------------------------- |
| Time to First Frame (TTFF) on 10 Mbps                            | < 2 s                      | Playwright + `page.metrics()` |
| Seek response time (click timeline → playback from new position) | < 500 ms                   | Playwright timers             |
| Player control render time after asset open                      | < 1 s                      | Performance Observer          |
| Memory after 10-minute playback session                          | No leak (< +50 MB)         | Chrome DevTools Memory tab    |
| CPU during active playback (1080p)                               | < 30% on mid-range machine | Chrome Task Manager           |

Performance benchmarks are a quality signal, not hard gates — deviations open investigation tickets rather than block releases.

### 2.5 Security

- **Direct URL access:** A video asset URL extracted from the player DOM must return `403 Forbidden` when opened in an incognito tab without a valid session cookie
- **No credential exposure:** Verify that signed URLs do not contain raw passwords or permanent tokens (only time-limited JWTs or pre-signed S3-style URLs)
- **XSS in metadata:** Upload a video with a filename like `<img src=x onerror=alert(1)>.mp4` and verify the player renders it as text, not HTML
- **Clickjacking:** Player should not be embeddable in an arbitrary third-party iframe without explicit allow-listing

### 2.6 Edge Cases

| Case                                                   | Expected Behaviour                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Video < 1 second                                       | Player renders, duration shows `0:00` or `< 0:01`, no infinite-loop bug         |
| Video > 2 hours                                        | Duration displays correctly (`2:15:00`), timeline scrub is precise              |
| File > 2 GB                                            | Upload completes; player streams via range requests rather than buffering fully |
| Corrupt / truncated file                               | Player shows error message, does not crash the page                             |
| Unsupported codec (e.g. AVI with DivX)                 | Clear "unsupported format" message, not blank screen                            |
| Mid-playback browser tab sleep (background throttling) | Playback resumes correctly when tab is refocused                                |
| Rapid seek clicks (stress test timeline)               | No race condition, player ends at last clicked position                         |
| Two video tabs open simultaneously                     | Both play independently; no shared audio interference                           |

### 2.7 Cross-Browser / Cross-Device

| Environment                      | Priority | Scope                                  |
| -------------------------------- | -------- | -------------------------------------- |
| Chrome (latest)                  | P1       | Full functional + UI                   |
| Firefox (latest)                 | P1       | Full functional                        |
| Safari 17+ (macOS)               | P2       | Codec differences (H.265 support)      |
| Edge (latest)                    | P3       | Smoke only                             |
| iOS Safari (iPhone 14+)          | P2       | Touch controls, fullscreen API differs |
| Android Chrome                   | P2       | Touch scrubbing, Picture-in-Picture    |
| 1280×720 / 1920×1080 / 2560×1440 | P2       | Layout breakpoints                     |

### 2.8 Video Annotation & Review

The overview states the player is used to "preview, **annotate**, and review" assets. This is a core DAM differentiator — yet it has no test coverage in the plan. The annotation surface must be tested as a first-class feature.

| Scenario                                                      | Priority | Notes                                                             |
| ------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| Add a time-coded comment at a specific timestamp              | P1       | Core review workflow                                              |
| Annotation marker appears on the timeline at correct position | P1       | Visual alignment with `currentTime`                               |
| Edit an existing annotation                                   | P1       | Inline editing; verify save persists on reload                    |
| Delete an annotation                                          | P1       | Confirm removal from timeline and list                            |
| View all annotations in the side panel / list                 | P2       | Sorted by timestamp                                               |
| Click annotation in list → player seeks to that time          | P2       | Deep link behaviour within the player UI                          |
| Multi-user annotation visibility                              | P2       | Annotation added by user A appears for user B without page reload |
| Annotations exported / included in PDF review report          | P3       | If feature exists                                                 |
| Annotation persists after video re-upload / version change    | P2       | Linked to asset ID, not raw URL                                   |

---

## 3. Test Case Prioritisation

### Tier 1 — Core (run on every build)

1. Video opens and plays to end without error
2. Play/pause works via button and Space key
3. Timeline seek delivers playback from correct position
4. Volume mute/unmute works
5. Fullscreen opens and closes correctly
6. Player does not crash on corrupt file
7. Unauthorised direct URL access returns 403

### Tier 2 — Important (run on each release candidate)

8. All supported video formats open (MP4, MOV, WebM)
9. Playback speed change takes effect
10. Error state shown on network failure
11. TTFF < 2 s benchmark
12. Player keyboard navigation (arrows, M, F)
13. XSS in filename does not execute
14. Add / edit / delete time-coded annotation
15. Annotation marker appears at correct timeline position
16. PiP mode opens and closes correctly
17. Timestamp deep link (`?t=`) seeks to correct position on load

### Tier 3 — Secondary (run weekly / per sprint)

18. Edge case file sizes (< 1s, > 2h, > 2 GB)
19. Cross-browser parity (Safari, Firefox)
20. Mobile touch controls
21. Memory / CPU performance profiling
22. Thumbnail strip preview accuracy
23. Signed URL expiry check

---

## 4. Automation Strategy

### What to Automate (and Why)

| Test Area                             | Automate?  | Reasoning                                                                    |
| ------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| Play / pause / seek via keyboard      | ✅ Yes     | Stable, deterministic, runs every build                                      |
| Format compatibility (MP4, WebM, MOV) | ✅ Yes     | Easy file-based parametrisation                                              |
| 403 on unauthorised URL               | ✅ Yes     | Single API assertion, zero flakiness                                         |
| TTFF benchmark                        | ✅ Yes     | `page.evaluate(() => performance.getEntriesByType('resource'))`              |
| Visual regression (player UI states)  | ✅ Yes     | Playwright screenshots + `expect(page).toMatchSnapshot()`                    |
| Mobile touch controls                 | ⚠️ Partial | Playwright device emulation for basic checks; real device for final sign-off |
| Corrupt / edge case files             | ✅ Yes     | Parameterised tests with prepared fixture files                              |
| XSS in filename                       | ✅ Yes     | One-time setup, high security value                                          |
| Memory leak detection                 | ❌ Manual  | Requires DevTools protocol; better done in exploratory sessions              |
| Safari-specific codec issues          | ❌ Manual  | BrowserStack session, not worth CI overhead                                  |
| Video annotations (add/edit/delete)   | ✅ Yes     | Core DAM value; deterministic with API-seeded test data                      |
| PiP mode entry/exit                   | ✅ Yes     | Browser API is testable via Playwright CDPSession                            |
| Timestamp deep link (`?t=`)           | ✅ Yes     | Single navigation assertion, zero flakiness                                  |
| Frame-by-frame navigation             | ✅ Yes     | Keyboard key dispatch + `currentTime` assertion                              |

### Automation Framework

#### Current State (as of May 2026)

The following tests are implemented and passing:

```
tests/
  uploadVideo.spec.ts          ← upload video.mp4, verify thumbnail generation starts, delete asset
```

Steps are located in `steps/` and follow a Page Object pattern (`LoginSteps`, `UploadVideoSteps`, `CheckUploadedSteps`, `DeleteVideoSteps`).

Only Chromium is enabled in `playwright.config.ts`; Firefox and Safari projects are commented out.

> **Gap:** No player-level tests exist yet. The scenarios below represent the **planned target structure**.

#### Planned Target Structure

```
tests/
  uploadVideo.spec.ts              ← already implemented
  videoPlayer/
    player-controls.spec.ts        ← play, pause, seek, volume, fullscreen, PiP, frame-by-frame
    player-formats.spec.ts         ← MP4, WebM, MOV fixtures
    player-security.spec.ts        ← 403, XSS filename
    player-performance.spec.ts     ← TTFF measurement
    player-edge-cases.spec.ts      ← corrupt file, short/long video, timestamp deep link
    player-annotations.spec.ts     ← add, edit, delete, timeline marker, multi-user visibility
```

### Test Fixtures

Fixture video files required by the test suite should be stored in `tests/fixtures/` and excluded from Git for large files. A download script or CI artifact should supply them before the suite runs.

| Fixture file             | Purpose                          | Size target |
| ------------------------ | -------------------------------- | ----------- |
| `video.mp4`              | Standard upload / player smoke   | ~5 MB       |
| `video.webm`             | Format compatibility             | ~5 MB       |
| `video.mov`              | Format compatibility             | ~5 MB       |
| `short.mp4`              | Edge case: < 1 second duration   | < 1 MB      |
| `corrupt.mp4`            | Edge case: truncated/broken file | < 1 MB      |
| `xss-filename <img>.mp4` | Security: XSS in filename        | ~1 MB       |

> The existing `uploadVideo.spec.ts` expects `video.mp4` in the working directory. Formalise this into `tests/fixtures/video.mp4` when the `videoPlayer/` suite is created.

### Credential & Environment Management

Test credentials **must not be hardcoded** in test files (currently they are in `uploadVideo.spec.ts`). Migrate to environment variables before expanding the suite:

```env
# .env.test  (not committed — add to .gitignore)
TEST_USER_EMAIL=...
TEST_USER_PASSWORD=...
BASE_URL=https://pics.io
```

Reference in tests via `process.env.TEST_USER_EMAIL`. On CI, inject as repository secrets.

---

## 5. Tools

| Purpose                          | Tool                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| E2E browser automation           | **Playwright** (already in project)                                                 |
| API / HTTP testing               | **Bruno** (open-source, Git-friendly) or Postman                                    |
| Cross-browser cloud              | **BrowserStack** (Safari + mobile real devices)                                     |
| Performance profiling            | **Chrome DevTools** + Lighthouse CI                                                 |
| Visual regression                | **Playwright** `toMatchSnapshot()`                                                  |
| Test management                  | **QASE** (integrates with Playwright reporter)                                      |
| Bug tracking                     | Jira / Linear                                                                       |
| **AI tools**                     |                                                                                     |
| → Test case generation           | **GitHub Copilot** — generate parametrised test skeletons from a table of scenarios |
| → Exploratory session assistance | **ChatGPT / Claude** — brainstorm edge cases, review test coverage gaps             |
| → Selector suggestions           | **Copilot** in-editor — suggest `data-testid` locators during inspection            |
| → Defect report drafting         | **Copilot Chat** — convert DevTools network trace into a structured bug report      |

---

## 6. Metrics & Benchmarks

### Quality Metrics

| Metric                       | Target                 |
| ---------------------------- | ---------------------- |
| Tier 1 test pass rate        | 100% (blocks merge)    |
| Tier 2 test pass rate        | ≥ 95% (blocks release) |
| Open P1 bugs in video player | 0 at release           |
| Flaky test rate              | < 3%                   |

### Performance Benchmarks

| Metric                    | Green    | Yellow     | Red      |
| ------------------------- | -------- | ---------- | -------- |
| TTFF (10 Mbps, 1080p MP4) | < 2 s    | 2–4 s      | > 4 s    |
| Seek response             | < 500 ms | 500 ms–1 s | > 1 s    |
| Player control render     | < 1 s    | 1–2 s      | > 2 s    |
| Memory delta after 10 min | < 50 MB  | 50–100 MB  | > 100 MB |

Red benchmarks are reported as P2 performance bugs; Yellow as tech debt items.

---

## 7. Communicating Results & Findings

### During a Sprint

- **Automated test results** posted to Slack `#qa-reports` channel via Playwright's GitHub Actions reporter after each CI run
- **Flaky tests** get a Jira ticket with the test name, failure rate, and screenshot within 24 hours
- **Blockers (P1 bugs)** flagged immediately in Slack `#eng-general` with a short screen recording and reproduction steps

### At Release

- **Test Summary Report** (1-page): pass/fail breakdown by tier, performance benchmark results, known issues with workarounds, devices/browsers covered
- **Coverage heatmap** in QASE showing which scenarios were run vs. skipped
- **Go / No-Go recommendation** with explicit criteria: all Tier 1 passing, zero open P1/P2 bugs, benchmarks in Green/Yellow

### Longer Term

- Weekly **QA Health Dashboard** in Notion: flaky test trend, open bug count by component, automation coverage %
- Monthly **Retrospective note** to engineering: top 3 regression patterns and suggested architectural mitigations (e.g. "seek failures correlate with range-request misconfiguration on CDN edge nodes")

---

## 8. Out of Scope

- Auth flows, team permissions, and user management (explicitly excluded per task instructions)
- Video encoding/transcoding pipeline (backend service, tested separately)
- Third-party player SDK internals
