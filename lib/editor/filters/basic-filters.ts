import type { FilterConfig } from "@/types/editor";

/**
 * Blur filter (0-100)
 */
export function applyBlur(value: number): Partial<FilterConfig> {
  return { blur: Math.max(0, Math.min(100, value)) };
}

/**
 * Grayscale toggle
 */
export function applyGrayscale(enabled: boolean): Partial<FilterConfig> {
  return { grayscale: enabled };
}

/**
 * Brightness adjustment (-100 to +100)
 */
export function applyBrightness(value: number): Partial<FilterConfig> {
  return { brightness: Math.max(-100, Math.min(100, value)) };
}

/**
 * Contrast adjustment (-100 to +100)
 */
export function applyContrast(value: number): Partial<FilterConfig> {
  return { contrast: Math.max(-100, Math.min(100, value)) };
}

/**
 * Saturation adjustment (-100 to +100)
 */
export function applySaturation(value: number): Partial<FilterConfig> {
  return { saturation: Math.max(-100, Math.min(100, value)) };
}

/**
 * Flip horizontal
 */
export function flipHorizontal(): Partial<FilterConfig> {
  return { flipX: true };
}

/**
 * Flip vertical
 */
export function flipVertical(): Partial<FilterConfig> {
  return { flipY: true };
}

/**
 * Reset all filters
 */
export function resetFilters(): FilterConfig {
  return {
    blur: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    grayscale: false,
    flipX: false,
    flipY: false,
  };
}
