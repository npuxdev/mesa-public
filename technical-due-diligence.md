# Technical due diligence — MESA / STRATA

Evidence from this repository as of November 2, 2026. Marketing claims are out of scope. Counts are line counts of current source, not production metrics.

## Portfolio Export — Project Context

| Field | Value |
|-------|-------|
| **Project name** | MESA — Decision Landscape |
| **Portfolio slug** | `mesa-decision-landscape` |
| **One-line pattern** | Complex operational rehearsal → guided scenario graph and facilitated session → evidence-checked, immutable publication |
| **Your role(s)** | Product design and frontend/full-stack engineering of the local harness (single git author: Nick, `npulido@gmail.com`, commit `8fc199e`) |
| **Domain / industry** | Operational readiness exercises (incident response, disaster recovery, business continuity, crisis management). The pattern is a governed workflow, not a vertical product claim. |
| **Stack (primary)** | TypeScript, React 19 + Next.js host, framework-free HTML view renderers, Node HTTP API, local Supabase/PostgreSQL, OpenAI Responses for reviewed proposals |
| **Status** | Local development prototype. `package.json` version `0.2.0`, `"private": true`. Not a production readiness platform. |
| **Year** | 2026 |
| **Portfolio site** | None recorded in the repo |
| **Live demo URL** | none — local only (`http://127.0.0.1:3000` with the API on port 3000). Do not deploy this harness. |
| **Client / brand clearance** | Not decided. User-facing brand is MESA. Internal contracts, storage keys, and the npm name still say STRATA. Synthetic tenants are Atlas Response Group and Harbor Continuity Group. GLASSHOUSE is a fictional scenario adapted in `src/glasshouse.ts`. Facilitator source files are omitted from the public GitHub history. |
| **Authorship** | Solo git history (one commit). No team credits are recorded. Confirm before publishing if collaborators should be named. |
| **Open-source intent** | Not stated. Package is private. No open-source positioning doc until that changes. |

### Source documents in this repo

- Project brief: `docs/product/STRATA-CONCEPT.md` (proposed product, October 8, 2026, plus later addenda — it specifies a product to build and says it does not describe a validated platform)
- Other: `README.md`, `docs/engineering/MIGRATION.md`, `docs/engineering/DESIGN-SYSTEM.md`, `docs/engineering/IMPLEMENTATION-STATUS.md`, `docs/engineering/LOCAL-SERVICES.md`, `docs/engineering/BOUNDED-AI-SPEC.md`, `docs/engineering/SCENARIO-GRAPH-SPEC.md`, `docs/engineering/GLASSHOUSE-IMPLEMENTATION.md`

### What this project proves

A complex, branching operational workflow can be authored as a versioned definition, run as a pinned session, and closed only when a human inspects evidence. Generated text stays a proposal until an explicit, digest-checked accept.

### Explicit limitations (honesty list)

- Local loopback only. Synthetic persona switching is not authentication.
- Workflow state is one JSONB aggregate per organization, not a normalized production schema.
- Screen registration (70 routes in `src/routes.ts`) is not the same as a finished backend for every screen.
- React migration is a host shell. Most screens are still HTML strings painted into `#app` (`docs/engineering/MIGRATION.md`).
- The publication digest is a non-cryptographic FNV-style hash (`hash` in `src/workflow-model.ts`).
- AI cannot be treated as an approver. Several admin, identity, billing, invitation, and export paths are explicit unavailable states.
- Documented test totals disagree by date (36, then 69, then 70 in October 2026 notes). Re-run `npm test` and `npm run test:web` before quoting a current count.
- No public demo URL, no production deploy, no measured users.

### Audience priorities (rank 1–3)

1. Portfolio visitors who need to see the pattern in the UI
2. Hiring managers evaluating workflow, state, and interface judgment
3. Consulting prospects who buy the pattern (author → facilitate → evidence-gated publish), not a readiness SaaS

---

## 1. What is generic vs. hardcoded?

**Conservative reusable share: about 25–30% of application lines.** I am not calling this a generic engine with a thin skin.

Application source under `src/` and `backend/` is about 3,150 lines, excluding `tests/` and the small Next.js host. The workflow kernel — contracts, route matching, scope checks, command handlers, digests, package parse/export, the scenario graph projection, the HTTP command API, and the coverage/retest rules — is on the order of 900 lines if those files are counted whole, and closer to 500 if only the mechanism (not the readiness nouns inside them) is counted. **About 28% whole-module, under 20% if the domain vocabulary inside those modules is excluded.**

`src/glasshouse.ts` alone is 808 lines, roughly a quarter of application source, and it is one scenario adapter.

