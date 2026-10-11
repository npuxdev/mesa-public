# Local API, Inference and Persistence

## Start

Keep `OPENAI_API_KEY` in `.env.local`; optional `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Start Docker, then `npm run db:start` and `npm run dev`. The database wrapper creates a dedicated loopback-bound network and verifies published ports. UI/API: http://127.0.0.1:4173. Studio: http://127.0.0.1:54323. Restart Node after environment/backend changes. `npm run db:stop` preserves volumes; `npm run db:migrate` applies additive migrations. Do not reset valued databases.

The server discovers the local Supabase service-role credential through the CLI; it is never copied into browser code. Optional server-only URL/key overrides are in `.env.example`; remote database URLs are rejected.

## Persistence and Migration

`strata_workspaces` stores one versioned JSONB workflow aggregate per organization: scenario revisions, sessions, evidence, findings, reports, actions, analytics inputs, receipts and pending command reconciliation. PostgreSQL compare-and-swap commits prevent lost updates. Receipts survive Node restarts. This is an initial local aggregate schema, not a normalized production schema.

On the first read of an empty database workspace, an authorized author's existing `strata-workflow-v2:<tenant>` tab snapshot and tenant-scoped command ledger are imported, if present; otherwise the synthetic baseline including GLASSHOUSE is installed. Existing database workspaces are never overwritten by browser snapshots. Browser recovery copies are retained. If another browser initializes the database first, later tab snapshots are not merged automatically; export/import their scenario packages explicitly.

`strata_ai_proposals` records request, tenant/actor, target, base digest/version, model, token usage, proposed content and disposition. Acceptance and disposition commit atomically. Both tables have RLS enabled with anon/authenticated privileges revoked; only the Node service writes them.

## Reviewed AI Authoring

In a draft's **Graph, Injects & Artifacts**, select the overview or an existing inject and describe the change. **Generate AI Proposal** sends only this scenario's narrative, roles, registered transitions, objective titles and selected inject (including facilitator notes) to OpenAI. It does not send private participant findings, other workspaces or secrets. Review current/proposed text and assumptions, then explicitly accept or reject. **AI History** recovers stored pending proposals.

This original narrative-proposal path changes title/summary or inject title/body/notes only, with explicit acceptance. It does not execute anything. Published content is immutable; changed digest/version blocks acceptance. Acceptance creates draft history and invalidates validation. The new AI Workbench below is a separate, wider user-approved path.

Responses requests use strict JSON schema, `store:false`, 2,200 output tokens and a 45-second timeout. One generation per organization may be active; a local in-memory limit permits 20 attempts/hour (resets on restart). UUID request IDs prevent successful/pending requests from silently generating again. Refusal, incomplete or malformed output never applies. No automated retries. A crashed generation can remain pending; inspect history before deliberately making a new request. Local proposals retain request/content; OpenAI data handling remains subject to account policies.

## Development Identity Boundary

Synthetic persona switching is intentionally retained. A HttpOnly/SameSite local cookie, CSRF token and Host/Origin guards protect requests; server capability checks and scope projections enforce the selected development role. **Anyone with local-machine access can select synthetic identities. This is not production authentication or tenant security.** Supabase Auth is available but not integrated into sign-in. Do not expose/deploy this harness.

Static routes block environment files, backend sources and database configuration. Bundled synthetic fixture sources remain inspectable, including template facilitator content; this is not a secure content vault. Production still requires real Auth/JWT memberships, appropriate normalized/RLS schema, removal of fixture bundles/persona controls, secure storage/retention, distributed rate limits, observability and deployment controls. Local Storage/Realtime containers exist, but app attachments/subscriptions are not wired. Arbitrary executable prose is never supported.

## AI Workbench and Bounded Automation

See [Bounded AI specification](BOUNDED-AI-SPEC.md) for authority, policy limits and provenance contracts.

The AI Workbench appears below authoring/facilitator/debrief page headings. Generate Scenario creates an editable package. Generate Injects & Branches applies parser-validated changes to the selected draft, recording history and invalidating validation. No generated scenario is published automatically.

In the facilitator workspace, Bounded Automation opens policy controls. Select actor, audiences and any actions; confirm disclosure before enabling. Stop AI Now is available directly in the control-room header. Runs execute server-side within reserved token/turn/timing limits; Pause/End/Stop prevent late application. Restart pauses all old runs and marks interrupted jobs failed, without retries. This is a single-local-Node runner, not a production worker fleet. No exercise is enabled by default. The token envelope is not an exact dollar cap.

Draft Assessment creates review-only findings from eligible recorded human action evidence, with individual scoring only when attribution is present. AI synthetic artifacts cannot become human performance evidence. Draft AI Report creates a Review Team report after exercise completion, using approved Team findings and recorded timeline. Existing evidence inspection, corrections, approval and publication remain required.

`strata_ai_tasks` and `strata_ai_runs` persist jobs, usage, policies, reservations and leases; both are server-only/RLS-protected. The atomic finish RPC checks current workspace version and live run lease. Manual workbench generation is durably capped at 20 jobs/workspace/hour, separate from the older narrative-proposal limit. 45-second provider timeout; 6,000 output tokens for scenario/branch generation, 2,200 otherwise; no automatic retry.

## Sources and Checks

Implementation follows [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [GPT-4.1 Mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), and [Supabase Local Development](https://supabase.com/docs/guides/local-development). A bounded synthetic live request succeeded with `gpt-4.1-mini-2025-04-14` using 319 total tokens; it changed no scenario. `npm test` covers parsing/refusals/provider failures, local guards, durable receipts and domain regressions.

End-to-end graph generation displayed current/proposed GLASSHOUSE text in the review dialog; rejection was persisted and visible in AI History without changing scenario content. Harbor's existing drafts were observed after migration. Local API checks passed for CSRF rejection, participant AI denial, blocked environment/backend downloads, and PostgreSQL CAS/persistence with unchanged content. Automated narrative acceptance tests verify preserved inject structure, stale validation and conflict/immutability checks. Full multi-user production acceptance is not claimed.
