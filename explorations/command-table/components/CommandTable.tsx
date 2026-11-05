"use client";

import { useCallback } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { CommandTableSceneData, LightingConfig } from "../types/commandTable.types";
import { CommandTableScene } from "./CommandTableScene";

export interface CommandTableProps {
  /** Scene content and focus. The table does not own this state. */
  scene: CommandTableSceneData;
  /** Numeric lighting and the active preset. The scene resolves preset colors. */
  lighting: LightingConfig;
  /** Coordinate and falloff guides. Leave off outside the workbench. */
  debug?: boolean;
  /**
   * Seat activation. `multi` is true for shift-click, meta-click, or shift-Enter.
   * Omit it to render a read-only table. Focus can still be driven through `scene.focus`.
   */
  onParticipantSelect?: (participantId: string, detail: { multi: boolean }) => void;
  className?: string;
}

/**
 * Product surface for the spatial command table.
 * It renders scene data. It does not know whether that data came from the workbench,
 * a simulation engine, or a parent component.
 */
export function CommandTable({ scene, lighting, debug = false, onParticipantSelect, className }: CommandTableProps) {
  const reducedMotion = usePrefersReducedMotion();
  const handleSelect = useCallback(
    (participantId: string, detail: { multi: boolean }) => {
      onParticipantSelect?.(participantId, detail);
    },
    [onParticipantSelect],
  );

  return (
    <div className={className ? `ct-frame ${className}` : "ct-frame"}>
      <CommandTableScene
        scene={scene}
        lighting={lighting}
        debug={debug}
        reducedMotion={reducedMotion}
        onParticipantSelect={onParticipantSelect ? handleSelect : undefined}
      />
    </div>
  );
}
