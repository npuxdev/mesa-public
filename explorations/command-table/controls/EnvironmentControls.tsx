import { useId } from "react";
import { ambientPresetList } from "../config/lightingPresets";
import type { AmbientPreset, LightingConfig } from "../types/commandTable.types";
import { SliderField } from "./SliderField";

interface EnvironmentControlsProps {
  lighting: LightingConfig;
  onPresetChange: (preset: AmbientPreset) => void;
  onIntensityChange: (value: number) => void;
}

export function EnvironmentControls({ lighting, onPresetChange, onIntensityChange }: EnvironmentControlsProps) {
  const name = useId();
  const active = ambientPresetList.find((preset) => preset.id === lighting.ambientPreset);

  return (
    <section aria-labelledby="ct-environment-heading">
      <h3 id="ct-environment-heading">Environment</h3>
      <p className="ct-hint">Presets change the room. They do not choose who is in focus.</p>
      <div className="ct-segment" role="radiogroup" aria-label="Ambient preset">
        {ambientPresetList.map((preset) => (
          <label key={preset.id}>
            <input
              type="radio"
              name={name}
              value={preset.id}
              checked={lighting.ambientPreset === preset.id}
              onChange={() => onPresetChange(preset.id)}
            />
            <span>{preset.label}</span>
          </label>
        ))}
      </div>
      {active ? <p className="ct-hint">{active.description}</p> : null}
      <SliderField parameter="ambientIntensity" value={lighting.ambientIntensity} onChange={onIntensityChange} />
    </section>
  );
}
