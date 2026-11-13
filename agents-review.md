# Engineering review — MESA for a senior front-end / UX interview

Review date: November 13, 2026. Evidence is this working tree, its three local commits, and a live local server at `http://127.0.0.1:3000`. Ratings describe what the repository demonstrates. They do not convert a readiness prototype into investment-management experience.

The target role is senior front-end engineering and UX for data-dense, numerically careful product interfaces. Equivalent technologies count. Missing libraries are missing libraries.

## Alignment matrix

| Area | Rating | Why |
| --- | --- | --- |
| Frontend engineering | Moderate | Next.js 15, React 19, and strict TypeScript are real. Most product screens are still HTML strings. |
| Complex data interfaces | Moderate | Filters, saved views, calendars, and several analytical tables exist. There is no grid library, virtualization, or pagination, and the rows are fixtures. |
| Numerical accuracy | Strong | The domain refuses to show a number when the evidence does not support one. This is not financial-instrument arithmetic. |
| Product design | Moderate | Information design and the visual system are deliberate. The product UI is only partly React, and the marketing page states results the model does not compute. |
| Performance and scalability | Weak | Contracts include loading and error states. Nothing here is built or measured for a large working set. |
| AI and analytical workflows | Strong | Reviewed, schema-bounded generation with a human accept step and server-side budgets. Local only. |
| Technical ownership | Strong | One author, three commits, written tradeoffs, and tests that encode the rules. Cursor is named as co-author on every commit. |
| Production credibility | Weak | 76 automated tests and a passing production build. No authentication, no deployment, no users. |

## What was reviewed

MESA — Decision Landscape is a local rehearsal harness. A scenario definition is versioned, a session pins that definition, and a report can be published only after a person inspects citations. The domain vocabulary is incident response and continuity. The transferable object is the workflow: legal moves are registered, runtime state is pinned, missing observations stay non-numeric, and model output cannot approve itself.

`package.json` is `strata-readiness-ui` 0.2.0 and `"private": true`. The README states it is not a production platform. That statement matches the code.

Git history on the local `master` branch, author Nick `<npulido@gmail.com>`:

| Commit | Date | What it actually contains |
| --- | --- | --- |
| `8fc199e` | 2026-10-11 | Initial STRATA UI: domain modules, string views, local API, Supabase migrations, tests, and a large reference-document tree. |
| `560aef4` | 2026-11-04 | Moves the browser onto the Next.js App Router under the MESA brand. Domain modules stay in `src/` for the API and Node tests. |
| `0c4f194` | 2026-11-05 | Adds `/explore/command-table`, an isolated lighting lab kept outside the product and marketing UI. |

Each commit message includes `Co-authored-by: Cursor <cursoragent@cursor.com>`. The history does not record a second human author. Do not describe this as a team delivery or as a long production tenure. October implementation notes are more granular than the three commits: the work was squashed into the initial commit, so day-by-day ownership inside October 2026 is not recoverable from Git.

## Frontend engineering

**Moderate.**

The host is real. `app/MesaHost.tsx` is a client component. It mounts dialog and toast targets, starts `startSessionController({ onPaint })`, and renders React shells (`app/_shells/ProgramShell.tsx`, `OperationalShell.tsx`, `AccessShell.tsx`). `app/(product)/[...slug]/page.tsx` loads that host with `ssr: false`. `app/api/[...path]/route.ts` forwards to `backend/api.mjs`. `next.config.ts` aliases `.js` imports to TypeScript and redirects the old HTML filenames. Both `tsconfig.json` and `tsconfig.domain.json` set `strict: true`.

The product body is not a React component tree. `docs/engineering/MIGRATION.md` calls the string views legacy and says not to delete one until its replacement is verified. `selectScreen` falls back to `HtmlView` whenever the controller injects AI chrome or a stale banner (`app/MesaHost.tsx`). `src/session-controller.ts` is about 509 lines and owns routing, forms, exports, and command submission. `src/improvement-views.ts` builds analytics as template strings, including the coverage table.

The marketing site is a separate React surface (`app/(marketing)/`) with its own CSS. The command-table lab is also React, split into scene, controls, and hooks under `explorations/command-table/`. Those two surfaces show component structure the product screens do not yet have.

