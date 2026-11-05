# LinkedIn launch post

**Status:** Do not post until `videos/01-scenario-graph-loop.webm` and `screenshots/02-scenario-graph.png` exist, and until MESA / GLASSHOUSE naming is cleared.

## Primary (~200 words)

I have been building a local prototype for a problem that shows up anywhere a team rehearses something serious and then writes a report.

The plan, the session, and the score drift apart. A gap in the record becomes a zero. The published recap gets edited so it reads cleanly.

MESA — Decision Landscape is my workspace for keeping that loop in one versioned record. I author a scenario as a graph that is only a drawing of the definition: solid arrows are real transition conditions, dashed lines are grouping. A session pins that definition when it starts. A finding with no inspected evidence cannot be approved. Not observed stays not observed. The report that follows is a snapshot, not a document you quietly revise.

Where a model drafts wording, a person accepts or rejects it against the current draft. Generation is not approval.

It is a laptop harness: TypeScript, a React host, a Node API, local Supabase. Synthetic identities, no production deploy, no customers. I would rather show the gate than imply a platform.

Clip: overview to the scenario graph, under 30 seconds.

## Alternate hooks

1. Dashed lines in a scenario graph are not a plot branch. They are a grouping. The rule is the product.
2. I refused to turn "not observed" into a score. The review screen says so, and the command rejects the approval.
3. Most of this UI is still HTML strings inside a React shell. The part I trust is the command path underneath, not the framework badge.

## Suggested image

`screenshots/02-scenario-graph.png` — graph and legend, fixture chrome hidden.

## Suggested video

`videos/01-scenario-graph-loop.webm` — primary loop only. Video 02 is for the portfolio page, not the launch post.

## Comment-thread FAQ

- **Production?** No. Local synthetic tenants.
- **Does AI run the exercise?** It can draft text or, if a facilitator opts in, act inside a token budget. It cannot publish or score people. The clip does not show a live model call.
- **Stack?** TypeScript, React, Vite, Node, local Supabase.
