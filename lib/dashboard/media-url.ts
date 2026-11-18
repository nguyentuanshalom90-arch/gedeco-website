import { DashboardValidationError } from "./action-errors";

const allowedLocalMedia = /^(?:\/api\/media(?:\/|\?|$)|\/assets\/|\/uploads\/)/;

/**
 * Only allow media served by this project or by its official HTTPS domain.
 * Empty values are valid for optional media fields and are normalized to null.
 */
export function validateManagedMediaUrl(value: string, fieldLabel = "Media") {
  const input = value.trim();
  if (!input) return null;
  if (input.includes("\\") || input.startsWith("//")) {
    throw new DashboardValidationError(`${fieldLabel} phải thuộc thư viện media nội bộ hoặc domain chính thức.`);
  }
  if (allowedLocalMedia.test(input)) return input;

  try {
    const official = new URL(process.env.SITE_URL || "https://gedeco.vn");
    const parsed = new URL(input);
    const officialHost = official.hostname.toLowerCase().replace(/^www\./, "");
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (
      parsed.protocol === "https:" &&
      hostname === officialHost &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      !parsed.hash
    ) {
      return parsed.toString();
    }
  } catch {
    // Report the same safe validation error below.
  }
  throw new DashboardValidationError(`${fieldLabel} phải thuộc thư viện media nội bộ hoặc domain chính thức.`);
}
