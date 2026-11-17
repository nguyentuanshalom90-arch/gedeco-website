import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import {
  getEnglishProductBySlug,
  getProductCategoryBySlug,
  listEnglishProducts,
} from "@/lib/products";
import { Icon } from "../../../components/inner-pages";
import {
  ProductCatalog,
  ProductDetailGallery,
  ShopBreadcrumb,
  ShopGuarantee,
  ShopRelated,
  ShopShell,
  ShopSidebar,
} from "../../../components/shop-pages";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { redirectDestination } from "@/lib/url-redirects";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const path = (await params).path || [];
  if (path.length === 1) {
    const category = await getProductCategoryBySlug(path[0], "en");
    if (category) {
      const canonical = absoluteUrl(
        category.canonicalUrlEn || `/en/products/${category.slugEn}`,
      );
      const vi = absoluteUrl(
        category.canonicalUrl || `/san-pham/${category.slug}`,
      );
      const title = category.metaTitleEn || category.nameEn;
      const description =
        category.metaDescriptionEn ||
        category.descriptionEn ||
        `Explore ${category.nameEn.toLowerCase()} from GEDECO.`;
      return {
        title,
        description,
        alternates: {
          canonical,
          languages: { vi, en: canonical, "x-default": vi },
        },
        robots: { index: category.robotsIndex, follow: category.robotsFollow },
        openGraph: {
          type: "website",
          locale: "en_US",
          siteName: siteConfig.brand,
          url: canonical,
          title,
          description,
          images: category.imageUrl
            ? [
                {
                  url: absoluteUrl(category.imageUrl),
                  alt: category.imageAltEn || category.nameEn,
                },
              ]
            : undefined,
        },
      };
    }
  }
  const slug = path.length > 1 ? path[1] : path[0];
  if (!slug)
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  const resolved = await getEnglishProductBySlug(slug);
  if (!resolved)
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  const category = resolved.view.categorySlugEn || "domestic";
  const canonical = absoluteUrl(
    resolved.view.canonicalUrl ||
      `/en/products/${category}/${resolved.canonicalSlug}`,
  );
  const vi = absoluteUrl(
    `/san-pham/${resolved.source.categorySlug || "trong-nuoc"}/${resolved.sourceSlug}`,
  );
  const title = resolved.view.metaTitle || resolved.view.title;
  const description = (
    resolved.view.metaDescription || resolved.view.description
  ).slice(0, 160);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { vi, en: canonical, "x-default": vi },
    },
    robots: {
      index: resolved.view.robotsIndex !== false,
      follow: resolved.view.robotsFollow !== false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.brand,
      url: canonical,
      title,
      description,
      images: resolved.view.ogImage
        ? [
            {
              url: absoluteUrl(resolved.view.ogImage),
              alt: resolved.view.ogImageAlt || resolved.view.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: resolved.view.ogImage
        ? [absoluteUrl(resolved.view.ogImage)]
        : undefined,
    },
  };
}

export default async function EnglishProductOrCategoryPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const path = (await params).path || [];
  if (!path.length) redirect("/en/products");
  if (path.length === 1) {
    const category = await getProductCategoryBySlug(path[0], "en");
    if (category) {
      const products = await listEnglishProducts();
      const canonical = absoluteUrl(
        category.canonicalUrlEn || `/en/products/${category.slugEn}`,
      );
      const jsonLd = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.nameEn,
          description:
            category.metaDescriptionEn || category.descriptionEn || undefined,
          url: canonical,
          inLanguage: "en",
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: absoluteUrl("/en"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Products",
              item: absoluteUrl("/en/products"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: category.nameEn,
              item: canonical,
            },
          ],
        },
      ];
      return (
        <ShopShell
          language="en"
          current={category.nameEn}
          heroImage={category.imageUrl || undefined}
          heroSubtitle={category.descriptionEn || undefined}
          alternateVietnamesePath={`/san-pham/${category.slug}`}
        >
          <div className="shop-width shop-page-layout">
            <div className="shop-main">
              <ShopBreadcrumb language="en" current={category.nameEn} />
              {category.imageCaptionEn && (
                <p className="product-category-caption">
                  {category.imageCaptionEn}
                </p>
              )}
              <ProductCatalog
                items={products}
                initialCategory={category.slugEn}
                language="en"
              />
            </div>
            <ShopSidebar language="en" />
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />
        </ShopShell>
      );
    }
  }
  const slug = path.length > 1 ? path[1] : path[0];
  const resolved = slug ? await getEnglishProductBySlug(slug) : null;
  if (!resolved) {
    const destination = await redirectDestination(
      `/en/products/${path.join("/")}`,
    );
    if (destination) permanentRedirect(destination);
    notFound();
  }
  const category = resolved.view.categorySlugEn || "domestic";
  if (
    path.length < 2 ||
    path[0] !== category ||
    resolved.canonicalSlug !== slug
  )
    permanentRedirect(`/en/products/${category}/${resolved.canonicalSlug}`);
  const product = resolved.view;
  const gallery = [
    {
      url: product.image,
      altText: product.imageAlt || product.title,
      caption: product.imageCaption || "",
    },
    ...(
      product.galleryMedia ||
      product.gallery.map((url, index) => ({
        url,
        altText: `${product.title} ${index + 2}`,
        caption: "",
      }))
    ).filter((item) => item.url !== product.image),
  ].slice(0, 6);
  const all = await listEnglishProducts();
  const canonical = absoluteUrl(
    product.canonicalUrl ||
      `/en/products/${category}/${resolved.canonicalSlug}`,
  );
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.metaDescription || product.description,
    image: gallery.map((item) => absoluteUrl(item.url)),
    sku: resolved.sourceSlug,
    brand: { "@type": "Brand", name: siteConfig.brand },
    url: canonical,
    inLanguage: "en",
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/en"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: absoluteUrl(`/en/products/${category}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: canonical,
      },
    ],
  };
  return (
    <ShopShell
      language="en"
      hero={false}
      alternateVietnamesePath={`/san-pham/${resolved.source.categorySlug}/${resolved.sourceSlug}`}
    >
      <div className="shop-width shop-detail-layout">
        <div className="shop-main">
          <ShopBreadcrumb
            language="en"
            current={product.title}
            category={product.category}
            categorySlug={category}
          />
          <section className="shop-product-detail">
            <ProductDetailGallery
              gallery={gallery}
              title={product.title}
              language="en"
            />
            <article className="shop-detail-summary">
              <h1>{product.title}</h1>
              {product.summaryHtml && (
                <div
                  className="shop-summary-html"
                  dangerouslySetInnerHTML={{ __html: product.summaryHtml }}
                />
              )}
              {product.stockText && !/Status:/i.test(product.summaryHtml) && (
                <p className="shop-stock">
                  Status: <strong>{product.stockText}</strong>
                </p>
              )}
              <img
                className="shop-shipper"
                src={product.shipperImage}
                alt="Delivery service"
              />
              <a className="shop-buy" href="tel:+84914943653">
                <Icon name="phone" />
                BUY NOW
              </a>
              <ShopGuarantee language="en" />
            </article>
          </section>
          <section className="shop-description">
            <div className="shop-description-tab">PRODUCT DESCRIPTION</div>
            <article
              dangerouslySetInnerHTML={{ __html: product.contentHtml }}
            />
            <a className="shop-product-contact" href="tel:+84914943653">
              <Icon name="phone" />
              Contact about this product · 0914 94 3653
            </a>
          </section>
          <ShopRelated products={all} current={product.slug} language="en" />
        </div>
        <ShopSidebar language="en" />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productSchema, breadcrumbSchema]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
    </ShopShell>
  );
}
