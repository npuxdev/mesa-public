"use client";

import { useCallback, useState } from "react";
import { defaultLightingConfig } from "../config/parameterSchema";
import type { NumericLightingKey } from "../config/parameterSchema";
import type { LightingConfig } from "../types/commandTable.types";

export function useLightingConfiguration(initial: LightingConfig = defaultLightingConfig) {
  const [config, setConfig] = useState<LightingConfig>(initial);

  const update = useCallback(<K extends keyof LightingConfig>(key: K, value: LightingConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  }, []);

  const replace = useCallback((next: LightingConfig) => {
    setConfig(next);
  }, []);

  const reset = useCallback(() => {
    setConfig(defaultLightingConfig);
  }, []);

  return { config, update, replace, reset, defaults: defaultLightingConfig };
}

export type { NumericLightingKey };
