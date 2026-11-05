import { sceneDefaults } from "../config/sceneDefaults";
import type { LightingConfig, Point } from "../types/commandTable.types";

export function outwardPoint(position: Point, distance: number): Point {
  const dx = position.x - sceneDefaults.centerX;
  const dy = position.y - sceneDefaults.centerY;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: position.x + (dx / length) * distance,
    y: position.y + (dy / length) * distance,
  };
}

export function inwardPoint(position: Point, inset: number): Point {
  return {
    x: sceneDefaults.centerX + (position.x - sceneDefaults.centerX) * inset,
    y: sceneDefaults.centerY + (position.y - sceneDefaults.centerY) * inset,
  };
}

/** 1 at the near edge, slightly under 1 at the far edge. Uniform scale only — no rotation. */
export function portraitDepth(position: Point): number {
  const far = sceneDefaults.centerY - sceneDefaults.radiusY;
  const span = sceneDefaults.radiusY * 2;
  const t = Math.min(1, Math.max(0, (position.y - far) / span));
  return sceneDefaults.depthScaleFar + (sceneDefaults.depthScaleNear - sceneDefaults.depthScaleFar) * t;
}

export function spotlightAspect(): number {
  return sceneDefaults.radiusY / sceneDefaults.radiusX;
}

export interface SpotlightPlacement {
  center: Point;
  rx: number;
  ry: number;
}

export function spotlightPlacement(
  position: Point,
  lighting: Pick<LightingConfig, "spotlightRadius">,
): SpotlightPlacement {
  const aspect = spotlightAspect();
  return {
    center: inwardPoint(position, sceneDefaults.spotlightInset),
    rx: lighting.spotlightRadius,
    ry: lighting.spotlightRadius * aspect,
  };
}

/**
 * Where the bright core gives way to the transparent edge.
 * Higher diffusion starts the falloff sooner. The perimeter stop stays at zero.
 */
export function diffusionHold(diffusion: number): number {
  return 0.28 + (1 - diffusion) * 0.34;
}

export interface ContactPlacement {
  center: Point;
  rx: number;
  ry: number;
}

export function contactPlacement(position: Point, selected: boolean): ContactPlacement {
  const seat = inwardPoint(position, sceneDefaults.contactInset);
  const radius = selected ? sceneDefaults.selectedContactRadius : sceneDefaults.contactRadius;
  const aspect = spotlightAspect();
  return {
    center: {
      x: seat.x + sceneDefaults.contactOffsetX,
      y: seat.y + (selected ? sceneDefaults.selectedContactOffsetY : sceneDefaults.contactOffsetY),
    },
    rx: radius,
    ry: radius * aspect,
  };
}
