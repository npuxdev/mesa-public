import type { LightingConfig } from "../types/commandTable.types";

export type NumericLightingKey = {
  [K in keyof LightingConfig]: LightingConfig[K] extends number ? K : never;
}[keyof LightingConfig];

export interface NumericParameter {
  key: NumericLightingKey;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
  unit: string;
}

/** Single source for defaults, slider ranges, and import validation. */
export const numericParameters = [
  {
    key: "ambientIntensity",
    label: "Ambient intensity",
    description: "Scales the room wash. Does not move participant pools.",
    min: 0,
    max: 1,
    step: 0.01,
    decimals: 2,
    unit: "0–1",
  },
  {
    key: "spotlightIntensity",
    label: "Spotlight intensity",
    description: "Brightness of each focused pool.",
    min: 0,
    max: 1,
    step: 0.01,
    decimals: 2,
    unit: "0–1",
  },
  {
    key: "spotlightRadius",
    label: "Radius",
    description: "Horizontal reach of a pool, in scene units. Vertical reach follows the table perspective.",
    min: 70,
    max: 260,
    step: 1,
    decimals: 0,
    unit: "scene units",
  },
  {
    key: "spotlightDiffusion",
    label: "Edge diffusion",
    description: "How early the pool falls off. The edge is always transparent.",
    min: 0.15,
    max: 0.95,
    step: 0.01,
    decimals: 2,
    unit: "0–1",
  },
  {
    key: "shadowStrength",
    label: "Shadow strength",
    description: "Contact shadows under seats and the broad shadow under the table.",
    min: 0,
    max: 1,
    step: 0.01,
    decimals: 2,
    unit: "0–1",
  },
  {
    key: "transitionDuration",
    label: "Transition",
    description: "How long focus and lighting changes take.",
    min: 0,
    max: 1200,
    step: 10,
    decimals: 0,
    unit: "ms",
  },
] as const satisfies readonly NumericParameter[];

export const defaultLightingConfig: LightingConfig = {
  ambientPreset: "daylight",
  ambientIntensity: 0.86,
  spotlightIntensity: 0.74,
  spotlightRadius: 138,
  spotlightDiffusion: 0.7,
  shadowStrength: 0.48,
  transitionDuration: 450,
};

export function parameterByKey(key: NumericLightingKey): NumericParameter {
  const found = numericParameters.find((parameter) => parameter.key === key);
  if (!found) throw new Error(`Unknown lighting parameter: ${key}`);
  return found;
}

export function formatParameter(key: NumericLightingKey, value: number): string {
  const parameter = parameterByKey(key);
  const rendered = value.toFixed(parameter.decimals);
  if (parameter.unit === "ms") return `${rendered} ms`;
  if (parameter.unit === "scene units") return rendered;
  return rendered;
}
