import { diffusionHold, spotlightPlacement } from "../../lib/geometry";
import type { FocusState, LightingConfig, Participant } from "../../types/commandTable.types";
import { ParticipantSpotlight } from "./ParticipantSpotlight";

interface SpotlightLayerProps {
  idPrefix: string;
  participants: readonly Participant[];
  focus: FocusState;
  lighting: LightingConfig;
}

export function SpotlightLayer({ idPrefix, participants, focus, lighting }: SpotlightLayerProps) {
  const gradientId = `${idPrefix}-spot`;
  const active = new Set(focus.mode === "overview" ? [] : focus.participantIds);
  const hold = `${(diffusionHold(lighting.spotlightDiffusion) * 100).toFixed(1)}%`;

  return (
    <g className="ct-spots">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ct-spot)" stopOpacity={0.94} />
          <stop offset="20%" stopColor="var(--ct-spot)" stopOpacity={0.58} />
          <stop className="ct-spot-hold" offset={hold} stopColor="var(--ct-spot)" stopOpacity={0.2} />
          <stop offset="100%" stopColor="var(--ct-spot)" stopOpacity={0} />
        </radialGradient>
      </defs>
      {participants.map((participant) => (
        <ParticipantSpotlight
          key={participant.id}
          placement={spotlightPlacement(participant.position, lighting)}
          active={active.has(participant.id)}
          intensity={lighting.spotlightIntensity}
          gradientId={gradientId}
        />
      ))}
    </g>
  );
}
