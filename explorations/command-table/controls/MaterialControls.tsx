import type { LightingConfig } from "../types/commandTable.types";
import { SliderField } from "./SliderField";

interface MaterialControlsProps {
  lighting: LightingConfig;
  onShadowStrength: (value: number) => void;
}

export function MaterialControls({ lighting, onShadowStrength }: MaterialControlsProps) {
  return (
    <section aria-labelledby="ct-materials-heading">
      <h3 id="ct-materials-heading">Materials</h3>
      <SliderField parameter="shadowStrength" value={lighting.shadowStrength} onChange={onShadowStrength} />
    </section>
  );
}
