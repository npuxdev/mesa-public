import type { Point } from "../types/commandTable.types";

/**
 * Six seats on the table perimeter.
 * Angles are measured in screen space: 0° is to the right, 90° is toward the camera.
 * Coordinates are editable here. Rendering components do not hardcode seats.
 *
 *   commander       -90°   far center
 *   security        -30°   far right
 *   communications   30°   near right
 *   operations       90°   near center
 *   legal           150°   near left
 *   executive       210°   far left
 */
export const defaultSeatLayout: Record<string, Point> = {
  commander: { x: 400, y: 99 },
  security: { x: 696.2, y: 181 },
  communications: { x: 696.2, y: 345 },
  operations: { x: 400, y: 427 },
  legal: { x: 103.8, y: 345 },
  executive: { x: 103.8, y: 181 },
};
