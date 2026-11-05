"use client";

import { useState } from "react";
import { parseConfigurationJson, serializeConfiguration } from "../lib/configTransfer";
import type { AmbientPreset, FocusMode, FocusState, LightingConfig, Participant, ParticipantGroup } from "../types/commandTable.types";
import { EnvironmentControls } from "./EnvironmentControls";
import { FocusControls } from "./FocusControls";
import { MaterialControls } from "./MaterialControls";
import { SpotlightControls } from "./SpotlightControls";

interface LightingWorkbenchProps {
  lighting: LightingConfig;
  focus: FocusState;
  participants: readonly Participant[];
  groups: readonly ParticipantGroup[];
  debug: boolean;
  onLightingChange: <K extends keyof LightingConfig>(key: K, value: LightingConfig[K]) => void;
  onReplaceLighting: (next: LightingConfig) => void;
  onResetLighting: () => void;
  onFocusChange: (next: FocusState) => void;
  onModeChange: (mode: FocusMode) => void;
  onSelectIndividual: (participantId: string) => void;
  onToggleParticipant: (participantId: string) => void;
  onApplyGroup: (participantIds: string[]) => void;
  onDebugChange: (debug: boolean) => void;
}

/**
 * Development instrument. It is not part of the scene tree and must not be mounted in the exercise UI.
 */
export function LightingWorkbench({
  lighting,
  focus,
  participants,
  groups,
  debug,
  onLightingChange,
  onReplaceLighting,
  onResetLighting,
  onFocusChange,
  onModeChange,
  onSelectIndividual,
  onToggleParticipant,
  onApplyGroup,
  onDebugChange,
}: LightingWorkbenchProps) {
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "error">("ok");

  async function copyConfiguration() {
    const text = serializeConfiguration(lighting, focus);
    try {
      await navigator.clipboard.writeText(text);
      setTone("ok");
      setMessage("Copied lighting and focus JSON.");
    } catch {
      setDraft(text);
      setTone("error");
      setMessage("Clipboard unavailable. The current JSON is in the import field.");
    }
  }

  function importConfiguration() {
    const result = parseConfigurationJson(draft);
    if (!result.ok) {
      setTone("error");
      setMessage(result.error);
      return;
    }
    if (result.lighting) onReplaceLighting(result.lighting);
    if (result.focus) onFocusChange(result.focus);
    setTone("ok");
    setMessage(result.lighting && result.focus ? "Imported lighting and focus." : result.lighting ? "Imported lighting." : "Imported focus.");
  }

  return (
    <aside className="ct-bench" aria-label="Lighting workbench">
      <header className="ct-bench-header">
        <h2>Lighting Workbench</h2>
        <p>Controls write state. The table only reads it.</p>
      </header>

      <FocusControls
        focus={focus}
        participants={participants}
        groups={groups}
        onModeChange={onModeChange}
        onSelectIndividual={onSelectIndividual}
        onToggleParticipant={onToggleParticipant}
        onApplyGroup={onApplyGroup}
      />

      <EnvironmentControls
        lighting={lighting}
        onPresetChange={(preset: AmbientPreset) => onLightingChange("ambientPreset", preset)}
        onIntensityChange={(value) => onLightingChange("ambientIntensity", value)}
      />

      <SpotlightControls
        lighting={lighting}
        onChange={(key, value) => onLightingChange(key, value)}
      />

      <MaterialControls lighting={lighting} onShadowStrength={(value) => onLightingChange("shadowStrength", value)} />

      <section aria-labelledby="ct-utilities-heading">
        <h3 id="ct-utilities-heading">Utilities</h3>
        <div className="ct-utility-row">
          <button
            type="button"
            className="ct-btn"
            onClick={() => {
              onResetLighting();
              setTone("ok");
              setMessage("Lighting reset to defaults. Focus was left as it is.");
            }}
          >
            Reset Lighting
          </button>
          <button type="button" className="ct-btn" onClick={() => void copyConfiguration()}>
            Copy JSON
          </button>
        </div>
        <label className="ct-import-label" htmlFor="ct-import-json">
          Import JSON
        </label>
        <textarea
          id="ct-import-json"
          className="ct-json"
          value={draft}
          spellCheck={false}
          placeholder='{"lighting":{"ambientPreset":"cool", ...}}'
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="button" className="ct-btn" onClick={importConfiguration} disabled={draft.trim().length === 0}>
          Apply Import
        </button>
        <label className="ct-choice ct-debug-toggle">
          <input type="checkbox" checked={debug} onChange={(event) => onDebugChange(event.target.checked)} />
          <span>
            <strong>Scene debug</strong>
            <small>Seats, pool centers, falloff edges, table geometry</small>
          </span>
        </label>
        {message ? (
          <p className={tone === "error" ? "ct-message is-error" : "ct-message"} role="status">
            {message}
          </p>
        ) : null}
      </section>
    </aside>
  );
}
