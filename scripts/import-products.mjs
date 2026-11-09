import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsDir = path.join(root, 'public', 'assets', 'products');
const detailsDir = path.join(productsDir, 'details');
const shipperSource = 'https://gedeco.vn/wp-content/uploads/2021/05/ship-300x105.jpg';
const apiUrl = 'https://gedeco.vn/wp-json/wp/v2/product?per_page=100&_embed=1';
const domestic = new Set([
  'tra-dinh-thuong-hang-uop-sen', 'ruou-dong-trung-ha-thao', 'dong-trung-ha-thao-nguyen-con',
  'bot-matcha-huu-co', 'tra-dinh-uop-gao-sen', 'dia-spithera-xoa-sach-nep-nhan',
  'tra-dinh-thuong-hang-uop-hoa-buoi', 'tra-hoa-vang-rung', 'tra-uop-hoa-soi',
  'nhat-pham-tra-nhai-tra-dinh-uop-hoa-nhai', 'tra-dinh-uop-hoa-nhai', 'tra-dinh-uop-bong-sen',
  'thuc-pham-bao-ve-suc-khoe-carositol'
]);
const existingPrimary = {
  'bot-matcha-huu-co': 'bot-matcha-huu-co', 'ca-phe-arabica': 'ca-phe-arabica',
  'ca-phe-robusta': 'ca-phe-robusta', 'canned-pineapple': 'canned-pineapple',
  'dia-spithera-xoa-sach-nep-nhan': 'dia-spithera', 'dong-trung-ha-thao-nguyen-con': 'dong-trung-ha-thao-nguyen-con',
  'durian': 'durian', 'ca-tra-dau': 'fresh-ginger-dried-sliced-ginger',
  'tra-dinh-uop-bong-sen': 'hop-tra-sen-thuong-hang-10', 'ruou-dong-trung-ha-thao': 'ruou-dong-trung-ha-thao',
  'thuc-pham-bao-ve-suc-khoe-carositol': 'carositol', 'tieu-den': 'tieu-den'
};

