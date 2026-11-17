import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProductBySlug, getProductCategoryBySlug, listProducts } from "@/lib/products";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { ProductCatalog, ProductDetailGallery, ShopBreadcrumb, ShopGuarantee, ShopRelated, ShopShell, ShopSidebar } from "@/app/components/shop-pages";
import { Icon } from "@/app/components/inner-pages";

export const dynamic = "force-dynamic";

function localize(html: string) { return html.replace(/Status:\s*In stock/gi, "Tình trạng: Còn hàng").replace(/Made in Vietnam/gi, "Sản xuất tại Việt Nam").replace(/Fresh ginger, dried sliced ginger/gi, "Gừng tươi, gừng thái lát sấy khô").replace(/Place of origin/gi, "Nơi xuất xứ").replace(/Natural color/gi, "Màu sắc tự nhiên").replace(/on request/gi, "theo yêu cầu").replace(/Ingredients/gi, "Thành phần").replace(/Packing/gi, "Đóng gói").replace(/Certification(s)?/gi, "Chứng nhận").replace(/Payment/gi, "Thanh toán").replace(/Color\s*:/gi, "Màu sắc:").replace(/MOQ\s*:/gi, "Số lượng tối thiểu:").replace(/\bSize\b/gi, "Kích thước").replace(/Vietnam/gi, "Việt Nam").replace(/Contact rates/gi, "Liên hệ báo giá").replace(/Contact for details about product information/gi, "Liên hệ để biết thêm thông tin sản phẩm"); }
function displayTitle(value: string) { return value.replace(/Fresh ginger, dried sliced ginger/gi, "Gừng tươi, gừng thái lát sấy khô").replace(/Canned pineapple/gi, "Dứa đóng hộp").replace(/Durian/gi, "Sầu riêng"); }

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }): Promise<Metadata> {
  const path = (await params).path || [];
  if (path.length === 1) {
    const category = await getProductCategoryBySlug(path[0], "vi");
    if (category) {
      const canonical = absoluteUrl(category.canonicalUrl || `/san-pham/${category.slug}`);
      const english = absoluteUrl(category.canonicalUrlEn || `/en/products/${category.slugEn}`);
      const title = category.metaTitle || category.name;
      const description = category.metaDescription || category.description || `Khám phá ${category.name.toLocaleLowerCase("vi")} từ GEDECO.`;
      return { title, description, alternates: { canonical, languages: { vi: canonical, en: english, "x-default": canonical } }, robots: { index: category.robotsIndex, follow: category.robotsFollow }, openGraph: { type: "website", locale: "vi_VN", siteName: siteConfig.brand, url: canonical, title, description, images: category.imageUrl ? [{ url: absoluteUrl(category.imageUrl), alt: category.imageAlt || category.name }] : undefined } };
    }
  }
  const slug = path.length > 1 ? path[1] : path[0];
  const product = slug ? await getProductBySlug(slug) : null;
  if (!product) return { title: "Không tìm thấy sản phẩm", robots: { index: false, follow: false } };
  const category = product.categorySlug || "trong-nuoc";
  const canonical = absoluteUrl(product.canonicalUrl || `/san-pham/${category}/${product.slug}`);
  const english = absoluteUrl(`/en/products/${product.categorySlugEn || "domestic"}/${product.slug}`);
  const title = product.metaTitle || displayTitle(product.title);
  const description = (product.metaDescription || product.description || siteConfig.defaultDescription).slice(0, 160);
  const image = product.ogImage || product.image;
  return { title, description, alternates: { canonical, languages: { vi: canonical, en: english, "x-default": canonical } }, robots: { index: product.robotsIndex !== false, follow: product.robotsFollow !== false }, openGraph: { type: "website", locale: "vi_VN", siteName: siteConfig.brand, url: canonical, title, description, images: image ? [{ url: absoluteUrl(image), alt: product.ogImageAlt || product.imageAlt || product.title }] : undefined }, twitter: { card: "summary_large_image", title, description, images: image ? [absoluteUrl(image)] : undefined } };
}

