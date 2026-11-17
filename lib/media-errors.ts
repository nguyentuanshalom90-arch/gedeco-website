type NodeStorageError = Error & { code?: string };

export function mediaStorageErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as NodeStorageError).code || "")
    : "";
  if (code === "EACCES" || code === "EPERM") {
    return "Thư mục media không có quyền ghi. Vui lòng kiểm tra quyền storage.";
  }
  if (code === "ENOENT") {
    return "Thư mục media không tồn tại hoặc chưa được gắn đúng.";
  }
  if (code === "ENOSPC" || code === "EDQUOT") {
    return "Dung lượng hoặc quota lưu trữ media đã hết.";
  }
  return "Không thể lưu ảnh. Vui lòng kiểm tra storage và thử lại.";
}
