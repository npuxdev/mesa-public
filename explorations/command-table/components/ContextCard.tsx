import { sceneDefaults } from "../config/sceneDefaults";
import type { SceneContext } from "../types/commandTable.types";

interface ContextCardProps {
  context: SceneContext;
}

export function ContextCard({ context }: ContextCardProps) {
  return (
    <article
      className="ct-card"
      style={{ left: sceneDefaults.cardX, top: sceneDefaults.cardY }}
      aria-label="Active incident"
    >
      {context.eyebrow ? <p className="ct-eyebrow">{context.eyebrow}</p> : null}
      <h2>{context.title}</h2>
      {context.description ? <p className="ct-card-copy">{context.description}</p> : null}
      {context.progress ? <p className="ct-progress">{context.progress}</p> : null}
    </article>
  );
}
