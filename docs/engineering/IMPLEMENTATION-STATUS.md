# Reference adherence and verification

## October 10 Local Service Boundary

Connected loopback Node API, local Supabase aggregate/proposal persistence, PostgreSQL compare-and-swap writes, durable receipts, and OpenAI Responses structured narrative proposals. Graph generation, before/after review, explicit accept/reject and persistent AI history are implemented. Existing browser data imports only into empty workspaces; recovery copies remain. Published immutability and role guards are enforced server-side. See `docs/engineering/LOCAL-SERVICES.md`; it supersedes historical claims that no AI/database endpoint is connected. Production authentication, normalized schema, attachment storage/realtime and autonomous actors are not claimed.

Checks: 55 automated tests pass, including AI acceptance/immutability/structure preservation. A bounded live OpenAI smoke call passed; browser graph generation/review/rejection was verified against local Supabase. Existing Harbor drafts remain present. Database CAS conflict/persistence, CSRF/role denial, secret/static file restrictions and loopback port checks passed. No user scenario was modified by these live checks; one rejected AI proposal remains as test history.

## GLASSHOUSE local scenario installation

User-supplied GLASSHOUSE v1.0 is adapted into a pinned local publication, editable fork, and scheduled rehearsal in Atlas/Harbor, installed additively into existing tab stores. Facilitated delivery includes twelve timed cues, eight unique fixture identities/roles, six weighted domains, custom action requests, and explicit authorized/time-gated investigation reveals. Human-readable branches are guidance, never executable strings. Full custom action/branch/scoring engine and secure server-held facilitator content remain unimplemented; see `docs/engineering/GLASSHOUSE-IMPLEMENTATION.md`. Build and three focused GLASSHOUSE tests pass; browser acceptance/full regression remain pending.

Catalog Clear now uses a native disabled state when no applied/pending search or facets can be cleared, responds to input changes, and preserves collection/layout. All scenario-authoring pages share horizontal section navigation, including draft/publication, form/list, and preview views. Build passed; browser acceptance remains pending.

## October 10 calendar and shared presentation updates

Exercises agenda is now a visual Month/Week calendar with date navigation, timezone-correct day grouping, exercise links, filter preservation, and empty-range messaging. Verification table values use accessible icon/tooltips for all five states. Team editors/history are arranged in equal, aligned rows. Decorative left-edge accents are removed globally, and displayed headings/view titles use shared Title Case presentation without mutating saved data. Strict TypeScript build passed; browser acceptance/full regression remain pending.

## October 10 scenario graph increment

AUT-04 defaults to the graph workspace, with complete list fallback and role-preview preservation. Node selection, modal inject editing/creation, transition and brief links, conditional edges, zoom/fit/reset, and tenant/persona/scenario-scoped local change-request storage are implemented. The graph projects existing definitions; no arbitrary narrative branch engine or AI provider is claimed. PRD addendum, graph spec, README, and design-system conventions are updated. Strict build passed; browser acceptance and full regression remain pending.

## October 10 targeted UI updates

Implemented the eleven browser comments: uniform hero card border, inbox import icon, sidebar tagline removal, horizontal people identity cells, collapsed advanced Analytics filters with always-visible Search/Period, persistent desktop icon-only navigation with hover/focus labels, global accessible required markers, aligned table actions, modal inject/objective authoring with item-scoped draft recovery, and event-feed separation. Shared conventions are documented in `docs/engineering/DESIGN-SYSTEM.md` and `/ui-reference`. TypeScript checks/build passed; browser acceptance and full regression verification have not been run for these changes.

Updated October 9, 2026. Source of direction: the supplied UI/UX Agent Build Reference v1.0. Earlier screenshots inform the STRATA identity; the newer document controls information architecture, blue/neutral tokens, readable scale, lifecycle language, and permissions.

## Implemented frontend scope

