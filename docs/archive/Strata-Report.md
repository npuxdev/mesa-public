# STRATA capabilities

Local readiness harness, version 0.2.0. Framework-free HTML and TypeScript served at 127.0.0.1:4173. Source review, October 11, 2026.

| Registered screens | Interface shells | Synthetic personas | Exercise disciplines |
| --- | --- | --- | --- |
| 70 | 8 | 9 | 4 |

## Local development boundary

Supabase persistence, server workflow guards, and reviewed OpenAI proposals are connected. Persona switching is a development control. Realtime, signing, rights, external jobs, and delivery remain unconnected. Confidential production data does not belong in this harness.

STRATA rehearses incident response, disaster recovery, business continuity, and crisis management, then turns the session into reviewed findings, a published report, and a retestable corrective action. The working loop is local: author a scenario, publish an immutable revision, schedule an exercise, facilitate timed injects, inspect evidence, and approve a digest-bound report.

## Screens by shell

Registered screens by interface shell. Horizontal axis: screen count. Vertical axis: shell. Source: `src/routes.ts`, 70 canonical screens, October 11, 2026.

| Shell | Registered screens |
| --- | --- |
| Program | 35 |
| Author | 7 |
| Exercise | 7 |
| Review | 5 |
| Access | 4 |
| Control | 4 |
| Publisher | 4 |
| Operations | 4 |

## What the local loop can do

| Domain | Working locally | Still a production adapter |
| --- | --- | --- |
| Identity and workspaces | Synthetic Atlas and Harbor tenants. Nine personas via Inspect states. Workspace switch clears drafts and receipts. Server cookie, CSRF, and role guards. | Live sign-in, MFA, invitations, organization creation, and Supabase Auth. |
| Organization context | Profile, source metadata, and accept or exclude fact review. Conflicts block use. Accepted facts can bind into a scenario brief. | Upload, scanning, extraction, and real context binding. |
| Scenario authoring | Draft and published revisions. Graph workspace plus list fallback. Entities, registered transitions, injects, objectives, and rubrics. Validation, isolated dry run, digest-pinned publication. Published revisions stay immutable. | Binary assets, signed expert approval, live collaboration, and an executable narrative-branch engine. |
| Packages | Strict JSON import into a new draft. Exact package export preview. Calendar files and published JSON, DOCX, and PDF print snapshots. | Signed packages, binary scanning, and background export jobs. |
| Exercise program | Month and Week calendar with timezone-aware placement and preserved filters. Schedule, reschedule, roster, disclosure, lobby, and launch preflight against a pinned revision. | External invitations, calendar sync, and production assignment authority. |
| Live session and facilitation | Situation, communications, evidence, investigation, decisions, and team notes. Start, pause, resume, end, stepped time, cue release, delay, cancel, adjudication, and recorded replay. | Production clock, realtime stream, external message delivery, and actor grants. |
| Review and reporting | Evidence inspection before approval. Amendments, rejection, and correction history. Audience-scoped sections. Digest-bound approval and immutable publication, supersession, and withdrawal. | Production audience enforcement, signing, and export jobs. |
| Analytics and actions | Filtered coverage from eligible opportunities. Saved views and CSV. Corrective actions with derived aging, retest plans, and reviewed pass or fail. | Production read models. Cohorts under five and mixed rubrics stay suppressed. |
| People and recommendations | Directory, self and scoped-coach profile, private development goals, and reasoned practice cards. | Real coaching grants and a connected commercial offering. |
| Settings, publisher, operations | In-tab organization name, timezone, and promotion preference. Audit rows from fixture operations. Remaining admin, publisher, and ops screens render explicit unavailable states. | Billing, webhooks, SCIM, rights, support grants, retention jobs, and telemetry. |

Source: route registry, workflow commands, `LOCAL-SERVICES.md`, and `IMPLEMENTATION-STATUS.md`. The UI reference labels every screen Local API / synthetic workflow.

### GLASSHOUSE v1.0

