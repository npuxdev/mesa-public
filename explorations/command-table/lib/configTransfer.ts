import { numericParameters, parameterByKey } from "../config/parameterSchema";
import { lightingPresets } from "../config/lightingPresets";
import type { AmbientPreset, FocusState, LightingConfig } from "../types/commandTable.types";
import type { NumericLightingKey } from "../config/parameterSchema";

const FOCUS_MODES = new Set<FocusState["mode"]>(["individual", "group", "overview"]);

export interface ConfigurationDocument {
  lighting?: LightingConfig;
  focus?: FocusState;
}

export type ConfigurationParseResult =
  | { ok: true; lighting?: LightingConfig; focus?: FocusState }
  | { ok: false; error: string };

export function serializeConfiguration(lighting: LightingConfig, focus: FocusState): string {
  return JSON.stringify({ lighting, focus }, null, 2);
}

export function parseConfigurationJson(raw: string): ConfigurationParseResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That text is not valid JSON." };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Configuration JSON must be an object." };
  }
  const record = value as Record<string, unknown>;
  const hasWrapper = "lighting" in record || "focus" in record;
  try {
    const lightingSource = hasWrapper ? record.lighting : "ambientPreset" in record ? record : undefined;
    const lighting = lightingSource === undefined ? undefined : readLighting(lightingSource);
    const focus = "focus" in record ? readFocus(record.focus) : undefined;
    if (!lighting && !focus) {
      return { ok: false, error: "Include a lighting object, a focus object, or both." };
    }
    return { ok: true, lighting, focus };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not read that configuration." };
  }
}

function readLighting(value: unknown): LightingConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Lighting configuration must be an object.");
  }
  const record = value as Record<string, unknown>;
  const ambientPreset = record.ambientPreset;
  if (typeof ambientPreset !== "string" || !(ambientPreset in lightingPresets)) {
    throw new Error("Ambient preset must be daylight, cool, or warm.");
  }
  const numeric = {} as Record<NumericLightingKey, number>;
  for (const parameter of numericParameters) {
    numeric[parameter.key] = readNumber(record[parameter.key], parameter.key);
  }
  return {
    ambientPreset: ambientPreset as AmbientPreset,
    ...numeric,
  };
}

function readNumber(value: unknown, key: NumericLightingKey): number {
  const parameter = parameterByKey(key);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${parameter.label} must be a number.`);
  }
  if (value < parameter.min || value > parameter.max) {
    throw new Error(`${parameter.label} must be between ${parameter.min} and ${parameter.max} ${parameter.unit}.`);
  }
  return value;
}

function readFocus(value: unknown): FocusState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Focus must be an object.");
  }
  const record = value as Record<string, unknown>;
  if (typeof record.mode !== "string" || !FOCUS_MODES.has(record.mode as FocusState["mode"])) {
    throw new Error("Focus mode must be individual, group, or overview.");
  }
  if (!Array.isArray(record.participantIds) || record.participantIds.some((id) => typeof id !== "string")) {
    throw new Error("Focus participantIds must be an array of strings.");
  }
  return {
    mode: record.mode as FocusState["mode"],
    participantIds: record.participantIds as string[],
  };
}
