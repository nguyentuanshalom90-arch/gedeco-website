import fs from 'node:fs/promises';

const source = await fs.readFile(new URL('../app/data/product-details.ts', import.meta.url), 'utf8');
const start = source.indexOf('export const gedecoProductDetails');
const jsonStart = source.indexOf('[', source.indexOf('=', start));
const products = JSON.parse(source.slice(jsonStart, source.lastIndexOf(']') + 1));

const slugMap = {
  'tra-dinh-thuong-hang-uop-sen': 'premium-ding-tea-with-lotus',
  'tieu-den': 'black-pepper',
  'ca-phe-robusta': 'robusta-coffee',
  'ca-phe-arabica': 'arabica-coffee',
  'ruou-dong-trung-ha-thao': 'cordyceps-liquor',
  'dong-trung-ha-thao-nguyen-con': 'whole-cordyceps',
  'bot-matcha-huu-co': 'organic-matcha-powder',
  'tra-dinh-uop-gao-sen': 'ding-tea-with-lotus-rice',
  'dia-spithera-xoa-sach-nep-nhan': 'dia-spithera-wrinkle-care',
  'tra-dinh-thuong-hang-uop-hoa-buoi': 'premium-ding-tea-with-pomelo-blossom',
  'tra-hoa-vang-rung': 'wild-tam-dao-golden-flower-tea',
  'tra-uop-hoa-soi': 'wolf-flower-scented-tea',
  'nhat-pham-tra-nhai-tra-dinh-uop-hoa-nhai': 'premium-ding-tea-traditional-flavor',
  'tra-dinh-uop-hoa-nhai': 'premium-ding-tea-with-jasmine',
  'tra-dinh-uop-bong-sen': 'premium-lotus-tea-box-10',
  durian: 'durian',
  'thuc-pham-bao-ve-suc-khoe-carositol': 'carositol-korean-health-supplement',
  'canned-pineapple': 'canned-pineapple',
  'ca-tra-dau': 'fresh-ginger-dried-sliced-ginger',
};

const vietnamese = /[À-ỹ]/;
const titleMap = {
  'tra-dinh-thuong-hang-uop-sen': 'SUPERIOR DINH TEA MARINATED WITH LOTUS',
  'tieu-den': 'BLACK PEPPER',
  'ca-phe-robusta': 'ROBUSTA COFFEE',
  'ca-phe-arabica': 'ARABICA COFFEE',
  'ruou-dong-trung-ha-thao': 'CORDYCEPS LIQUOR',
  'dong-trung-ha-thao-nguyen-con': 'WHOLE CORDYCEPS',
  'bot-matcha-huu-co': 'ORGANIC MATCHA POWDER',
  'tra-dinh-uop-gao-sen': 'DING TEA WITH LOTUS RICE',
  'dia-spithera-xoa-sach-nep-nhan': 'DIA SPITHERA WRINKLE CARE',
  'tra-dinh-thuong-hang-uop-hoa-buoi': 'PREMIUM DINH TEA WITH POMELO BLOSSOM',
  'tra-hoa-vang-rung': 'WILD TAM DAO GOLDEN FLOWER TEA',
  'tra-uop-hoa-soi': 'WOLF FLOWER SCENTED TEA',
  'nhat-pham-tra-nhai-tra-dinh-uop-hoa-nhai': 'PREMIUM DINH TEA, TRADITIONAL FLAVOR',
  'tra-dinh-uop-hoa-nhai': 'PREMIUM DINH TEA WITH JASMINE',
  'tra-dinh-uop-bong-sen': 'PREMIUM LOTUS TEA BOX 10',
  durian: 'DURIAN',
  'thuc-pham-bao-ve-suc-khoe-carositol': "CAROSITOL — KOREA'S NO. 1 HEALTH SUPPLEMENT FOR DIABETES PREVENTION",
  'canned-pineapple': 'CANNED PINEAPPLE',
  'ca-tra-dau': 'FRESH GINGER, DRIED SLICED GINGER',
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateChunk(text, attempt = 0) {
  const normalized = text?.normalize('NFKC') || text;
  if (!normalized || !vietnamese.test(normalized)) return normalized;
  const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&format=html&q=${encodeURIComponent(normalized)}`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return (payload[0] || []).map((item) => item[0]).join('') || normalized;
  } catch (error) {
    if (attempt < 3) { await wait(800 * (attempt + 1)); return translateChunk(text, attempt + 1); }
    throw error;
  }
}

async function translateHtml(value) {
  if (!value || !vietnamese.test(value)) return value;
  const parts = value.split(/(<[^>]*>)/g);
  const textParts = parts.map((part, index) => ({ part, index })).filter(({ part }) => !/^<[^>]*>$/.test(part) && vietnamese.test(part.normalize('NFKC')));
  for (let offset = 0; offset < textParts.length; offset += 18) {
    const batch = textParts.slice(offset, offset + 18);
    const markers = batch.map((_, index) => `ZZZGED${index}ZZZ`);
    const sourceText = batch.map(({ part }, index) => `${markers[index]} ${part.normalize('NFKC')}`).join('\n');
    const translated = await translateChunk(sourceText);
    const pieces = translated.split(/ZZZGED\d+ZZZ/g);
    if (pieces.length === batch.length + 1) {
      batch.forEach(({ index }, batchIndex) => { parts[index] = pieces[batchIndex + 1].replace(/^\s+/, ''); });
    } else {
      for (let batchIndex = 0; batchIndex < batch.length; batchIndex += 1) {
        const { index, part } = batch[batchIndex];
        parts[index] = await translateChunk(part);
      }
    }
    await wait(180);
  }
  return parts.join('');
}

const translations = {};
for (const product of products) {
  console.log(`Translating ${product.slug}`);
  translations[product.slug] = {
    sourceSlug: product.slug,
    slug: slugMap[product.slug] || product.slug,
    title: titleMap[product.slug] || await translateChunk(product.title),
    category: product.category === 'Sản phẩm xuất khẩu' ? 'Export products' : 'Domestic products',
    description: await translateHtml(product.description),
    contentHtml: await translateHtml(product.contentHtml),
    summaryHtml: await translateHtml(product.summaryHtml),
    priceText: 'Contact us',
    stockText: 'In stock',
  };
  await wait(220);
}

const output = `// Generated from app/data/product-details.ts. Do not edit the Vietnamese source data.\nexport const englishProductTranslations = ${JSON.stringify(translations, null, 2)} as const;\nexport type EnglishProductTranslation = (typeof englishProductTranslations)[keyof typeof englishProductTranslations];\n`;
await fs.writeFile(new URL('../app/data/product-translations-en.ts', import.meta.url), output, 'utf8');
console.log(`Wrote ${Object.keys(translations).length} English product translations.`);
