import { memo } from "react";
import { sceneDefaults } from "../config/sceneDefaults";
import { outwardPoint, portraitDepth } from "../lib/geometry";
import type { FocusState, Participant } from "../types/commandTable.types";
import { ParticipantNode } from "./ParticipantNode";

interface ParticipantLayerProps {
  idPrefix: string;
  participants: readonly Participant[];
  focus: FocusState;
  onSelect?: (participantId: string, multi: boolean) => void;
}

export const ParticipantLayer = memo(function ParticipantLayer({
  idPrefix,
  participants,
  focus,
  onSelect,
}: ParticipantLayerProps) {
  const active = new Set(focus.mode === "overview" ? [] : focus.participantIds);

  return (
    <div className="ct-people" role="group" aria-label="Participants">
      {participants.map((participant) => {
        const placement = outwardPoint(participant.position, sceneDefaults.portraitNudge);
        return (
          <ParticipantNode
            key={participant.id}
            participant={participant}
            selected={active.has(participant.id)}
            depth={portraitDepth(participant.position)}
            left={placement.x}
            top={placement.y}
            idPrefix={idPrefix}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
});
