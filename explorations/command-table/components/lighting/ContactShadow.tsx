import { sceneDefaults } from "../../config/sceneDefaults";
import { contactPlacement } from "../../lib/geometry";
import type { FocusState, Participant } from "../../types/commandTable.types";

type GeometryStyle = React.CSSProperties & {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

interface GroundShadowProps {
  idPrefix: string;
  strength: number;
}

export function GroundShadow({ idPrefix, strength }: GroundShadowProps) {
  const gradientId = `${idPrefix}-ground`;
  const cx = sceneDefaults.centerX + sceneDefaults.groundOffsetX;
  const cy = sceneDefaults.centerY + sceneDefaults.groundOffsetY;
  return (
    <g className="ct-ground" opacity={strength}>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="var(--ct-shadow)" stopOpacity={0.32} />
          <stop offset="52%" stopColor="var(--ct-shadow)" stopOpacity={0.14} />
          <stop offset="100%" stopColor="var(--ct-shadow)" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={sceneDefaults.groundRadiusX}
        ry={sceneDefaults.groundRadiusY}
        fill={`url(#${gradientId})`}
      />
    </g>
  );
}

interface ParticipantShadowsProps {
  idPrefix: string;
  participants: readonly Participant[];
  focus: FocusState;
  strength: number;
}

export function ParticipantShadows({ idPrefix, participants, focus, strength }: ParticipantShadowsProps) {
  const gradientId = `${idPrefix}-contact`;
  const active = new Set(focus.mode === "overview" ? [] : focus.participantIds);

  return (
    <g className="ct-contacts">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ct-shadow)" stopOpacity={0.5} />
          <stop offset="48%" stopColor="var(--ct-shadow)" stopOpacity={0.16} />
          <stop offset="100%" stopColor="var(--ct-shadow)" stopOpacity={0} />
        </radialGradient>
      </defs>
      {participants.map((participant) => {
        const selected = active.has(participant.id);
        const placement = contactPlacement(participant.position, selected);
        const opacity = strength * (selected ? 0.9 : 0.48);
        const style: GeometryStyle = {
          cx: placement.center.x,
          cy: placement.center.y,
          rx: placement.rx,
          ry: placement.ry,
          opacity,
        };
        return (
          <ellipse
            key={participant.id}
            className="ct-contact"
            cx={placement.center.x}
            cy={placement.center.y}
            rx={placement.rx}
            ry={placement.ry}
            fill={`url(#${gradientId})`}
            style={style}
          />
        );
      })}
    </g>
  );
}
