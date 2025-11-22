import { FilterPreset, DEFAULT_FILTER_SETTINGS } from "@/types/editor";

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
      brightness: 10,
      contrast: 10,
      saturation: -20,
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
      hue: 20,
      saturation: 20,
      contrast: 20,
      brightness: -5,
    },
  },
  {
    name: "Warm",
    description: "Orange/yellow tint",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      hue: -150,
      saturation: 30,
      brightness: 10,
    },
  },
  {
    name: "High Contrast",
    description: "Dramatic contrast boost",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      contrast: 40,
      brightness: 5,
    },
  },
  {
    name: "Soft",
    description: "Gentle blur và low contrast",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      blur: 10,
      contrast: -10,
      brightness: 5,
    },
  },
  {
    name: "Vibrant",
    description: "Boosted saturation",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      saturation: 50,
      contrast: 10,
    },
  },
  {
    name: "Faded",
    description: "Washed out look",
    settings: {
      ...DEFAULT_FILTER_SETTINGS,
      brightness: 20,
      contrast: -15,
      saturation: -30,
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

export function getPresetByName(name: string): FilterPreset | undefined {
  return FILTER_PRESETS.find((preset) => preset.name === name);
}

export function getPresetNames(): string[] {
  return FILTER_PRESETS.map((preset) => preset.name);
}
