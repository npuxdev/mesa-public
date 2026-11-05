# Scenario graph workspace

## Local AI Proposal Increment — October 10

The graph now connects to local Node API/Supabase persistence and server-side OpenAI Responses inference. Generate AI Proposal targets overview or existing inject narrative only; registered transition edits remain manual. Show current/proposed text, model/base version, rationale and warnings in the review dialog. Explicit acceptance checks draft status, base version and digest, preserves timing/roles/conditions, and invalidates validation. Rejection leaves scenario content unchanged. AI History retrieves durable proposals after reload. Saving local requests remains unbilled/browser-only. See `docs/engineering/LOCAL-SERVICES.md` for data disclosure, limits and identity limitations; it supersedes older no-endpoint/deferred-AI notes below.

Status: local frontend implementation, October 10, 2026. Route: AUT-04 (`/o/:orgSlug/scenarios/:scenarioId/revisions/:revisionId/content`). Graph is the default; `?view=list` selects the existing complete table. Participant preview queries continue to show the role-scoped preview.

## Data and graph semantics

The graph reads `AuthorState.definition` from the current fixture scenario. Node positions are a browser-tab layout preference scoped by tenant, persona, and scenario, never a separate scenario/execution authority.

- Overview node: scenario title and summary; links to Brief & bindings.
- Registered option / transition nodes: transition name, authorized role, target, state change, and registered action. Links open World & roles for that transition.
- Inject nodes: title, trigger, simulation minute, channel, and participant message. Selection exposes the full text in the inspector.
- Solid directed edges: a condition-triggered inject references a registered transition ID.
- Dashed edges: overview grouping only. They do not claim sequence, causal relationships, role authorization, or executable branching.
- Missing condition references do not produce invented edges; existing scenario validation remains authoritative.

## Interaction contract

1. Select a keyboard-focusable node to update the inspector and its pressed state. Selecting is read-only.
2. Edit Inject opens the shared labelled authoring dialog. Successful saves use the existing version/idempotency contracts and regenerate the graph; failed saves preserve form input. Add Inject uses the same dialog. Published injects offer no edit action; fork a draft first.
3. Zoom in/out adjusts a bounded 25–150% canvas scale. Fit fits the graph width; vertical content remains scrollable. Reset returns to 100%. The canvas supports normal scroll navigation; controls do not change scenario data.

Drag blank canvas space to pan freely; drag a node to reposition it. Apply a five-pixel movement threshold so normal clicks still inspect nodes. Pointer capture begins only after dragging starts; release/cancel clears drag state and prevents a completed drag from triggering inspection. Node deltas are adjusted for zoom, connectors redraw continuously, and canvas bounds expand to contain the arrangement. Mouse, pen, and single-pointer touch share the same interaction. Native scrolling remains available.

Alt + Arrow keys move a focused node by 10 graph pixels; Alt + Shift + Arrow keys move by 50. Reset View returns zoom, pan, and scroll to the origin; Reset Layout additionally restores the generated node arrangement. Layout changes are permitted on published views because they do not alter scenario data, dependencies, revision digests, or publication status. Removed node positions are ignored when definitions change; new nodes retain their generated positions.
4. List view preserves access to all table actions, role previews, and removals. Transition and brief editors remain on their existing routes.
5. Shift-click targets the selected node and focuses the change-request textarea. The labelled target dropdown provides the same capability without a modifier gesture. Requests require a target and non-empty text.
6. Save local request stores target/text in sessionStorage, scoped to tenant, fixture persona, and scenario. Reopening recovers it; unavailable storage reports failure. This is a planning note, not an applied change or AI response. Published scenarios cannot save requests. No upload or external endpoint is added.

## Responsive and accessible presentation

All scenario sections use horizontal navigation above their content, including list and preview routes; the vertical authoring rail is removed. The graph uses a full-width authoring layout, not the narrow settings-form column. Desktop canvas height scales from 620–900px with the viewport.

Use STRATA's neutral panels, blue interaction states, readable typography, uniform borders, and existing tokens. A dotted light canvas distinguishes the graph workspace without adopting the screenshots' dark/purple styling. The inspector sits alongside the canvas on wide screens and below it at narrower widths. Nodes are native buttons with descriptive text and focus/selection outlines. Full descriptions remain available in the inspector despite abbreviated node cards. Edges have a textual legend; all controls are labelled. Graph data is escaped, including embedded JSON; no scenario text is executed as markup.

## Verification and exclusions

Strict TypeScript build is checked for this increment. Browser acceptance and full regression verification remain pending. Acceptance should cover selection, modifier-free targeting, zoom bounds/fit/reset, scrolling, dialog save/failure/recovery, published immutability, conditional edge accuracy, malicious text escaping, list/preview routes, request storage scope, and narrow-screen behavior.

Deferred: arbitrary decision/story graph schema, edge drawing, graph-specific undo history, AI proposal generation or automatic mutation, ingestion/scanning, realtime collaboration, and production persistence. A future branching model must define option eligibility, consequences, convergence, termination, validation, packaging, and runtime execution before such edges are presented as executable.
# AI Branch Authoring Addendum — October 10, 2026

The AI Workbench adds complete scenario and inject/transition generation alongside the original reviewed narrative-proposal inspector. A branch is a real registered transition plus optional conditional follow-up inject, not an inferred edge from narrative text. Parser/domain checks reject missing entity/action/condition IDs, invalid role audiences, unreachable states and resource violations before committing draft changes. Existing role/rubric/rights/binding definitions remain untouched by expansion. Every generated change invalidates validation and dry-run state; publication remains explicit.

The participant action console selects and reconciles exact transition IDs, supporting alternatives with the same action verb/target without silently choosing the wrong branch. Actor-only actions and opt-in bounded runtime execution are defined in [BOUNDED-AI-SPEC.md](BOUNDED-AI-SPEC.md). No in-progress pinned scenario is changed by authoring generation.
