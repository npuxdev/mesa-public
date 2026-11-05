import type { CSSProperties } from "react";

interface AmbientLightingProps {
  intensity: number;
}

/**
 * Room light only. Participant pools are a separate layer and do not feed this component.
 */
export function AmbientLighting({ intensity }: AmbientLightingProps) {
  return (
    <div
      className="ct-ambient"
      style={{ "--ct-ambient-opacity": String(intensity) } as CSSProperties}
      aria-hidden="true"
    />
  );
}
