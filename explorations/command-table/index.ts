export { CommandTable } from "./components/CommandTable";
export type { CommandTableProps } from "./components/CommandTable";
export { CommandTableWorkbench } from "./CommandTableWorkbench";
export { useCommandTable } from "./hooks/useCommandTable";
export { useLightingConfiguration } from "./hooks/useLightingConfiguration";
export { defaultLightingConfig } from "./config/parameterSchema";
export { lightingPresets } from "./config/lightingPresets";
export { sceneDefaults } from "./config/sceneDefaults";
export { sampleExercise } from "./fixtures/sampleExercise";
export { parseConfigurationJson, serializeConfiguration } from "./lib/configTransfer";
export type {
  AmbientPreset,
  CommandTableSceneData,
  FocusMode,
  FocusState,
  LightingConfig,
  Participant,
  ParticipantGroup,
} from "./types/commandTable.types";
