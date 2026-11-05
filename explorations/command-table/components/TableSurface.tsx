import { sceneDefaults } from "../config/sceneDefaults";

interface TableSurfaceProps {
  idPrefix: string;
  ambientIntensity: number;
}

export function TableSurface({ idPrefix, ambientIntensity }: TableSurfaceProps) {
  const { centerX, centerY, radiusX, radiusY, bevelOffsetY, ringScales } = sceneDefaults;
  const surfaceId = `${idPrefix}-surface`;
  const rimId = `${idPrefix}-rim`;
  const vignetteId = `${idPrefix}-vignette`;
  const sheenId = `${idPrefix}-sheen`;

  return (
    <g className="ct-table">
      <defs>
        <linearGradient id={surfaceId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ct-table-top)" />
          <stop offset="58%" stopColor="var(--ct-table-top)" />
          <stop offset="100%" stopColor="var(--ct-table-bottom)" />
        </linearGradient>
        <linearGradient id={rimId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="38%" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={vignetteId} cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor="var(--ct-vignette)" stopOpacity={0} />
          <stop offset="58%" stopColor="var(--ct-vignette)" stopOpacity={0.04} />
          <stop offset="100%" stopColor="var(--ct-vignette)" stopOpacity={0.28} />
        </radialGradient>
        <radialGradient id={sheenId} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${idPrefix}-clip`}>
          <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} />
        </clipPath>
      </defs>

      <ellipse
        className="ct-bevel"
        cx={centerX}
        cy={centerY + bevelOffsetY}
        rx={radiusX}
        ry={radiusY + 3}
        fill="var(--ct-bevel)"
      />
      <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} fill={`url(#${surfaceId})`} />
      <ellipse
        cx={centerX}
        cy={centerY - 28}
        rx={radiusX * 0.78}
        ry={radiusY * 0.46}
        fill={`url(#${sheenId})`}
        opacity={0.22 * ambientIntensity}
        className="ct-sheen"
      />
      <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} fill={`url(#${vignetteId})`} />
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={radiusX - 0.75}
        ry={radiusY - 0.75}
        fill="none"
        stroke={`url(#${rimId})`}
        strokeWidth={1.5}
      />
      {ringScales.map((scale) => (
        <ellipse
          key={scale}
          cx={centerX}
          cy={centerY}
          rx={radiusX * scale}
          ry={radiusY * scale}
          fill="none"
          stroke="var(--ct-ring)"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
