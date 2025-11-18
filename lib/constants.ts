export const CANVAS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MIN_WIDTH: 600,
  MIN_HEIGHT: 400,
  SIDEBAR_WIDTH: 512,
  HEADER_HEIGHT: 64,
} as const;

export const SUBSCRIPTION = {
  FREE_PROJECT_LIMIT: 5,
  PRO_PROJECT_LIMIT: 999,
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "File quá lớn! Tối đa 10MB",
  FILE_INVALID_TYPE:
    "Định dạng file không hợp lệ! Chỉ chấp nhận PNG, JPG, WEBP",
  CANVAS_INIT_FAILED: "Không thể khởi tạo canvas",
  IMAGE_LOAD_FAILED: "Không thể tải ảnh",
  IMAGE_UPLOAD_FAILED: "Không thể tải ảnh lên",
  EXPORT_FAILED: "Không thể xuất ảnh",
  UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện thao tác này",
  PROJECT_NOT_FOUND: "Không tìm thấy dự án",
  PROJECT_CREATE_FAILED: "Không thể tạo dự án",
  PROJECT_UPDATE_FAILED: "Không thể cập nhật dự án",
  PROJECT_DELETE_FAILED: "Không thể xóa dự án",
  UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định",
} as const;

export const SUCCESS_MESSAGES = {
  IMAGE_UPLOADED: "Đã tải ảnh thành công!",
  IMAGE_EXPORTED: "Đã xuất ảnh thành công!",
  PROJECT_CREATED: "Đã tạo dự án thành công!",
  PROJECT_UPDATED: "Đã cập nhật dự án!",
  PROJECT_DELETED: "Đã xóa dự án!",
  FILTERS_RESET: "Đã reset filters!",
} as const;
