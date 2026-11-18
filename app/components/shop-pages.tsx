"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ContactActions } from "./contact-actions";
import { EnglishHeader } from "./english-pages";
import { Icon, InnerFooter, InnerHeader, InnerHero } from "./inner-pages";
import type { GedecoProductDetail } from "../data/product-details";

type ShopProduct = Omit<GedecoProductDetail, "category"> & { category: string };
import styles from "./product-filters.module.css";

type ShopLanguage = "vi" | "en";
type SharedChromeValue = {
  value: string;
  url: string;
  imageUrl: string;
  altText: string;
  caption: string;
};
const ShopChromeContext = createContext<{
  values: Record<string, SharedChromeValue>;
  loaded: boolean;
}>({ values: {}, loaded: false });

function safeSharedUrl(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (
    /^tel:\+?[0-9 .()-]+$/i.test(value) ||
    /^mailto:[^\s@]+@[^\s@]+$/i.test(value)
  )
    return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.toString()
      : fallback;
  } catch {
    return fallback;
  }
}

export function ShopHeader({
  active = "SẢN PHẨM",
  language = "vi",
  alternateEnglishPath,
  alternateVietnamesePath,
}: {
  active?: string;
  language?: ShopLanguage;
  alternateEnglishPath?: string | null;
  alternateVietnamesePath?: string | null;
}) {
  return language === "en" ? (
    <EnglishHeader
      active="Products"
      alternateVietnamesePath={alternateVietnamesePath}
    />
  ) : (
    <InnerHeader
      active={active === "SẢN PHẨM" ? "Sản phẩm" : active}
      alternateEnglishPath={alternateEnglishPath}
    />
  );
}

export function ShopHero({
  title = "Sản phẩm",
  eyebrow = "GEDECO PRODUCTS",
  language = "vi",
  image = "/assets/banner-1.jpg",
  subtitle,
}: {
  title?: string;
  eyebrow?: string;
  language?: ShopLanguage;
  image?: string;
  subtitle?: string;
}) {
  const isProductsLanding = title === "Sản phẩm" || title === "Products";
  const english = language === "en";
  return (
    <InnerHero
      eyebrow={eyebrow}
      title={
        isProductsLanding
          ? english
            ? "Domestic and export products"
            : "Sản phẩm trong nước và xuất khẩu"
          : title
      }
      subtitle={
        subtitle ||
        (isProductsLanding
          ? english
            ? "Explore GEDECO products, from Vietnamese sources to products connecting with international markets."
            : "Khám phá danh mục sản phẩm GEDECO, từ nguồn hàng Việt Nam đến các sản phẩm kết nối thị trường quốc tế."
          : english
            ? "Product information and cooperation solutions from GEDECO."
            : "Thông tin sản phẩm và giải pháp hợp tác từ GEDECO.")
      }
      image={image}
    />
  );
}

export function ShopBreadcrumb({
  current,
  category,
  categorySlug,
  language = "vi",
}: {
  current: string;
  category?: string;
  categorySlug?: string;
  language?: ShopLanguage;
}) {
  const english = language === "en";
  const categoryIsExport =
    category === "Sản phẩm xuất khẩu" || category === "Export products";
  const fallbackSlug = english
    ? categoryIsExport
      ? "export"
      : "domestic"
    : categoryIsExport
      ? "xuat-khau"
      : "trong-nuoc";
  const categoryHref = `${english ? "/en/products" : "/san-pham"}?category=${categorySlug || fallbackSlug}`;
  const homeHref = english ? "/en" : "/";
  const homeLabel = english ? "Home" : "Trang chủ";
  return (
    <nav
      className="shop-breadcrumb"
      aria-label={english ? "Breadcrumb" : "Đường dẫn trang"}
    >
      <Link href={homeHref}>{homeLabel}</Link>
      <span>/</span>
      {category && (
        <>
          <Link href={categoryHref}>{category}</Link>
          <span>/</span>
        </>
      )}
      <strong>{current}</strong>
    </nav>
  );
}

