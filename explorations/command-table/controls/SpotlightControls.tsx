import type { LightingConfig } from "../types/commandTable.types";
import { SliderField } from "./SliderField";

interface SpotlightControlsProps {
  lighting: LightingConfig;
  onChange: (key: "spotlightIntensity" | "spotlightRadius" | "spotlightDiffusion" | "transitionDuration", value: number) => void;
}

export function SpotlightControls({ lighting, onChange }: SpotlightControlsProps) {
  return (
    <section aria-labelledby="ct-spotlight-heading">
      <h3 id="ct-spotlight-heading">Spotlight</h3>
      <p className="ct-hint">
        Each focused seat gets its own pool. Group focus is those pools together, not a separate graphic.
      </p>
      <SliderField
        parameter="spotlightIntensity"
        value={lighting.spotlightIntensity}
        onChange={(value) => onChange("spotlightIntensity", value)}
      />
      <SliderField
        parameter="spotlightRadius"
        value={lighting.spotlightRadius}
        onChange={(value) => onChange("spotlightRadius", value)}
      />
      <SliderField
        parameter="spotlightDiffusion"
        value={lighting.spotlightDiffusion}
        onChange={(value) => onChange("spotlightDiffusion", value)}
      />
      <SliderField
        parameter="transitionDuration"
        value={lighting.transitionDuration}
        onChange={(value) => onChange("transitionDuration", value)}
      />
    </section>
  );
}
