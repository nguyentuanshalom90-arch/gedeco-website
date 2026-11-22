import { prisma } from "./prisma-client.mjs";

function decode(value) {
  return value.replace(/<br\s*\/?>(\s*)/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&#8211;|&#x2013;/gi, "–").replace(/&#8212;|&#x2014;/gi, "—").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function makeSummary(product) {
  const source = decode(product.description || product.contentHtml || "");
  const fallback = `${product.title} — sản phẩm được giới thiệu và phân phối bởi GEDECO.`;
  const fullText = source || fallback;
  const text = fullText.slice(0, 240).replace(/\s+\S*$/, "").trim();
  return `<p>${escapeHtml(text)}${text.length < fullText.length ? "…" : ""}</p>`;
}

const products = await prisma.product.findMany({ where: { summaryHtml: "" }, select: { id: true, title: true, description: true, contentHtml: true } });
for (const product of products) await prisma.product.update({ where: { id: product.id }, data: { summaryHtml: makeSummary(product) } });
console.log(`PRODUCT_SUMMARY_BACKFILL_PASS updated=${products.length}`);
await prisma["$disconnect"]();
