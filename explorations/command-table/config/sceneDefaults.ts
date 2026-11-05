/**
 * Shared design space for every spatial object.
 * Scene units match the SVG viewBox. One unit equals one CSS pixel
 * before the stage is scaled to the viewport.
 */
export const sceneDefaults = {
  width: 800,
  height: 520,
  centerX: 400,
  centerY: 263,
  radiusX: 342,
  radiusY: 164,
  /** How far a pool sits toward the table center from its seat, 0–1. */
  spotlightInset: 0.84,
  /** How far a contact shadow sits toward the table center from its seat, 0–1. */
  contactInset: 0.9,
  /** Scene units to step a portrait outward from its seat along the radial. */
  portraitNudge: 22,
  depthScaleFar: 0.96,
  depthScaleNear: 1,
  contactRadius: 38,
  selectedContactRadius: 48,
  contactOffsetX: 2,
  contactOffsetY: 6,
  selectedContactOffsetY: 10,
  groundOffsetX: 4,
  groundOffsetY: 28,
  groundRadiusX: 308,
  groundRadiusY: 92,
  bevelOffsetY: 10,
  cardX: 400,
  cardY: 250,
  ringScales: [0.7, 0.44] as const,
  ease: "cubic-bezier(0.22, 0.61, 0.36, 1)",
} as const;
