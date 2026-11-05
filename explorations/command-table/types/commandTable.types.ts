/** Focus is application state. The scene only renders it. */
export type FocusMode = "individual" | "group" | "overview";

/** Named room treatments. Color values live in the preset table, not in components. */
export type AmbientPreset = "daylight" | "cool" | "warm";

export interface Point {
  x: number;
  y: number;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  /** Seat anchor in scene units. Portraits are placed from this point and stay upright. */
  position: Point;
}

/**
 * Normalized lighting parameters.
 * Intensities, diffusion, and shadow strength are unitless, 0–1.
 * Spotlight radius is in scene units (the 800×520 design space).
 * Transition duration is milliseconds.
 */
export interface LightingConfig {
  ambientPreset: AmbientPreset;
  ambientIntensity: number;
  spotlightIntensity: number;
  spotlightRadius: number;
  spotlightDiffusion: number;
  shadowStrength: number;
  transitionDuration: number;
}

export interface FocusState {
  mode: FocusMode;
  participantIds: string[];
}

export interface SceneContext {
  eyebrow?: string;
  title: string;
  description?: string;
  progress?: string;
}

export interface CommandTableSceneData {
  participants: Participant[];
  focus: FocusState;
  context: SceneContext;
}

export interface ParticipantGroup {
  id: string;
  label: string;
  participantIds: string[];
}

/** Colors and atmosphere for one ambient preset. Components consume these as CSS variables. */
export interface AmbientTokens {
  canvas: string;
  ambientCore: string;
  softbox: string;
  fill: string;
  tableTop: string;
  tableBottom: string;
  bevel: string;
  ring: string;
  vignette: string;
  spotlight: string;
  shadow: string;
  ink: string;
  muted: string;
  accent: string;
  card: string;
}

export interface AmbientPresetDefinition {
  id: AmbientPreset;
  label: string;
  description: string;
  tokens: AmbientTokens;
}
