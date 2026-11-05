# Videos

Exactly two recordings. Silent, viewport only, no browser chrome, **1920×1080** at device scale 1. Target 20–28 seconds. Hard cap 30 seconds. Cursor on. `slowMo` 80–90ms.

Start the app with harness labels hidden:

```sh
SHOW_FIXTURE_CHROME=0 npm run db:start
SHOW_FIXTURE_CHROME=0 npm run dev
```

Base URL: `http://127.0.0.1:3000` (`SCREENSHOT_BASE_URL` or `VIDEO_BASE_URL`). Both flows use the default manager on Atlas. They do not call OpenAI. Do not press Generate AI Proposal, Approve, Fork, or Publish.

Playwright is not a dependency of the app. Install it when you are ready to record:

```sh
npm install --save-dev playwright
npx playwright install chromium
npm run portfolio:videos
```

Media status: **Pending.** Scripts: `scripts/capture-portfolio-videos.mjs`, `scripts/lib/portfolio-flow-runner.mjs`.

## 1. Program overview to the scenario graph

| Field | Value |
|-------|-------|
| **Filename** | `01-scenario-graph-loop.webm` |
| **Flow script** | `flows/01-scenario-graph-loop.flow.json` |
| **Duration target** | 26 seconds (max 30) |
| **Resolution** | 1920×1080 |
| **Viewport** | 1920×1080 at 1× — do not upscale |
| **Theme / brand** | MESA default. Confirm clearance before publishing the wordmark. |
| **Purpose** | Primary hero loop. What the product is: a program, then a versioned scenario, then the graph of that definition. |
| **Caption** | From the program overview to the scenario graph. Solid arrows are recorded conditions. Dashed lines are grouping, not a second plot. |
| **End frame** | Graph fitted, legend visible: "Solid arrow: recorded transition condition" and the dashed-line label. |

**Pairing:** `screenshots/01-program-overview.png`, `screenshots/02-scenario-graph.png`.

**Re-capture:** `node scripts/capture-portfolio-videos.mjs --flow=01-scenario-graph-loop` with the dev server up. Section link text is title-cased by `applyTitleCase` ("Graph, Injects & Artifacts").

## 2. A missing observation is not a score

| Field | Value |
|-------|-------|
| **Filename** | `02-evidence-gate.webm` |
| **Flow script** | `flows/02-evidence-gate.flow.json` |
| **Duration target** | 24 seconds (max 30) |
| **Resolution** | 1920×1080 |
| **Viewport** | 1920×1080 at 1× |
| **Theme / brand** | Same MESA theme as video 01 |
| **Purpose** | Differentiated proof. Review refuses to treat "not observed" as a number. |
| **Caption** | The findings queue includes a draft with no evidence. Opening it shows that N/O and N/A stay distinct from numeric zero. |
| **End frame** | Finding `f-03` with the warning "No qualifying evidence" / "N/O and N/A remain distinct from numeric zero." Approve is not clicked. |

**Pairing:** `screenshots/04-evidence-gate.png`, `screenshots/06-published-report.png`.

**Re-capture:** `node scripts/capture-portfolio-videos.mjs --flow=02-evidence-gate`. The queue has several links named Review, so the script opens `/o/atlas/findings/f-03` directly after the queue is on screen.

Optional ffmpeg trim, only if a take exceeds 30 seconds:

```sh
ffmpeg -i videos/01-scenario-graph-loop.webm -t 30 -c copy videos/01-scenario-graph-loop-trimmed.webm
```

No MP4 transcode is required for this package until a CMS asks for it.
