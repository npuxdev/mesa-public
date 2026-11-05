# MESA — Decision Landscape

Complex operational rehearsal → guided scenario graph and facilitated session → evidence-checked, immutable publication.

The screens use readiness exercises as the demo: incident response, disaster recovery, business continuity, and crisis management, inside two synthetic organizations (Atlas Response Group and Harbor Continuity Group). I care more about the loop than the subject matter. A definition is versioned. A session pins that definition. A publication stores an exact snapshot. Nothing in that chain becomes "approved" because a model wrote a paragraph.

This is a local prototype I built in 2026 (`strata-readiness-ui` 0.2.0, private). It is not a production readiness platform, and it has no public URL.

## The problem

Any program that runs a complicated event and then writes about it hits the same failure mode. The plan lives in one file. The event log lives in another. The score appears in a third, often as a number where the record is "we didn't see it." Later, someone edits the published recap so it matches the story they prefer.

Readiness exercises make that failure obvious, because the vocabulary is already strict: injects, roles, evidence, findings, after-action reports, corrective actions. The same shape shows up in incident reviews, clinical simulations, audit walkthroughs, and change exercises. The demo domain is narrow. The failure is not.

`docs/product/STRATA-CONCEPT.md` states the product bet as a specification, and it says so: the October 8, 2026 document describes a product to build, not a validated platform. What exists in the repo is the local slice I could make honest: author, run, review, publish, and refuse to invent the rest.

## Product strategy

I bet on one loop a facilitator can finish on a laptop.

1. Pick or fork a scenario whose actions come from a registered set, not free-form code.
2. See that scenario as a graph that is a projection of the definition.
3. Run a session that pins the definition at launch.
4. Review findings only when citations have been inspected.
5. Publish a snapshot that cannot be edited in place. Corrections become amendments.

I skipped, on purpose, anything that would look finished and be fake: real sign-in, invitations, billing, expert marketplace, webhook delivery, binary attachments, and a production clock. Those screens exist as routes. Their actions say the service is unavailable. Empty states are part of the product, not a gap I papered over.

I also skipped treating AI as the product. A reviewer can generate a narrative proposal. Acceptance is a separate command, checked against the draft's version and digest. Bounded automation can speak as a synthetic actor. It cannot publish, approve a finding, or turn its own dialogue into a participant score (`docs/engineering/BOUNDED-AI-SPEC.md`).

## Design principles

- **Show the gate.** If approval is blocked, the screen says why. Finding `f-03` is a draft at `not_observed` with no evidence. The review screen says N/O and N/A are not numeric zero.
- **Accepted is not executed.** Commands carry a receipt. Unknown outcomes reconcile the original id instead of appending a second event.
- **Published means frozen.** A digest mismatch is a conflict. The next edit is a draft or an amendment.
- **Projection, not a second model.** The scenario graph reads entities, transitions, and injects. Dragging a node stores a layout preference. It does not create a branch.
- **Role changes the record you see.** Participant views drop facilitator notes and unreleased cues. Admin is not coach. Consultant scope is Atlas only.
- **Withhold the number.** Metrics have display states: supported, not observed, suppressed, incomparable. A small cohort does not become a percentage.
- **One visual system.** Obsidian, Mist, Stone, Basalt, Mineral Gold (`design-tokens.css`). Gold is emphasis, never body text, never a status color. No second theme in the React host.
- **Harness labels are not the product.** `SHOW_FIXTURE_CHROME` marks the local-services banner, screen ids, and fixture controls so they can be hidden. Portfolio stills should be captured with it off.

## System architecture

The browser is a Next.js React host (`web/App.tsx`) that mounts `#app`, a dialog, and a toast, then calls `startSessionController` (`src/app.ts`, `src/session-controller.ts`). The controller matches `src/routes.ts`, asks `HttpAdapter` for a scoped read, and paints an HTML string into the shell. Dev proxies `/api` from port 5173 to the Node API on 4173.

The API (`backend/api.mjs`) checks origin and a CSRF cookie, loads the tenant aggregate from local Supabase, and runs the same command handlers the tests use (`src/workflow-commands.ts`, `src/improvement-model.ts`). Writes are compare-and-swap on `strata_workspaces`. AI calls stay on the server. The browser never sees the service-role key or `OPENAI_API_KEY`.

