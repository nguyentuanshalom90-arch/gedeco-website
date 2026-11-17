import { DashboardValidationError } from "./action-errors.ts";

type Options = {
  fieldLabel?: string;
  pathPrefix?: string;
};

export function validateOfficialCanonical(value: string, options: Options = {}) {
  const canonical = value.trim();
  if (!canonical) return null;
  const field = options.fieldLabel || "Canonical URL";
  if (canonical.includes("\\") || canonical.startsWith("//")) {
    throw new DashboardValidationError(`${field} phải là đường dẫn nội bộ hoặc URL HTTPS của domain chính thức.`);
  }

  let parsed: URL;
  const officialUrl = process.env.SITE_URL || "https://gedeco.vn";
  try {
    parsed = new URL(canonical, officialUrl);
  } catch {
    throw new DashboardValidationError(`${field} không hợp lệ.`);
  }

  const official = new URL(officialUrl);
  const officialHost = official.hostname.toLowerCase().replace(/^www\./, "");
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const isRelative = canonical.startsWith("/");
  if (parsed.protocol !== "https:" || hostname !== officialHost || parsed.username || parsed.password || parsed.port || parsed.hash) {
    throw new DashboardValidationError(`${field} chỉ được dùng HTTPS trên domain ${officialHost}, không chứa tài khoản, port hoặc fragment.`);
  }
  if (options.pathPrefix && !parsed.pathname.startsWith(options.pathPrefix)) {
    throw new DashboardValidationError(`${field} phải bắt đầu bằng ${options.pathPrefix}.`);
  }
  return isRelative ? `${parsed.pathname}${parsed.search}` : parsed.toString();
}

