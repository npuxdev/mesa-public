# MESA — Decision Landscape

Portfolio package for the local readiness harness in this repo. The product name on screen is **MESA — Decision Landscape**. Contracts, storage keys, and the npm package still say STRATA.

**Pattern:** complex operational rehearsal → guided scenario graph and facilitated session → evidence-checked, immutable publication.

The demo domain is tabletop exercises (incident response, recovery, continuity, crisis). The thing worth hiring for is the workflow: a versioned definition, a pinned session, and a publication that cannot move until a person has inspected the evidence. Generated text stays a proposal.

## Contents

| File | Purpose |
|------|---------|
| `case-study.md` | Long-form case study |
| `case-study-short.md` | 250–400 word cut |
| `project-summary.json` | CMS summary, limitations, media slots |
| `technical-architecture.md` | Modules, data, request flows |
| `storytelling-notes.md` | Narrative, 30s scripts, what not to claim |
| `linkedin-launch-post.md` | Launch post and hooks |
| `recruiter-version.md` | Hiring-manager cut |
| `consulting-version.md` | Engagement shape and boundaries |
| `asset-inventory.md` | Status, proof points, open questions |
| `diagrams/*.mmd` | Architecture, data flow, publish gate |
| `screenshots/README.md` | 10-shot list (PNGs pending) |
| `videos/README.md` | Two ≤30s flows (media pending) |
| `videos/flows/*.flow.json` | Re-runnable capture scripts |
| `snippets/*.md` | Interview excerpts with real paths |
| `seo/` | Title, description, keywords |
| `../../technical-due-diligence.md` | Evidence note at repo root |

`open-source-positioning.md` is omitted. `package.json` is `"private": true` and no release intent is recorded.

## Status

Local prototype, 2026, version 0.2.0. No public demo. Screenshots and both videos are **Pending** until capture runs against a live `npm run dev` server.

## Limitations

- Synthetic identities, not authentication. Do not deploy.
- One JSON aggregate per organization in local Supabase. Not a normalized production schema.
- Most screens are HTML strings inside a React host shell.
- Digests are a non-cryptographic hash.
- AI proposes; a person accepts. AI does not publish, score, or approve.
- Test counts in older notes (36 / 69 / 70) are historical. Re-run before quoting.

## Publish workflow

1. Confirm brand clearance (MESA, STRATA, GLASSHOUSE, synthetic names).
2. Capture screenshots (`SHOW_FIXTURE_CHROME=0`).
3. Capture the two videos.
4. Re-read the case study against the stills.
5. Fill CMS from `case-study-short.md` and `project-summary.json`.
6. LinkedIn uses video 01 only after the file exists.

## Stack

TypeScript, React 19, Vite, Node HTTP API, local Supabase, OpenAI Responses for reviewed narrative proposals. Package manager: **npm** (`package-lock.json`).
