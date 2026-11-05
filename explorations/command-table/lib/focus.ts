import type { CommandTableSceneData, FocusState, Participant } from "../types/commandTable.types";

export function sameParticipantIds(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const ids = new Set(a);
  return b.every((id) => ids.has(id));
}

export function normalizeFocus(focus: FocusState, participants: readonly Participant[]): FocusState {
  const known = new Set(participants.map((participant) => participant.id));
  const participantIds = focus.participantIds.filter((id) => known.has(id));
  if (focus.mode === "overview") return { mode: "overview", participantIds };
  if (focus.mode === "individual") {
    return { mode: "individual", participantIds: participantIds.slice(0, 1) };
  }
  return { mode: "group", participantIds };
}

export function describeFocus(scene: Pick<CommandTableSceneData, "participants" | "focus">): string {
  if (scene.focus.mode === "overview") {
    return "Overview. No participant has priority.";
  }
  const names = scene.focus.participantIds.map((id) => {
    const participant = scene.participants.find((item) => item.id === id);
    return participant ? `${participant.name}, ${participant.role}` : id;
  });
  if (names.length === 0) {
    return scene.focus.mode === "group"
      ? "Group focus. No participants selected."
      : "Individual focus. No participant selected.";
  }
  const mode = scene.focus.mode === "group" ? "Group focus" : "Individual focus";
  return `${mode}. ${names.join(". ")}.`;
}
