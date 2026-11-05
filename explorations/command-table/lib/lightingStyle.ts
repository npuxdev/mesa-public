import type { CSSProperties } from "react";
import { lightingPresets } from "../config/lightingPresets";
import { sceneDefaults } from "../config/sceneDefaults";
import type { LightingConfig } from "../types/commandTable.types";

/** Pushes the active preset and numeric parameters onto the scene as CSS variables. */
export function lightingCssVars(lighting: LightingConfig, durationMs: number): CSSProperties {
  const { tokens } = lightingPresets[lighting.ambientPreset];
  return {
    "--ct-canvas": tokens.canvas,
    "--ct-ambient-core": tokens.ambientCore,
    "--ct-softbox": tokens.softbox,
    "--ct-fill": tokens.fill,
    "--ct-table-top": tokens.tableTop,
    "--ct-table-bottom": tokens.tableBottom,
    "--ct-bevel": tokens.bevel,
    "--ct-ring": tokens.ring,
    "--ct-vignette": tokens.vignette,
    "--ct-spot": tokens.spotlight,
    "--ct-shadow": tokens.shadow,
    "--ct-ink": tokens.ink,
    "--ct-muted": tokens.muted,
    "--ct-accent": tokens.accent,
    "--ct-card": tokens.card,
    "--ct-ambient-intensity": String(lighting.ambientIntensity),
    "--ct-shadow-strength": String(lighting.shadowStrength),
    "--ct-duration": `${durationMs}ms`,
    "--ct-ease": sceneDefaults.ease,
  } as CSSProperties;
}