export function ShopSidebar({ language = "vi" }: { language?: ShopLanguage }) {
  const english = language === "en";
  const { values: chrome, loaded } = useContext(ShopChromeContext);
  const [news, setNews] = useState<
    Array<{ id: string; title: string; date: string; href: string }>
  >([]);
  useEffect(() => {
    fetch(`/api/featured-news?lang=${language}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setNews(payload?.items || []))
      .catch(() => setNews([]));
  }, [language]);
  const get = (key: string, fallback: string) => chrome[key]?.value || fallback;
  const supportImage = chrome["shopSupport.image"];
  const showSupport = !loaded || Boolean(chrome["shopSupport.heading"]);
  const showNews = !loaded || Boolean(chrome["shopNews.heading"]);
  return (
    <aside className="shop-sidebar">
      {showSupport && (
        <section className="shop-support">
          <h2>
            {get(
              "shopSupport.heading",
              english ? "CUSTOMER SUPPORT" : "HỖ TRỢ KHÁCH HÀNG",
            )}
          </h2>
          {(!loaded || supportImage) && (
            <>
              <img
                src={supportImage?.imageUrl || "/assets/shop-support.jpg"}
                alt={
                  supportImage?.altText ||
                  (english
                    ? "GEDECO customer support representative"
                    : "Nhân viên hỗ trợ khách hàng GEDECO")
                }
              />
              {supportImage?.caption ? (
                <small>{supportImage.caption}</small>
              ) : null}
            </>
          )}
          {(!loaded || chrome["shopSupport.name"]) && (
            <strong>
              {get("shopSupport.name", english ? "MY LINH" : "MỸ LINH")}
            </strong>
          )}
          {(!loaded || chrome["shopSupport.phone"]) && (
            <span>
              {get(
                "shopSupport.phone",
                english ? "Phone: +(84) 914943653" : "SĐT: +(84) 914943653",
              )}
            </span>
          )}
        </section>
      )}
      {showNews && (
        <section className="shop-news">
          <h2>
            {get(
              "shopNews.heading",
              english ? "FEATURED NEWS" : "TIN TỨC NỔI BẬT",
            )}
          </h2>
          {news.map((item) => (
            <Link href={item.href} key={item.id}>
              <b>{item.title}</b>
              <small>{item.date}</small>
            </Link>
          ))}
        </section>
      )}
    </aside>
  );
}

export function ShopShell({
  children,
  hero = true,
  current = "Sản phẩm",
  language = "vi",
  heroImage,
  heroTitle,
  heroEyebrow,
  heroSubtitle,
  alternateEnglishPath,
  alternateVietnamesePath,
}: {
  children: React.ReactNode;
  hero?: boolean;
  current?: string;
  language?: ShopLanguage;
  heroImage?: string;
  heroTitle?: string;
  heroEyebrow?: string;
  heroSubtitle?: string;
  alternateEnglishPath?: string | null;
  alternateVietnamesePath?: string | null;
}) {
  const [chrome, setChrome] = useState<Record<string, SharedChromeValue>>({});
  const [chromeLoaded, setChromeLoaded] = useState(false);
  useEffect(() => {
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = "vi";
    };
  }, [language]);
  useEffect(() => {
    setChromeLoaded(false);
    fetch(`/api/site-chrome?area=FOOTER&lang=${language}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        setChrome(payload?.values || {});
        setChromeLoaded(true);
      })
      .catch(() => setChromeLoaded(true));
  }, [language]);
  return (
    <ShopChromeContext.Provider
      value={{ values: chrome, loaded: chromeLoaded }}
    >
      <div
        className={`shop-site${hero ? "" : " shop-site-no-hero"}${language === "en" ? " shop-site-en" : ""}`}
      >
        <ShopHeader
          language={language}
          alternateEnglishPath={alternateEnglishPath}
          alternateVietnamesePath={alternateVietnamesePath}
        />
        {hero && (
          <ShopHero
            title={heroTitle || current}
            eyebrow={heroEyebrow}
            language={language}
            image={heroImage}
            subtitle={heroSubtitle}
          />
        )}
        <main>{children}</main>
        <InnerFooter language={language} />
        <ContactActions english={language === "en"} />
      </div>
    </ShopChromeContext.Provider>
  );
}

type ProductCardItem = Pick<
  GedecoProductDetail,
  "slug" | "title" | "image" | "categorySlug" | "categorySlugEn"
> & { category: string };

