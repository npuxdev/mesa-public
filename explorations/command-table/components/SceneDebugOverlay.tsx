import { sceneDefaults } from "../config/sceneDefaults";
import { contactPlacement, spotlightPlacement } from "../lib/geometry";
import type { FocusState, LightingConfig, Participant } from "../types/commandTable.types";

interface SceneDebugOverlayProps {
  participants: readonly Participant[];
  focus: FocusState;
  lighting: LightingConfig;
}

export function SceneDebugOverlay({ participants, focus, lighting }: SceneDebugOverlayProps) {
  const { width, height, centerX, centerY, radiusX, radiusY } = sceneDefaults;
  const active = new Set(focus.mode === "overview" ? [] : focus.participantIds);
  const summary = `${focus.mode} · ${focus.participantIds.join(", ") || "none"}`;

  return (
    <svg
      className="ct-debug"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <rect x={0.5} y={0.5} width={width - 1} height={height - 1} className="ct-debug-bounds" />
      <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} className="ct-debug-table" />
      <path d={`M${centerX - 8} ${centerY} H${centerX + 8} M${centerX} ${centerY - 8} V${centerY + 8}`} className="ct-debug-table" />
      <text x={12} y={18} className="ct-debug-label">
        {summary}
      </text>
      {participants.map((participant) => {
        const spot = spotlightPlacement(participant.position, lighting);
        const contact = contactPlacement(participant.position, active.has(participant.id));
        const focused = active.has(participant.id);
        return (
          <g key={participant.id} className={focused ? "is-focused" : undefined}>
            <ellipse cx={spot.center.x} cy={spot.center.y} rx={spot.rx} ry={spot.ry} className="ct-debug-spot" />
            <circle cx={spot.center.x} cy={spot.center.y} r={3.5} className="ct-debug-spot-center" />
            <circle cx={contact.center.x} cy={contact.center.y} r={2.5} className="ct-debug-contact" />
            <path
              d={`M${participant.position.x - 5} ${participant.position.y} H${participant.position.x + 5} M${participant.position.x} ${participant.position.y - 5} V${participant.position.y + 5}`}
              className="ct-debug-anchor"
            />
          </g>
        );
      })}
    </svg>
  );
}