Installed additively into Atlas and Harbor as a published template, an editable fork, and a scheduled rehearsal. Twelve timed injects, eight fixture roles, six weighted domains, and authorized time-gated investigation reveals.

Branch notes stay human guidance. Custom scoring, automatic financial branches, and a secure facilitator-only content vault remain unimplemented.

### Persistence

One versioned JSONB workflow aggregate per organization in local Supabase, committed with compare-and-swap. Receipts survive a Node restart. An empty workspace can import an existing browser snapshot once.

Unsent input and graph layout stay in the browser tab. The schema is an aggregate, and a normalized production model is still ahead.

## Bounded AI

AI can propose narrative, draft scenarios, and run an opt-in facilitator policy. Generated text becomes evidence only after a person accepts it through the existing review gates. Actor output is labeled synthetic and is excluded from participant competency.

| Path | What it is allowed to do |
| --- | --- |
| Generate AI Proposal | Sends the selected scenario narrative, roles, transitions, objective titles, and one inject to OpenAI. Review before and after text, then accept or reject. Acceptance is digest-checked and writes draft history only. |
| Generate Scenario | Workbench creates an editable draft package. Nothing is published automatically. |
| Generate Injects and Branches | Parser-validated inject and registered-transition changes on the selected draft. Validation is invalidated. |
| Bounded Automation | Opt-in facilitator policy for actor dialogue, allowlisted actions, eligible cue release, and pending-request adjudication. Turn and token leases. Stop AI Now invalidates in-flight turns. |
| Draft Assessment and Draft AI Report | Review-only findings from recorded human actions, and a Review Team draft after completion. Existing inspection, correction, approval, and publication gates remain. |

Default model gpt-4.1-mini. Structured JSON, store disabled, 45-second timeout, 20 jobs per workspace per hour. Failures pause. There is no automatic retry.

## Rules the commands enforce

- An accepted command is a receipt. Execution is a later event, and reconciliation keeps the original command ID.
- Paused or disconnected sessions reject fixture writes. A version mismatch is a conflict and leaves the record unchanged.
- Published scenarios and reports cannot be edited in place. Missing evidence or disputed attribution blocks finding approval. A scored zero stays distinct from not observed and not applicable.
- Corrective-action overdue is derived from the due date. A passed verification needs comparable completed sessions, the source finding, and an explicit acceptance rationale.

### Who can see what

- Program manager and consultant can author, facilitate, review, and open analytics. Consultant scope is Atlas only.
- Organization admin can manage settings and does not receive private coaching records.
- Participant and coach see self or an explicitly named subject. Observer and guest see the live exercise projection and lose program and private records.
- Publisher and operator shells are separate workspaces and do not inherit tenant content.

Program navigation is Overview, Exercises, Scenarios, Reports, Actions, Analytics, People, My development, Recommendations, and Organization. Legacy HTML URLs still resolve. Automated coverage in the status notes reached 69 tests after the bounded-AI expansion, including route round-trips and populated plus empty renders. That suite certifies the fixture harness.

## Design catalog

Taken from the UI reference and integration status page at `/ui-reference`. The page title is UI reference and fixture states. It lives in the program shell and is linked from every screen footer and the help dialog.

### Integration status shown on the page

The warning notice says local Supabase persistence, server workflow guards, and reviewed AI narrative proposals are connected, and that realtime, signing, rights, external jobs, and delivery remain unconnected. The screen table then marks all 70 rows with the same integration value: Local API / synthetic workflow.

### Conventions the page states

