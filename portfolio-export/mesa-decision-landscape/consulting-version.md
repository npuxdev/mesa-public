# Consulting version

## Problem class

Teams that run a structured event — a rehearsal, an inspection, a simulation, a facilitated workshop — and then need a record someone can defend. The symptoms are familiar. Branching procedures live in slides. Facilitator notes leak into participant views. Scores appear where the observer wrote "not seen." The final PDF no longer matches the session that was run.

I prototype the spine of that system. I do not sell a readiness SaaS.

## What I can repeat

- A domain model of legal moves, roles, and evidence, separated from the prose.
- A projection UI (graph, queue, or checklist) that cannot fork the stored definition by dragging.
- Command receipts with version checks, so a stale form does not overwrite a newer draft.
- Role-shaped reads: participant, facilitator, reviewer, observer.
- An approval gate that refuses missing citations and refuses to coerce "not observed" into zero.
- Immutable snapshots plus amendments, instead of editing the published artifact.
- A human accept/reject step in front of any model draft, bound to a content digest.
- Interface rules for empty, denied, and not-connected services so the demo does not invent integrations.

The reference build uses TypeScript, a React host, Node, and local Postgres. The client stack can change. The gates should not.

## Engagement shape

1. **Discovery.** Map the real artifacts (procedure, session log, score, published recap) and the decisions that must stay human.
2. **Prototype.** One tenant, synthetic data, two paths: authoring projection and evidence-gated publication. Unavailable integrations stay labelled.
3. **Handoff.** Schema and command list, projection rules, and a written list of what is still a fixture. No production auth unless that was the engagement.

Typical artifact set matches this package: a short case narrative, architecture diagrams, and two recorded paths.

## Boundaries

I will not claim production readiness, certification, or learning outcomes from this prototype. I will not put confidential client procedures in a browser bundle the way GLASSHOUSE currently ships inside this repo; that is a limit I would fix before a client pilot. I will not price model tokens as a guaranteed budget. I will not present persona switching as identity. If the engagement needs real SSO, a normalized schema, or a signed export, that is a later phase with its own scope, not a slide I add to this case study.