export function localizeShopProductTitle(
  title: string,
  language: ShopLanguage = "vi",
) {
  if (language === "en") {
    const titleMap: Record<string, string> = {
      "Trà Đinh Thượng Hạng ướp Sen": "Superior Dinh Tea Marinated with Lotus",
      "TIÊU ĐEN": "BLACK PEPPER",
      "CÀ PHÊ ROBUSTA": "ROBUSTA COFFEE",
      "CÀ PHÊ ARABICA": "ARABICA COFFEE",
      "Rượu Đông Trùng Hạ Thảo": "CORDYCEPS LIQUOR",
      "Đông Trùng Hạ Thảo Nguyên con": "WHOLE CORDYCEPS",
      "BỘT MATCHA HỮU CƠ": "ORGANIC MATCHA POWDER",
      "TRÀ ĐINH ƯỚP GẠO SEN": "DING TEA WITH LOTUS RICE",
      "DIA SPITHERA XÓA SẠCH NẾP NHĂN": "DIA SPITHERA WRINKLE CARE",
      "TRÀ ĐINH THƯỢNG HẠNG ƯỚP HOA BƯỞI":
        "PREMIUM DING TEA WITH POMELO BLOSSOM",
      "TRÀ HOA VÀNG RỪNG TAM ĐẢO": "WILD TAM DAO GOLDEN FLOWER TEA",
      "Trà ướp hoa sói": "WOLF FLOWER SCENTED TEA",
      "TRÀ ĐINH THƯỢNG HẠNG NGUYÊN VỊ TRUYỀN THỐNG":
        "PREMIUM DING TEA, TRADITIONAL FLAVOR",
      "TRÀ ĐINH THƯỢNG HẠNG ƯỚP HOA NHÀI": "PREMIUM DING TEA WITH JASMINE",
      "HỘP TRÀ SEN THƯỢNG HẠNG 10": "PREMIUM LOTUS TEA BOX 10",
      DURIAN: "DURIAN",
      "Canned pineapple": "CANNED PINEAPPLE",
      "Fresh ginger, dried sliced ginger": "FRESH GINGER, DRIED SLICED GINGER",
    };
    return titleMap[title] || title;
  }
  return title
    .replace(
      /Fresh ginger, dried sliced ginger/gi,
      "Gừng tươi, gừng thái lát sấy khô",
    )
    .replace(/Canned pineapple/gi, "Dứa đóng hộp")
    .replace(/Durian/gi, "Sầu riêng");
}