| Surface | Established rule |
| --- | --- |
| Cards | Uniform neutral border and shared corner radius. Status is a badge. Decorative colored top edges, scallops, curved highlights, and left-edge accent bars are excluded. |
| Buttons | Primary, secondary, and tertiary. Blue is the action color. Tertiary actions have no shadow. Press scales to 0.96 unless marked static. Disabled controls keep their background, mute text, and use a not-allowed cursor. |
| Badges | Success, warning, and danger may show a check or exclamation. Info and neutral badges are text only, with no leading dot. |
| Forms | Use shared field and select helpers. Required fields show a small blue asterisk with accessible Required text and the native required attribute. Optional fields stay unmarked. |
| Tables | Edit and Remove share secondary button styles inside aligned row actions. Verification cells are icon-only with a tooltip: clock, refresh, check, cross, warning. |
| Identity | Avatar and name sit in a horizontal person cell with 12px spacing. The avatar does not shrink. |
| Filters | Catalog Clear is natively disabled when nothing differs from the defaults. Analytics keeps Search and Period visible. Further filters live in a collapsed All filters disclosure with a chevron and active count. |
| Navigation | Desktop sidebar is 240px, or 72px icon-only. Hover and keyboard focus reveal the label. Collapse preference is local. Mobile uses the drawer. The sidebar tagline is removed. |
| Dialogs | Native dialogs, 16px corners, labelled close, Escape, focus return, and retained input on failure. Inject and objective editors are modal, with draft recovery scoped to command, scenario, and item. |
| Type | 16px body, 14px controls. Displayed headings use Title Case through a presentation helper. Stored narrative, notes, and form input stay unchanged. Timers, zoom, coverage, and AI counters use tabular numerals. |
| Icons | One outline SVG set in currentColor. 1.5px strokes on regular controls, 2px on emphasized primary, destructive, and selected navigation. Import is an inbox with a down arrow. Plus means create. |
| Motion | Explicit 120ms state transitions. Reduced motion removes transitions and press scaling. Color, labels, and selected outlines stay visible without motion. |
| Graph | Light canvas, neutral node cards, blue selection outline. Solid arrows are recorded transition conditions. Dashed links are grouping only. Legend is always visible. Layout is a browser-tab preference. |

Source: Design-system conventions and Scenario graph conventions panels on `/ui-reference`, implemented in `design-tokens.css`, `app.css`, `src/ui.ts`, and `src/workflow-ui.ts`.

### Semantic states on the page

| Sample | Tone | Where statusBadge uses it |
| --- | --- | --- |
| Published | Success | Published, approved, verified, accepted, running |
| Awaiting review | Warning | Draft, in review, disputed, blocked, paused, verification pending |
| Revoked | Danger | Withdrawn, revoked, rejected |
| Connected fixture | Info | Informational fixture connection and simulation labels |
| Not observed | Neutral | Missing observation, default status, and nonnumeric metrics |

### Button variants on the page

| Variant | Role |
| --- | --- |
| Primary | The commit action. Blue fill, stronger icon stroke, restrained press. |
| Secondary | Supporting actions, including Edit, Remove, and most workflow commands. |
| Tertiary | Low-emphasis actions such as Fixture controls. No control shadow. |

Command forms on the page expose pending, a committed receipt, and retained input after failure.

### Fixture states the page tells you to inspect

Loading, Empty, Stale, Error, Expired, Revoked, Disconnected, Conflict.

Inspect states switches persona and these read states. The page also prints the current persona. Command forms keep pending, committed receipt, and retained input on failure.

### Shells

| Shell | Screens | Presentation |
| --- | --- | --- |
| SH-PROGRAM | 35 | Sidebar workspace for planning, review, analytics, people, and settings |
| SH-AUTHOR | 7 | Horizontal section nav for brief, world, graph, objectives, history, validation, and publication |
| SH-EXERCISE | 7 | Dark operational header, simulation clock, and participant task tabs |
| SH-REVIEW | 5 | Evidence inspection, findings, and report composition |
| SH-ACCESS | 4 | Centered card for sign-in, invitation, workspace choice, and organization setup |
| SH-CONTROL | 4 | Facilitator control room with pacing, world, injects, and adjudication |
| SH-PUBLISHER | 4 | Expert identity, review inbox, and publication tracking |
| SH-OPS | 4 | Platform health, catalog governance, support grants, and data jobs |

### Token scale behind those conventions

The reference page demonstrates the components. The values live in `design-tokens.css`. The system font stack is the platform UI font. Branding in settings is described as STRATA identity with a constrained blue accent, and semantic colors stay fixed. The logo adds a coral chevron that is separate from status color.

