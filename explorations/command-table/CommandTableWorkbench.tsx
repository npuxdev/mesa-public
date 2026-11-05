"use client";

import { useState } from "react";
import { CommandTable } from "./components/CommandTable";
import { LightingWorkbench } from "./controls/LightingWorkbench";
import { useCommandTable } from "./hooks/useCommandTable";
import { useLightingConfiguration } from "./hooks/useLightingConfiguration";

/**
 * Development composition. The scene and the workbench share state here and nowhere inside the table.
 * Hiding the workbench unmounts the controls and leaves the current scene state in place.
 */
export function CommandTableWorkbench() {
  const table = useCommandTable();
  const lighting = useLightingConfiguration();
  const [showWorkbench, setShowWorkbench] = useState(true);

  return (
    <div className="ct-lab">
      <header className="ct-lab-header">
        <div>
          <p className="ct-kicker">MESA</p>
          <h1>Spatial Illumination Lab</h1>
          <p className="ct-lab-note">
            A development instrument for the command table. It is not part of the exercise interface.
          </p>
        </div>
        <button type="button" className="ct-btn" onClick={() => setShowWorkbench((current) => !current)} aria-pressed={showWorkbench}>
          {showWorkbench ? "Hide Workbench" : "Show Workbench"}
        </button>
      </header>

      <div className={showWorkbench ? "ct-lab-body" : "ct-lab-body is-solo"}>
        <CommandTable
          scene={table.scene}
          lighting={lighting.config}
          debug={table.debug}
          onParticipantSelect={(participantId, detail) => {
            if (detail.multi) table.toggleParticipant(participantId);
            else table.selectIndividual(participantId);
          }}
        />
        {showWorkbench ? (
          <LightingWorkbench
            lighting={lighting.config}
            focus={table.focus}
            participants={table.scene.participants}
            groups={table.groups}
            debug={table.debug}
            onLightingChange={lighting.update}
            onReplaceLighting={lighting.replace}
            onResetLighting={lighting.reset}
            onFocusChange={table.setFocus}
            onModeChange={table.setMode}
            onSelectIndividual={table.selectIndividual}
            onToggleParticipant={table.toggleParticipant}
            onApplyGroup={table.applyGroup}
            onDebugChange={table.setDebug}
          />
        ) : null}
      </div>
    </div>
  );
}
