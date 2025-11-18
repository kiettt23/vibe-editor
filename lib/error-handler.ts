import { toast } from "sonner";

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Đã xảy ra lỗi không xác định";
}

export function handleError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);

  if (process.env.NODE_ENV === "development") {
    console.error(`[${context || "Error"}]:`, error);
  }

  toast.error(message);
}

export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context || "Error"}]:`, error);
  }
}
