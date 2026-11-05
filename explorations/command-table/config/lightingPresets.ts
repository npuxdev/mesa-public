import type { AmbientPreset, AmbientPresetDefinition } from "../types/commandTable.types";

/**
 * Room treatments. Rendering code reads the active preset's tokens as CSS variables.
 * Add or replace a preset here without editing the scene components.
 */
export const lightingPresets: Record<AmbientPreset, AmbientPresetDefinition> = {
  daylight: {
    id: "daylight",
    label: "Daylight",
    description: "Neutral and airy, with a soft overhead wash.",
    tokens: {
      canvas: "#F2F5F7",
      ambientCore: "rgba(255, 255, 255, 0.96)",
      softbox: "rgba(255, 255, 255, 0.98)",
      fill: "rgba(255, 255, 255, 0.42)",
      tableTop: "#E7EEF3",
      tableBottom: "#D5E0E8",
      bevel: "#C3CED8",
      ring: "rgba(110, 128, 142, 0.38)",
      vignette: "#8EA3B3",
      spotlight: "#FFFFFF",
      shadow: "#2C3C4A",
      ink: "#1C2830",
      muted: "#5A6C7A",
      accent: "#3D5A6C",
      card: "rgba(255, 255, 255, 0.94)",
    },
  },
  cool: {
    id: "cool",
    label: "Cool",
    description: "Blue-gray and subdued, as if the room were overcast.",
    tokens: {
      canvas: "#E9EEF3",
      ambientCore: "rgba(232, 241, 248, 0.94)",
      softbox: "rgba(240, 247, 252, 0.96)",
      fill: "rgba(206, 220, 232, 0.45)",
      tableTop: "#E3EBF2",
      tableBottom: "#D0DCE6",
      bevel: "#B9C8D6",
      ring: "rgba(96, 122, 144, 0.4)",
      vignette: "#7C98AE",
      spotlight: "#F6FAFE",
      shadow: "#283848",
      ink: "#1C2830",
      muted: "#516678",
      accent: "#3A5870",
      card: "rgba(251, 253, 255, 0.94)",
    },
  },
  warm: {
    id: "warm",
    label: "Warm",
    description: "A slight neutral warmth. Limestone, not amber.",
    tokens: {
      canvas: "#F5F3EF",
      ambientCore: "rgba(255, 251, 246, 0.94)",
      softbox: "rgba(255, 249, 242, 0.96)",
      fill: "rgba(236, 228, 216, 0.4)",
      tableTop: "#EFEAE4",
      tableBottom: "#E2DBD2",
      bevel: "#D0C6BA",
      ring: "rgba(124, 114, 102, 0.36)",
      vignette: "#B4A89A",
      spotlight: "#FFFCF8",
      shadow: "#3A342E",
      ink: "#241F1C",
      muted: "#655E56",
      accent: "#3D5A6C",
      card: "rgba(255, 253, 250, 0.95)",
    },
  },
};

export const ambientPresetList: readonly AmbientPresetDefinition[] = [
  lightingPresets.daylight,
  lightingPresets.cool,
  lightingPresets.warm,
];
