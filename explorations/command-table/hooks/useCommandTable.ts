"use client";

import { useCallback, useMemo, useState } from "react";
import { sampleExercise } from "../fixtures/sampleExercise";
import { normalizeFocus } from "../lib/focus";
import type { CommandTableSceneData, FocusMode, FocusState } from "../types/commandTable.types";

type Exercise = typeof sampleExercise;

export function useCommandTable(exercise: Exercise = sampleExercise) {
  const [focus, setFocusState] = useState<FocusState>(exercise.initialFocus);
  const [debug, setDebug] = useState(false);

  const setFocus = useCallback(
    (next: FocusState) => {
      setFocusState(normalizeFocus(next, exercise.participants));
    },
    [exercise.participants],
  );

  const selectIndividual = useCallback(
    (participantId: string) => {
      setFocus({ mode: "individual", participantIds: [participantId] });
    },
    [setFocus],
  );

  const applyGroup = useCallback(
    (participantIds: string[]) => {
      setFocus({ mode: "group", participantIds });
    },
    [setFocus],
  );

  const toggleParticipant = useCallback(
    (participantId: string) => {
      setFocusState((current) => {
        const has = current.participantIds.includes(participantId);
        const participantIds = has
          ? current.participantIds.filter((id) => id !== participantId)
          : [...current.participantIds, participantId];
        const mode: FocusMode =
          participantIds.length >= 2 ? "group" : participantIds.length === 1 ? "individual" : "overview";
        return normalizeFocus({ mode, participantIds }, exercise.participants);
      });
    },
    [exercise.participants],
  );

  const setMode = useCallback(
    (mode: FocusMode) => {
      setFocusState((current) => {
        if (mode === "overview") {
          return normalizeFocus({ mode, participantIds: current.participantIds }, exercise.participants);
        }
        if (mode === "individual") {
          const id = current.participantIds[0] ?? exercise.participants[0]?.id;
          return normalizeFocus({ mode, participantIds: id ? [id] : [] }, exercise.participants);
        }
        if (current.participantIds.length >= 2) {
          return normalizeFocus({ mode, participantIds: current.participantIds }, exercise.participants);
        }
        const fallback = exercise.groups[0]?.participantIds ?? [];
        return normalizeFocus({ mode, participantIds: fallback }, exercise.participants);
      });
    },
    [exercise],
  );

  const scene = useMemo<CommandTableSceneData>(
    () => ({
      participants: exercise.participants,
      focus,
      context: exercise.context,
    }),
    [exercise, focus],
  );

  return {
    scene,
    focus,
    setFocus,
    selectIndividual,
    toggleParticipant,
    applyGroup,
    setMode,
    debug,
    setDebug,
    groups: exercise.groups,
  };
}
