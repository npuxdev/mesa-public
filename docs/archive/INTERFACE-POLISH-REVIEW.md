# Interface Polish — October 10, 2026

Mode: **full**. Scope: the runtime workspace loaded by `index.html` (`app.css`, `design-tokens.css`, shared TypeScript UI). Framework: native HTML and TypeScript. Styling: the existing plain CSS and design tokens. No new framework, motion library, font, or styling system.

Boundary: every current HTML entry loads `/app.css`. Unused prototype sheets (`styles.css`, `screens.css`, `portal.css`) are not linked and were not restyled. Graph dragging, report-length prose, and structural dividers were inspected and left as they are.

## Coverage

| Category | Evidence inspected | Result |
| --- | --- | --- |
| Typography | Root smoothing, heading/body wrap, clocks, metrics, tables, dates, badges, dialog copy | 2 refinements |
| Surfaces | Buttons, breadcrumbs, catalog toggle, fixture action, fields, dialog, empty state, image rule | 1 refinement |
| Animations | Press scale, sidebar icon swap, filter chevron, reduced-motion opt-out; frame samples of both motions | 3 refinements |
| Icons | `src/ui.ts` SVG helper, nav/button/tab/link/filter strokes, help-row stroke, collapse/expand pair | 2 refinements |
| Performance | Runtime transitions, `package.json` (no motion dependency), no `will-change` | Clear |

## Findings and changes

#### Minimum hit area

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `app.css:86`, `app.css:87`, `app.css:88`, `app.css:102` | Breadcrumb link had no target height; catalog Cards/Table controls were 36×32; fixture “Inspect states” was 24px tall | Breadcrumb and fixture actions are 40px tall (44px on coarse pointers); catalog toggle links are at least 40×40 | Small targets are hard to hit, especially on touch |

#### Scale on press

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `app.css:59`, `app.css:68`, `app.css:69`, `app.css:103` | Only primary and destructive buttons scaled, and only those buttons opted out under reduced motion | Every `.btn`, icon button, and sidebar toggle uses `scale: 0.96` on press, with `data-static` and reduced-motion opt-outs | Press feedback should be available on ordinary controls and must not move when motion is reduced |

#### Match icon stroke to text weight

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `src/ui.ts:14`, `app.css:84`, `app.css:85` | SVG attribute was `1.6`; only primary, destructive, and the current nav icon stepped up to `2` | Default stroke is `1.5` beside regular text; buttons, navigation, tabs, text links, and filter summaries use `2` | Medium and semibold labels were paired with a lighter stroke than their text |

#### Tabular numbers

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `app.css:48` | Tabular digits covered clocks and a few metrics only | Also applied to table cells, date tiles, calendar days, metric comparisons, badges, table footers, and the event counter | Changing counts and times were still able to shift nearby text |

#### Text wrapping

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `app.css:47` | Pretty wrapping covered page, panel, card, notice, empty, list, task, and AI copy | Also covers dialog, settings, timeline, access, graph, chart, message, list, help, facilitator, and prototype notes | Short interface copy could still leave a single word on the last line |

#### Contextual icon animation

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `src/app.ts` sidebar toggle, `app.css:89`–`app.css:92` | Collapse replaced one icon with another instantly | Both icons stay mounted and cross-fade with opacity, `scale(0.25)` to `1`, and `4px` blur over 300ms | The state change had no directional motion; the label and sidebar width remain the static cues |

#### Interruptible animation

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `app.css` analytics summary chevron | The filter chevron snapped to 180 degrees | `transform` transitions over the existing 180ms state timing | Opening and closing the filter disclosure can reverse mid-turn |

#### Image outlines

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `app.css:101` | The inset black 10% outline applied only inside `.main-content` | Any `img` except `data-unframed` gets the same outline | A dialog or header image would have missed the neutral edge |

## Considered but rejected

| Location | Candidate | Rejected because |
| --- | --- | --- |
| Panels, tables, inputs | Replace structural borders with elevation shadows | Dividers, selected rows, and input outlines communicate structure and state; the shared surface shadow already supplies depth |
| Page changes and graph nodes | Stagger entrances or scale nodes while dragging | Route and filter updates are frequent, and node motion would fight pointer tracking |
| Play glyphs and RTL flips | Optically shift a play icon and mirror directional icons | No play control is rendered, and the workspace does not set a right-to-left direction |
| Filter and choice containers | Force concentric radii onto the 10px card token | Nested controls sit behind 16px or more of padding, so they read as separate surfaces |
| Animated elements | Add `will-change` | Frame samples did not show a first-frame stutter, and extra layers are not free |

## Verification

- `npm test`: TypeScript build and **70 passing tests**, including the shared CSS polish contract.
- Browser at `http://127.0.0.1:4173/o/atlas`: root smoothing `antialiased`; heading wrap `balance`; description wrap `pretty`; metric digits `tabular-nums`.
- Measured targets: breadcrumb link 40px tall, fixture action 40px, nav links 44px, collapse control 44px, catalog Cards/Table 40px tall inside a 6px shell with 3px padding and 3px inner corners, analytics summary 44px, filter fields 44px, dialog close 44×44, dialog radius 16px.
- Sidebar collapse and expand: width moved between 72px and 240px; the label hid only while collapsed; icon samples moved through opacity, `scale(0.25)`–`1`, and blur `4px`–`0` over about 300ms. The resting icon is fully visible and the other stays at `scale(0.25)`, opacity `0`.
- Analytics “All filters”: chevron samples rotated to 180 degrees over about 180ms; summary icons computed `stroke-width: 2px`. Help copy uses pretty wrapping; help icons beside regular text stay `1.5px`. Dialog backdrop is `oklch(0 0 0 / 0.38)`. Catalog table cells use `tabular-nums`. No `img` elements are currently rendered.
- **Not verified:** DevTools Animations panel at 10% speed, physical touch, the operating system’s reduced-motion setting, print preview, non-Chromium engines, and every route and persona. Reduced-motion behavior was checked as a source rule.

## Verdict

**Approve** for the shared runtime refinements above. Unverified checks: 10% Animations-panel playback, physical touch, OS reduced motion, print preview, cross-browser rendering, and exhaustive route/persona coverage.
