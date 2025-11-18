import type * as fabric from "fabric";
import type { HistoryState } from "@/types/editor";

/**
 * History Manager - Handles undo/redo functionality
 */
export class HistoryManager {
  private canvas: fabric.Canvas;
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;
  private isUndoRedoing: boolean = false;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.saveState();
  }

  /**
   * Setup event listeners for canvas changes
   */
  private setupEventListeners() {
    const events = [
      "object:added",
      "object:modified",
      "object:removed",
      "object:skewing",
    ] as const;

    events.forEach((event) => {
      this.canvas.on(event as any, () => {
        if (!this.isUndoRedoing) {
          this.saveState();
        }
      });
    });
  }

  /**
   * Save current canvas state
   */
  saveState() {
    // Remove any states after current index (for branching)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    const state: HistoryState = {
      canvasJSON: JSON.stringify(this.canvas.toJSON()),
      timestamp: Date.now(),
    };

    this.history.push(state);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo last action
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) return false;

    this.isUndoRedoing = true;
    this.currentIndex--;

    const state = this.history[this.currentIndex];
    await this.restoreState(state);

    this.isUndoRedoing = false;
    return true;
  }

  /**
   * Redo last undone action
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) return false;

    this.isUndoRedoing = true;
    this.currentIndex++;

    const state = this.history[this.currentIndex];
    await this.restoreState(state);

    this.isUndoRedoing = false;
    return true;
  }

  /**
   * Restore canvas state from history
   */
  private async restoreState(state: HistoryState): Promise<void> {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(state.canvasJSON, () => {
        this.canvas.renderAll();
        resolve();
      });
    });
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
   * Clear history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.saveState();
  }

  /**
   * Get history info
   */
  getHistoryInfo() {
    return {
      total: this.history.length,
      current: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }
}