| Token | Role |
| --- | --- |
| canvas / surface / surface-subtle / surface-selected | Page, card, quiet fill, and selected row. Light only. |
| text / text-muted / text-on-dark | Reading text, secondary text, and type on the exercise header. |
| primary / primary-hover / primary-soft | Blue actions, links, required asterisks, and selection. |
| success, warning, danger, info | Semantic status only. Each has a soft background. They are fixed and are not rebranded. |
| exercise-header / exercise-canvas | Operational shell header and live workspace canvas. |
| type-meta through type-page, type-metric | 12px meta, 14px UI, 16px reading, 20px section, 24px page, 32px metric. |
| space-1 through space-12 | 4, 8, 12, 16, 24, 32, and 48px. |
| radius-control / radius-card | 6px controls and 10px cards. Dialogs use 16px, independent of interior control radius. |
| sidebar-width / sidebar-collapsed-width | 240px expanded and 72px icon-only. |
| shadow-surface / shadow-control | Quiet card elevation and button elevation. Print removes elevation. |
| focus / focus-halo | 2px primary outline plus a 4px halo. Inverse focus is used on dark operational chrome. |
| motion-state / ease-state | 120ms state changes. Surface motion is 180ms. Never transition all properties. |
| chart-1 through chart-4 | Blue, teal, ochre, and purple series for analytics marks. |

## Screen registry

Every registered screen is linked from the reference table. Integration is identical on each row, so this catalog groups the 70 IDs by family and records shell once per screen.

Integration column on `/ui-reference`: Local API / synthetic workflow.

### ACC · Access

| Screen | Title | Shell |
| --- | --- | --- |
| ACC-01 | Sign in and identity recovery | SH-ACCESS |
| ACC-02 | Invitation acceptance and guest verification | SH-ACCESS |
| ACC-03 | Organization and workspace chooser | SH-ACCESS |
| ACC-04 | Organization onboarding | SH-ACCESS |
| ACC-05 | Personal account and security | SH-PROGRAM |

### HOME · Home

| Screen | Title | Shell |
| --- | --- | --- |
| HOME-01 | Private organization overview | SH-PROGRAM |
| HOME-02 | Notifications and activity inbox | SH-PROGRAM |
| HOME-03 | Jobs, downloads, and exports | SH-PROGRAM |

### CTX · Context

| Screen | Title | Shell |
| --- | --- | --- |
| CTX-01 | Organization context profile | SH-PROGRAM |
| CTX-02 | Source documents | SH-PROGRAM |
| CTX-03 | Extracted fact review | SH-REVIEW |

### CAT · Catalog

| Screen | Title | Shell |
| --- | --- | --- |
| CAT-01 | Scenario Library and Expert Editions | SH-PROGRAM |
| CAT-02 | Scenario detail and permitted preview | SH-PROGRAM |
| CAT-03 | Expert profile and attribution details | SH-PROGRAM |

### AUT · Authoring

| Screen | Title | Shell |
| --- | --- | --- |
| AUT-01 | Organization scenario workspace | SH-PROGRAM |
| AUT-02 | Scenario brief and organization bindings | SH-AUTHOR |
| AUT-03 | Roles, actors, world state, and rules | SH-AUTHOR |
| AUT-04 | Injects, channels, and artifacts | SH-AUTHOR |
| AUT-05 | Objectives, opportunities, and rubrics | SH-AUTHOR |
| AUT-06 | Revision history, semantic diff, and AI changes | SH-AUTHOR |
| AUT-07 | Validation and dry run | SH-AUTHOR |
| AUT-08 | Publish scenario revision | SH-AUTHOR |

### PKG · Packages

| Screen | Title | Shell |
| --- | --- | --- |
| PKG-01 | Import scenario package | SH-PROGRAM |
| PKG-02 | Export scenario package | SH-PROGRAM |

### EX · Exercises

| Screen | Title | Shell |
| --- | --- | --- |
| EX-01 | Exercise program and calendar | SH-PROGRAM |
| EX-02 | Exercise scheduling and configuration | SH-PROGRAM |
| EX-03 | Exercise overview and readiness | SH-PROGRAM |
| EX-04 | Lobby, role brief, and participation disclosure | SH-EXERCISE |

