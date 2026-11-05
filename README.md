# MESA — Decision Landscape

Readiness platform UI branded as **MESA — Decision Landscape** (repository and internal contracts may still say STRATA). Revised against the supplied UI/UX Agent Build Reference and the MESA brand identity system. Browser UI is migrating to React + Next.js while domain modules remain TypeScript for the local API and Node tests. See [MIGRATION.md](docs/engineering/MIGRATION.md) and [DESIGN-SYSTEM.md](docs/engineering/DESIGN-SYSTEM.md).

## Run

```sh
npm install
npm run db:start
npm run dev
```

Open the app at http://127.0.0.1:3000/ (Next.js App Router; `/api` is served by the same process). `npm start` builds and serves production. `npm test` runs Node contract/renderer tests against `src/` (via `tsx`); `npm run check` typechecks the domain and Next.js projects.

Harness-only labels (local-services banner, screen IDs, synthetic-workspace captions, fixture controls) are shown in normal `npm run dev`. Hide them for a product-like view with:

```sh
npm run dev:clean
# or
npm run dev -- --hide-fixtures
```

`SHOW_FIXTURE_CHROME=0` still works the same way. `npm start` and production builds hide them unless `SHOW_FIXTURE_CHROME=1`.

Local Supabase now persists workflow aggregates and command receipts. Server-side OpenAI inference powers reviewed overview/inject proposals from the graph. Keep `OPENAI_API_KEY` in `.env.local`; see [Local services setup and boundaries](docs/engineering/LOCAL-SERVICES.md). Synthetic identities remain development-only, not production authentication. This guide supersedes historical fixture-only integration notes below.

## What is implemented

- GLASSHOUSE v1.0 local facilitated scenario: published template, editable draft, scheduled rehearsal, twelve timed injects, eight fixture roles, six weighted assessment domains, and authorized investigation evidence. See [GLASSHOUSE implementation/run guide](docs/engineering/GLASSHOUSE-IMPLEMENTATION.md) for adaptation limits and instructions. Original scenario material lives under `.private/glasshouse/`; `Strata-Media-Docs/STRATA_GLASSHOUSE_v1.0/` is an import snapshot only.

- Exercises Calendar with Month/Week grids, date navigation, timezone-aware exercise placement, and filter-preserving links.
- Accessible verification-state icons/tooltips, Title Case headings, and neutral selection styles without decorative left-edge accents.

Scenario inject authoring defaults to a graph workspace with overview/transition/inject nodes, conditional links, modal editing, drag/zoom controls, list fallback, and targeted requests. Server-side AI generates reviewed narrative proposals stored in Supabase. See [graph specification](docs/engineering/SCENARIO-GRAPH-SPEC.md), [PRD addendum](docs/product/STRATA-CONCEPT.md), and [design conventions](docs/engineering/DESIGN-SYSTEM.md).

- Shared MESA design tokens (Obsidian, Mist, Stone, Basalt, Mineral Gold), readable 16px body / 14px controls, Obsidian actions with gold emphasis, Mist surfaces, responsive program and operational layouts.
- 70 registered canonical screen routes with requirement, component, shell, and dependency references. Legacy HTML URLs redirect to canonical paths.
- Program navigation: Overview, Exercises, Scenarios, Reports, Actions, Analytics, People, My development, Recommendations, Organization.
- Explicit fixture interactions for scheduling, scenario drafts, fact review, session controls, commands and receipts, decisions, team notes, report review, corrective actions, and preferences.
- Synthetic Atlas and Harbor workspaces; role and request-state inspection through **Inspect states**.

## Honest limitations

This is a **local development implementation, not a production readiness platform**. Saved workflows/proposals persist in Supabase; unsent input and graph layout remain browser-tab preferences. Bundled data and identities are synthetic. Server role guards enforce development scopes but persona switching is not real authentication. Never put confidential production data into this harness.

Real authentication, realtime collaboration, external messages, signed publication, live export jobs and paid entitlements remain unconnected. Local authoring inference, opt-in bounded automatic actors/adjudication, draft assessments/reports, server workflow checks and persistence are connected; these do not certify production readiness or instructional validity. See [Bounded AI specification](docs/engineering/BOUNDED-AI-SPEC.md).

See [implementation status](docs/engineering/IMPLEMENTATION-STATUS.md) for scope, deviations, and verification evidence.

## Documentation map

- `docs/product/` — product PRD (`STRATA-CONCEPT.md`)
- `docs/engineering/` — migration, design system, local services, AI/graph/GLASSHOUSE specs, status ledger
- `docs/reference/` — UI/UX agent build reference
- `docs/archive/` — closed reviews and superseded PRD snapshots
- `portfolio-export/mesa-decision-landscape/` — hiring/case-study package (sibling of the app)

## Source map

- `design-tokens.css`: MESA brand and semantic design tokens.
- `app.css`: shells, components, responsive layouts, accessibility and print styles.
- `src/contracts.ts`: frontend request, scope, command, and metric contracts.
- `src/platform.ts`: synthetic adapter, projection rules, mutation validation, idempotency.
- `src/routes.ts`: screen registry and canonical route matching.
- `src/views-*.ts` / `src/workflow-*-views.ts`: page renderers (HTML strings during strangler migration).
- `src/session-controller.ts`: routing, forms, dialogs, lifecycle feedback, downloads; paints into React via `onPaint`.
- `src/workflow-model.ts` / `workflow-commands.ts`: versioned scenario definitions, pinned exercise state, finding corrections, report approval and immutable publication snapshots.
- `src/workflow-package.ts` / `workflow-exports.ts`: strict synthetic package handling, calendar files, and published JSON/DOCX/PDF print exports.
- `app/`: Next.js App Router host (`MesaHost`), shells, screen registry, and `/api` Route Handlers.
- `tests/`: focused automated checks importing domain modules from `src/`.

Approved verification of authoring, exercise, and review/reporting is recorded in `docs/engineering/IMPLEMENTATION-STATUS.md`: dated automated tests, browser end-to-end workflows, responsive/keyboard checks, and downloaded DOCX structural inspection. PDF saving still needs a standard-browser print check; production authority, cross-browser/screen-reader acceptance, and deferred product areas are not certified by these fixture checks.