const safeName = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const extFor = (contentType, url) => {
  const fromUrl = path.extname(new URL(url).pathname).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromUrl) ? fromUrl : (contentType?.includes('png') ? '.png' : '.jpg');
};
const fetchBuffer = async (url) => {
  const res = await fetch(url, { headers: { 'user-agent': 'GEDECO product import' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { buffer: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') || '' };
};
const toLocalImage = async (url, slug, index) => {
  const normalized = url.replace(/^http:\/\//, 'https://');
  if (!new URL(normalized).hostname.endsWith('gedeco.vn')) return null;
  const { buffer, contentType } = await fetchBuffer(normalized);
  const ext = extFor(contentType, normalized);
  const originalName = `${slug}-${String(index).padStart(2, '0')}${ext}`;
  const originalPath = path.join(detailsDir, originalName);
  await fs.writeFile(originalPath, buffer);
  const optimizedName = `${slug}-${String(index).padStart(2, '0')}.optimized.webp`;
  const optimizedPath = path.join(detailsDir, optimizedName);
  await sharp(buffer).webp({ quality: 84, alphaQuality: 90 }).toFile(optimizedPath);
  return `/assets/products/details/${optimizedName}`;
};

const loadCommerceSummary = async (link) => {
  try {
    const response = await fetch(link, { headers: { 'user-agent': 'GEDECO product import' } });
    if (!response.ok) return { summaryHtml: '', priceText: 'Liên hệ', stockText: 'Còn hàng' };
    const page = await response.text();
    const match = page.match(/<div class="woocommerce-product-details__short-description">([\s\S]*?)<div class="woodmart-before-add-to-cart">/i);
    const raw = match?.[1] || '';
    const summaryHtml = raw.replace(/<img[^>]*>/gi, '').trim();
    const text = summaryHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–').replace(/\s+/g, ' ').trim();
    const priceMatch = text.match(/Giá:\s*([^T]+?)(?=\s*Tình trạng:|$)/i);
    const stockMatch = text.match(/Tình trạng:\s*([^H]+?)(?=\s*Hộp|$)/i);
    return { summaryHtml, priceText: priceMatch?.[1]?.trim() || 'Liên hệ', stockText: stockMatch?.[1]?.trim() || 'Còn hàng' };
  } catch (error) { console.warn(`Commerce summary skipped: ${link} (${error.message})`); return { summaryHtml: '', priceText: 'Liên hệ', stockText: 'Còn hàng' }; }
};

await fs.mkdir(detailsDir, { recursive: true });
const shipperPath = path.join(productsDir, 'shipper.jpg');
if (!(await fs.stat(shipperPath).catch(() => null))) { const { buffer } = await fetchBuffer(shipperSource); await fs.writeFile(shipperPath, buffer); }
const products = await (await fetch(apiUrl)).json();
const imported = [];
for (const product of products) {
  const slug = product.slug;
  const imageUrls = [];
  const featured = product._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (featured) imageUrls.push(featured);
  const html = product.content?.rendered || '';
  for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) imageUrls.push(match[1]);
  const uniqueUrls = [...new Set(imageUrls.map((url) => url.replace(/-\d+x\d+(?=\.[a-z]{3,4}$)/i, '')))].filter(Boolean);
  const localImages = [];
  const rewrites = new Map();
  for (let index = 0; index < uniqueUrls.length; index += 1) {
    try {
      const local = await toLocalImage(uniqueUrls[index], slug, index + 1);
      if (local) { localImages.push(local); rewrites.set(uniqueUrls[index], local); }
    } catch (error) { console.warn(`Skipped media for ${slug}: ${error.message}`); }
  }
  let contentHtml = html;
  for (const [remote, local] of rewrites) contentHtml = contentHtml.split(remote).join(local);
  contentHtml = contentHtml.replace(/\s+(?:srcset|sizes)=["'][^"']*["']/gi, '');
  contentHtml = contentHtml.replace(/\[[^\]]+\]/g, '').replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (tag, src) => {
    if (src.startsWith('/assets/')) return tag;
    const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] || '';
    return alt ? alt : '';
  });
  const primaryBase = existingPrimary[slug] || slug;
  const primaryOriginal = path.join(productsDir, `${primaryBase}.jpg`);
  const primaryOptimized = path.join(productsDir, `${primaryBase}.optimized.webp`);
  if (!(await fs.stat(primaryOriginal).catch(() => null)) && featured) {
    const { buffer } = await fetchBuffer(featured.replace(/^http:\/\//, 'https://'));
    await fs.writeFile(primaryOriginal, buffer);
    await sharp(buffer).webp({ quality: 84, alphaQuality: 90 }).toFile(primaryOptimized);
  }
  const commerce = await loadCommerceSummary(product.link);
  imported.push({
    slug, title: product.title?.rendered || slug, category: domestic.has(slug) ? 'Sản phẩm trong nước' : 'Sản phẩm xuất khẩu',
    image: `/assets/products/${primaryBase}.optimized.webp`, description: (product.excerpt?.rendered || '').replace(/\[[^\]]+\]/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240),
    contentHtml, gallery: localImages, ...commerce, shipperImage: '/assets/products/shipper.jpg'
  });
}
const out = `export type GedecoProductDetail = { slug: string; title: string; category: 'Sản phẩm trong nước' | 'Sản phẩm xuất khẩu'; image: string; description: string; contentHtml: string; gallery: string[]; summaryHtml: string; priceText: string; stockText: string; shipperImage: string; };\n\nexport const gedecoProductDetails: GedecoProductDetail[] = ${JSON.stringify(imported, null, 2)};\n`;
await fs.writeFile(path.join(root, 'app', 'data', 'product-details.ts'), out, 'utf8');
console.log(`Imported ${imported.length} products and ${imported.reduce((sum, item) => sum + item.gallery.length, 0)} local gallery images.`);
