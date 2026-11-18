/** Read deployment environment values at runtime in standalone builds. */
export function runtimeEnv(name: string) {
  return process.env[name]?.trim() || "";
}
