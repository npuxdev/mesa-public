# Technical architecture

MESA is a local, loopback application. The React app does not own the domain rules. Next.js hosts shells and a screen registry; most screen bodies still come from TypeScript HTML-string view functions during the strangler migration. Domain modules compile to `dist/` for the Node API; domain tests import `src/` via `tsx`.

## Layers

```
Browser  Next.js App Router :3000  app/MesaHost.tsx
         session-controller.ts  →  onPaint → React shells / HtmlView
         HttpAdapter             →  /api/*  (CSRF header)
Same     app/api/[...path]/route.ts → backend/api.mjs
process  backend/repository.mjs  local Supabase REST, compare-and-swap
         dist/platform.js        FixtureAdapter + workflow commands (API runtime)
OpenAI   Responses API           server key only, store:false
Postgres local Supabase          strata_workspaces (JSONB aggregate)
                                 strata_ai_proposals / tasks / runs
```

Diagram: `diagrams/architecture.mmd`.

`npm run dev` runs `tsc` for domain output, then `next dev` on `127.0.0.1:3000` (API Route Handlers in-process). `npm start` runs `next build && next start` on the same host/port. The previous Vite `:5173` + `server.mjs` `:4173` split has been removed.

## Module map

| Module | Path | Role |
|--------|------|------|
| Host | `app/MesaHost.tsx`, `app/[[...slug]]/page.tsx` | Mount shell targets and start the session controller |
| Session | `src/session-controller.ts` | Route, forms, dialogs, downloads, AI review modal; paints via `onPaint` |
| Routes | `src/routes.ts` | 70 screens, legacy aliases, `matchRoute` |
| Contracts | `src/contracts.ts` | Requests, receipts, metrics, personas, fixtures |
| Scope | `src/platform.ts` | `can`, `canScreen`, `scopeProjection`, `FixtureAdapter` |
| Model | `src/workflow-model.ts` | Definitions, validation, digests, report snapshots |
| Commands | `src/workflow-commands.ts` | Authoring, session, finding, report mutations |
| Improvement | `src/improvement-model.ts` | Coverage, saved views, retest comparison |
| Graph | `src/scenario-graph.ts` | Project definition → nodes and edges |
| Views | `src/views-*.ts`, `src/workflow-*-views.ts`, `src/ai-ui.ts` | HTML screens |
| Transport | `src/http-adapter.ts` | `/api/read`, `/api/command`, AI endpoints |
| API | `backend/api.mjs`, `backend/ai-service.mjs`, `backend/ai-domain.mjs`, `backend/inference.mjs` | HTTP, jobs, schema, provider |
| Store | `backend/repository.mjs` | Loopback check, workspace load/commit |
| Fixtures | `src/fixtures.ts`, `src/glasshouse.ts` | Synthetic Atlas data; GLASSHOUSE adapter |
| Tokens | `design-tokens.css`, `app.css`, `src/ui.ts` | MESA visual system |

Live `selectView` dispatches AUT screens to `authoring()` and REV screens to `reviewWorkflow()` / `reportWorkflow()`. Older functions in `src/views-scenarios.ts` (`author`) and `src/views-program.ts` (`review`, `report`) are not that path. `src/views-exercise.ts` is off the path (`docs/engineering/MIGRATION.md`).

## Data model and persistence

`FixtureData` in `src/contracts.ts` holds scenarios, sessions, findings, reports, actions, evidence, facts, people, and an optional `workflow` blob.

`WorkflowData` (`src/workflow-model.ts`) hangs authoring state, exercise state, finding history, and report snapshots off that blob. `ImprovementState` adds saved filters and retest attempts.

On disk, `strata_workspaces` stores one versioned JSONB aggregate per organization. Receipts survive a Node restart. Browser keys are narrower: `strata-draft:*` for unsent input, `strata-graph-layout:*` and `strata-graph-request:*` for layout and unsent AI prompts, `strata-sidebar-collapsed` for the nav preference. Those preferences are not part of the published snapshot.

First read of an empty database workspace imports a tab snapshot if one exists, otherwise installs the synthetic baseline including GLASSHOUSE. A later browser does not auto-merge (`docs/engineering/LOCAL-SERVICES.md`).

## Critical request flows

**Read.** `GET /api/bootstrap` sets an HttpOnly `strata_local` cookie and returns a CSRF token, plus flags for database and AI configuration. `POST /api/read` with `x-strata-csrf` loads the tenant and returns `scopeProjection` output. Publisher and operator personas receive an empty fixture, not customer content.

**Command.** `POST /api/command` asserts the mutation, runs `FixtureAdapter.command`, and compare-and-swap commits. Statuses are `submitted`, `accepted`, `executed`, `rejected`, and `unknown` (`CommandReceipt`). Repeated reconciliation must not duplicate events. `session.pause` suspends AI runs before the write so a late model turn cannot land in a paused session.

**Publish.** `scenario.validate` stores checks and, if clean, `validatedDigest`. `scenario.publish` requires that digest to equal `authorDigest()` and the posted preview digest. Status becomes `published`. Further edits throw `IMMUTABLE` until `scenario.fork`.

**Finding approval.** `finding.approve` requires evidence, an integer level 0–3, a non-disputed status, and every citation present in `inspected`. Otherwise `MISSING_EVIDENCE`.

**AI narrative proposal.** Generate stores a row in `strata_ai_proposals`. Accept calls `acceptanceCommand`, which 409s on version or digest drift, then issues `scenario.save` or `scenario.inject` with idempotency key `ai:{proposal id}`.

**Report read.** `permittedReport()` drops withdrawn snapshots, blocks Review-team audience for non-reviewers, and filters sections and findings by persona.

Diagram: `diagrams/data-flow.mmd`, `diagrams/publish-gate.mmd`.

## Core abstractions

Command statuses and metric states live in `src/contracts.ts`. The metric type allows `value: number | null` and a `displayState` so the UI can render "not observed" without coercing it to zero.

Scope redaction for a non-facilitator walks exercise injects, clears notes, and removes objectives from the pinned definition the participant can see (`scopeProjection` in `src/platform.ts`). This is a server-side projection of the aggregate the Node process already loaded. It is not a guarantee about strings shipped inside `dist/` or `web-dist/`. GLASSHOUSE's own notes say the bundle is inspectable.

The graph builder (`scenarioGraph`) creates one overview node, one node per transition, one node per inject, dashed edges from the overview, and solid edges only when `inject.trigger === 'condition'`.

## Extension points and coupling

- New screens: add a `ScreenDefinition`, a branch in `selectView`, and a renderer. Legacy `.html` URLs go in `legacyRoutes`.
- New commands: handle them in `workflowCommand` or `improvementCommand` and reject unknown types. The UI posts `data-command` forms.
- New disciplines: `allowedActions()` and `definition()` are the coupling point. There is no pack loader.
- New tenants: the scope type is `'atlas' | 'harbor'`. A third organization is a type change plus fixture policy, not a setting.
- AI operations: add a schema in `backend/ai-domain.mjs` and keep accept/reject on the existing command path. Do not write model output straight onto a published revision.
- Visual changes: `design-tokens.css` and `app.css`. `docs/engineering/MIGRATION.md` forbids a parallel React theme.

Known coupling to leave visible: persona ids, the reviewer string in `finding.approve`, fixture cutoff `2026-10-09T16:00:00Z`, and GLASSHOUSE imported from `platform.ts`.