See `diagrams/architecture.mmd`, `diagrams/data-flow.mmd`, and `diagrams/publish-gate.mmd`.

A line I will stand behind: about a quarter to 30% of `src/` + `backend/` is the workflow kernel. `src/glasshouse.ts` is 808 lines, one scenario, about as large as that kernel. Detail is in `technical-due-diligence.md` at the repo root.

## Key technical decisions

**HTML strings behind a React host.** I needed the domain modules to stay importable from Node tests, and I did not want a second design system. The strangler migration in `docs/engineering/MIGRATION.md` keeps `tsc` output in `dist/` for the API and tests, and Vite output in `web-dist/` for the browser. The cost is real: `session-controller.ts` is 407 lines of orchestration and markup, and several older renderers are no longer on `selectView`. I would not start a new screen that way. I would not pretend the migration is done.

**One aggregate document.** Local Supabase stores a versioned JSON workflow per organization, plus proposal and AI-run tables. That made receipts and immutability testable without inventing a production schema. It will not survive concurrent editors. I documented that instead of implying a platform.

**FNV digest, named as a check, not a signature.** `hash()` in `src/workflow-model.ts` folds JSON into 8 hex characters. Publish and AI accept compare that value so a stale preview cannot commit. It is not a cryptographic signature and it is not a rights proof. Replacing it is a product step, not a copy edit.

**Graph interaction without a graph database.** Nodes are buttons positioned over an SVG. Conditional injects get a solid arrow to the transition they reference. Everything else gets a dashed link to the overview. Shift-click and a labelled dropdown both set the AI target. Keyboard movement is Alt+arrows. Layout keys are `strata-graph-layout:` plus tenant, persona, and scenario. Publication does not read that key.

**Discipline-locked actions.** `allowedActions()` switches on the discipline name. Custom executable prose is rejected. That keeps the dry run inside a resource envelope. It also means a new domain is a code change, not a plugin. I think that is the right trade for a prototype and the wrong trade for a catalog business. The concept doc's "discipline pack" is not implemented as a package you drop in.

## Validation, data, and the review pipeline

Inputs are synthetic on purpose. Atlas ships four catalog scenarios, three exercises, four findings, and two reports (`src/fixtures.ts`). Harbor starts empty in the fixture factory, then the local database installer can add GLASSHOUSE. Names such as Jordan Davis and Casey Morgan are fixture identities.

A finding moves like this:

1. A session records events, messages, and decisions against the pinned definition.
2. A draft finding cites evidence ids and a rubric level, or an explicit `not_observed` / `not_applicable`.
3. A reviewer marks each citation inspected.
4. `finding.approve` refuses an empty evidence list, a disputed status, a non-integer level, or any citation not inspected (`src/workflow-commands.ts`).
5. A report lists approved findings, builds a digest over title, audience, sections, and finding versions, and publishes a snapshot.
6. Later corrections flag dependent publications. The old snapshot stays. Withdrawal and supersession are separate states.

Coverage uses the same idea at program scale. An opportunity counts only with a verified role and a released cue inside the window. Personal, draft, disputed, and intervention-affected observations do not enter the aggregate. If nothing is eligible, the percent is null (`coverage()` in `src/improvement-model.ts`). The overview can show "executive-role comparison" as suppressed. I would rather show a blank than a rounded success rate.

AI sits beside this, not inside the approval. `acceptanceCommand` throws 409 if the draft version or digest moved. The returned payload is an ordinary `scenario.save` or `scenario.inject`. Triggers, audiences, and rubrics are not rewritten by the narrative proposal path (`docs/engineering/LOCAL-SERVICES.md`).

## Specialized UI

**Shells.** Access, program, authoring, exercise, facilitator control, review, publisher, and operations (`Shell` in `src/contracts.ts`). Exercise and control use an Obsidian header and a simulation clock. Program uses the Mist canvas and a collapsible sidebar.

**Scenario graph.** Default on the injects screen. List view is the fallback. Inspector shows the full description; the node card abbreviates. Zoom, fit, reset view, and reset layout are labelled buttons.

