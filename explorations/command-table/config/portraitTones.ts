export interface PortraitTone {
  from: string;
  to: string;
  figure: string;
}

/** Quiet studio backdrops. Variation is only enough to tell seats apart. */
export const portraitTones: Record<string, PortraitTone> = {
  commander: { from: "#E7EEF3", to: "#C5D0DA", figure: "#3E5160" },
  security: { from: "#E3EEF4", to: "#C3D4E0", figure: "#4A6578" },
  communications: { from: "#E8EEF1", to: "#CDD6DC", figure: "#5C7280" },
  operations: { from: "#E5ECEF", to: "#C9D3DA", figure: "#55697A" },
  legal: { from: "#E7EEEA", to: "#D0D6D2", figure: "#5A6C66" },
  executive: { from: "#EEEAE6", to: "#D6D1CB", figure: "#6A645E" },
};

export const fallbackPortraitTone: PortraitTone = portraitTones.commander;
