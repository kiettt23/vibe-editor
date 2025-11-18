import type { FilterConfig, PresetFilter } from "@/types/editor";

/**
 * Instagram-style preset filters
 */

export const PRESET_FILTERS: PresetFilter[] = [
  {
    id: "valencia",
    name: "Valencia",
    config: {
      brightness: 10,
      contrast: 5,
      saturation: 20,
    },
  },
  {
    id: "clarendon",
    name: "Clarendon",
    config: {
      brightness: 15,
      contrast: 25,
      saturation: 10,
    },
  },
  {
    id: "gingham",
    name: "Gingham",
    config: {
      brightness: 5,
      contrast: -10,
    },
  },
  {
    id: "juno",
    name: "Juno",
    config: {
      brightness: 10,
      contrast: 15,
      saturation: 30,
    },
  },
  {
    id: "lark",
    name: "Lark",
    config: {
      brightness: 20,
      contrast: -5,
      saturation: -10,
    },
  },
  {
    id: "moon",
    name: "Moon",
    config: {
      grayscale: true,
      brightness: 15,
      contrast: 10,
    },
  },
  {
    id: "reyes",
    name: "Reyes",
    config: {
      brightness: 20,
      contrast: -15,
      saturation: -20,
    },
  },
  {
    id: "slumber",
    name: "Slumber",
    config: {
      brightness: 5,
      saturation: -30,
    },
  },
  {
    id: "crema",
    name: "Crema",
    config: {
      brightness: 10,
      saturation: -10,
    },
  },
  {
    id: "ludwig",
    name: "Ludwig",
    config: {
      brightness: 10,
      contrast: 5,
      saturation: 10,
    },
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): PresetFilter | undefined {
  return PRESET_FILTERS.find((preset) => preset.id === id);
}

/**
 * Apply preset intensity (0-100%)
 */
export function applyPresetWithIntensity(
  preset: PresetFilter,
  intensity: number
): FilterConfig {
  const factor = intensity / 100;

  const config: FilterConfig = {};

  if (preset.config.blur !== undefined) {
    config.blur = preset.config.blur * factor;
  }
  if (preset.config.brightness !== undefined) {
    config.brightness = preset.config.brightness * factor;
  }
  if (preset.config.contrast !== undefined) {
    config.contrast = preset.config.contrast * factor;
  }
  if (preset.config.saturation !== undefined) {
    config.saturation = preset.config.saturation * factor;
  }
  if (preset.config.grayscale) {
    config.grayscale = intensity > 50; // Toggle at 50%
  }

  return config;
}
