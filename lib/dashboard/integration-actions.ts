"use server";

import { prisma } from "@/lib/prisma";
import { integrationDefaults, type IntegrationCategory, type IntegrationItem } from "./integration-types";

export async function listIntegrations(category: IntegrationCategory): Promise<IntegrationItem[]> {
  const stored = await prisma.dashboardIntegration.findMany({ where: { category }, orderBy: { createdAt: "asc" } });
  const map = new Map(stored.map((item) => [item.provider, item]));
  return integrationDefaults.filter((item) => item.category === category).map((item) => {
    const saved = map.get(item.provider);
    const config = saved?.config && typeof saved.config === "object" && !Array.isArray(saved.config) ? saved.config as Record<string, string | boolean | number> : {};
    const merged = saved ? { ...item.config, ...config } : item.config;
    const safeConfig = item.provider === "sepay" ? { ...merged, apiKey: "", apiKeySet: Boolean(config.apiKey) } : merged;
    return saved ? { ...item, enabled: saved.enabled, config: safeConfig } : { ...item, config: safeConfig };
  });
}

export async function saveIntegration(input: IntegrationItem): Promise<{ ok: true }> {
  if (process.env.NODE_ENV === "production") throw new Error("Chưa cấu hình xác thực quản trị cho môi trường production.");
  if (!integrationDefaults.some((item) => item.category === input.category && item.provider === input.provider)) throw new Error("Tích hợp không hợp lệ.");
  const existing = await prisma.dashboardIntegration.findUnique({ where: { category_provider: { category: input.category, provider: input.provider } } });
  const existingConfig = existing?.config && typeof existing.config === "object" && !Array.isArray(existing.config) ? existing.config as Record<string, string | boolean | number> : {};
  const config = input.provider === "sepay" && !String(input.config.apiKey || "").trim()
    ? { ...input.config, apiKey: existingConfig.apiKey || "" }
    : input.config;
  await prisma.dashboardIntegration.upsert({
    where: { category_provider: { category: input.category, provider: input.provider } },
    create: { category: input.category, provider: input.provider, enabled: input.enabled, config },
    update: { enabled: input.enabled, config },
  });
  return { ok: true };
}
