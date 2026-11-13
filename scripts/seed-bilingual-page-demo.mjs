import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const slug = "demo-hop-tac-ben-vung";
const sections = [
  { type: "hero", eyebrow: "TRANG DEMO", title: "Hợp tác bền vững", body: "Một page mới được tạo từ nội dung tiếng Việt và dùng chung đúng một frontend cho hai ngôn ngữ.", imageUrl: "/assets/service-trade.jpg", imageAlt: "Kết nối hợp tác quốc tế" },
  { type: "feature-grid", title: "Cùng một cấu trúc, hai ngôn ngữ", body: "Các section, thứ tự và style được dùng chung; chỉ dữ liệu hiển thị thay đổi theo ngôn ngữ.", items: [{ title: "Đồng bộ layout", body: "Tiếng Việt và English luôn dùng cùng renderer." }, { title: "Dịch tự động", body: "Khi lưu page tiếng Việt, hệ thống tạo TranslationEntry tiếng Anh." }, { title: "Chuẩn SEO", body: "Mỗi page có title, description và canonical riêng theo locale." }] },
  { type: "cta", eyebrow: "GEDECO", title: "Sẵn sàng kết nối", body: "Liên hệ để cùng phát triển những cơ hội hợp tác mới.", buttonLabel: "Liên hệ ngay", buttonHref: "/lien-he" },
];
const englishPayload = {
  title: "Sustainable partnership",
  excerpt: "A newly created page uses one shared frontend for both languages.",
  metaTitle: "Sustainable partnership | GEDECO",
  metaDescription: "Discover a bilingual page with shared layout, translated content and SEO metadata.",
  sections: [
    { type: "hero", eyebrow: "DEMO PAGE", title: "Sustainable partnership", body: "A newly created page uses one shared frontend for both languages.", imageUrl: "/assets/service-trade.jpg", imageAlt: "International partnership" },
    { type: "feature-grid", title: "One structure, two languages", body: "Sections, order and styles are shared; only the displayed content changes by language.", items: [{ title: "Shared layout", body: "Vietnamese and English always use the same renderer." }, { title: "Automatic translation", body: "Saving a Vietnamese page creates its English TranslationEntry." }, { title: "SEO-ready", body: "Each page has localized title, description and canonical metadata." }] },
    { type: "cta", eyebrow: "GEDECO", title: "Ready to connect", body: "Contact us to explore new opportunities together.", buttonLabel: "Contact us", buttonHref: "/en/contact" },
  ],
};

try {
  const page = await prisma.sitePage.upsert({
    where: { slug },
    update: { name: "Demo page song ngữ", title: "Hợp tác bền vững", excerpt: "Một page mới được tạo từ nội dung tiếng Việt và dùng chung đúng một frontend cho hai ngôn ngữ.", sections, metaTitle: "Hợp tác bền vững | GEDECO", metaDescription: "Trang demo song ngữ dùng chung frontend, tự động dịch nội dung và tối ưu SEO.", canonicalUrl: `/pages/${slug}`, status: "PUBLISHED" },
    create: { slug, name: "Demo page song ngữ", title: "Hợp tác bền vững", excerpt: "Một page mới được tạo từ nội dung tiếng Việt và dùng chung đúng một frontend cho hai ngôn ngữ.", sections, metaTitle: "Hợp tác bền vững | GEDECO", metaDescription: "Trang demo song ngữ dùng chung frontend, tự động dịch nội dung và tối ưu SEO.", canonicalUrl: `/pages/${slug}`, status: "PUBLISHED" },
  });
  await prisma.translationEntry.upsert({
    where: { entityType_entityId_locale: { entityType: "SITE_PAGE", entityId: page.id, locale: "en" } },
    update: { slug, payload: englishPayload, sourceUpdatedAt: page.updatedAt, sourceHash: "demo-bilingual-page-v1", status: "TRANSLATED", provider: "demo", manualOverride: true, translatedAt: new Date(), errorMessage: null },
    create: { entityType: "SITE_PAGE", entityId: page.id, locale: "en", slug, payload: englishPayload, sourceUpdatedAt: page.updatedAt, sourceHash: "demo-bilingual-page-v1", status: "TRANSLATED", provider: "demo", manualOverride: true, translatedAt: new Date() },
  });
  console.log(JSON.stringify({ slug, vi: `/pages/${slug}`, en: `/en/pages/${slug}` }));
} finally {
  await prisma.$disconnect();
}