| Screen family | Coverage | Authority status |
| --- | --- | --- |
| ACC / HOME | Identity-unavailable surfaces, workspace switching, overview, notifications and jobs empty states | Synthetic identity only |
| CTX | Profile, source metadata, accept/exclude fact review, conflict blocking | No upload, scanning, extraction or real context binding |
| CAT / AUT / PKG | Structured entity/transition graph list, inject/artifact forms, opportunities and rubric anchors, context bindings, brief autosave/recovery, semantic comparisons, proposals, history restore, digest validation, isolated local dry run, immutable publication, strict JSON import into new drafts and exact package export previews | Local synthetic contracts; binary asset service, production validation, verified rights/signatures and AI provider deferred |
| EX | Draft/scheduled configurations, rescheduling without creating another session, calendar files, existing verified fixture roster assignment, disclosure, lobby and launch preflight | External invitations and production assignment authority deferred |
| SIM | Recorded situation events, thread messages/receipts, released evidence, typed action prerequisites, command reconciliation/history, versioned decisions, notes and handoffs | Local synthetic transitions and tab persistence; production engine/stream deferred |
| FAC | Start/pause/resume/end, stepped time, pinned roster/scenario, release/delay/cancel/manual cues, attributed adjudication and compensating events, verbal observations, passive replay with perspective filtering | Local synthetic state; production clock, actor, grant and audit authority deferred |
| REV / REP | Reflections, evidence inspection before approval, amendments/rejection/correction history, dependent amendment flags, section audiences, digest-bound report approval, immutable publication, supersession/withdrawal, JSON/DOCX and PDF print snapshots | Production audience enforcement, signing and export jobs deferred |
| ANA / ACT | Filtered opportunity read models, saved views, denominator/exercise/evidence drill-downs, delivery/content records, scoped CSV, action aging, planned retests, comparability and evidence-reviewed pass/fail | Tab-persistent synthetic records; production read-model and verification authority deferred |
| PEO / REC | Directory, self/scoped-coach profile, development, reasoned practice | No real coaching grants; no invented expert identity or connected commercial service |
| SET / PUB / OPS | Preferences, scoped access descriptions, service-unavailable/empty surfaces | No live identity, billing, integrations, rights, support grants, retention, or deletion |

All 70 screen IDs and their requirement/dependency/component references are enumerated in `src/routes.ts`. Registration and successful rendering do **not** mean that every screen's backend or detailed interaction contract is complete.

## Important semantics retained

- Accepted commands do not imply execution. Unknown outcomes reconcile the original command ID.
- Repeated reconciliation does not append duplicate execution events.
- Paused/disconnected sessions cannot issue fixture writes.
- Published scenario/report revisions cannot be edited in place.
- Missing evidence and disputed attribution prevent finding approval.
- A scored zero is distinct from not observed and not applicable. Suppressed metrics carry no number.
- Implemented corrective actions are not verified by a dropdown. Overdue is derived from the due date.
- Administrator access does not imply private coaching access; consultant scope is limited to Atlas.
- Observer/guest projections exclude program-only and private personal records.
- Validation errors leave records unchanged; version mismatch is a conflict, not silent overwrite.

## Earlier verification baseline

Before the latest approved items 1–3, `npm test` reported **14 passing tests**, including:

- All 70 canonical routes round-trip with requirement/dependency metadata.
- All 70 renderers handle both populated Atlas and empty Harbor fixtures without exceptions (140 renders).
- Access projection, consultant isolation, observer restrictions, disconnected and paused writes.
- Command idempotency and original-ID reconciliation.
- Published immutability, approval blockers, valid zero, stale-version conflicts.
- Pack purpose/delivery constraints and atomic validation failure.

Browser checks:

- Primary navigation destinations render correctly; no page-level overflow at the tested medium width.
- Exercise filter reduces results and writes filter state into the URL.
- Disclosure acknowledgement enters the live fixture workspace.
- Unknown command → explicit confirmation → unknown receipt → reconciliation → executed receipt retains the original ID.
- Escape closes the native dialog and returns focus to its launcher.
- Workspace switch to Harbor clears the view and displays the first-use empty state.
- Live workspace dimensions checked at 1440×900, 1024×768, 390×844 and 320×844; no page-level horizontal overflow. Compact task tabs scroll within their container.
- No browser console errors in the tested flows.

## Incomplete acceptance items / integration inputs

The reference's production definition of done is **not met** without server authority. Required next inputs are the actual D-ID/D-ORG membership contracts; D-CONTEXT extraction and fact provenance; scenario validation and package schemas; D-EX assignment/scheduling; D-SIM command/status/event-stream contracts; reviewed observation/rubric schemas; report audience/export enforcement; retest verification rules; entitlements, publisher rights, job and operations adapters.

The user approved verification after items 1–3. The latest revision passes `npm run check` and **36 automated tests** (`npm test`, including compilation). The renderer tests now exercise the current workflow modules rather than legacy renderers: 70 route round trips and 140 populated/empty page renders, with unique HTML IDs. This is fixture-level verification, not production acceptance.

Analytics and improvement were subsequently approved and implemented locally (see below). Broader access/administration, additional acceptance verification, and the final consistency pass remain deferred. Production services remain deferred. The earlier verification covers approved items 1–3, not the new analytics phase or the out-of-scope production demonstrations.