export default async function ProductOrCategoryPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const path = (await params).path || [];
  if (!path.length) redirect("/san-pham");
  if (path.length === 1) {
    const category = await getProductCategoryBySlug(path[0], "vi");
    if (category) {
      const products = await listProducts();
      const canonical = absoluteUrl(category.canonicalUrl || `/san-pham/${category.slug}`);
      const jsonLd = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: category.name, description: category.metaDescription || category.description || undefined, url: canonical, inLanguage: "vi-VN" }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Trang chủ", item: siteConfig.officialUrl }, { "@type": "ListItem", position: 2, name: "Sản phẩm", item: absoluteUrl("/san-pham") }, { "@type": "ListItem", position: 3, name: category.name, item: canonical }] }];
      return <ShopShell current={category.name} heroImage={category.imageUrl || undefined} heroSubtitle={category.description || undefined}><div className="shop-width shop-page-layout"><div className="shop-main"><ShopBreadcrumb current={category.name} />{category.imageCaption && <p className="product-category-caption">{category.imageCaption}</p>}<ProductCatalog items={products} initialCategory={category.slug} /></div><ShopSidebar /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /></ShopShell>;
    }
  }
  const slug = path.length > 1 ? path[1] : path[0];
  const product = slug ? await getProductBySlug(slug) : null;
  if (!product) notFound();
  const category = product.categorySlug || "trong-nuoc";
  if (path.length === 1 || path[0] !== category) redirect(`/san-pham/${category}/${product.slug}`);
  const title = displayTitle(product.title);
  const gallery = [{ url: product.image, altText: product.imageAlt || title, caption: product.imageCaption || "" }, ...(product.galleryMedia || product.gallery.map((url, index) => ({ url, altText: `${title} ${index + 2}`, caption: "" }))).filter((item) => item.url !== product.image)].slice(0, 6);
  const summary = localize(product.summaryHtml || "");
  const all = await listProducts();
  const canonical = absoluteUrl(product.canonicalUrl || `/san-pham/${category}/${product.slug}`);
  const productSchema = { "@context": "https://schema.org", "@type": "Product", name: title, description: product.metaDescription || product.description, image: gallery.map((item) => absoluteUrl(item.url)), sku: product.slug, brand: { "@type": "Brand", name: siteConfig.brand }, url: canonical, inLanguage: "vi-VN" };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Trang chủ", item: siteConfig.officialUrl }, { "@type": "ListItem", position: 2, name: product.category, item: absoluteUrl(`/san-pham/${category}`) }, { "@type": "ListItem", position: 3, name: title, item: canonical }] };
  return <ShopShell hero={false}><div className="shop-width shop-detail-layout"><div className="shop-main"><ShopBreadcrumb current={title} category={product.category} categorySlug={category} /><section className="shop-product-detail"><ProductDetailGallery gallery={gallery} title={title} /><article className="shop-detail-summary"><h1>{title}</h1>{summary && <div className="shop-summary-html" dangerouslySetInnerHTML={{ __html: summary }} />}{product.stockText && !/Tình trạng:/i.test(summary) && <p className="shop-stock">Tình trạng: <strong>{product.stockText}</strong></p>}<img className="shop-shipper" src={product.shipperImage} alt="Dịch vụ giao hàng" /><a className="shop-buy" href="tel:+84914943653"><Icon name="phone" />MUA HÀNG</a><ShopGuarantee /></article></section><section className="shop-description"><div className="shop-description-tab">MÔ TẢ SẢN PHẨM</div><article dangerouslySetInnerHTML={{ __html: localize(product.contentHtml) }} /><a className="shop-product-contact" href="tel:+84914943653"><Icon name="phone" />Liên hệ về sản phẩm · 0914 94 3653</a></section><ShopRelated products={all} current={product.slug} /></div><ShopSidebar /></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([productSchema, breadcrumbSchema]).replace(/</g, "\\u003c") }} /></ShopShell>;
}
