"use server";

import { prisma } from "@/lib/prisma";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { contentPages, dynamicSeed } from "./site-content-seed";
import type { SiteContentInput, SiteContentItem, SiteContentKind } from "./site-content-types";

function assertDashboardWriteAllowed() {
  if (process.env.NODE_ENV === "production") throw new Error("Chưa cấu hình xác thực quản trị cho môi trường production.");
}

async function ensureSeeded() {
  for (const page of contentPages) {
    await prisma.siteContentPage.upsert({
      where: { pageKey: page.pageKey },
      update: {},
      create: { ...page },
    });
  }
  for (const [pageKey, sectionKey, fieldKey, label, value, headingLevel, sortOrder] of dynamicSeed) {
    await prisma.siteDynamicContent.upsert({
      where: { pageKey_sectionKey_fieldKey: { pageKey, sectionKey, fieldKey } },
      update: {},
      create: { pageKey, sectionKey, fieldKey, label, value, headingLevel: headingLevel || null, sortOrder },
    });
  }
}

const staticContentPath = path.join(process.cwd(), "data", "site-static-content.json");

async function readStaticContent(): Promise<any[]> {
  return JSON.parse(await readFile(staticContentPath, "utf8")) as any[];
}

async function writeStaticContent(rows: any[]) {
  await writeFile(staticContentPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

function toItem(row: any): SiteContentItem {
  return {
    id: row.id,
    pageKey: row.pageKey,
    pageName: row.page.name,
    route: row.page.route,
    h1: row.page.h1 ?? "",
    metaTitle: row.page.metaTitle ?? "",
    metaDescription: row.page.metaDescription ?? "",
    canonicalUrl: row.page.canonicalUrl ?? "",
    robotsIndex: row.page.robotsIndex,
    robotsFollow: row.page.robotsFollow,
    sectionKey: row.sectionKey,
    fieldKey: row.fieldKey,
    label: row.label,
    value: row.value,
    contentType: row.contentType,
    headingLevel: row.headingLevel ?? "",
    imageUrl: row.imageUrl ?? "",
    altText: row.altText ?? "",
    isVisible: row.isVisible,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export async function listSiteContent(kind: SiteContentKind): Promise<SiteContentItem[]> {
  await ensureSeeded();
  const rows = kind === "dynamic"
    ? await prisma.siteDynamicContent.findMany({ include: { page: true }, orderBy: [{ pageKey: "asc" }, { sortOrder: "asc" }] })
    : (await readStaticContent()).sort((a, b) => a.pageKey.localeCompare(b.pageKey) || a.sortOrder - b.sortOrder).map((row) => ({ ...row, page: null }));
  if (kind === "static") {
    const pages = await prisma.siteContentPage.findMany();
    return rows.map((row) => toItem({ ...row, page: pages.find((page) => page.pageKey === row.pageKey) }));
  }
  return rows.map(toItem);
}

export async function saveSiteContent(kind: SiteContentKind, input: SiteContentInput): Promise<{ ok: true; item: SiteContentItem }> {
  assertDashboardWriteAllowed();
  const pageKey = input.pageKey.trim();
  const sectionKey = input.sectionKey.trim();
  const fieldKey = input.fieldKey.trim();
  if (!pageKey || !sectionKey || !fieldKey || !input.label.trim()) throw new Error("Vui lòng nhập đủ page key, section key, field key và nhãn nội dung.");
  if (!input.h1.trim()) throw new Error("Mỗi page phải có đúng một H1 page để đảm bảo cấu trúc SEO.");
  if (!input.metaTitle.trim() || input.metaTitle.trim().length > 60) throw new Error("SEO title bắt buộc và không vượt quá 60 ký tự.");
  if (!input.metaDescription.trim() || input.metaDescription.trim().length > 160) throw new Error("Meta description bắt buộc và không vượt quá 160 ký tự.");
  if (!input.canonicalUrl.trim()) throw new Error("Canonical URL là bắt buộc cho mỗi page.");
  if (input.headingLevel === "H1") {
    if (kind === "dynamic") {
      const duplicate = await prisma.siteDynamicContent.findFirst({ where: { pageKey, headingLevel: "H1", ...(input.id ? { NOT: { id: input.id } } : {}) } });
      if (duplicate) throw new Error("Mỗi page chỉ được có một heading H1.");
    } else {
      const rows = await readStaticContent();
      if (rows.some((row) => row.pageKey === pageKey && row.headingLevel === "H1" && row.id !== input.id)) throw new Error("Mỗi page chỉ được có một heading H1.");
    }
  }
  const page = await prisma.siteContentPage.upsert({
    where: { pageKey },
    update: {
      name: input.pageName?.trim() || pageKey,
      route: input.route.trim() || "/",
      h1: input.h1.trim() || null,
      metaTitle: input.metaTitle.trim() || null,
      metaDescription: input.metaDescription.trim() || null,
      canonicalUrl: input.canonicalUrl.trim() || null,
      robotsIndex: input.robotsIndex,
      robotsFollow: input.robotsFollow,
    },
    create: {
      pageKey,
      name: input.pageName?.trim() || pageKey,
      route: input.route.trim() || "/",
      h1: input.h1.trim() || null,
      metaTitle: input.metaTitle.trim() || null,
      metaDescription: input.metaDescription.trim() || null,
      canonicalUrl: input.canonicalUrl.trim() || null,
      robotsIndex: input.robotsIndex,
      robotsFollow: input.robotsFollow,
    },
  });
  const data = {
    pageKey,
    sectionKey,
    fieldKey,
    label: input.label.trim(),
    value: input.value,
    contentType: input.contentType,
    headingLevel: input.headingLevel || null,
    imageUrl: input.imageUrl.trim() || null,
    altText: input.altText.trim() || null,
    isVisible: input.isVisible,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
  if (kind === "static") {
    const rows = await readStaticContent();
    const index = input.id ? rows.findIndex((row) => row.id === input.id) : rows.findIndex((row) => row.pageKey === pageKey && row.sectionKey === sectionKey && row.fieldKey === fieldKey);
    const staticRow = { id: input.id || `static-${pageKey}-${sectionKey}-${fieldKey}-${Date.now()}`, ...data, updatedAt: new Date().toISOString() };
    if (index >= 0) rows[index] = staticRow;
    else rows.push(staticRow);
    await writeStaticContent(rows);
    const pageRecord = await prisma.siteContentPage.findUnique({ where: { pageKey } });
    return { ok: true, item: toItem({ ...staticRow, page: pageRecord }) };
  }
  const row = await prisma.siteDynamicContent.upsert({ where: { pageKey_sectionKey_fieldKey: { pageKey, sectionKey, fieldKey } }, update: data, create: data, include: { page: true } });
  return { ok: true, item: toItem({ ...row, page: page || row.page }) };
}

export async function deleteSiteContent(kind: SiteContentKind, id: string): Promise<{ ok: true }> {
  assertDashboardWriteAllowed();
  if (kind === "dynamic") await prisma.siteDynamicContent.delete({ where: { id } });
  else await writeStaticContent((await readStaticContent()).filter((row) => row.id !== id));
  return { ok: true };
}
