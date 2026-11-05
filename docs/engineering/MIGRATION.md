# MESA Next.js strangler migration

Incremental migration from framework-free HTML string views to **Next.js App Router** (local Node). Domain logic, `/api` contracts, and Node `dist/` compilation remain the backend and test boundary. Product presentation is **MESA — Decision Landscape**; keep using shared [`design-tokens.css`](../../design-tokens.css) and [`app.css`](../../app.css) rather than a parallel React theme.

## Architecture boundary

| Layer | Location | Status |
| --- | --- | --- |
| Next.js App Router | `app/` (`layout.tsx`, `[[...slug]]/page.tsx`, Route Handlers) | **Migrated (foundation)** |
| React shells | `app/_shells/` | **Migrated** |
| React primitives | `app/_components/ui.tsx`, `workflow-ui.tsx` | **Migrated** |
| Screen families | `app/_screens/` | **Registered** (HtmlView bridges + HOME guest/empty JSX) |
| Session orchestration | `src/session-controller.ts` | Shared; paints via `onPaint` into React host |
| HTML view functions | `src/views-*.ts`, `src/workflow-*-views.ts`, `src/ai-ui.ts`, `src/ui.ts` | **Legacy bodies** (still source for most screens) |
| Domain / auth / routes | `src/contracts.ts`, `routes.ts`, `platform.ts`, `workflow-*`, … | Framework-agnostic |
| Transport | `src/http-adapter.ts` ↔ `app/api/[...path]/route.ts` | Fetch API + CSRF |
| Backend | `backend/*.mjs` (imports `dist/` for domain) | Unchanged semantics |
| Design tokens / CSS | `design-tokens.css`, `app.css` | MESA identity |

### Runtime

- **Dev:** `npm run build:domain && next dev -H 127.0.0.1 -p 3000` via `npm run dev`
- **Production-style:** `npm start` → `next build && next start -H 127.0.0.1 -p 3000`
- Legacy Vite host, `server.mjs`, and root `*.html` shells have been removed. Legacy HTML paths redirect in `next.config.ts`.

## Migrated

- [x] Next.js App Router catch-all client host (`MesaHost`) mounting dialog/toast and calling `startSessionController({ onPaint })`
- [x] React program / operational / access shells
- [x] React UI and workflow primitives (same `app.css` classes)
- [x] Screen family registry under `app/_screens/`
- [x] `/api/*` Route Handlers via Fetch-compatible `handleApiRequest`
- [x] `instrumentation.ts` starts the bounded AI runner
- [x] Dual build: `tsc -p tsconfig.domain.json` → `dist/` (API runtime only), Next → `.next/`
- [x] Domain tests import `src/` via `tsx`; `dist/` is gitignored

## Remaining legacy (screen bodies)

Do not delete a string renderer until its React replacement is verified. Prefer expanding JSX inside the matching `app/_screens/*.tsx` family module (HOME guest/empty paths are the template). Order:

1. Shared primitives — **done** (`app/_components`)
2. Shells — **done** (`app/_shells`)
3. Access + home — in progress (guest/empty JSX; populated overview still HtmlView)
4. Exercises
5. Catalog + context
6. Authoring + packages (scenario graph last; keep `mountScenarioGraph` after paint)
7. Live exercise + facilitator
8. Review + reports
9. Analytics + actions
10. People + recommendations
11. Settings, publisher, operations

`src/views-exercise.ts` remains for Node view inventory tests; it is not on the live `selectView` path.

## Compatibility invariants

- Path routes and `legacyRoutes` redirects (including `/simulate.html` → EX-01)
- `HttpAdapter` CSRF cookie + `/api/read` / `/api/command` / AI endpoints
- Fixture scope (persona / tenant / state), draft keys (`strata-draft:*`), sidebar collapse key
- Command semantics: accepted ≠ executed; idempotency; published immutability
- Design tokens and `app.css` visual conventions (MESA palette and marks; no second theme)

## Brand / visual system

User-facing chrome, favicons, document titles, help copy, and calendar `PRODID` use MESA. Persist storage keys, package format `strata-scenario`, draft/graph keys, DB table names, and npm package name until an intentional contract migration. Pre-MESA prototype JS/CSS files have been removed.

## Open gaps

- Most screen bodies remain HTML strings (via `HtmlView` / string modules)
- No React Router / global client store (session-controller + `history` APIs)
- Backend still loads domain from `dist/` (Node ESM); Next Route Handlers use the same modules after `build:domain`
- Domain tests import `src/` via `tsx`; `dist/` remains gitignored build output for the API
- Browser acceptance of the Next host should be re-checked after each family body migration
