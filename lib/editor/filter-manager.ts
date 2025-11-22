import Konva from "konva";
import { FilterSettings, EditorError } from "@/types/editor";
import {
  brightnessToInternal,
  saturationToInternal,
  hueToInternal,
} from "./filter-utils";

export class FilterManager {
  static applyFilters(imageNode: Konva.Image, settings: FilterSettings): void {
    try {
      imageNode.filters([]);
      imageNode.clearCache();
      const filterArray: (typeof Konva.Filters)[keyof typeof Konva.Filters][] =
        [];

      // Transform UI values to Konva internal values
      const internalBlur = Math.min(50, settings.blur / 2); // UI 0-100 -> Konva 0-50
      const internalBrightness = brightnessToInternal(settings.brightness); // UI -100 to +100 -> Konva -1 to 1
      const internalSaturation = saturationToInternal(settings.saturation); // UI -100 to +100 -> Konva -1 to 1
      const internalHue = hueToInternal(settings.hue); // UI -180 to +180 -> Konva 0-359

      if (settings.blur > 0) {
        filterArray.push(Konva.Filters.Blur);
      }

      if (settings.brightness !== 0) {
        filterArray.push(Konva.Filters.Brighten);
      }

      if (settings.contrast !== 0) {
        filterArray.push(Konva.Filters.Contrast);
      }

      if (settings.saturation !== 0 || settings.hue !== 0) {
        filterArray.push(Konva.Filters.HSL);
      }

      if (settings.grayscale) {
        filterArray.push(Konva.Filters.Grayscale);
      }

      if (settings.sepia) {
        filterArray.push(Konva.Filters.Sepia);
      }

      if (settings.invert) {
        filterArray.push(Konva.Filters.Invert);
      }

      if (filterArray.length > 0) {
        imageNode.filters(filterArray);

        if (settings.blur > 0) {
          imageNode.blurRadius(internalBlur);
        }

        if (settings.brightness !== 0) {
          imageNode.brightness(internalBrightness);
        }

        if (settings.contrast !== 0) {
          imageNode.contrast(settings.contrast);
        }

        if (settings.saturation !== 0 || settings.hue !== 0) {
          if (settings.saturation !== 0) {
            imageNode.saturation(internalSaturation);
          }
          if (settings.hue !== 0) {
            imageNode.hue(internalHue);
          }
        }

        imageNode.cache();
      }

      imageNode.getLayer()?.draw();
    } catch (error) {
      throw new EditorError(
        `Không thể apply filters: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "FILTER_APPLY_FAILED"
      );
    }
  }

  static clearFilters(imageNode: Konva.Image): void {
    imageNode.filters([]);
    imageNode.clearCache();
    imageNode.getLayer()?.draw();
  }

  static getFilterValues(imageNode: Konva.Image): Partial<FilterSettings> {
    const filters = imageNode.filters() || [];

    // Note: This method is not used in current implementation
    // Values are stored in UI scale in editor store
    return {
      blur: filters.includes(Konva.Filters.Blur) ? imageNode.blurRadius() : 0,
      brightness: filters.includes(Konva.Filters.Brighten)
        ? imageNode.brightness()
        : 0,
      contrast: filters.includes(Konva.Filters.Contrast)
        ? imageNode.contrast()
        : 0,
      saturation: filters.includes(Konva.Filters.HSL)
        ? imageNode.saturation()
        : 0,
      hue: filters.includes(Konva.Filters.HSL) ? imageNode.hue() : 0,
      grayscale: filters.includes(Konva.Filters.Grayscale),
      sepia: filters.includes(Konva.Filters.Sepia),
      invert: filters.includes(Konva.Filters.Invert),
    };
  }

  static validateSettings(settings: FilterSettings): boolean {
    return (
      settings.blur >= 0 &&
      settings.blur <= 100 &&
      settings.brightness >= -100 &&
      settings.brightness <= 100 &&
      settings.contrast >= -100 &&
      settings.contrast <= 100 &&
      settings.saturation >= -100 &&
      settings.saturation <= 100 &&
      settings.hue >= -180 &&
      settings.hue <= 180
    );
  }
}
