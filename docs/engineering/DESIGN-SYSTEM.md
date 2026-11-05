# MESA interface conventions

Product identity: **MESA — Decision Landscape**. Shared tokens live in `design-tokens.css`; shells and components in `app.css`; mark and primitives in `src/ui.ts`. The Next.js host and remaining HTML-string views share this system—do not introduce a second theme during the React migration.

## Brand identity

| Token | Value | Role |
| --- | --- | --- |
| Obsidian `--obsidian` | `#1B2B2A` | Text, primary buttons, operational header, wordmark |
| Mist `--mist` | `#E9EDE8` | Page canvas |
| Stone `--stone` | `#D7D2C8` | Borders and structure |
| Basalt `--basalt` | `#6E7A77` | Secondary / muted text |
| Mineral Gold `--mineral-gold` | `#B9B36A` | Selection, focus, chart emphasis, live labels |

`--primary` maps to Obsidian. Mineral Gold is never body text and never a status color. Gold fills (`.btn.accent`) are reserved for large emphasis on dark surfaces with Obsidian labels after contrast checks. Success, warning, danger, and info remain distinct semantic hues.

**Typography:** `--font` prefers Söhne with Helvetica Neue / system fallbacks; `--mono` prefers Söhne Mono with the system mono stack. Commercial font files are not vendored. Wordmark: heavy uppercase MESA with tight tracking; “Decision Landscape” is small, widely tracked uppercase.

**Marks:** `logo('full')` = terrain SVG + wordmark (access, expanded sidebar). `logo('compact')` = terrain mark only (collapsed sidebar, exercise header). Favicon is the mark on a rounded Obsidian squircle.

**Atmosphere:** Topographic contour treatments are allowed on `SH-ACCESS` and the program overview hero (`.mesa-terrain`). Other program, authoring, review, publisher, and operations screens stay Mist canvas with dense panels. Exercise / facilitator shells use an Obsidian header and Mist content; gold marks live / facilitator labels only.

**Legacy leftovers:** Pre-MESA prototype JS/CSS (`portal.js`, `prototype.js`, `script.js`, `portal.css`, `screens.css`, `styles.css`) were removed. Internal identifiers (`strata-scenario`, `strata-workflow-v2`, draft / graph keys, DB tables) stay as integration contracts and are not renamed for branding.

## Shared Interface Polish

Keep the existing plain CSS/token system. Prefer the Söhne stack above when licensed locally; otherwise system fallbacks apply. Apply macOS font smoothing at the root, balance short headings, and use pretty wrapping for short descriptions only. Dynamic timers, graph zoom, coverage values and AI runtime counters use tabular numerals. Do not change narrative or stored data to achieve visual polish.

Use `--shadow-surface` for quiet panel/card elevation and `--shadow-control` for buttons. Retain structural dividers and accessible input/selection borders; tertiary actions have no shadow. Avoid hover lift, decorative edge accents, and heavy per-card shadows. Print removes elevation. AI panels share `--radius-card`; dialogs use 16px corners, independent of widely padded interior controls. Close nested surfaces should follow outer radius = inner radius + padding, rather than copying equal radii.

Desktop small buttons, text actions, labelled checkbox rows and verification indicators have at least 40px targets. Filter buttons align with 44px inputs; coarse-pointer targets rise to 44px without overlapping pseudo-elements. Keep keyboard focus outlines and the shared focus halo visible. Disabled controls retain their background on hover, use muted text/opacity and a not-allowed cursor, and must still be behaviorally disabled by native attributes or the existing action guards. Invalid fields retain their danger border during focus.

Icons remain one outline SVG set using `currentColor`: 1.5px strokes for regular controls, 2px for emphasized primary/destructive buttons and selected navigation. Text-plus-icon buttons use 2px less padding on the icon side. Do not swap assets or add an animation dependency. Content images use a pure-black 10% inset outline; transparent artwork can opt out with `data-unframed`.