export function ShopProductCard({
  product,
  className = "",
  language = "vi",
  onMouseEnter,
  onFocus,
}: {
  product: ProductCardItem;
  className?: string;
  language?: ShopLanguage;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
}) {
  const english = language === "en";
  const { values: chrome } = useContext(ShopChromeContext);
  const catalogText = (key: string, fallback: string) => chrome[`shopCatalog.${key}`]?.value || fallback;
  const title = english
    ? product.title
    : localizeShopProductTitle(product.title, language);
  const categorySlug = english
    ? product.categorySlugEn ||
      (product.category === "Export products" ||
      product.category === "Sản phẩm xuất khẩu"
        ? "export"
        : "domestic")
    : product.categorySlug ||
      (product.category === "Sản phẩm xuất khẩu" ? "xuat-khau" : "trong-nuoc");
  const productSlug = product.slug;
  const href = english
    ? `/en/products/${categorySlug}/${productSlug}`
    : `/san-pham/${categorySlug}/${productSlug}`;
  return (
    <article
      className={`shop-product-card ${className}`.trim()}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
    >
      <Link href={href} className="shop-product-image">
        {product.image ? (
          <img src={product.image} alt={title} />
        ) : (
          <span
            className="shop-product-image-placeholder"
            aria-label={
              english ? "Image is being updated" : "Hình ảnh đang được cập nhật"
            }
          >
            <Icon name="box" />
            <small>
              {english ? "Image coming soon" : "Hình ảnh đang cập nhật"}
            </small>
          </span>
        )}
      </Link>
      <div
        className="shop-product-body"
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        <h3
          style={{
            height: "42.5px",
            minHeight: "42.5px",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          <Link href={href}>{title}</Link>
        </h3>
        <Link
          className="shop-product-cta"
          style={{ alignSelf: "flex-start", marginTop: "auto" }}
          href={href}
        >
          {english ? catalogText("viewDetails", "View details") : catalogText("viewDetails", "Xem chi tiết")} <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}

export function ProductDetailGallery({
  gallery,
  title,
  language = "vi",
}: {
  gallery: Array<string | { url: string; altText?: string; caption?: string }>;
  title: string;
  language?: ShopLanguage;
}) {
  const images = gallery.map((item, index) =>
    typeof item === "string"
      ? { url: item, altText: `${title} ${index + 1}`, caption: "" }
      : {
          url: item.url,
          altText: item.altText || `${title} ${index + 1}`,
          caption: item.caption || "",
        },
  );
  const [selectedImage, setSelectedImage] = useState(images[0]?.url || "");
  const selected =
    images.find((item) => item.url === selectedImage) || images[0];
  const english = language === "en";
  return (
    <div className="shop-detail-gallery">
      <div className="shop-detail-main-image">
        <img src={selectedImage} alt={selected?.altText || title} />
        {selected?.caption ? (
          <p className="shop-image-caption">{selected.caption}</p>
        ) : null}
      </div>
      <div
        className="shop-detail-thumbs"
        role="list"
        aria-label={english ? "Product image gallery" : "Album ảnh sản phẩm"}
      >
        {images.map((image, index) => (
          <button
            type="button"
            key={`${image.url}-${index}`}
            className={selectedImage === image.url ? "active" : ""}
            onClick={() => setSelectedImage(image.url)}
            aria-label={`${english ? "View image" : "Xem ảnh"} ${index + 1}: ${image.altText}`}
          >
            <img src={image.url} alt={image.altText} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ShopGuarantee({
  language = "vi",
}: {
  language?: ShopLanguage;
}) {
  const english = language === "en";
  const { values: chrome, loaded } = useContext(ShopChromeContext);
  const get = (key: string, fallback: string) => chrome[key]?.value || fallback;
  const defaults = english
    ? [
        "100% genuine, quality products",
        "Best market pricing",
        "Thoughtful after-sales service",
        "For bulk orders, call 0946548996 for the best price.",
      ]
    : [
        "Cam kết 100% hàng chính hãng chất lượng",
        "Giá cả tối ưu nhất thị trường",
        "Dịch vụ hậu mãi chu đáo",
        "Mua số lượng lớn. Vui lòng liên hệ 0946548996 để được hỗ trợ giá tốt nhất.",
      ];
  if (loaded && !chrome["shopGuarantee.heading"]) return null;
  return (
    <div className="shop-guarantee">
      <h2>
        {get(
          "shopGuarantee.heading",
          english ? "PURCHASE GUARANTEE" : "CAM KẾT KHI MUA HÀNG",
        )}
      </h2>
      <ul>
        {defaults.map((fallback, index) => {
          const key = `shopGuarantee.item${index + 1}`;
          if (loaded && !chrome[key]) return null;
          const text = get(key, fallback);
          const href = chrome[key]?.url;
          return (
            <li key={key}>
              <Icon name="check" />
              <span>
                {href ? <a href={safeSharedUrl(href, "#")}>{text}</a> : text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ShopPurchaseLink({
  type,
  language = "vi",
}: {
  type: "buy" | "contact";
  language?: ShopLanguage;
}) {
  const english = language === "en";
  const { values: chrome, loaded } = useContext(ShopChromeContext);
  const key = type === "buy" ? "shopBuy.label" : "shopBuy.contact";
  const fallbackLabel =
    type === "buy"
      ? english
        ? "BUY NOW"
        : "MUA HÀNG"
      : english
        ? "Contact about this product · 0914 94 3653"
        : "Liên hệ về sản phẩm · 0914 94 3653";
  if (loaded && !chrome[key]) return null;
  const href = safeSharedUrl(chrome[key]?.url, "tel:+84914943653");
  return (
    <a
      className={type === "buy" ? "shop-buy" : "shop-product-contact"}
      href={href}
    >
      <Icon name="phone" />
      {chrome[key]?.value || fallbackLabel}
    </a>
  );
}

export function ProductCatalog({
  items,
  initialCategory,
  language = "vi",
}: {
  items: ShopProduct[];
  initialCategory?: string;
  language?: ShopLanguage;
}) {
  const english = language === "en";
  const { values: chrome } = useContext(ShopChromeContext);
  const catalogText = (key: string, fallback: string) => chrome[`shopCatalog.${key}`]?.value || fallback;
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const readCategory = () => {
    if (typeof window === "undefined") return "all";
    return new URLSearchParams(window.location.search).get("category") || "all";
  };
  const [category, setCategory] = useState(
    () => initialCategory || readCategory(),
  );
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [remoteItems, setRemoteItems] = useState<ProductCardItem[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRemoteItems(null);
    const timer = window.setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("gedeco:product-category", {
            detail: { category: category === "all" ? "" : category },
          }),
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [category]);

  const updateCategory = (next: string) => {
    setCategory(next);
    setRemoteItems(null);
    const params = new URLSearchParams(window.location.search);
    if (next === "all") params.delete("category");
    else params.set("category", next);
    router.replace(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  };

  const localItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    const filtered = items.filter((item) => {
      const matchesCategory =
        category === "all" ||
        (english ? item.categorySlugEn : item.categorySlug) === category;
      const matchesQuery =
        !normalizedQuery ||
        `${item.title} ${item.description}`
          .toLocaleLowerCase("vi-VN")
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
    return [...filtered].sort((a, b) =>
      sort === "latest"
        ? b.title.localeCompare(a.title, "vi")
        : sort === "name"
          ? a.title.localeCompare(b.title, "vi")
          : 0,
    );
  }, [category, items, query, sort]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: query,
          category,
          sort,
          language,
        });
        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const payload = (await response.json()) as {
            items?: ProductCardItem[];
          };
          setRemoteItems(payload.items || []);
        }
      } catch {
        if (!controller.signal.aborted) setRemoteItems(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 140);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [category, language, query, sort]);

  const visibleItems = remoteItems ?? localItems;
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const pagedItems = visibleItems.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [category, query, sort]);
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);
  const clearFilters = () => {
    setQuery("");
    setSort("default");
    updateCategory("all");
  };
  const categoryOptions = Array.from(
    new Map(
      items
        .map(
          (item) =>
            [
              english ? item.categorySlugEn : item.categorySlug,
              item.category,
            ] as const,
        )
        .filter(([slug]) => Boolean(slug)),
    ).entries(),
  ) as Array<[string, string]>;

  const labels = english
    ? {
        all: catalogText("all", "All"), domestic: "Domestic", export: "Export", sort: catalogText("sort", "Sort by"), default: catalogText("default", "Default"), az: catalogText("az", "Name A–Z"), za: catalogText("za", "Name Z–A"), search: catalogText("search", "Search products..."), clear: catalogText("clear", "Reset"), searching: catalogText("searching", "Searching..."), count: catalogText("count", "products"), prev: catalogText("prev", "Previous page"), next: catalogText("next", "Next page"), empty: catalogText("empty", "No matching products found"), emptyHint: catalogText("emptyHint", "Try another keyword or reset the filters."), showAll: catalogText("showAll", "View all products"),
      }
    : {
        all: catalogText("all", "Tất cả"), domestic: "Trong nước", export: "Xuất khẩu", sort: catalogText("sort", "Sắp xếp"), default: catalogText("default", "Mặc định"), az: catalogText("az", "Tên A–Z"), za: catalogText("za", "Tên Z–A"), search: catalogText("search", "Tìm sản phẩm..."), clear: catalogText("clear", "Đặt lại"), searching: catalogText("searching", "Đang tìm..."), count: catalogText("count", "sản phẩm"), prev: catalogText("prev", "Trang trước"), next: catalogText("next", "Trang sau"), empty: catalogText("empty", "Không tìm thấy sản phẩm phù hợp"), emptyHint: catalogText("emptyHint", "Thử từ khóa khác hoặc đặt lại bộ lọc."), showAll: catalogText("showAll", "Xem tất cả sản phẩm"),
      };
  return (
    <section
      className={styles.catalog}
      aria-label={english ? "Product filters" : "Bộ lọc sản phẩm"}
    >
      <div className={styles.filterRow}>
        <div
          className={styles.chips}
          role="tablist"
          aria-label={english ? "Product groups" : "Nhóm sản phẩm"}
        >
          <button
            type="button"
            className={category === "all" ? styles.activeChip : ""}
            onClick={() => updateCategory("all")}
          >
            {labels.all} <b>{items.length}</b>
          </button>
          {categoryOptions.map(([slug, label]) => (
            <button
              key={slug}
              type="button"
              className={category === slug ? styles.activeChip : ""}
              onClick={() => updateCategory(slug)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.viewAndCount}>
          <div className={styles.sortWrap}>
            <span>{labels.sort}</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setRemoteItems(null);
              }}
              aria-label={labels.sort}
            >
              <option value="default">{labels.default}</option>
              <option value="name">{labels.az}</option>
              <option value="latest">{labels.za}</option>
            </select>
          </div>
          <div className={styles.inlineSearchWrap}>
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setRemoteItems(null);
              }}
              placeholder={labels.search}
              aria-label={labels.search}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRemoteItems(null);
                }}
                aria-label={english ? "Clear search" : "Xóa tìm kiếm"}
              >
                ×
              </button>
            )}
          </div>
          <span>
            {loading
              ? labels.searching
              : `${visibleItems.length} ${labels.count}`}
          </span>
          {(query || category !== "all" || sort !== "default") && (
            <button
              type="button"
              className={styles.clear}
              onClick={clearFilters}
            >
              {labels.clear}
            </button>
          )}
        </div>
      </div>
      <div className="shop-products-grid">
        {pagedItems.map((product) => (
          <ShopProductCard
            key={product.slug}
            product={product}
            language={language}
          />
        ))}
      </div>
      {visibleItems.length > pageSize && (
        <nav
          className={styles.pagination}
          aria-label={english ? "Product pagination" : "Phân trang sản phẩm"}
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            aria-label={labels.prev}
          >
            ←
          </button>
          {Array.from({ length: pageCount }, (_, index) => {
            const number = index + 1;
            return (
              <button
                key={number}
                type="button"
                className={page === number ? styles.activePage : ""}
                aria-current={page === number ? "page" : undefined}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            );
          })}
          <button
            type="button"
            disabled={page === pageCount}
            onClick={() => setPage((current) => current + 1)}
            aria-label={labels.next}
          >
            →
          </button>
        </nav>
      )}
      {!visibleItems.length && (
        <div className={styles.empty}>
          <strong>{labels.empty}</strong>
          <span>{labels.emptyHint}</span>
          <button type="button" onClick={clearFilters}>
            {labels.showAll}
          </button>
        </div>
      )}
    </section>
  );
}

export function ShopControls() {
  return (
    <div className="shop-controls">
      <div className="shop-view-buttons">
        <button aria-label="Hai cột">▦</button>
        <button className="active" aria-label="Ba cột">
          ▦
        </button>
        <button aria-label="Bốn cột">▦</button>
      </div>
      <select aria-label="Sắp xếp sản phẩm" defaultValue="default">
        <option value="default">Mặc định</option>
        <option>Phổ biến nhất</option>
        <option>Mới nhất</option>
        <option>Giá thấp đến cao</option>
        <option>Giá cao đến thấp</option>
      </select>
    </div>
  );
}

export function ShopRelated({
  products,
  current,
  language = "vi",
}: {
  products: ShopProduct[];
  current: string;
  language?: ShopLanguage;
}) {
  const english = language === "en";
  const related = products
    .filter((product) => product.slug !== current)
    .slice(0, 8);
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  useEffect(() => {
    const syncVisibleCount = () =>
      setVisibleCount(window.innerWidth <= 640 ? 2 : 4);
    syncVisibleCount();
    window.addEventListener("resize", syncVisibleCount);
    return () => window.removeEventListener("resize", syncVisibleCount);
  }, []);
  const maxIndex = Math.max(0, related.length - visibleCount);
  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [index, maxIndex]);
  useEffect(() => {
    if (related.length <= visibleCount) return;
    const timer = window.setInterval(
      () =>
        setIndex((currentIndex) =>
          currentIndex >= maxIndex ? 0 : currentIndex + 1,
        ),
      4500,
    );
    return () => window.clearInterval(timer);
  }, [maxIndex, related.length, visibleCount]);
  return (
    <section className="shop-related">
      <div className="shop-related-heading">
        <h2>{english ? "RELATED PRODUCTS" : "SẢN PHẨM LIÊN QUAN"}</h2>
        <div className="shop-related-arrows">
          <button
            type="button"
            onClick={() =>
              setIndex((currentIndex) =>
                currentIndex <= 0 ? maxIndex : currentIndex - 1,
              )
            }
            aria-label={english ? "Previous products" : "Sản phẩm trước"}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() =>
              setIndex((currentIndex) =>
                currentIndex >= maxIndex ? 0 : currentIndex + 1,
              )
            }
            aria-label={english ? "Next products" : "Sản phẩm tiếp theo"}
          >
            →
          </button>
        </div>
      </div>
      <div className="shop-related-viewport">
        <div
          className="shop-related-track"
          style={{
            transform: `translateX(calc(-1 * var(--related-step) * ${index}))`,
          }}
        >
          {related.map((product) => (
            <ShopProductCard
              key={product.slug}
              product={product}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
