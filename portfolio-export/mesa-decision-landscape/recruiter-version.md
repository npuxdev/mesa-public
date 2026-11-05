# Recruiter version

I designed and built MESA — Decision Landscape, a local prototype of a governed operational workflow. The user-facing brand is MESA. The repository and storage contracts still use the name STRATA.

The work covers product structure and implementation. A scenario is a versioned definition of roles, registered actions, timed or conditional injects, and rubric anchors. I render that definition as a graph without creating a second model. Sessions pin the definition at launch. Commands return receipts (`accepted` is not `executed`). Findings require inspected evidence. `not_observed` is not stored as zero. Reports publish an immutable snapshot keyed by a content digest. Model output is a proposal until a person accepts it against the current version.

The stack is TypeScript, React 19 and Vite for the host shell, HTML view functions shared with Node tests, a Node HTTP API, local Supabase, and the OpenAI Responses API for structured proposals. The interface follows a single token system (Obsidian, Mist, Stone, Basalt, Mineral Gold) with explicit empty and unavailable states, keyboard-reachable graph controls, and verification icons that do not rely on color alone.

Scope is a working local harness with 70 registered screens, not a production multi-tenant service. Authentication is synthetic on purpose. The React migration has started; most screen bodies are still strings. I can walk the case study and two short silent clips: the overview-to-graph loop, and the evidence gate.

Full write-up: `case-study.md` in this folder. Demo clips are specified and still pending capture.