**Calendar.** Month and week grids, timezone named, filters kept in the URL, no drag-reschedule (`src/exercise-calendar.ts`).

**Verification icons.** Not scheduled, pending, passed, failed, review required. Icon plus tooltip, not color alone.

**Unavailable services.** Invite, upload, entitlements, webhooks, and expert review render the missing dependency in the button (`data-service="D-ID …"`) and do not pretend the click worked.

**AI review dialog.** Current and proposed text, model, base version, assumptions, Reject and Accept. The shell still says identities are synthetic.

## What works today

I can walk these paths locally with `npm run dev` after `npm run db:start`. Media files below are specified and not yet captured.

**Demo:** `videos/01-scenario-graph-loop.webm` — overview, scenario library, organization scenarios, graph, fit (~26s, pending).

**Demo:** `videos/02-evidence-gate.webm` — findings queue to the not-observed finding, hold on the evidence warning (~24s, pending).

Stills, when captured, should match `screenshots/README.md`:

| File | What it shows |
|------|----------------|
| `screenshots/01-program-overview.png` | Atlas overview: exercise, next steps, metrics that can be suppressed |
| `screenshots/02-scenario-graph.png` | Graph, toolbar, legend |
| `screenshots/03-facilitator-control.png` | Control room for the running rehearsal |
| `screenshots/04-evidence-gate.png` | `f-03`, no qualifying evidence |
| `screenshots/05-entitlement-preview.png` | Preview-only catalog item, export prohibited |
| `screenshots/06-published-report.png` | Immutable recap and digest |
| `screenshots/07-ui-reference.png` | Component conventions |
| `screenshots/08-organization-preferences.png` | Settings shell; no theme switch |
| `screenshots/09-publish-digest.png` | Publish screen with digest and validation |
| `screenshots/10-report-mobile.png` | Published report at 390×844 |

Recorded checks I will cite only with their dates live in `docs/engineering/IMPLEMENTATION-STATUS.md`: route round-trips, populated and empty renders, idempotent command reconciliation, publication immutability, a browser path from catalog fork through publication, and a DOCX structural check. PDF save was not file-inspected. I have not re-run the suite for this portfolio export, so I am not printing a current pass count.

## Limitations and honest scope

- Anyone with the machine can switch personas. That is a development harness (`docs/engineering/LOCAL-SERVICES.md`).
- Remote database URLs are rejected. Good. It also means there is no hosted demo I can link.
- The React migration's open list is most of the product surface. Shell markup is still assembled as strings.
- Duplicate renderers can drift. The unused authoring view still says the AI provider is disconnected.
- GLASSHOUSE answers are hidden in participant projections and still present in compiled JavaScript.
- The digest is not a signature. Rights and expert endorsement screens say verification is pending because it is.
- Analytics and improvement rules exist and are stricter than a dashboard vanity metric. `docs/engineering/IMPLEMENTATION-STATUS.md` notes a phase whose new tests were not executed. I treat that phase as implemented code, not as certified.
- No customer, no production traffic, no instructional-validity study. Competitive notes in the concept doc are market reading, not my results.

## What's next

Tied to gaps I can point at:

- Capture stills and the two videos with fixture chrome off, then fix any caption that does not match the pixels.
- Delete `author()` / unused exercise views only after the React replacement for that family is verified (`docs/engineering/MIGRATION.md` order).
- Pull facilitator-only fields out of the client bundle before any share beyond this machine.
- Swap `hash()` for a real content hash if a snapshot is ever shown to someone who must trust it.
- Add authentication and a normalized schema only when there is a real second user. Not before.

## Reflection

If I strip the ransomware story, what remains is a way to keep a complicated procedure honest: register the legal moves, project them, pin them at runtime, and refuse publication when the evidence is missing. I would put the reusable share at about 25–30% of the application lines, and I would not round up. The rest is readiness vocabulary, a large scenario adapter, and view code.

The lesson I want the case study to carry: progressive disclosure and "AI assisted" are cheap to claim. A disabled approve path, a withheld metric, and a digest conflict are where the design either holds or it doesn't. In this prototype, those three hold inside a local boundary. They do not make it a product you can hand to a customer.
