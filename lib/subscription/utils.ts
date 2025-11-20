import type { ProFeature } from "@/types/subscription";
import { PRO_FEATURES } from "@/types/subscription";

/**
 * Check if a feature requires Pro subscription
 */
export function isProFeature(feature: string): feature is ProFeature {
  return PRO_FEATURES.includes(feature as ProFeature);
}

/**
 * Get Pro feature display name
 */
export function getProFeatureName(feature: ProFeature): string {
  const names: Record<ProFeature, string> = {
    "no-watermark": "Không Watermark",
    "unlimited-projects": "Dự Án Không Giới Hạn",
    "advanced-filters": "Bộ Lọc Nâng Cao",
    "export-jpeg": "Export JPEG",
    "export-webp": "Export WebP",
    "keyboard-shortcuts": "Phím Tắt",
    "auto-save": "Tự Động Lưu",
    "priority-support": "Hỗ Trợ Ưu Tiên",
  };
  return names[feature];
}

/**
 * Format days remaining for display
 */
export function formatDaysRemaining(days: number | null): string {
  if (days === null) return "Không giới hạn";
  if (days === 0) return "Hết hạn hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
}

/**
 * Get subscription badge text
 */
export function getSubscriptionBadge(isTrial: boolean, tier: string): string {
  if (tier === "free") return "Free";
  if (isTrial) return "Pro Trial";
  return "Pro";
}

/**
 * Get subscription badge color classes
 */
export function getSubscriptionBadgeClass(
  isTrial: boolean,
  tier: string
): string {
  if (tier === "free") {
    return "bg-muted text-muted-foreground";
  }
  if (isTrial) {
    return "bg-gradient-to-r from-purple-500/20 to-amber-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30";
  }
  return "bg-gradient-to-r from-purple-500 to-amber-500 text-white";
}
