import "server-only";

import path from "node:path";

export function mediaRoot() {
  const configured = process.env.MEDIA_ROOT;
  if (process.env.NODE_ENV === "production") {
    if (!configured || !path.isAbsolute(configured)) {
      throw new Error("MEDIA_ROOT phải là đường dẫn tuyệt đối ngoài release ở production.");
    }
    return path.resolve(configured);
  }
  return path.resolve(configured || path.join(process.cwd(), ".uploads"));
}

export function containedMediaPath(filename: string) {
  const root = mediaRoot();
  const resolved = path.resolve(root, filename);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) throw new Error("Invalid media path");
  return resolved;
}
