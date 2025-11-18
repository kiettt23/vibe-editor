import Konva from "konva";
import { FilterSettings, EditorError } from "@/types/editor";

/**
 * FilterManager - Quản lý filters cho Konva Image
 *
 * Best practices từ Konva docs:
 * - Phải gọi node.cache() TRƯỚC khi apply filters
 * - Filters là array: node.filters([Konva.Filters.Blur, Konva.Filters.Sepia])
 * - Set giá trị: node.blurRadius(10), node.brightness(0.5)
 * - Clear cache khi filters thay đổi để force re-render
 */
export class FilterManager {
  /**
   * Apply filters to Konva Image node
   * Pattern từ Konva docs: cache() → filters() → set values → draw()
   */
  static applyFilters(imageNode: Konva.Image, settings: FilterSettings): void {
    try {
      // Step 1: Clear existing filters và cache
      imageNode.filters([]);
      imageNode.clearCache();

      // Step 2: Build filters array
      const filterArray: (typeof Konva.Filters)[keyof typeof Konva.Filters][] =
        [];

      // Blur filter
      if (settings.blur > 0) {
        filterArray.push(Konva.Filters.Blur);
      }

      // Brightness filter (Brighten)
      if (settings.brightness !== 0) {
        filterArray.push(Konva.Filters.Brighten);
      }

      // Contrast filter
      if (settings.contrast !== 0) {
        filterArray.push(Konva.Filters.Contrast);
      }

      // HSL filter (cho saturation và hue)
      if (settings.saturation !== 0 || settings.hue !== 0) {
        filterArray.push(Konva.Filters.HSL);
      }

      // Grayscale filter (boolean)
      if (settings.grayscale) {
        filterArray.push(Konva.Filters.Grayscale);
      }

      // Sepia filter (boolean)
      if (settings.sepia) {
        filterArray.push(Konva.Filters.Sepia);
      }

      // Invert filter (boolean)
      if (settings.invert) {
        filterArray.push(Konva.Filters.Invert);
      }

      // Step 3: Set filters array
      if (filterArray.length > 0) {
        imageNode.filters(filterArray);

        // Step 4: Set filter values
        if (settings.blur > 0) {
          imageNode.blurRadius(settings.blur);
        }

        if (settings.brightness !== 0) {
          // Brighten filter: -1 to 1
          imageNode.brightness(settings.brightness);
        }

        if (settings.contrast !== 0) {
          // Contrast filter: -100 to 100
          imageNode.contrast(settings.contrast);
        }

        if (settings.saturation !== 0 || settings.hue !== 0) {
          // HSL filter
          if (settings.saturation !== 0) {
            imageNode.saturation(settings.saturation);
          }
          if (settings.hue !== 0) {
            imageNode.hue(settings.hue);
          }
        }

        // Step 5: Cache node (REQUIRED for filters to work)
        imageNode.cache();
      }

      // Step 6: Redraw layer
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

  /**
   * Clear all filters from image
   */
  static clearFilters(imageNode: Konva.Image): void {
    imageNode.filters([]);
    imageNode.clearCache();
    imageNode.getLayer()?.draw();
  }

  /**
   * Get current filter values from image node
   * Useful for syncing UI state với actual Konva state
   */
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

  /**
   * Validate filter settings values
   */
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
