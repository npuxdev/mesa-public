# Screenshots

Capture with Chromium, no browser chrome, no DevTools. Prefer **fixture chrome off** so the local-services banner, screen ids, and harness captions are not in the frame:

```sh
SHOW_FIXTURE_CHROME=0 npm run dev
```

Dev UI is `http://127.0.0.1:3000`. Default persona is the synthetic manager on Atlas. Do not sign in with a real account. Do not open `.env.local`. Synthetic names (Jordan Davis, Atlas Response Group) are fixtures; confirm they may be published before using the PNGs.

Desktop shots: CSS viewport **1440×900**, `deviceScaleFactor: 2` (exported pixels 2880×1800). Mobile shot: **390×844** at 2×. Wait for the main heading. If a shot shows the fixture banner, recapture.

Script: `node scripts/capture-portfolio-screenshots.mjs` (or `npm run portfolio:screenshots`) after `npm install` of Playwright's Chromium. PNGs are **Pending** until that run.

## 1. Program overview

| Field | Value |
|-------|-------|
| **Filename** | `01-program-overview.png` |
| **Purpose** | First impression of the readiness loop: a live exercise, next steps, and metrics that may be suppressed |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/` — HOME-01, Atlas, manager, fixture chrome off |
| **Caption** | Program overview for a synthetic organization. Coverage is reviewed opportunity data. One comparison stays suppressed instead of showing a made-up percent. |

**Notes:** Heading renders as "Program Overview" via `titleCase`.

## 2. Scenario graph

| Field | Value |
|-------|-------|
| **Filename** | `02-scenario-graph.png` |
| **Purpose** | Core interaction. Hero still for the case study. |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/o/atlas/scenarios/sc-ir/revisions/2.4/content` — AUT-04 graph, published ransomware scenario |
| **Caption** | The scenario graph projects the stored definition. Toolbar: zoom, fit, reset view, reset layout. |

**Notes:** Do not drag nodes. Dragging only changes a local layout preference.

## 3. Facilitator control room

| Field | Value |
|-------|-------|
| **Filename** | `03-facilitator-control.png` |
| **Purpose** | Differentiated operational shell: Obsidian header, simulation clock, facilitator tasks |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/o/atlas/sessions/s-ir-01/control` — FAC-01, session "Ransomware response rehearsal" running |
| **Caption** | Facilitator control for a pinned, running rehearsal. This is the session side of the same definition shown in the graph. |

**Notes:** Do not start bounded AI. Do not click Stop or Pause for this still.

## 4. Evidence gate

| Field | Value |
|-------|-------|
| **Filename** | `04-evidence-gate.png` |
| **Purpose** | Validation proof: a draft finding with no citations |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/o/atlas/findings/f-03` — "Executive escalation was not observed", level `not_observed`, no evidence |
| **Caption** | Not observed stays non-numeric. The panel says there is no qualifying evidence, and N/O is not zero. |

**Notes:** Do not press Approve. The command would reject; the still should show the warning, not an error toast.

## 5. Entitlement preview

| Field | Value |
|-------|-------|
| **Filename** | `05-entitlement-preview.png` |
| **Purpose** | Edge case: a catalog item that cannot be scheduled or exported |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/o/atlas/scenarios/catalog/sc-cm` — "Public allegations & data leak", `available: false` |
| **Caption** | Preview only. Rights say export is prohibited. The screen does not invent an entitlement. |

**Notes:** Button copy is an unavailable service, not a checkout.

## 6. Published report

| Field | Value |
|-------|-------|
| **Filename** | `06-published-report.png` |
| **Purpose** | Outcome: an immutable recap with a publication digest |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/o/atlas/reports/rep-01` — REV-05, "Supplier continuity · executive recap" |
| **Caption** | Published snapshot for program members. Later corrections would amend; this revision stays. |

**Notes:** Digest is a non-cryptographic hash. Caption must not call it a signature.

## 7. UI reference

| Field | Value |
|-------|-------|
| **Filename** | `07-ui-reference.png` |
| **Purpose** | Developer-facing convention page. Optional in a public gallery if it looks like debug chrome. |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/ui-reference` |
| **Caption** | Shared component conventions for the MESA shell. Not a customer screen. |

**Notes:** `componentExplorer` wraps this page in `fixture-chrome`, so `SHOW_FIXTURE_CHROME=0` hides the whole screen. Capture this one shot with `SHOW_FIXTURE_CHROME=1`. It is a developer reference, not a customer screen. The other shots should stay chrome-off.

## 8. Organization preferences

| Field | Value |
|-------|-------|
| **Filename** | `08-organization-preferences.png` |
| **Purpose** | Brand shell in settings. There is no theme switcher; this shot documents that. |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/o/atlas/settings/general` — SET-01 |
| **Caption** | Organization settings use the same Obsidian and Mist tokens. Branding here is not a white-label theme. |

**Notes:** Do not present this as multi-brand theming.

## 9. Publish digest

| Field | Value |
|-------|-------|
| **Filename** | `09-publish-digest.png` |
| **Purpose** | Architecture proof next to the UI: digest, validation, organization-only audience |
| **Viewport** | 1440×900 desktop, 2× |
| **State** | `/o/atlas/scenarios/sc-ir/revisions/2.4/publish` — AUT-08 for the published ransomware revision |
| **Caption** | Publish is bound to a digest of the definition. This revision is already published, so the control is not an in-place edit. |

**Notes:** The published record is read-only. Fork would create a draft; do not fork during capture.

## 10. Report on a narrow viewport

| Field | Value |
|-------|-------|
| **Filename** | `10-report-mobile.png` |
| **Purpose** | Responsive layout of the published report |
| **Viewport** | 390×844, 2× |
| **State** | `/o/atlas/reports/rep-01` |
| **Caption** | The published report stacks on a narrow viewport. Same snapshot as the desktop reader. |

**Notes:** Open the navigation drawer only if the heading is obscured. Prefer the document itself in frame.

## Bonus (optional)

| Field | Value |
|-------|-------|
| **Filename** | `11-exercise-calendar.png` |
| **Purpose** | Month/week calendar with the workspace timezone |
| **Viewport** | 1440×900, 2× |
| **State** | `/o/atlas/exercises?view=agenda` |
| **Caption** | Exercises calendar groups sessions in the workspace timezone. It does not drag-reschedule. |

Not required for the set of ten.
