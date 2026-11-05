# Bounded AI Workbench and Exercise Runtime

Version 1.0 · October 10, 2026 · Local implementation

## Product Authority

User-approved mode: **Bounded Automatically**. A facilitator explicitly enables each exercise run and confirms AI disclosure. No existing exercise is enabled by installation, navigation, reload, or a server restart. AI cannot publish scenarios, approve findings, verify corrective actions, grant access, or publish reports.

## Authoring

- **Generate Scenario** creates a complete synthetic scenario package: brief, human roles, non-human actors, services, registered transitions, timed/conditional injects, artifacts, and four-anchor objectives. Strict schema and package/domain validation must pass before a new editable draft is committed.
- **Generate Injects & Branches** upserts only injects/transitions on a current draft. Entities, objectives, bindings, rights, and published revisions are untouched. Conditions reference actual registered transition IDs; mutually exclusive branches can share a prerequisite state. The action console selects a specific transition ID and reconciliation retains it.
- Changes invalidate validation/dry-run state and record revision history. A facilitator reviews, validates, dry-runs and explicitly publishes before scheduling against that publication.
- Actor-only registered actions: `disrupt_service` (environment/threat actor); `spread_compromise` and `exfiltrate_data` (Incident Response threat actor only). These change simulated state labels through pinned preconditions/resources, not external systems or executable code.

## Runtime Policy

Policy records: selected pinned non-human actor, assigned delivery audiences, registered-action/compensation allowlist, 1–30 turns, 10,000–300,000 token reservation budget, 15–300 seconds between completed turns, 0–10 stepped simulation minutes per turn, optional eligible-inject release and optional pending-request adjudication.

Defaults: 5 turns, 60,000 reserved tokens, 30 seconds, no clock advancement, no actions selected, no automatic cue release or adjudication. Tokens are a conservative spending-control envelope, **not a guaranteed dollar billing cap**. Model choice/account pricing determines charges; already-sent requests can be billed after cancellation.

The server reserves a worst-case input/output allowance in PostgreSQL before inference. Reservations are not refunded after failures or lower actual usage. Each turn has a durable UUID, lease, usage record and terminal result. No automatic retries. Failure, conflict, quota exhaustion, termination or paused/ended session pauses further work. After server restart, prior running jobs are marked interrupted and runs paused; explicit enablement is required again. This initial runner assumes one Node process for the local workspace, not a distributed production worker fleet.

AI sees only the actor's configured knowledge, selected transition targets/budgets, released public or actor-addressed cues, permitted delivery audiences, and (when enabled) pending intents for its bounded adjudication role. Hidden injects, facilitator notes, rubrics, answer keys and private participant messages/reflections are not actor context. Responses are untrusted, typed proposals: actor actions require actor ownership, allowlisting, current state and sufficient budget. Compensation additionally requires an unresolved request and explicit policy authorization. No approval is inferred from prose.

Eligible timed/conditional cues may be released deterministically; manual cues remain queued. AI cannot add live injects or change the pinned assessment policy during a running exercise. Synthetic dialogue/artifacts and adjudication are provenance-labeled and record assessment impact/AI assistance. They are not human performance observations and cannot qualify as participant score evidence.

**Stop AI Now** invalidates the lease and aborts local inference; the atomic commit checks the live lease/status, so a late response cannot apply. Exercise Pause/End suspends automation. Stop is separate from pausing human exercise activity. Resume never silently re-enables AI.

## Assessment and Reports

**Draft Assessment** proposes Team and attributable individual findings using recorded human registered-action evidence only. Numeric 0–3 requires a selected pinned objective, role/window eligibility, a released role opportunity, and valid citations. Individual scores additionally require matching participant attribution in every evidence record and a non-observer assignment. Legacy unattributed evidence supports Team only. Missing observations stay N/O; fabricated speech or actor artifacts cannot become score evidence. Drafts have no inspected citations or reviewer approval; normal evidence inspection, correction/challenge and approval workflows remain mandatory.

**Draft AI Report** is available after completion. Input is recorded timeline, approved Team findings and assessment impact, not private individual findings. It creates a Review Team draft with limitations and citation prompts. Content/audience approval and publication remain human, digest-bound operations. Narrative validity still requires review; a valid JSON schema does not establish factual or instructional quality.

## Data and Operations

`strata_ai_tasks` stores local job input/status/results/model/usage; `strata_ai_runs` stores policies, reservations, turns and leases. RLS is enabled; browser roles cannot access these tables directly. `strata_ai_finish` atomically commits a current aggregate and job result; version/lease mismatch prevents any application. Request IDs prevent a retried browser request from rebilling a completed/pending job. Manual workbench jobs have a durable 20 jobs/workspace/hour cap; the older reviewed narrative-proposal path retains its existing separate local limit.

OpenAI Responses uses strict schema, `store:false`, a 45-second timeout, 6,000 output tokens for package/branch generation and 2,200 for other operations. The key remains server-only. Requests/results persist locally; OpenAI processing/retention is governed separately by the account's provider policies. Synthetic persona switching remains a local development harness, not production authentication.

## Verification

Automated coverage includes schema errors, policy limits/disclosure, actor/private-context filtering, ownership/preconditions/resources, bounded compensation, eligible release, evidence attribution, draft-only assessment, unknown evidence rejection, replay and stale/stopped commit denial. Local PostgreSQL checks verified atomic reservation, over-limit rejection, stopped-lease rejection and unchanged workspace version. Live scenario generation created `AI Verification Branching Recovery` as an editable Atlas draft; an invalid generation was safely rejected first. Production multi-worker leases, real identities, provider outage/load testing and broad usability acceptance remain separate.

69 automated tests pass (14 bounded-AI regressions). After explicit user approval, live actor and assessment checks passed against source fixtures entirely in memory using `gpt-4.1-mini-2025-04-14` (330 actor tokens; 772 assessment tokens). The actor message was labeled as an AI simulation artifact, not participant observation, and created no findings. Assessment produced three `not_observed` draft findings without inventing numeric scores. These smoke checks did not persist any data or enable automation on saved exercises; they do not constitute end-to-end verification of every automatic runtime path.
