import { EditorSnapshot, EditorError } from "@/types/editor";

/**
 * HistoryManager - State-based undo/redo
 *
 * Best practice từ Konva docs:
 * - KHÔNG dùng stage.toJSON() (không serialize được images, filters, events)
 * - Lưu app state (filters, transform) thay vì Konva internals
 * - Lightweight và fast: chỉ JSON.stringify() simple objects
 *
 * Pattern: Store → Snapshot → History Array → Undo/Redo by restoring state
 */
export class HistoryManager {
  private history: EditorSnapshot[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;

  /**
   * Save snapshot of current editor state
   * Được gọi sau mỗi action: filter change, transform, crop, etc.
   */
  saveSnapshot(snapshot: EditorSnapshot): void {
    try {
      // Remove any future states (branching)
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Add new snapshot
      this.history.push({
        ...snapshot,
        timestamp: Date.now(),
      });

      this.currentIndex++;

      // Remove oldest if exceeding limit
      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.currentIndex--;
      }
    } catch (error) {
      throw new EditorError(
        `Không thể lưu snapshot: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "HISTORY_ERROR"
      );
    }
  }

  /**
   * Undo to previous state
   * Returns snapshot để app restore state
   */
  undo(): EditorSnapshot | null {
    if (!this.canUndo()) {
      return null;
    }

    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  /**
   * Redo to next state
   * Returns snapshot để app restore state
   */
  redo(): EditorSnapshot | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current snapshot
   */
  getCurrentSnapshot(): EditorSnapshot | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history statistics
   */
  getStats() {
    return {
      totalSnapshots: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimate memory usage (KB)
   */
  private estimateMemoryUsage(): number {
    const json = JSON.stringify(this.history);
    return (json.length * 2) / 1024; // UTF-16 = 2 bytes per char
  }

  /**
   * Export history to JSON (for save/load project)
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
    });
  }

  /**
   * Import history from JSON
   */
  importHistory(json: string): void {
    try {
      const data = JSON.parse(json);
      this.history = data.history || [];
      this.currentIndex = data.currentIndex ?? -1;
    } catch (error) {
      throw new EditorError(
        "Không thể import history: Invalid JSON",
        "HISTORY_ERROR"
      );
    }
  }
}
