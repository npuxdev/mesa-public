import { memo } from "react";
import type { SpotlightPlacement } from "../../lib/geometry";

type GeometryStyle = React.CSSProperties & {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

interface ParticipantSpotlightProps {
  placement: SpotlightPlacement;
  active: boolean;
  intensity: number;
  gradientId: string;
}

export const ParticipantSpotlight = memo(function ParticipantSpotlight({
  placement,
  active,
  intensity,
  gradientId,
}: ParticipantSpotlightProps) {
  const style: GeometryStyle = {
    cx: placement.center.x,
    cy: placement.center.y,
    rx: placement.rx,
    ry: placement.ry,
    opacity: active ? intensity : 0,
  };

  return (
    <ellipse
      className="ct-spot"
      cx={placement.center.x}
      cy={placement.center.y}
      rx={placement.rx}
      ry={placement.ry}
      fill={`url(#${gradientId})`}
      style={style}
    />
  );
});