Use explicit 120ms CSS state transitions, never `transition: all`. No new page-load, row-hover, icon-swap or graph-position animation is introduced. Primary/destructive actions have restrained `.96` press feedback; add `data-static` when movement would distract. Reduced motion disables transitions and press scaling. Preserve static color, labels, selected outlines and semantic states independently of motion. See [INTERFACE-POLISH-REVIEW.md](../archive/INTERFACE-POLISH-REVIEW.md) for inspection coverage and verification limits.

## AI Proposal Review

Retain neutral panels and Obsidian / Mineral Gold action tokens. Separate Save Local Request from Generate AI Proposal; disclose selected context is sent to OpenAI. Disable generation while pending; announce progress/errors in the status region. Show escaped current/proposed text side by side, stacked on narrow screens, plus model/base version and assumptions. Use explicit Accept Reviewed Changes and Reject Proposal buttons; never treat generated content as approved evidence. Shared dialog focus/close rules apply. AI History restores pending proposals. Conflicts require regeneration; no silent overwrite or retry. The shell identifies synthetic development identities and Supabase persistence.

## Scenario graph workspace

Use grab/grabbing cursors for canvas panning and node arrangement. Dragging must not trigger click inspection or change scenario logic. Keep connector geometry attached to moving nodes at every zoom level. Provide keyboard movement (Alt + arrows; add Shift for larger steps), Reset View, and Reset Layout. Persist node arrangement only as a tenant/persona/scenario-scoped browser-tab preference; publication immutability is unchanged.

All scenario-authoring sections use the same horizontal navigation above their content; do not use a vertical section rail. This applies to brief, world, graph/list/preview, objectives, history, validation, and publication, for drafts and published revisions. Wrap links on desktop and allow horizontal scrolling on narrow screens. Give the graph the full available program content width rather than the 760px settings-form column. On desktop, canvas height scales with the viewport (620–900px); smaller screens retain scroll navigation and a stacked inspector.

Use the Mist canvas, Stone card borders, Mineral Gold selection/focus, and shared typography—not the reference screenshots' dark/purple visual style. Overview, registered transition/option, and inject nodes have labelled type headers and restrained icons. Node selection uses a uniform gold outline, never a curved or colored top-edge decoration. Solid directed links mean recorded transition conditions; dashed links mean non-executable overview grouping. Always show the legend.

Keep zoom in/out, scale, fit-width, reset, and list-view controls discoverable. Use a scrollable canvas with a side inspector; stack the inspector below the canvas at narrower widths. Node cards abbreviate long content, while the inspector displays the full description. Selected nodes expose `aria-pressed`; node buttons, controls, and inspector actions remain keyboard accessible. Shift-click targeting is an accelerator, not the only input method: provide a labelled target dropdown.

The targeted-change composer must visibly say that the AI endpoint is unconnected and that saving stores only a local request. Use explicit save feedback and never show generated/successful scenario changes without a committed authoring command. See [SCENARIO-GRAPH-SPEC.md](SCENARIO-GRAPH-SPEC.md) for semantics and interaction contracts.

Shared tokens are defined in `design-tokens.css`; shared components in `src/ui.ts` and `src/workflow-ui.ts`; styles in `app.css`. The UI reference route shows the component conventions.

## Cards and spacing

Never use decorative left-edge bars, accent borders, or inset left-edge shadows. Current navigation, channel, and section selection uses background, text weight, and semantic `aria-current` state instead. Ordinary one-pixel structural dividers between regions remain permitted; focus outlines remain visible.

## Titles, verification, and calendars

All displayed headings and view/section titles use Title Case. Preserve acronyms and identifiers; minor connecting words stay lowercase except at the beginning/end. Apply presentation casing through `titleCase()` / `applyTitleCase()` without rewriting stored narrative, notes, or form input.

Verification table cells use icon-only indicators for Not Scheduled (clock), Pending (refresh), Passed (check), Failed (cross), and Review Required (warning). Each indicator has an accessible explanation and a tooltip on hover or keyboard focus. Do not rely on color alone or replace the column header with an unexplained symbol.

Exercises Calendar supports Month and Week grids with Previous, Today, and Next navigation. Show the workspace timezone explicitly; group exercises by that timezone's calendar day. Calendar event cards link to the existing exercise overview. Preserve search/status/discipline filters while navigating or applying filters. Narrow screens scroll the calendar grid horizontally instead of shrinking event text. Calendar navigation is read-only; no drag-rescheduling or external calendar sync is implied.