### SIM · Simulation

| Screen | Title | Shell |
| --- | --- | --- |
| SIM-01 | Live situation | SH-EXERCISE |
| SIM-02 | Simulated communications | SH-EXERCISE |
| SIM-03 | Evidence library and inspector | SH-EXERCISE |
| SIM-04 | Investigation and action console | SH-EXERCISE |
| SIM-05 | Decisions and commitments | SH-EXERCISE |
| SIM-06 | Shared team workspace | SH-EXERCISE |

### FAC · Facilitation

| Screen | Title | Shell |
| --- | --- | --- |
| FAC-01 | Facilitator control room | SH-CONTROL |
| FAC-02 | World state and actor inspector | SH-CONTROL |
| FAC-03 | Inject queue and pacing | SH-CONTROL |
| FAC-04 | Adjudication and controlled overrides | SH-CONTROL |
| FAC-05 | Recorded session replay | SH-REVIEW |

### REV · Review

| Screen | Title | Shell |
| --- | --- | --- |
| REV-01 | Exercise completion and debrief | SH-PROGRAM |
| REV-02 | Findings and observation review queue | SH-REVIEW |
| REV-03 | Finding, evidence, and correction detail | SH-REVIEW |
| REV-04 | Report composition, review, and publication | SH-REVIEW |
| REV-05 | Published report reader | SH-PROGRAM |

### REP · Reports

| Screen | Title | Shell |
| --- | --- | --- |
| REP-01 | Report library | SH-PROGRAM |

### ANA · Analytics

| Screen | Title | Shell |
| --- | --- | --- |
| ANA-01 | Program analytics | SH-PROGRAM |
| ANA-02 | Exercise analytics and coverage | SH-PROGRAM |
| ANA-03 | Retest comparison | SH-PROGRAM |

### ACT · Actions

| Screen | Title | Shell |
| --- | --- | --- |
| ACT-01 | Corrective-action program | SH-PROGRAM |
| ACT-02 | Corrective-action detail and verification | SH-PROGRAM |

### PEO · People

| Screen | Title | Shell |
| --- | --- | --- |
| PEO-01 | People and role directory | SH-PROGRAM |
| PEO-02 | Participant profile and observations | SH-PROGRAM |
| PEO-03 | Personal development plan | SH-PROGRAM |

### REC · Recommendations

| Screen | Title | Shell |
| --- | --- | --- |
| REC-01 | Recommended practice and offerings | SH-PROGRAM |
| REC-02 | Service offering and contact request | SH-PROGRAM |

### SET · Settings

| Screen | Title | Shell |
| --- | --- | --- |
| SET-01 | Organization identity, branding, and preferences | SH-PROGRAM |
| SET-02 | Members, invitations, and coaching assignments | SH-PROGRAM |
| SET-03 | Partner delegation and support grants | SH-PROGRAM |
| SET-04 | Privacy, retention, data export, and deletion | SH-PROGRAM |
| SET-05 | Plan, entitlements, and usage | SH-PROGRAM |
| SET-06 | Integrations and webhook deliveries | SH-PROGRAM |
| SET-07 | Organization audit history | SH-PROGRAM |

### PUB · Publisher

| Screen | Title | Shell |
| --- | --- | --- |
| PUB-01 | Expert identity and rights setup | SH-PUBLISHER |
| PUB-02 | Expert review inbox | SH-PUBLISHER |
| PUB-03 | Expert content and rubric review | SH-PUBLISHER |
| PUB-04 | Publications, approvals, and revocations | SH-PUBLISHER |

### OPS · Operations

| Screen | Title | Shell |
| --- | --- | --- |
| OPS-01 | Platform health, usage, and jobs | SH-OPS |
| OPS-02 | Catalog governance and entitlement administration | SH-OPS |
| OPS-03 | Scoped support access | SH-OPS |
| OPS-04 | Retention and deletion operations | SH-OPS |