| Kind | Where | What travels |
|------|--------|----------------|
| Pattern | `src/contracts.ts` | Request states, command receipt statuses, metric display states, screen registry shape |
| Pattern | `src/routes.ts` | Static registry + `matchRoute` / `routeTo`. The 70 entries are this product. |
| Pattern | `src/platform.ts` `can`, `canScreen`, `scopeProjection` | Capability checks and redaction. The persona matrix is product-specific. |
| Pattern | `src/workflow-model.ts`, `src/workflow-commands.ts` | Versioned definitions, validation, digest-pinned publish, session commands. Action names are discipline-specific. |
| Pattern | `src/scenario-graph.ts` | One definition projected to overview / transition / inject nodes. Layout is a browser preference, not a second model. |
| Pattern | `backend/api.mjs`, `backend/repository.mjs` | CSRF/origin guards, compare-and-swap workspace writes, loopback-only database |
| Pattern | `src/improvement-model.ts` | Opportunity coverage that withholds a number; retest comparison checks |
| Hardcoded domain | `src/fixtures.ts`, `src/glasshouse.ts` | Synthetic people, scenarios, and the GLASSHOUSE rehearsal |
| Hardcoded domain | `allowedActions()` in `src/workflow-model.ts` | Discipline string switches the legal action set |
| Hardcoded presentation | `src/views-*.ts`, `src/workflow-*-views.ts`, `src/session-controller.ts` | HTML shells, copy, and fixture chrome |
| Hardcoded brand | `design-tokens.css`, `src/ui.ts` `logo()` | MESA palette and mark. No tenant theme switch. |

`app/MesaHost.tsx` mounts the shell targets and boots `startSessionController({ onPaint })`. It does not own domain rules. The previous Vite `web/` host has been removed.

## 2. Where does business logic leak?

The intended split is real in places and broken in others.

**Holds in the engine**

- Publication refuses a stale digest (`scenario.publish` in `src/workflow-commands.ts`).
- Finding approval refuses missing evidence, a non-integer level, or uninspected citations (`finding.approve`, same file).
- AI acceptance rebuilds a normal authoring command only when version and digest still match (`acceptanceCommand` in `backend/api.mjs`).
- Participant projections strip facilitator notes and unreleased injects (`scopeProjection` in `src/platform.ts`).

**Leaks**

- `src/session-controller.ts` (407 lines) owns shells, command submission, AI review modals, exports, and routing. Domain outcomes are triggered from click handlers next to markup.
- `allowedActions()` and `definition()` in `src/workflow-model.ts` encode incident-response vs. continuity rules in the shared model.
- `finding.approve` writes the reviewer name `'Casey Morgan'` in the command handler.
- `src/glasshouse.ts` is imported by the platform adapter, so one scenario ships inside the client bundle. `docs/engineering/GLASSHOUSE-IMPLEMENTATION.md` states compiled assets are not a facilitator vault. Facilitator source files are not part of the public GitHub history.
- Two authoring renderers exist. Live `selectView` uses `authoring()` from `src/workflow-author-views.ts`. `author()` in `src/views-scenarios.ts` is a second, older surface (its AUT-06 copy still says no model provider is connected, which is stale relative to `docs/engineering/LOCAL-SERVICES.md`).
- `views-exercise.ts` is off the live path (`docs/engineering/MIGRATION.md`). `review()` / `report()` in `src/views-program.ts` are also bypassed for `REV-*` in favor of `src/workflow-review-views.ts`.

## 3. Architecture summary

```
Browser (Next.js App Router :3000, app/MesaHost.tsx)
  → session-controller.ts paints via onPaint into React shells / screen registry
  → HttpAdapter  POST /api/read | /api/command | /api/ai/*
Same process Route Handlers (app/api/[...path]/route.ts → backend/api.mjs)
  → Repository (local Supabase only)
  → FixtureAdapter + workflowCommand / improvementCommand
  → OpenAI Responses (server key, structured output, human accept)
PostgreSQL JSONB: strata_workspaces, strata_ai_proposals, strata_ai_tasks, strata_ai_runs
```
Vite, `server.mjs`, and the dual `:5173`/`:4173` split are obsolete after the Next.js cutover.

Persistence is one versioned workflow aggregate per tenant plus durable command receipts (`docs/engineering/LOCAL-SERVICES.md`). Unsent form input and graph layout stay in browser storage (`strata-draft:*`, `strata-graph-layout:*`). There is no React Router and no global client store, by design (`docs/engineering/MIGRATION.md`).

Data flow for a consequential edit: form → command with `expectedVersion` and an idempotency key → server scope check → domain handler → compare-and-swap commit → receipt (`submitted | accepted | executed | rejected | unknown`). Accepted is not executed. Unknown outcomes reconcile the original command id (`README.md`, `docs/engineering/IMPLEMENTATION-STATUS.md`).

## 4. Strongest technical proof points