## Latest approved verification evidence

- Automated: publication digests and stale proposals, atomic dependency rejection, strict package parsing and two clean Harbor imports/re-exports (IR and DR), launch preflight, pinned definitions, pause guards, original-ID idempotent reconciliation, resource-limited recovery/compensation, draft roster/cancellation, note conflicts and handoff ownership, observation evidence/session validation, inspected zero-level approval, report audience changes and approval invalidation, contested personal findings, immutable amendments/supersession/withdrawal, restricted JSON/DOCX content, and calendar UTC offsets/CRLF boundaries.
- Browser: catalog fork → recovered brief → manual inject without a conditional trigger → validation → isolated dry run → publication → schedule → readiness-blocked launch → synthetic readiness → launch → released cue → attachment-free message → unknown command → reload → original-ID reconciliation → verified recovery → restoration → attributed observation → completion → evidence-inspection-blocked approval → inspected zero approval → report composition → exact audience/digest approval → immutable publication. Also inspected and committed a portable package into a separate draft.
- Responsive/accessibility smoke checks: 16px body scale; no document-level horizontal overflow at 320/390/1024/1440px on the tested report/action surfaces, and 320/390px authoring forms. Form controls were labelled, duplicate intent IDs were corrected, compact navigation opens by Enter and closes by Escape, and the native export dialog fits at 390px, closes by Escape, and returns focus to its launcher. These are focused checks, not an automated WCAG audit or a screen-reader certification; actual 200% browser zoom was not tested.
- Export bytes: downloaded `/Users/npulido/Downloads/strata-published-report.docx` passed Python ZIP CRC validation; all three OpenXML parts parsed successfully and contained the reviewed QA narrative. Automated content checks search projected JSON/text/DOCX for restricted section/summary markers. A calendar download exposed literal line-ending escapes; those were fixed and protected by CRLF/UTC tests. The corrected calendar function is tested; a second native calendar download was not inspected. Browser JSON download was attempted but no completed file was available for inspection; its serialized projection is covered by the automated tests.
- Browser console: no error logs in the exercised flows. QA used a separate temporary browser tab and synthetic tab-local records; the user's existing tab was not changed by these tests.
- Screenshots: `verification/workflow-report-wide.jpg`, `verification/workflow-report-mobile.jpg`, and `verification/workflow-author-import.jpg` record this phase. Earlier overview screenshots remain historical, not evidence for the new flows.

Issues fixed during verification: optional empty selections blocked messages/manual injects; draft roster/cancellation guards disagreed with the UI; role-restricted inject messages and observer workflow records leaked across fixture projections; invalid numeric observations and empty report sections were accepted; duplicate field IDs merged accessible labels; submitted action drafts reappeared after reload; publication retained draft revision links; calendar line endings were malformed; review queues/new report finding selection could cross session boundaries; compensation bypassed the resource budget; hidden summaries remained in JSON projections; and corrections could reopen superseded/withdrawn publications.

Still requiring manual/integration verification: PDF print/save did not produce a visible print window in the in-app browser, so no PDF file was inspected. Native Word/Pages visual rendering, multiple real users/tabs with server concurrency, screen-reader and cross-browser acceptance, live revocation/entitlements, and AI/adversary/provider behavior require environments or services outside this approved fixture phase. The deterministic IR/DR checks are not a claim of success against a connected AI adversary.

## Approved phase 1–3 implementation handoff

- Authoring: editable list-based graph, registered discipline actions, resource envelope checks, inject triggers/audiences/hidden notes, local text artifact loading, rubric opportunities, accepted context bindings, brief autosave and recovered conflicts, preserved history and semantic differences, manual proposal staging/accept/reject, validation/dry-run trace, digest-pinned publication, strict portable/private package previews and import into isolated drafts.
- Exercise: draft/scheduled configuration, roster changes before launch, calendar export, lobby/disclosure/readiness, launch-time snapshots, late-join catch-up, scoped recorded events, released artifacts, thread send/reconciliation, command history and prerequisites, decisions/revisions, versioned team notes and handoffs, pause/end controls, pacing, adjudication, attributed verbal observations, passive recorded replay.
- Review/reporting: completion reflection, inspection-based finding approval, rejection/amendment/challenge resolution history, dependent report amendment flags, report section/audience editing, approval invalidation, immutable publication snapshots, amendment/supersession/withdrawal, selected-snapshot JSON/DOCX exports and PDF printing.

Limits retained: package assets are inline text (binary scanning is a deferred production service); AI changes can be staged manually but are not generated by a provider; realtime clock policy has no running production clock; fixture identities and readiness controls demonstrate the flow without claiming real invitations or consent. PDF output uses the browser's print/save dialog. Private backup facts are shown in export previews; imported organization bindings are cleared for review rather than silently accepted.