There is no Redux, Zustand, or React Query. The migration doc treats that as a choice: the session controller and `history` are the client model. Draft text and graph layout sit in `sessionStorage`. Workspace data is fetched through `HttpAdapter` (`src/http-adapter.ts`) with a CSRF header. Request state is modeled (`loading | ready | error | unavailable` in `src/contracts.ts`) but it is not a cache.

Maintainability cost is visible. `technical-due-diligence.md` notes a second, unused authoring renderer whose copy still says no model is connected. `src/views-exercise.ts` is kept for tests and is off the live path. Several domain files are dense single-line functions. They typecheck and test, and they are hard to review line by line.

## Complex data interfaces

**Moderate.**

What exists:

- Program analytics (`src/improvement-views.ts`, `src/improvement-model.ts`) with search, a 30/90/custom period, and advanced filters for discipline, team, role, difficulty, revision, and purpose. Filters intersect at opportunity grain. Saved views are persona-scoped. Coverage, delivery, and content are separate tabs. CSV export uses the same selection and neutralizes formula-leading cells.
- A role × opportunity table, an action-aging table, and a condition-group series that refuses an interpolated trend.
- Retest comparison renders conditions side by side and blocks a numeric delta when the conditions differ (`ANA-03`).
- Corrective actions (`ACT-01`) filter by implementation, verification, owner, source finding, and due state.
- Exercise month/week calendar with timezone labeling (`src/exercise-calendar.ts`). The November 13 screenshot shows two Atlas exercises on the month grid.
- Scenario graph: SVG edges, button nodes, pan, zoom, drag, and Alt+arrow movement (`src/scenario-graph.ts`). Layout is not scenario logic.
- Shared `table()` in `src/ui.ts` wraps a native table in a scroll region with a caption.

What does not exist: TanStack Table, TanStack Query, column sorting as a grid feature, pagination, windowing, or a virtualized row model. Fixture scale is small. Atlas analytics on November 13 selected two exercises. A senior data-grid interview should treat this as transferable interface and query design, not as a shipped positions blotter.

## Numerical accuracy

**Strong, inside this domain.**

The rule is in the type. `MetricView.displayState` is `supported | not_observed | suppressed | incomparable`, and `assertMetric` throws if an unsupported metric still carries a number (`src/contracts.ts`). The overview can show executive-role comparison as suppressed. Coverage percent is null when nothing is eligible (`coverage()` in `src/improvement-model.ts`). The live analytics screenshot shows reviewed rubric attainment as **Suppressed**, with the caption that unassigned roles are N/A and unreleased cues are N/O.

Further rules, covered by `tests/improvement.test.mjs` and `tests/platform.test.mjs`:

- A scored zero is distinct from not observed. Approval of zero still requires every citation to be inspected (`src/workflow-commands.ts`).
- Two conflicting approved findings are not averaged or cherry-picked (`reviewedFinding`).
- Rubric attainment needs a completed exercise, at least five distinct assigned participants, no intervention, and each objective's coverage threshold. Otherwise the score is null.
- Retest verification compares scenario revision, role, rubric signature, difficulty, purpose, delivery, assistance, and intervention count. A digest mismatch is a conflict. The planned target cannot be lowered on the same attempt. A failed retest reopens the action and keeps implementation history.
- Overdue is derived from the due date, not stored as a status.
- CSV cells that start with `=`, `+`, `@`, or `-` are prefixed so a spreadsheet does not treat them as formulas.

Limits, so the rating is not read as pricing or NAV work: levels are integers 0–3, percents are rounded for display (`Math.round`, and `toFixed(1)` in one table), and the publication digest is FNV-1a-style 32-bit hex (`hash()` in `src/workflow-model.ts`). There is no decimal library, no currency type, and no lot-level rounding policy. The marketing impact band (`app/(marketing)/_components/Impact.tsx`) prints 92%, +27 pts, 96%, and 4.8 with copy such as "Across enterprise programs." Those figures are not produced by `coverage()` and no dataset for them is in the repo. The product model is more careful than the marketing page.

## Product design

**Moderate.**

Decisions that hold up:

- The evidence screen for finding `f-03` says no qualifying evidence is available and that N/O and N/A are not numeric zero. The approve control explains that every citation must be inspected. Screenshot: `docs/screenshots/07-evidence-review.png`.
- Analytics puts the denominator in the caption and withholds attainment. Screenshot: `docs/screenshots/03-analytics-metrics.png` and `03-analytics-coverage-table.png`.
- Actions separate implementation from verification. A clock icon is not the only signal; status text is in the row. Screenshot: `docs/screenshots/08-corrective-actions.png`.
- The graph legend says a dashed line is grouping, not execution order. Screenshot: `docs/screenshots/04-scenario-graph.png`.
- Tokens live in `design-tokens.css` (Obsidian, Mist, Stone, Basalt, Mineral Gold). Body type is 16px. Gold is not a status color. `docs/engineering/DESIGN-SYSTEM.md` records the conventions.
- The marketing home is a composed React page with a product frame, not a screenshot pasted into a hero (`app/(marketing)/_components/ProductFrames.tsx`). It is visually ahead of the product shells.
- The command-table lab labels itself as not part of the exercise interface and respects reduced motion (`explorations/command-table/hooks/usePrefersReducedMotion.ts`).
- A skip link, dialog labeling, table captions, and icon-plus-text verification are present. October notes record keyboard and 320/390/1024/1440 checks on specific flows. There is no WCAG audit and no screen-reader certification.

The gap is that product design is implemented twice: a careful domain model, and a marketing composition that claims "Real readiness. Measurable results." A reviewer should talk about the first and not cite the second as evidence.

## Performance and scalability

**Weak.**

`UiRequest` has loading, ready, stale, error, and unavailable. The API sets `Cache-Control: no-store`. Reads and writes go through one Node process to one JSON document per tenant (`backend/repository.mjs`, compare-and-swap via `rpc/strata_commit`). AI rate limits reset with the process. Sessions are an in-memory `Map` capped by a blunt clear at 1000 (`backend/api.mjs`). The scenario graph lays out every node in the DOM. Analytics render every selected row. No measurement of frame time, query time, or payload size is in the repo.

The production build on November 13, 2026 succeeded (`next build`, Next.js 15.5.29). Route first-load JavaScript was about 114 kB for `/`, 104 kB for the product catch-all, 103 kB for `/api`, and 111 kB for the command-table lab, with about 103 kB shared. That is bundle size, not workload capacity.

A realistic next step, if this pattern were pointed at a large ledger, would be a normalized read model, a windowed table, and a client cache with explicit stale states. None of that is started.

## AI and analytical workflows

**Strong as a control design. Local as a system.**

`docs/engineering/BOUNDED-AI-SPEC.md` and `backend/ai-service.mjs` specify a boundary and implement it:

- The model cannot publish, approve a finding, verify an action, or grant access.
- Authoring proposals are strict JSON. `acceptanceCommand` in `backend/api.mjs` returns 409 when the draft version or digest changed, then emits a normal `scenario.save` or `scenario.inject`.
- Token budget is reserved in Postgres before the provider call. Failure does not retry. A stopped lease cannot apply a late response.
- Actor text is labeled synthetic and is not participant score evidence. Draft assessment may not invent a numeric score from missing observations.
- The browser never sees `OPENAI_API_KEY`. `.env.example` is empty placeholders. Inference uses `store: false`.

`tests/ai-automation.test.mjs` covers schema failure, private-context filtering, reservation-before-call, and stale commit denial. The October status note records one live smoke with `gpt-4.1-mini` and says it did not persist automation onto saved exercises. This review did not repeat a live provider call.

This is human oversight in the command path, not a chat widget. It is also one process, one local database, and no production eval harness.

## Ownership and evolution

**Strong, with the co-author caveat above.**

The interesting ownership is in the rules that were kept when they were inconvenient: accepted is not executed, published revisions are immutable, a lifecycle dropdown cannot mark an action verified, and a small cohort does not become a percentage. Those rules are in `src/workflow-commands.ts`, `src/improvement-model.ts`, and the tests, not only in prose.

The November 4 commit is an architectural migration rather than a visual reskin: App Router, Route Handlers, domain `tsc` output for the API, and the old Vite host removed. The November 5 commit isolates a visual experiment so it does not land inside the exercise UI. Both are the kind of boundary choice worth discussing.

Inferences, labeled as such: the October notes read as iterative verification (a calendar line-ending bug, duplicate field ids, a compensation path that bypassed a resource budget). Git cannot prove which hour those fixes landed, because they share `8fc199e`.

## Testing, build, and maintainability

November 13, 2026, this tree:

| Check | Result |
| --- | --- |
| `npm test` | 76 passed, 0 failed. Includes route round-trips, 70 Atlas renders, 70 Harbor renders, workflow immutability, analytics/retest rules, GLASSHOUSE gates, AI schema and lease tests, and backend origin checks. |
| `npm run check` | Passed for the domain project and the Next.js project. |
| `npm run build` | Passed. Static `/` and `/explore/command-table`; dynamic product and API routes. |
| ESLint script | None in `package.json`. Next.js reported "Linting and checking validity of types" during the build. |

`docs/engineering/IMPLEMENTATION-STATUS.md` still contains older counts (36, then 69, then 70). Those are historical. The 76 figure is the suite that ran for this review. Some October paragraphs say a phase's tests were not executed at the time they were written. Those tests are in the current passing run. The document was not rewritten to hide that sequence.

Browser evidence for this review is the screenshot set in `docs/screenshots/`, taken from the already-running dev server with fixture chrome on. Pages checked: marketing home, Atlas overview, analytics metrics, coverage table, scenario graph, exercise calendar, facilitator control, finding `f-03`, corrective actions, published report at 1440 and at 390×844, and the command-table lab. They show the fixture workspace, including the local-services banner. They are not a regression suite.

## Strengths to discuss

1. A command receipt with five statuses, and tests that an unknown result reconciles the original id (`src/contracts.ts`, `tests/platform.test.mjs`).
2. A metric type that makes a dishonest number a contract error.
3. AI acceptance as a stale-checked domain command, not a direct write.
4. Scope projection: observer and participant views drop facilitator notes and private findings (`src/platform.ts`).
5. A design system that states its constraints, plus a marketing page that shows a higher level of visual finish.
6. Written limits that match the code more often than not. The README and the bounded-AI spec are usable in an interview without exaggeration.

## Weaknesses to discuss

1. The React migration stopped at the shell. A hiring review that opens `src/improvement-views.ts` will not find a table component.
2. No virtualized or paginated data surface, so large-list performance is not demonstrated.
3. Marketing statistics are not product calculations. Leave them, or label them as illustration, before relying on the site as evidence.
4. `hash()` is not a signature. `finding.approve` writes the fixture name Casey Morgan in the handler.
5. `src/glasshouse.ts` ships facilitator-oriented scenario content to the browser. The implementation doc already says the bundle is not a vault.
6. One JSON aggregate will not serve concurrent editors. The code says so by using compare-and-swap and a conflict error, and by not building realtime.
7. Accessibility evidence is a smoke record, not an audit.
8. Three squashed commits hide the October iteration. The status doc is the only fine-grained log, and parts of it are stale.

## Overall fit

The repository is relevant to the role where the role cares about interface judgment under messy operational data: when to show a number, how a filter defines a population, how a publication stays immutable, and how a model stays subordinate to a reviewer. Those are senior product-engineering habits.

It is a weak exhibit for production React architecture, high-volume grids, financial rounding, and operational maturity. It should be presented as a local prototype with a serious domain kernel, not as a system that has been operated.

Priority, if more work were in scope. None of this was done in this review.

1. Replace the analytics and actions string tables with React components, keeping the domain functions as the source of numbers.
2. Add a windowing or pagination strategy and a fixture large enough to show it.
3. Label or remove the marketing impact statistics.
4. Keep facilitator-only scenario fields on the server.
5. Add authentication only when a second real user exists. The current persona switch must not be dressed up as auth.

## Publication

No API keys, service-role keys, or `.env.local` files are in Git history. `.env.example` contains empty placeholders. `supabase/config.toml` contains local ports only. A secret scan of all three commits found no provider keys. `supabase status` on a developer machine prints the CLI's local demo keys; those values are not committed and are not repeated here.

The local history does contain `Strata-Media-Docs/` (third-party CISA exercise manuals and templates, plus concept images, on the order of 70 MB) and `.private/glasshouse/` (a fictional facilitator package). Those paths are not credentials. They do not belong in a public portfolio history: the manuals are someone else's documents, and the playbook is facilitator material the app itself refuses to serve from a dot-path.

Local `master` was not rewritten. The public repository `npuxdev/mesa-public` is a filtered copy of the same commits with `Strata-Media-Docs/` and `.private/` removed. The GLASSHOUSE behavior remains in `src/glasshouse.ts`, which is functional source and is still client-visible. That is an acknowledged product limit, not a hidden credential.

A local download path in `docs/engineering/IMPLEMENTATION-STATUS.md` was removed from the prose. The verification fact (a DOCX passed ZIP and OpenXML checks) stays.
