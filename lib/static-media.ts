export function optimizedStaticMediaUrl(value: string | null | undefined) {
  if (!value || !value.startsWith("/assets/")) return value || "";
  if (!/\.(?:png|jpe?g)$/i.test(value)) return value;
  return value.replace(/\.(png|jpe?g)$/i, ".optimized.webp");
}
