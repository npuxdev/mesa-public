import { memo } from "react";
import { fallbackPortraitTone, portraitTones } from "../config/portraitTones";
import type { Participant } from "../types/commandTable.types";

interface ParticipantNodeProps {
  participant: Participant;
  selected: boolean;
  depth: number;
  left: number;
  top: number;
  idPrefix: string;
  onSelect?: (participantId: string, multi: boolean) => void;
}

export const ParticipantNode = memo(function ParticipantNode({
  participant,
  selected,
  depth,
  left,
  top,
  idPrefix,
  onSelect,
}: ParticipantNodeProps) {
  const tone = portraitTones[participant.id] ?? fallbackPortraitTone;
  const portraitId = `${idPrefix}-portrait-${participant.id}`;
  const label = `${participant.name}, ${participant.role}`;
  const className = selected ? "ct-node is-selected" : "ct-node";
  const style = {
    left,
    top,
    zIndex: Math.round(top),
    "--depth": String(depth),
  } as React.CSSProperties;

  const content = (
    <span className="ct-node-press">
      <span className="ct-avatar">
        {participant.avatarUrl ? (
          // Decorative. The control name carries the participant.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={participant.avatarUrl} alt="" />
        ) : (
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <defs>
              <linearGradient id={portraitId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tone.from} />
                <stop offset="100%" stopColor={tone.to} />
              </linearGradient>
            </defs>
            <rect width="80" height="80" fill={`url(#${portraitId})`} />
            <ellipse cx="40" cy="6" rx="30" ry="16" fill="#ffffff" opacity="0.34" />
            <circle cx="40" cy="31" r="13" fill={tone.figure} opacity="0.78" />
            <ellipse cx="40" cy="70" rx="23" ry="18" fill={tone.figure} opacity="0.78" />
          </svg>
        )}
      </span>
      <span className="ct-name">{participant.name}</span>
      <span className="ct-role">{participant.role}</span>
    </span>
  );

  if (!onSelect) {
    return (
      <div className={className} style={style} role="img" aria-label={selected ? `${label}, selected` : label}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-pressed={selected}
      aria-label={label}
      onClick={(event) => onSelect(participant.id, event.shiftKey || event.metaKey)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && (event.shiftKey || event.metaKey)) {
          event.preventDefault();
          onSelect(participant.id, true);
        }
      }}
    >
      {content}
    </button>
  );
});
