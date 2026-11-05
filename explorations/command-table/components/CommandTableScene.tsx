"use client";

import { useId } from "react";
import { sceneDefaults } from "../config/sceneDefaults";
import { describeFocus } from "../lib/focus";
import { lightingCssVars } from "../lib/lightingStyle";
import type { CommandTableSceneData, LightingConfig } from "../types/commandTable.types";
import { ContextCard } from "./ContextCard";
import { ParticipantLayer } from "./ParticipantLayer";
import { SceneDebugOverlay } from "./SceneDebugOverlay";
import { TableSurface } from "./TableSurface";
import { AmbientLighting } from "./lighting/AmbientLighting";
import { GroundShadow, ParticipantShadows } from "./lighting/ContactShadow";
import { SpotlightLayer } from "./lighting/SpotlightLayer";

export interface CommandTableSceneProps {
  scene: CommandTableSceneData;
  lighting: LightingConfig;
  debug?: boolean;
  reducedMotion: boolean;
  onParticipantSelect?: (participantId: string, detail: { multi: boolean }) => void;
}

export function CommandTableScene({
  scene,
  lighting,
  debug = false,
  reducedMotion,
  onParticipantSelect,
}: CommandTableSceneProps) {
  const idPrefix = useId().replace(/:/g, "");
  const duration = reducedMotion ? 0 : lighting.transitionDuration;
  const focusLabel = describeFocus(scene);

  const handleSelect = onParticipantSelect
    ? (participantId: string, multi: boolean) => onParticipantSelect(participantId, { multi })
    : undefined;

  return (
    <section
      className="ct-scene"
      data-ambient={lighting.ambientPreset}
      data-motion={reducedMotion ? "reduced" : "full"}
      style={lightingCssVars(lighting, duration)}
      aria-label="Command table"
    >
      <AmbientLighting intensity={lighting.ambientIntensity} />
      <div className="ct-stage">
        <div className="ct-scaler">
          <svg
            className="ct-svg"
            viewBox={`0 0 ${sceneDefaults.width} ${sceneDefaults.height}`}
            width={sceneDefaults.width}
            height={sceneDefaults.height}
            aria-hidden="true"
            focusable="false"
          >
            <GroundShadow idPrefix={idPrefix} strength={lighting.shadowStrength} />
            <TableSurface idPrefix={idPrefix} ambientIntensity={lighting.ambientIntensity} />
            <g clipPath={`url(#${idPrefix}-clip)`}>
              <SpotlightLayer
                idPrefix={idPrefix}
                participants={scene.participants}
                focus={scene.focus}
                lighting={lighting}
              />
              <ParticipantShadows
                idPrefix={idPrefix}
                participants={scene.participants}
                focus={scene.focus}
                strength={lighting.shadowStrength}
              />
            </g>
          </svg>
          <ContextCard context={scene.context} />
          <ParticipantLayer
            idPrefix={idPrefix}
            participants={scene.participants}
            focus={scene.focus}
            onSelect={handleSelect}
          />
          {debug ? (
            <SceneDebugOverlay participants={scene.participants} focus={scene.focus} lighting={lighting} />
          ) : null}
        </div>
      </div>
      <p className="ct-sr" aria-live="polite">
        {focusLabel}
      </p>
    </section>
  );
}
