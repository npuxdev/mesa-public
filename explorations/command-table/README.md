# Spatial Command Table

A standalone illumination lab for the MESA command table. The implementation lives in `explorations/command-table` and is not mounted in the product shells or the marketing site.

Open it at [http://127.0.0.1:3000/explore/command-table](http://127.0.0.1:3000/explore/command-table) while the Next dev server is running. That route is not linked from product or marketing navigation.

## Responsibilities

| Piece | Role |
| --- | --- |
| `CommandTable` | Product surface. Renders `scene` and `lighting` props. It does not know where they came from. |
| Lighting components | Draw the room, the table, contact shadows, and one pool per seat. |
| `FocusState` | Application state. Changing it moves every local pool. |
| `CommandTableWorkbench` | Development instrument. Owns the shared state and can be unmounted without touching the scene. |

`CommandTableScene` does not render the workbench. Hiding the workbench leaves the current focus and lighting in place.

## Component API

```tsx
import { CommandTable, defaultLightingConfig } from "@/explorations/command-table";

<CommandTable
  scene={{
    participants,
    focus: { mode: "group", participantIds: ["security", "legal"] },
    context: {
      eyebrow: "Inject 04",
      title: "Customer Data Exposure Confirmed",
      description: "Security validated unauthorized access to the billing archive.",
      progress: "Decision window · 12 min",
    },
  }}
  lighting={defaultLightingConfig}
/>
```

`onParticipantSelect(id, { multi })` is optional. Without it the table is read-only and focus still updates when the parent changes `scene.focus`. `multi` is true for shift-click, meta-click, and shift-Enter.

`debug` draws seat anchors, pool centers, falloff edges, table geometry, and scene bounds. It is visual only.

## Focus

```ts
setFocus({
  mode: "group",
  participantIds: ["security", "legal"],
});
```

`useCommandTable()` exposes that operation. Pools are created from the focused participants, one instance each. Overview ignores those ids and leaves the room broadly lit. Unknown ids are dropped. Individual focus keeps a single id.

## Configuration model

The design space is 800×520. The table center is `(400, 263)`, with radii 342 and 164. Seat coordinates live in `config/participantLayouts.ts`. Portrait pixels are billboards: the table’s ellipse is not applied to their contents. A uniform depth scale (0.96–1) is the only size change, and it does not rotate them.

| Field | Unit | Default | Range |
| --- | --- | --- | --- |
| `ambientPreset` | `daylight` \| `cool` \| `warm` | `daylight` | preset table |
| `ambientIntensity` | 0–1 | 0.86 | 0–1 |
| `spotlightIntensity` | 0–1 | 0.74 | 0–1 |
| `spotlightRadius` | scene units, horizontal | 138 | 70–260 |
| `spotlightDiffusion` | 0–1 falloff | 0.70 | 0.15–0.95 |
| `shadowStrength` | 0–1 | 0.48 | 0–1 |
| `transitionDuration` | milliseconds | 450 | 0–1200 |

Vertical pool radius is `spotlightRadius × (164 / 342)`, so a round pool in table space stays foreshortened. Diffusion moves the gradient’s falloff stop. The outer stop is always transparent, so pools have no hard edge. Preset colors live in `config/lightingPresets.ts` and are written onto the scene as CSS variables. Slider ranges and the defaults are the same list in `config/parameterSchema.ts`.

Copy JSON from the workbench writes:

```json
{
  "lighting": {},
  "focus": { "mode": "individual", "participantIds": ["security"] }
}
```

Import accepts that document, a bare lighting object, or a `focus` object alone. Values outside the ranges above are rejected.

## Styles

The lab layout imports `styles/command-table.css` and `styles/lighting.css`. Mounting `CommandTable` on another route needs those stylesheets. They are not part of `app.css`.

## Motion and accessibility

Focus, radius, and shadow geometry transition on `cx`, `cy`, `rx`, `ry`, and `opacity`. Seat elevation uses `transform`. `prefers-reduced-motion` and the scene’s reduced-motion flag collapse those durations. Every seat stays fully readable. Selection is a 1px accent ring, a slight lift, a stronger contact shadow, and `aria-pressed` — not light alone. A polite live region announces the focus summary. Seats are buttons in tab order. Workbench controls are native radios, checkboxes, and sliders with a 40px minimum target.
