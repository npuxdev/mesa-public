import { defaultSeatLayout } from "../config/participantLayouts";
import type {
  CommandTableSceneData,
  FocusState,
  Participant,
  ParticipantGroup,
} from "../types/commandTable.types";

const roster: Array<Omit<Participant, "position">> = [
  { id: "commander", name: "Maya Chen", role: "Incident Commander" },
  { id: "security", name: "Andre Walsh", role: "Security" },
  { id: "communications", name: "Jonah Ellis", role: "Communications" },
  { id: "operations", name: "Elena Voss", role: "Operations" },
  { id: "legal", name: "Priya Shah", role: "Legal" },
  { id: "executive", name: "Chris Adeyemi", role: "Executive" },
];

export const sampleParticipants: Participant[] = roster.map((person) => {
  const position = defaultSeatLayout[person.id];
  if (!position) throw new Error(`Missing seat for ${person.id}`);
  return { ...person, position };
});

export const sampleGroups: ParticipantGroup[] = [
  {
    id: "containment",
    label: "Containment",
    participantIds: ["security", "operations"],
  },
  {
    id: "disclosure",
    label: "Disclosure",
    participantIds: ["legal", "communications"],
  },
  {
    id: "command",
    label: "Command",
    participantIds: ["commander", "executive", "legal"],
  },
];

export const sampleContext: CommandTableSceneData["context"] = {
  eyebrow: "Inject 04",
  title: "Customer Data Exposure Confirmed",
  description:
    "Security validated unauthorized access to the billing archive. Legal and communications need a holding statement before the next cycle.",
  progress: "Decision window · 12 min",
};

export const sampleInitialFocus: FocusState = {
  mode: "individual",
  participantIds: ["security"],
};

export const sampleExercise = {
  participants: sampleParticipants,
  groups: sampleGroups,
  context: sampleContext,
  initialFocus: sampleInitialFocus,
};