1. **Screen contract.** 70 `ScreenDefinition` rows with shell, requirement, and dependency ids, plus legacy HTML aliases (`src/routes.ts`).
2. **Command receipt model.** Five statuses and a receipt that carries the original command id (`src/contracts.ts`).
3. **Scope projection.** Observer/guest and participant views drop facilitator notes, queued injects, and private findings (`src/platform.ts`).
4. **Validation before publish.** `validation()` returns blockers; publish requires `validatedDigest === authorDigest` (`src/workflow-model.ts`, `src/workflow-commands.ts`).
5. **Graph is a projection.** Solid edges are recorded conditions; dashed edges are grouping. Dragging does not change scenario logic (`src/scenario-graph.ts`, `docs/engineering/DESIGN-SYSTEM.md`).
6. **Evidence gate.** `not_observed` is not zero. Approval requires inspected citations (`src/workflow-commands.ts`, `src/workflow-review-views.ts`).
7. **Coverage withholds numbers.** `MetricView.displayState` includes `suppressed` and `not_observed`. Cohorts and interventions do not become a percentage (`src/improvement-model.ts`).
8. **Reviewed AI.** Generation does not publish. Acceptance is digest-checked and becomes an ordinary draft command (`backend/api.mjs`, `docs/engineering/BOUNDED-AI-SPEC.md`).
9. **Loopback guard.** Remote Supabase URLs are rejected (`backend/repository.mjs`).
10. **Design system with constraints.** Tokens, 40px targets, no color-only verification, title case that does not rewrite stored narrative (`design-tokens.css`, `docs/engineering/DESIGN-SYSTEM.md`).

## 5. Gaps and risks

- **Tests.** Focused Node tests import domain modules from `src/` via `tsx` (`npm test`). October notes cite 36, then 69, then 70 passing tests at different moments. `docs/engineering/IMPLEMENTATION-STATUS.md` also says some improvement tests were written and not executed. I am not treating any of those figures as the current suite.
- **README vs. code.** The root README is unusually honest. Stale copy remains in the unused `author()` renderer.
- **Deploy.** No production host. Docs forbid deploying the harness. Static routes block env files; fixture content in the bundle is still readable.
- **Security.** HttpOnly CSRF cookie and origin checks protect the local API. Anyone on the machine can switch personas. RLS is on, with browser roles revoked; the Node service role writes. That is a local boundary, not tenant security.
- **Scale.** Single Node process, in-memory AI rate limits that reset on restart, one JSON document per org, no realtime collaboration.
- **Migration.** React host is real; screen bodies are not React. Deleting a string renderer before replacement is explicitly deferred.
- **Hash.** `authorDigest` / report digests are FNV-1a style 32-bit hex, not a signature.
- **Accessibility.** Keyboard and responsive smoke checks are documented. There is no WCAG audit or screen-reader certification (`docs/engineering/IMPLEMENTATION-STATUS.md`).
- **PDF.** Print/save was not file-inspected in the recorded verification.

## 6. Cross-domain portability

To reuse the pattern outside readiness:

1. Keep the screen registry, command receipt, version + digest, and projection types.
2. Replace `allowedActions`, entity kinds, and rubric anchors with the new domain's schema.
3. Replace fixture install (`fixtures.ts`, `glasshouse.ts`) with real identity and a normalized store.
4. Keep "generated text is a proposal" as a gate, not a feature flag bolted on later.
5. Split `session-controller.ts` before the HTML strings calcify a second UI.

The expensive part is not the graph canvas. It is the rule that a published snapshot cannot be edited in place, and that a missing observation is not a zero.

## 7. Recommended next steps

**For portfolio credibility**

- Capture the two flows in this package with fixture chrome off (`SHOW_FIXTURE_CHROME=0`).
- Decide whether MESA, STRATA, GLASSHOUSE, and the synthetic names can be public.
- Quote tests only after a fresh `npm test` / `npm run test:web`.
- Lead with the pattern. The ransomware and supplier stories are demo data.

**For product maturity (not required to publish the case study)**

- Finish the React migration one screen family at a time, deleting the unused renderer when the new one is verified.
- Replace the FNV digest with a real content hash before any external trust claim.
- Move facilitator-only scenario content out of the client bundle.
- Replace persona switching with real auth before any non-local use.
- Normalize the workflow aggregate once more than one writer matters.

## 8. Hero user paths for portfolio media

Both paths use the default manager persona on the Atlas synthetic tenant. They do not call OpenAI. Hide fixture chrome for publish captures. Server: `npm run dev` → `http://127.0.0.1:3000`.

### Flow 01 — Program overview to scenario graph (primary loop, ~26s)

- **Start:** `/` — Program Overview for Atlas Response Group. Metrics, a live exercise card, and next steps are visible. This is the "what is this?" frame.
- **Interactions:** Primary nav **Scenarios** → **Organization scenarios** → open **Ransomware with data exposure** → section **Graph, Injects & Artifacts** → **Fit graph**.
- **End frame:** Scenario graph with the legend in view. Solid arrows mean recorded transition conditions. Dashed lines mean overview grouping, not execution order. No node has been edited.

### Flow 02 — Not-observed is not a score (differentiated proof, ~24s)

- **Start:** `/o/atlas/sessions/s-ir-01/review/findings` — Findings Review queue, including draft, approved, and disputed rows.
- **Interactions:** Open **Executive escalation was not observed** (`/o/atlas/findings/f-03`). Do not press Approve. The command would reject; the UI proof is the warning itself.
- **End frame:** Cited-evidence panel reading that there is no qualifying evidence, and that N/O and N/A stay distinct from numeric zero (`src/workflow-review-views.ts`). Level is `not_observed`, status is draft, evidence list is empty (`src/fixtures.ts`, finding `f-03`).

These flows are distinct: 01 is authoring structure, 02 is the review gate that protects publication.
