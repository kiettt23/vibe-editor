import Konva from "konva";
import { FilterSettings, EditorError } from "@/types/editor";

export class FilterManager {
  static applyFilters(imageNode: Konva.Image, settings: FilterSettings): void {
    try {
      imageNode.filters([]);
      imageNode.clearCache();
      const filterArray: (typeof Konva.Filters)[keyof typeof Konva.Filters][] =
        [];

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
          imageNode.blurRadius(settings.blur);
        }

        if (settings.brightness !== 0) {
          imageNode.brightness(settings.brightness);
        }

        if (settings.contrast !== 0) {
          imageNode.contrast(settings.contrast);
        }

        if (settings.saturation !== 0 || settings.hue !== 0) {
          if (settings.saturation !== 0) {
            imageNode.saturation(settings.saturation);
          }
          if (settings.hue !== 0) {
            imageNode.hue(settings.hue);
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
      settings.brightness >= -1 &&
      settings.brightness <= 1 &&
      settings.contrast >= -100 &&
      settings.contrast <= 100 &&
      settings.saturation >= -1 &&
      settings.saturation <= 1 &&
      settings.hue >= 0 &&
      settings.hue <= 359
    );
  }
}
