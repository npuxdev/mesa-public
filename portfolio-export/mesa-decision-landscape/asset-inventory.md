# Asset inventory — mesa-decision-landscape

Generated November 2, 2026. Media capture was not run: the dev server was not up, and Playwright is not installed in this repo.

## Existing useful files

| Path | Role | Portfolio relevance |
|------|------|---------------------|
| `README.md` | Runbook and honest limitations | Primary source for status language |
| `docs/product/STRATA-CONCEPT.md` | Proposed product, not an implementation claim | Problem framing; do not cite its targets as results |
| `docs/engineering/DESIGN-SYSTEM.md` | MESA tokens and interaction rules | Design principles |
| `docs/engineering/MIGRATION.md` | React host vs HTML views | Architecture honesty |
| `docs/engineering/IMPLEMENTATION-STATUS.md` | Dated verification notes | Cite with dates only |
| `docs/engineering/LOCAL-SERVICES.md` | API, Supabase, AI boundaries | Limitations and AI story |
| `docs/engineering/BOUNDED-AI-SPEC.md` | What the model may not do | FAQ |
| `src/contracts.ts` | Receipts, metrics, screens | Snippet |
| `src/routes.ts` | 70 screens | Proof of scope vs completeness |
| `src/platform.ts` | Scope projection | Snippet |
| `src/workflow-commands.ts` | Publish and approval gates | Snippet |
| `src/scenario-graph.ts` | Graph projection | Hero visual |
| `src/fixtures.ts` | Synthetic Atlas data | Flow 02 finding `f-03` |
| `technical-due-diligence.md` | This export's evidence note | Keep next to the package |

## Important components

| Kind | Files |
|------|--------|
| Core | `src/contracts.ts`, `src/platform.ts`, `src/workflow-model.ts`, `src/workflow-commands.ts`, `src/improvement-model.ts`, `backend/api.mjs`, `backend/repository.mjs` |
| UI | `src/session-controller.ts`, `src/scenario-graph.ts`, `src/ui.ts`, `design-tokens.css`, `app.css`, `app/MesaHost.tsx` |
| Domain-specific | `src/fixtures.ts`, `src/glasshouse.ts`, `allowedActions()` in `src/workflow-model.ts`, readiness copy in the view modules |

## Strongest proof points

1. Command receipt statuses in `src/contracts.ts`.
2. Digest-checked publish in `src/workflow-commands.ts`.
3. Finding approval rejects missing or uninspected evidence, and rejects non-integer levels such as `not_observed`.
4. `coverage()` returns null when nothing is eligible (`src/improvement-model.ts`).
5. Scenario graph edges: solid = condition, dashed = grouping (`src/scenario-graph.ts`).
6. Participant projection strips facilitator notes (`src/platform.ts`).
7. AI accept rebuilds a normal draft command or 409s (`backend/api.mjs`).
8. Loopback-only database guard (`backend/repository.mjs`).
9. 70-row screen registry (`src/routes.ts`).
10. One token system, gold never used as status (`docs/engineering/DESIGN-SYSTEM.md`).

## Missing assets

| Asset | Status | Priority |
|-------|--------|----------|
| `screenshots/01`–`10` PNGs | Pending | High |
| `screenshots/11-exercise-calendar.png` | Pending, optional | Low |
| `videos/01-scenario-graph-loop.webm` | Pending | High |
| `videos/02-evidence-gate.webm` | Pending | High |
| Public demo URL | None; do not deploy the harness | Decision |
| Fresh `npm test` / `npm run test:web` count | Not run for this export | Medium |

## Screenshots

| File | Status |
|------|--------|
| `01-program-overview.png` | Pending |
| `02-scenario-graph.png` | Pending |
| `03-facilitator-control.png` | Pending |
| `04-evidence-gate.png` | Pending |
| `05-entitlement-preview.png` | Pending |
| `06-published-report.png` | Pending |
| `07-ui-reference.png` | Pending — requires `SHOW_FIXTURE_CHROME=1` |
| `08-organization-preferences.png` | Pending |
| `09-publish-digest.png` | Pending |
| `10-report-mobile.png` | Pending |
| `11-exercise-calendar.png` | Pending, optional |

## Videos

| File | Target | Status |
|------|--------|--------|
| `videos/01-scenario-graph-loop.webm` | ~26s, 1920×1080 | Pending |
| `videos/02-evidence-gate.webm` | ~24s, 1920×1080 | Pending |

## Flow scripts

| File | Status |
|------|--------|
| `videos/flows/01-scenario-graph-loop.flow.json` | Written. Locators taken from source labels and `applyTitleCase`. Not executed against a live server. |
| `videos/flows/02-evidence-gate.flow.json` | Written. Opens `/o/atlas/findings/f-03` because the queue repeats the accessible name Review. Not executed. |

## Diagrams

| File | Description |
|------|-------------|
| `diagrams/architecture.mmd` | Browser, Node API, Postgres, OpenAI |
| `diagrams/data-flow.mmd` | Draft command → projection |
| `diagrams/publish-gate.mmd` | Validate, publish conflict, finding approval |

Not rendered to PNG.

## Open questions

1. May the public case study use the names MESA, STRATA, Atlas Response Group, and Harbor Continuity Group?
2. May GLASSHOUSE be named, or should the scenario adapter stay out of public copy? The public history keeps the adapter in `src/glasshouse.ts` and omits the facilitator source package.
3. Who else should be credited? Git history is one commit by Nick (`npulido@gmail.com`). No team list is in the repo.
4. Is there a portfolio site URL or CMS slug to match `seo/`?
5. Open-source intent? `package.json` is private. `open-source-positioning.md` was not written.
6. Are fixture personal names acceptable in stills, or should a capture pass use a redacted workspace?
7. Should published stills include the local-services banner? Default in this package is no, except the UI reference shot.
8. Quote a test count only after a fresh run. October notes disagree (36, 69, and 70 at different dates).

## Package status

| Deliverable | Status |
|-------------|--------|
| `technical-due-diligence.md` (repo root) | Complete |
| `README.md` | Complete |
| `case-study.md` | Complete |
| `case-study-short.md` | Complete |
| `project-summary.json` | Complete |
| `technical-architecture.md` | Complete |
| `storytelling-notes.md` | Complete |
| `linkedin-launch-post.md` | Complete — do not post until video 01 exists |
| `recruiter-version.md` | Complete |
| `consulting-version.md` | Complete |
| `open-source-positioning.md` | Skipped — private package, intent unset |
| `asset-inventory.md` | Complete |
| `diagrams/*.mmd` (3) | Complete |
| `snippets/*.md` (5) | Complete |
| `seo/*` | Complete |
| `screenshots/README.md` | Complete |
| Screenshot PNGs | Pending |
| `videos/README.md` | Complete |
| Flow JSON (2) | Complete, not executed |
| Video files | Pending |
| Capture scripts | Scaffolded in `scripts/`. Not run. |

## Recommended next actions

1. Decide the open questions above, especially names and GLASSHOUSE.
2. Start local Supabase and `SHOW_FIXTURE_CHROME=0 npm run dev`.
3. `npm install --save-dev playwright && npx playwright install chromium`.
4. `npm run portfolio:screenshots` for shots 01–06 and 08–11. Re-run shot 07 with fixture chrome on.
5. `npm run portfolio:videos`. If a step id fails, fix that step in the flow JSON. Trim with ffmpeg only if a take exceeds 30 seconds.
6. Mark the rows above complete and check captions against the pixels.
7. Re-run tests before anyone quotes a pass count.
8. Publish stills, then videos, then the case study. LinkedIn uses video 01 only.
