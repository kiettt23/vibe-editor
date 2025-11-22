/**
 * Utility functions for transforming filter values between UI and internal representations
 * Following industry standards (Photoshop, Lightroom, GIMP)
 */

/**
 * Transform brightness from UI scale (-100 to +100) to Konva scale (-1 to 1)
 * Industry standard: Photoshop/Lightroom use -100 to +100
 */
export function brightnessToInternal(uiValue: number): number {
  return uiValue / 100;
}

/**
 * Transform brightness from Konva scale (-1 to 1) to UI scale (-100 to +100)
 */
export function brightnessToUI(internalValue: number): number {
  return Math.round(internalValue * 100);
}

/**
 * Transform saturation from UI scale (-100 to +100) to Konva scale (-1 to 1)
 * Industry standard: Photoshop/Lightroom use -100 to +100
 */
export function saturationToInternal(uiValue: number): number {
  return uiValue / 100;
}

/**
 * Transform saturation from Konva scale (-1 to 1) to UI scale (-100 to +100)
 */
export function saturationToUI(internalValue: number): number {
  return Math.round(internalValue * 100);
}

/**
 * Transform hue from UI scale (-180 to +180) to Konva scale (0 to 359)
 * Industry standard: Photoshop uses -180 to +180 for color shift
 */
export function hueToInternal(uiValue: number): number {
  // Convert -180 to +180 range to 0 to 359 range
  return (uiValue + 180) % 360;
}

/**
 * Transform hue from Konva scale (0 to 359) to UI scale (-180 to +180)
 */
export function hueToUI(internalValue: number): number {
  // Convert 0 to 359 range to -180 to +180 range
  const shifted = internalValue - 180;
  return shifted < -180 ? shifted + 360 : shifted;
}

/**
 * Validate filter values are within acceptable ranges
 */
export function validateFilterValue(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}
