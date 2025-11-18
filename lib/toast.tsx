import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";

/**
 * Consistent toast notifications with icons
 */

export const toastSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    icon: <CheckCircle2 className="h-4 w-4" />,
  });
};

export const toastError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    icon: <XCircle className="h-4 w-4" />,
  });
};

export const toastWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    icon: <AlertCircle className="h-4 w-4" />,
  });
};

export const toastInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    icon: <Info className="h-4 w-4" />,
  });
};

export const toastLoading = (message: string, description?: string) => {
  return toast.loading(message, {
    description,
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  });
};

export const toastPromise = <T,>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) => {
  return toast.promise(promise, {
    loading,
    success: (data) =>
      typeof success === "function" ? success(data) : success,
    error: (err) => (typeof error === "function" ? error(err) : error),
  });
};

// Specific toast messages for common actions
export const toastMessages = {
  // Upload
  uploadSuccess: () => toastSuccess("Đã tải ảnh lên thành công"),
  uploadError: () => toastError("Không thể tải ảnh lên", "Vui lòng thử lại"),

  // Save
  saveSuccess: () => toastSuccess("Đã lưu project"),
  saveError: () => toastError("Không thể lưu project", "Vui lòng thử lại"),
  autoSaveSuccess: () => toastInfo("Đã tự động lưu"),

  // Export
  exportSuccess: (filename: string) =>
    toastSuccess("Đã export thành công", `File: ${filename}`),
  exportError: () => toastError("Không thể export ảnh", "Vui lòng thử lại"),
  exportWithWatermark: () =>
    toastWarning("Đã export với watermark", "Nâng cấp Pro để bỏ watermark"),

  // Filters
  filterApplied: (filterName: string) =>
    toastSuccess(`Đã áp dụng: ${filterName}`),
  filterReset: () => toastSuccess("Đã reset tất cả"),
  filterError: () => toastError("Không thể áp dụng filter"),

  // Project
  projectCreated: () => toastSuccess("Đã tạo project mới"),
  projectDeleted: () => toastSuccess("Đã xóa project"),
  projectDeleteError: () => toastError("Không thể xóa project"),
  projectLoadError: () => toastError("Không thể tải project"),

  // Auth
  loginSuccess: () => toastSuccess("Đăng nhập thành công"),
  logoutSuccess: () => toastSuccess("Đã đăng xuất"),
  signupSuccess: () => toastSuccess("Đăng ký thành công"),
  authError: (message?: string) =>
    toastError("Lỗi xác thực", message || "Vui lòng thử lại"),

  // General
  copiedToClipboard: () => toastSuccess("Đã sao chép"),
  invalidInput: (field: string) =>
    toastWarning(`${field} không hợp lệ`, "Vui lòng kiểm tra lại"),
  featureProOnly: () =>
    toastWarning("Tính năng Pro", "Nâng cấp để sử dụng tính năng này"),
};
