import { useId } from "react";
import { sameParticipantIds } from "../lib/focus";
import type { FocusMode, FocusState, Participant, ParticipantGroup } from "../types/commandTable.types";

const modes: Array<{ id: FocusMode; label: string }> = [
  { id: "individual", label: "Individual" },
  { id: "group", label: "Group" },
  { id: "overview", label: "Overview" },
];

interface FocusControlsProps {
  focus: FocusState;
  participants: readonly Participant[];
  groups: readonly ParticipantGroup[];
  onModeChange: (mode: FocusMode) => void;
  onSelectIndividual: (participantId: string) => void;
  onToggleParticipant: (participantId: string) => void;
  onApplyGroup: (participantIds: string[]) => void;
}

export function FocusControls({
  focus,
  participants,
  groups,
  onModeChange,
  onSelectIndividual,
  onToggleParticipant,
  onApplyGroup,
}: FocusControlsProps) {
  const name = useId();

  return (
    <section aria-labelledby="ct-focus-heading">
      <h3 id="ct-focus-heading">Focus</h3>
      <p className="ct-hint">
        Click a seat for individual focus. Shift-click adds or removes a seat. Overview clears priority without
        lighting every portrait.
      </p>
      <div className="ct-segment" role="radiogroup" aria-label="Focus mode">
        {modes.map((mode) => (
          <label key={mode.id}>
            <input
              type="radio"
              name={name}
              value={mode.id}
              checked={focus.mode === mode.id}
              onChange={() => onModeChange(mode.id)}
            />
            <span>{mode.label}</span>
          </label>
        ))}
      </div>

      {focus.mode === "overview" ? (
        <p className="ct-hint">The room stays broadly lit. Stored seats return when you leave overview.</p>
      ) : null}

      {focus.mode === "group" ? (
        <div className="ct-groups" role="group" aria-label="Predefined groups">
          {groups.map((group) => {
            const pressed = focus.mode === "group" && sameParticipantIds(focus.participantIds, group.participantIds);
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => onApplyGroup(group.participantIds)}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {focus.mode === "individual" ? (
        <div className="ct-choices" role="radiogroup" aria-label="Focused participant">
          {participants.map((participant) => {
            const id = `${name}-${participant.id}`;
            return (
              <label key={participant.id} className="ct-choice">
                <input
                  id={id}
                  type="radio"
                  name={`${name}-person`}
                  checked={focus.participantIds[0] === participant.id}
                  onChange={() => onSelectIndividual(participant.id)}
                />
                <span>
                  <strong>{participant.name}</strong>
                  <small>{participant.role}</small>
                </span>
              </label>
            );
          })}
        </div>
      ) : null}

      {focus.mode === "group" ? (
        <div className="ct-choices" role="group" aria-label="Focused participants">
          {participants.map((participant) => {
            const id = `${name}-${participant.id}`;
            return (
              <label key={participant.id} className="ct-choice">
                <input
                  id={id}
                  type="checkbox"
                  checked={focus.participantIds.includes(participant.id)}
                  onChange={() => onToggleParticipant(participant.id)}
                />
                <span>
                  <strong>{participant.name}</strong>
                  <small>{participant.role}</small>
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