Do not deploy this fixture UI as an authenticated production application or interpret its client-side scope checks as protection of bundled content.

## Approved analytics and improvement implementation

- ANA-01/02: intersecting search, date, team, discipline, role, difficulty, revision and purpose filters; tenant/persona-scoped saved selections; coverage bars/table and role/opportunity records; denominator drill-down with anchors and exclusions; exercise, finding and evidence links. Delivery and content tabs now derive their counts from the selected records rather than returning static unavailable placeholders. CSV uses the selected tab and population.
- Coverage v2 derives one opportunity per selected pinned objective/session. Eligibility requires a verified assigned role and a released role-visible cue within the opportunity window. Only unambiguous evidence-backed approved **team** observations with exact objective mappings enter reviewed coverage. Legacy prose-only finding opportunities remain unmapped until a reviewer records a reasoned mapping. Personal, draft, disputed and intervention-affected observations do not create aggregate scores.
- Numeric zero remains a reviewed anchor. Cohorts under five, unfinished sessions, insufficient coverage and mixed rubric groups suppress rubric attainment. Comparable coverage histories remain separate condition-group tables; no interpolated trend or overall percentage-improvement claim is fabricated. Unknown preparation effort, cost, response latency and production recovery performance remain unavailable.
- ACT-01/02: implementation/verification/owner/source/due filtering; owner and due-date edits; implementation evidence and rationale; derived action aging; retest plan linked to a separate prelaunch session with a pinned target anchor; side-by-side scenario/role/rubric/difficulty/purpose/delivery/assistance/intervention checks; reviewed pass/fail against inspected baseline and retest citations. Normal session completion is recorded separately from invalidating interventions.
- Passing verification requires current comparable completed sessions, the action’s approved source finding, session-scoped reviewed evidence, implementation evidence, and explicit acceptance rationale. Failed results reopen the action without erasing implementation. Results are immutable; a new attempt is required rather than lowering the target after a result. Corrections or changed measurement conditions invalidate the displayed verification while retaining the prior result history.
- Program overview coverage now consumes the same opportunity calculation instead of the old hard-coded 75% fixture total.

Implementation checks: strict TypeScript checking and compilation succeeded. Eleven focused regression cases were added in `tests/improvement.test.mjs` but **not executed**, honoring the user’s explicit deferral of verification. The analytics preview was requested in Codex; opening returned queued. No browser interaction, visual acceptance, download inspection, cross-browser or full regression run was performed for this phase. The prior 36-test baseline must not be interpreted as verification of these changes.

Broader administration, final consistency, production/third-party integrations and acceptance verification were not resumed.
# October 10, 2026 — Bounded Automatic AI Expansion

User-approved bounded automatic mode is implemented locally. The AI Workbench generates complete editable scenarios and parser-validated inject/registered-transition changes. Opt-in facilitator policies drive server-side actor dialogue, actor-owned actions, optional eligible cue release/stepped pacing and allowlisted pending-request adjudication. Durable Supabase reservations/leases enforce turn/token limits and late-response stop checks; failures/conflicts/restarts pause rather than retry or resume silently.

AI artifacts carry synthetic provenance; draft assessment uses recorded human action evidence and individual attribution, never invented speech or actor output. Report generation produces Review Team drafts from completed timeline and approved Team findings. Existing review/correction/approval/publication gates remain. Actor intervention records mark AI assistance and prevent unassisted comparisons. Existing user scenarios/sessions were not enabled for automation by this implementation.

Verification: strict build and 69 automated tests pass, including 14 new bounded-AI tests. Real local PostgreSQL checks confirmed reservation/limit/stop rejection with unchanged workspace state. A live model generation created the editable Atlas `AI Verification Branching Recovery` draft; the prior invalid generation failed safely. Local browser checks confirmed workbench/graph controls and generation modal. After explicit user approval, additional live actor/assessment smoke checks passed entirely in memory with synthetic source fixtures: `gpt-4.1-mini-2025-04-14`, 330 actor tokens and 772 assessment tokens. The actor artifact was explicitly excluded from participant observations and created no findings; assessment returned three `not_observed` draft findings rather than invented numeric scores. No data was persisted and no saved exercise automation was enabled by these checks. Broader production Auth, normalized data, distributed workers, multi-user realtime and acceptance/performance testing remain outside this local expansion. Details: [BOUNDED-AI-SPEC.md](BOUNDED-AI-SPEC.md).