Team Workspace uses equal-width columns: note and handoff editors align in the first row, history and handoffs in the second row. Shared form margins, padding, and action placement keep both columns uniform; stack the rows on mobile.

Neutral and informational tags are text-only: do not prepend bullet/dot characters. Success and warning/error tags may retain their meaningful check/exclamation indicators. Metadata separators outside tags are unaffected. Use the shared `badge()` / `statusBadge()` helpers for consistent rendering.

Cards use a uniform neutral border and consistent corner radius. Do not add decorative colored top edges, scallops, or curved highlights. Use a status badge to communicate state. Separate adjacent situation and event-feed panels by 24px.

## Forms

Catalog Clear is disabled when no applied or pending filters differ from the defaults. Update its native disabled state as users type or change selections. Clearing removes search and facets, but preserves the catalog collection and Cards/Table view. Do not imply that an empty filter set has something to clear.

Use `field()` and `select()` rather than handwritten labels. Required fields use `requiredMarker()`: a small Obsidian asterisk, with accessible “Required” text and a title. Keep the native `required` attribute for validation. Do not append “(required)” or “(optional)” to labels. Optional fields are unmarked; explain conditional requirements in helper text. Use this convention for filters and command forms alike.

Analytics keeps Search and Period visible, alongside Search, Reset, and Save this view actions. Additional controls live in native `details` under “All filters,” closed by default. The summary has a filter icon, chevron, explanatory text, and active-filter count. Selecting Custom dates opens the advanced controls. Collapsing never clears values; either submit action applies the complete selection. Date helpers must not create uneven control alignment.

## Navigation and identity

Desktop navigation toggles between `--sidebar-width` (240px) and `--sidebar-collapsed-width` (72px). The collapse/expand button is labelled and keyboard accessible. In collapsed mode, icons retain accessible names; hovering or focusing a navigation item exposes its full name. Store the preference locally without rerendering unsaved forms. Mobile retains its existing drawer behavior. Do not display the former sidebar tagline.

Use `.person-cell` to place an avatar and name horizontally, with 12px spacing. Keep the avatar non-shrinking.

## Actions and icons

Import uses `icon('import')`, an inbox with a down arrow. Plus is reserved for creation. Use `.row-actions` for aligned table actions; Edit and Remove have matching secondary button presentation. Navigation may remain a button-styled anchor when it changes the route; dialogs use real buttons.

## Authoring dialogs

Add/Edit Inject and Add/Edit Objective launch labelled native dialogs. Do not leave an editor visible beneath its table. Dialogs support Escape, a labelled close control, keyboard focus, native validation, and retained input on failure. Draft recovery is scoped by command, scenario, and edited item. Only an explicit successful save commits changes; published revisions remain immutable.
# AI Workbench Components — October 10, 2026

Use the established MESA Mist surfaces, Obsidian / Mineral Gold action tokens, panel borders and modal/field components. Do not introduce a separate AI theme or left-edge decoration. Place the workbench beneath relevant authoring, facilitator and debrief headings. Separate editable draft generation from runtime authority and review-only conclusions in visible helper text.

Automation policy dialogs must default to off/no selected actions, show actor/audience allowlists, maximum turns, conservative token budget, interval and clock step, and require disclosure authorization. Keep Stop AI Now directly accessible in the control-room header. Status exposes completed/reserved turn and token counts, pause reasons and billable cancellation limitations; polling must not overwrite unsaved form values. Starting a run is explicit, and resume/reload never re-enables it silently.

Job history shows operation, state, model/token usage and links to actual resulting draft resources. Use honest pending/failed outcomes and preserve request IDs after interrupted responses. Assessment links lead to existing evidence review; report links lead to composition/approval, never a claimed published result. Individual findings remain scoped; actor-generated artifacts are visibly labeled synthetic and never displayed as participant competency proof. See [BOUNDED-AI-SPEC.md](BOUNDED-AI-SPEC.md) in this folder.
