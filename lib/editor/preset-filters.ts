import {
  FilterPreset,
  FilterSettings,
  DEFAULT_FILTER_SETTINGS,
} from "@/types/editor";

/**
 * Predefined filter presets
 * Instagram-style filters cho quick apply
 */
export const FILTER_PRESETS: FilterPreset[] = [
  {
    name: "Original",
    description: "Không có filter",
    settings: { ...DEFAULT_FILTER_SETTINGS },
  },
  {
    name: "Vintage",
    description: "Warm sepia tone",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      brightness: 0.1,
      contrast: 10,
      saturation: -0.2,
      sepia: true,
    },
  },
  {
    name: "Black & White",
    description: "Classic grayscale",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      grayscale: true,
      contrast: 15,
    },
  },
  {
    name: "Cool",
    description: "Blue tint, high contrast",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      hue: 200,
      saturation: 0.2,
      contrast: 20,
      brightness: -0.05,
    },
  },
  {
    name: "Warm",
    description: "Orange/yellow tint",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      hue: 30,
      saturation: 0.3,
      brightness: 0.1,
    },
  },
  {
    name: "High Contrast",
    description: "Dramatic contrast boost",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      contrast: 40,
      brightness: 0.05,
    },
  },
  {
    name: "Soft",
    description: "Gentle blur và low contrast",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      blur: 5,
      contrast: -10,
      brightness: 0.05,
    },
  },
  {
    name: "Vibrant",
    description: "Boosted saturation",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      saturation: 0.5,
      contrast: 10,
    },
  },
  {
    name: "Faded",
    description: "Washed out look",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      brightness: 0.2,
      contrast: -15,
      saturation: -0.3,
    },
  },
  {
    name: "Dramatic",
    description: "Inverted colors",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      invert: true,
      contrast: 20,
    },
  },
];

/**
 * Get preset by name
 */
export function getPresetByName(name: string): FilterPreset | undefined {
  return FILTER_PRESETS.find((preset) => preset.name === name);
}

/**
 * Get all preset names
 */
export function getPresetNames(): string[] {
  return FILTER_PRESETS.map((preset) => preset.name);
}
