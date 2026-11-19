"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ContactActions } from "./contact-actions";
import { LanguageSwitcher } from "./language-switcher";

export type InnerIcon =
  | "globe"
  | "handshake"
  | "chart"
  | "people"
  | "box"
  | "ship"
  | "truck"
  | "building"
  | "search"
  | "phone"
  | "mail"
  | "pin"
  | "arrow"
  | "chevron"
  | "facebook"
  | "music"
  | "youtube"
  | "linkedin"
  | "check";

export function Icon({
  name,
  className = "",
}: {
  name: InnerIcon;
  className?: string;
}) {
  const common = {
    className: `icon-svg ${className}`,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<InnerIcon, React.ReactNode> = {
    globe: (
      <>
        <circle cx="24" cy="24" r="17" />
        <path d="M7 24h34M24 7c5 5 7 10 7 17s-2 12-7 17c-5-5-7-10-7-17s2-12 7-17ZM12 13c3 2 7 3 12 3s9-1 12-3M12 35c3-2 7-3 12-3s9 1 12 3" />
      </>
    ),
    handshake: (
      <>
        <path d="m7 20 7-6 9 4 4-3 14 8-5 8-9-5-6 5-8-5-6 3-5-9 5-3Z" />
        <path d="m16 26 5 3 5-4 7 4M23 18l7 8" />
      </>
    ),
    chart: (
      <>
        <path d="M8 39h32M12 35V25h7v10M22 35V18h7v17M32 35V10h7v25M10 19l10-7 8 3 10-8" />
        <path d="m32 8 6-1-2 6" />
      </>
    ),
    people: (
      <>
        <circle cx="24" cy="16" r="5" />
        <circle cx="11" cy="19" r="4" />
        <circle cx="37" cy="19" r="4" />
        <path d="M14 38c0-7 4-11 10-11s10 4 10 11M5 37c0-5 2-8 6-8 2 0 4 1 5 3M43 37c0-5-2-8-6-8-2 0-4 1-5 3" />
      </>
    ),
    box: (
      <>
        <path d="m24 7 15 8-15 8-15-8 15-8Z" />
        <path d="M9 15v17l15 9 15-9V15M24 23v18M16 11l15 8" />
      </>
    ),
    ship: (
      <>
        <path d="M7 31h34l-5 7H12l-5-7ZM12 31V18h24v13M16 18V11h8v7M28 18v-5h5v5M5 42c4-3 7 3 11 0 4-3 7 3 11 0 4-3 7 3 11 0" />
      </>
    ),
    truck: (
      <>
        <path d="M5 12h25v23H5zM30 22h7l6 6v7H30zM12 35a4 4 0 1 0 8 0M34 35a4 4 0 1 0 8 0" />
      </>
    ),
    building: (
      <>
        <path d="M10 40V12l14-5v33M24 40h14V18l-14-4M15 17h4M15 24h4M15 31h4M29 23h4M29 30h4M29 37h4M7 40h34" />
      </>
    ),
    search: (
      <>
        <circle cx="21" cy="21" r="9" />
        <path d="m28 28 8 8" />
      </>
    ),
    phone: (
      <path d="M14 8 8 12c1 13 10 22 23 28l5-6-8-6-4 3c-4-2-7-5-9-9l3-4-4-10Z" />
    ),
    mail: (
      <>
        <rect x="7" y="11" width="34" height="26" rx="2" />
        <path d="m8 14 16 12 16-12" />
      </>
    ),
    pin: (
      <>
        <path d="M24 41s12-12 12-22a12 12 0 1 0-24 0c0 10 12 22 12 22Z" />
        <circle cx="24" cy="19" r="4" />
      </>
    ),
    arrow: (
      <>
        <path d="M7 24h31" />
        <path d="m28 14 10 10-10 10" />
      </>
    ),
    chevron: <path d="m18 12 12 12-12 12" />,
    facebook: (
      <path d="M27 10h-4c-3 0-5 2-5 5v4h-4v6h4v13h7V25h5l1-6h-6v-3c0-1 1-2 2-2h4v-4Z" />
    ),
    music: <path d="M29 9v22a6 6 0 1 1-5-6V14l16-4v18a6 6 0 1 1-5-6V7l-6 2Z" />,
    youtube: (
      <>
        <rect x="7" y="12" width="34" height="24" rx="6" />
        <path d="m21 19 10 5-10 5v-10Z" />
      </>
    ),
    linkedin: (
      <>
        <rect x="9" y="9" width="30" height="30" rx="2" />
        <path d="M15 20v12M15 15v1M22 32V20M22 25c0-4 8-5 8 1v6" />
      </>
    ),
    check: <path d="m10 25 9 9 19-20" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const nav = [
  ["Trang chủ", "/"],
  ["Giới thiệu", "/gioi-thieu"],
  ["Tin tức", "/tin-tuc"],
  ["Sản phẩm", "/san-pham"],
  ["Liên hệ", "/lien-he"],
];

export function InnerHeader({
  active = "",
  language = "vi",
  alternateEnglishPath,
  alternateVietnamesePath,
}: {
  active?: string;
  language?: "vi" | "en";
  alternateEnglishPath?: string | null;
  alternateVietnamesePath?: string | null;
}) {
  const english = language === "en";
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || (english ? "/en" : "/");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productCategories, setProductCategories] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      nameEn: string;
      slugEn: string;
    }>
  >([]);
  const [chrome, setChrome] = useState<
    Record<
      string,
      {
        value: string;
        url: string;
        imageUrl: string;
        altText: string;
        caption: string;
      }
    >
  >({});
  const [chromeLoaded, setChromeLoaded] = useState(false);
  useEffect(() => {
    setChromeLoaded(false);
    fetch(`/api/site-chrome?area=HEADER&lang=${language}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        setChrome(payload?.values || {});
        setChromeLoaded(true);
      })
      .catch(() => setChromeLoaded(true));
  }, [language]);
  useEffect(() => {
    fetch("/api/product-categories")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.items) setProductCategories(payload.items);
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    const syncCategory = (event?: Event) => {
      const detail = (event as CustomEvent<{ category?: string }> | undefined)
        ?.detail;
      const hasCategoryDetail = Boolean(
        detail && Object.prototype.hasOwnProperty.call(detail, "category"),
      );
      const value = hasCategoryDetail
        ? detail?.category
        : new URLSearchParams(window.location.search).get("category");
      const pathCategory = window.location.pathname.match(
        /^\/(?:en\/products|san-pham)\/([^/]+)(?:\/|$)/,
      )?.[1];
      setSelectedCategory(pathCategory || value || "");
    };
    syncCategory();
    window.addEventListener("popstate", syncCategory);
    window.addEventListener("gedeco:product-category", syncCategory);
    return () => {
      window.removeEventListener("popstate", syncCategory);
      window.removeEventListener("gedeco:product-category", syncCategory);
    };
  }, [pathname]);
  const get = (key: string, fallback: string) =>
    chromeLoaded ? chrome[key]?.value || "" : fallback;
  const getUrl = (key: string, fallback: string) =>
    chromeLoaded ? chrome[key]?.url || "" : fallback;
  const show = (key: string) => !chromeLoaded || Boolean(chrome[key]);
  // Header uses the same official vertical GEDECO logo family as the Footer.
  const logo = "/assets/logo-new.optimized.webp";
  const urls = english
    ? {
        home: "/en",
        about: "/en/about",
        news: "/en/news",
        products: "/en/products",
        contact: "/en/contact",
      }
    : {
        home: getUrl("navigation.home", "/"),
        about: getUrl("navigation.about", "/gioi-thieu"),
        news: getUrl("navigation.news", "/tin-tuc"),
        products: getUrl("navigation.products", "/san-pham"),
        contact: getUrl("navigation.contact", "/lien-he"),
      };
  const labels = english
    ? {
        home: get("navigation.home", "Home"),
        about: get("navigation.about", "About"),
        news: get("navigation.news", "News"),
        products: get("navigation.products", "Products"),
        contact: get("navigation.contact", "Contact"),
        domestic: "Domestic products",
        export: "Export products",
        cta: get("cta.label", "Contact us"),
      }
    : {
        home: get("navigation.home", "Trang chủ"),
        about: get("navigation.about", "Giới thiệu"),
        news: get("navigation.news", "Tin tức"),
        products: get("navigation.products", "Sản phẩm"),
        contact: get("navigation.contact", "Liên hệ"),
        domestic: "Sản phẩm trong nước",
        export: "Sản phẩm xuất khẩu",
        cta: get("cta.label", "Liên hệ ngay"),
      };
  const categoryLinks = productCategories.length
    ? productCategories.map((category) => ({
        id: category.id,
        label: english ? category.nameEn : category.name,
        slug: english ? category.slugEn : category.slug,
      }))
    : [
        {
          id: "domestic",
          label: labels.domestic,
          slug: english ? "domestic" : "trong-nuoc",
        },
        {
          id: "export",
          label: labels.export,
          slug: english ? "export" : "xuat-khau",
        },
      ];
  return (
    <header className="site-header inner-header">
      <div className="nav-shell">
        {show("brand.logo") && (
          <a
            className="brand"
            href={urls.home}
            aria-label={english ? "GEDECO home" : "GEDECO trang chủ"}
          >
            <img className="site-logo" src={logo} alt="GEDECO" />
            {chrome["brand.logo"]?.caption ? (
              <span className="sr-only">{chrome["brand.logo"].caption}</span>
            ) : null}
          </a>
        )}
        <button
          className="menu-toggle"
          aria-label={english ? "Open menu" : "Mở menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          className={`main-nav${open ? " open" : ""}`}
          aria-label={english ? "Main navigation" : "Điều hướng chính"}
        >
          {show("navigation.home") && (
            <a
              className={
                active === (english ? "Home" : "Trang chủ") ? "active" : ""
              }
              href={urls.home}
              onClick={() => setOpen(false)}
            >
              {labels.home}
            </a>
          )}
          {show("navigation.about") && (
            <a
              className={
                active === (english ? "About" : "Giới thiệu") ? "active" : ""
              }
              href={urls.about}
              onClick={() => setOpen(false)}
            >
              {labels.about}
            </a>
          )}
          {show("navigation.news") && (
            <a
              className={
                active === (english ? "News" : "Tin tức") ? "active" : ""
              }
              href={urls.news}
              onClick={() => setOpen(false)}
            >
              {labels.news}
            </a>
          )}
          {show("navigation.products") && (
            <div className="nav-dropdown">
              <a
                className={
                  active === (english ? "Products" : "Sản phẩm") ||
                  Boolean(selectedCategory)
                    ? "active"
                    : ""
                }
                href={urls.products}
                onClick={() => setOpen(false)}
              >
                {labels.products}{" "}
                <span className="nav-chevron" aria-hidden="true">
                  <Icon name="chevron" />
                </span>
              </a>
              <div className="nav-submenu">
                {categoryLinks.map((category) => (
                  <a
                    key={category.id}
                    className={
                      selectedCategory === category.slug ? "active" : ""
                    }
                    href={`${urls.products}?category=${category.slug}`}
                    onClick={() => setOpen(false)}
                  >
                    {category.label}
                  </a>
                ))}
              </div>
            </div>
          )}
          {show("navigation.contact") && (
            <a
              className={
                active === (english ? "Contact" : "Liên hệ") ? "active" : ""
              }
              href={urls.contact}
              onClick={() => setOpen(false)}
            >
              {labels.contact}
            </a>
          )}
        </nav>
        <div className="nav-tools">
          <button
            className="search-btn"
            aria-label={english ? "Search" : "Tìm kiếm"}
            onClick={() => { window.location.href = english ? "/en/products?focus=search" : "/san-pham?focus=search"; }}
          >
            <Icon name="search" />
          </button>
          <LanguageSwitcher
            english={english}
            alternateEnglishPath={alternateEnglishPath}
            alternateVietnamesePath={alternateVietnamesePath}
          />
          {show("cta.label") && (
            <a
              className="button button-gold button-small"
              href={
                english
                  ? urls.contact
                  : getUrl("cta.label", urls.contact) || urls.contact
              }
            >
              {labels.cta} <Icon name="arrow" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export function InnerFooter({ language = "vi" }: { language?: "vi" | "en" }) {
  const english = language === "en";
  const [chrome, setChrome] = useState<
    Record<
      string,
      {
        value: string;
        url: string;
        imageUrl: string;
        altText: string;
        caption: string;
      }
    >
  >({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
    fetch(`/api/site-chrome?area=FOOTER&lang=${language}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        setChrome(payload?.values || {});
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [language]);
  const get = (key: string, fallback: string) =>
    loaded ? chrome[key]?.value || "" : fallback;
  const getUrl = (key: string, fallback: string) => {
    const value = loaded ? chrome[key]?.url || "" : fallback;
    if (!value) return "";
    if (value.startsWith("/") && !value.startsWith("//")) return value;
    if (
      /^tel:\+?[0-9 .()-]+$/i.test(value) ||
      /^mailto:[^\s@]+@[^\s@]+$/i.test(value)
    )
      return value;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password
        ? url.toString()
        : "";
    } catch {
      return "";
    }
  };
  const show = (key: string) => !loaded || Boolean(chrome[key]);
  const address = get(
    "contact.address",
    english
      ? "14th Floor, Multifunctional Building, 169 Nguyen Ngoc Vu, Yen Hoa Ward, Hanoi, Vietnam"
      : "Trụ sở: Tầng 14, Tòa nhà Đa năng, số 169 Nguyễn Ngọc Vũ, P. Yên Hòa, TP. Hà Nội, Việt Nam",
  );
  const addressParts = address.split(", P. Yên Hòa");
  const urls = english
    ? {
        about: "/en/about",
        products: "/en/products",
        news: "/en/news",
        contact: "/en/contact",
      }
    : {
        about: "/gioi-thieu",
        products: "/san-pham",
        news: "/tin-tuc",
        contact: "/lien-he",
      };
  const labels = english
    ? {
        contact: get("footerLabel.contact", "CONTACT"),
        quick: get("footerLabel.quick", "QUICK LINKS"),
        support: get("footerLabel.support", "SUPPORT"),
        about: get("quickLink.about", "About us"),
        products: get("quickLink.products", "Products"),
        news: get("quickLink.news", "News"),
        contactLink: get("quickLink.contact", "Contact"),
        registration: get(
          "legal.registration",
          "Business registration: 0109613491",
        ),
        tagline: "Trade and export partner from Vietnam",
      }
    : {
        contact: get("footerLabel.contact", "THÔNG TIN LIÊN HỆ"),
        quick: get("footerLabel.quick", "LIÊN KẾT NHANH"),
        support: get("footerLabel.support", "HỖ TRỢ"),
        about: get("quickLink.about", "Giới thiệu"),
        products: get("quickLink.products", "Sản phẩm"),
        news: get("quickLink.news", "Tin tức"),
        contactLink: get("quickLink.contact", "Liên hệ"),
        registration: get(
          "legal.registration",
          "Mã số doanh nghiệp: 0109613491",
        ),
        tagline: "GEDECO CORPORATION",
      };
  const supportLinks = english
    ? [
        [
          "supportLink.authentic",
          get("supportLink.authentic", "Authentic product policy"),
          "/en/authentic-product-policy",
        ],
        [
          "supportLink.order",
          get("supportLink.order", "How to order"),
          "/en/how-to-order",
        ],
        [
          "supportLink.shipping",
          get("supportLink.shipping", "Shipping and payment"),
          "/en/shipping-and-payment",
        ],
        [
          "supportLink.returns",
          get("supportLink.returns", "Returns and warranty"),
          "/en/returns-and-warranty",
        ],
      ]
    : [
        [
          "supportLink.authentic",
          get("supportLink.authentic", "Chính sách hàng chính hãng"),
          "/chinh-sach-hang-chinh-hang",
        ],
        [
          "supportLink.order",
          get("supportLink.order", "Hướng dẫn mua hàng"),
          "/huong-dan-mua-hang",
        ],
        [
          "supportLink.shipping",
          get("supportLink.shipping", "Giao hàng và thanh toán"),
          "/giao-hang-va-thanh-toan",
        ],
        [
          "supportLink.returns",
          get("supportLink.returns", "Đổi trả và bảo hành"),
          "/doi-tra-va-bao-hanh",
        ],
      ];
  return (
    <footer className="footer">
      <div className="container footer-grid home-footer-grid">
        <div className="footer-brand">
          {show("brand.logo") && (
            <img
              src={
                "/assets/logo-new-footer.optimized.webp"
              }
              alt={chrome["brand.logo"]?.altText || "GEDECO"}
            />
          )}
          {chrome["brand.logo"]?.caption ? (
            <span className="sr-only">{chrome["brand.logo"].caption}</span>
          ) : null}
          {(show("brand.company") || show("brand.tagline")) && (
            <p>
              {get(
                "brand.company",
                english ? "GEDECO CORPORATION" : "CÔNG TY CỔ PHẦN GEDECO",
              )}
              {show("brand.tagline") && (
                <>
                  <br />
                  <i>{get("brand.tagline", labels.tagline)}</i>
                </>
              )}
            </p>
          )}
          <div className="socials">
            {show("social.facebook") && (
              <a
                aria-label="Facebook"
                href={getUrl(
                  "social.facebook",
                  "https://www.facebook.com/www.gedeco.tra.thuong.hang",
                )}
              >
                <Icon name="facebook" />
              </a>
            )}
            {show("social.youtube") && (
              <a
                aria-label="YouTube"
                href={getUrl("social.youtube", "https://www.youtube.com/")}
              >
                <Icon name="youtube" />
              </a>
            )}
          </div>
        </div>
        <div className="footer-info-columns">
          <div>
            {show("footerLabel.contact") && <h3>{labels.contact}</h3>}
            {show("contact.phone") && (
              <a href={getUrl("contact.phone", "tel:0914943653")}>
                <Icon name="phone" />{" "}
                <span>{get("contact.phone", "0914 94 3653")}</span>
              </a>
            )}
            {show("contact.email") && (
              <a href={getUrl("contact.email", "mailto:info@gedeco.vn")}>
                <Icon name="mail" />{" "}
                <span>{get("contact.email", "info@gedeco.vn")}</span>
              </a>
            )}
            {show("contact.address") && (
              <a href={urls.contact}>
                <Icon name="pin" />{" "}
                <span>
                  {english ? (
                    address
                  ) : addressParts.length > 1 ? (
                    <>
                      {addressParts[0]},<br />
                      P. Yên Hòa{addressParts.slice(1).join(", P. Yên Hòa")}
                    </>
                  ) : (
                    address
                  )}
                </span>
              </a>
            )}
          </div>
          <div>
            {show("footerLabel.quick") && <h3>{labels.quick}</h3>}
            {show("quickLink.about") && <a href={urls.about}>{labels.about}</a>}
            {show("quickLink.products") && (
              <a href={urls.products}>{labels.products}</a>
            )}
            {show("quickLink.news") && <a href={urls.news}>{labels.news}</a>}
            {show("quickLink.contact") && (
              <a href={urls.contact}>{labels.contactLink}</a>
            )}
          </div>
          <div>
            {show("footerLabel.support") && <h3>{labels.support}</h3>}
            {supportLinks.map(
              ([key, label, href]) =>
                show(key) && (
                  <a key={href} href={href}>
                    {label}
                  </a>
                ),
            )}
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        {show("legal.registration") && <span>{labels.registration}</span>}
      </div>
    </footer>
  );
}

export function InnerHero({
  eyebrow,
  title,
  subtitle,
  image = "/assets/banner-1.optimized.webp",
  imageAlt,
  imageCaption,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
}) {
  return (
    <section
      className="inner-hero"
      style={{
        backgroundImage: `linear-gradient(90deg,rgba(3,25,54,.86),rgba(3,25,54,.33)),url('${image}')`,
      }}
    >
      {imageAlt ? (
        <span className="sr-only" role="img" aria-label={imageAlt} />
      ) : null}
      {imageCaption ? <span className="sr-only">{imageCaption}</span> : null}
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}

export function InnerPage({
  children,
  active,
  pageClass = "",
  language = "vi",
  alternateEnglishPath,
  alternateVietnamesePath,
}: {
  children: React.ReactNode;
  active: string;
  pageClass?: string;
  language?: "vi" | "en";
  alternateEnglishPath?: string | null;
  alternateVietnamesePath?: string | null;
}) {
  return (
    <div className={`inner-site ${pageClass}`}>
      <InnerHeader
        active={active}
        language={language}
        alternateEnglishPath={alternateEnglishPath}
        alternateVietnamesePath={alternateVietnamesePath}
      />
      <main id="main-content" className="inner-main">
        {children}
      </main>
      <InnerFooter language={language} />
      <ContactActions english={language === "en"} />
    </div>
  );
}

export function CTA({
  title = "Hãy để chúng tôi đồng hành cùng bạn",
  text,
  language = "vi",
  eyebrow,
  image,
  imageAlt,
  imageCaption,
  primaryLabel,
  secondaryLabel,
}: {
  title?: string;
  text?: string;
  language?: "vi" | "en";
  eyebrow?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const english = language === "en";
  const [secondaryHref, setSecondaryHref] = useState("mailto:info@gedeco.vn");
  useEffect(() => {
    let active = true;
    fetch(`/api/site-chrome?area=FOOTER&lang=${language}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const value = payload?.values?.["contact.email"]?.url;
        if (active && typeof value === "string" && /^mailto:[^\s@]+@[^\s@]+$/i.test(value)) setSecondaryHref(value);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [language]);
  const body =
    text ||
    (english
      ? "Connect with GEDECO today to explore new cooperation and sustainable growth opportunities."
      : "Kết nối ngay hôm nay để tìm kiếm cơ hội hợp tác và phát triển bền vững trên toàn cầu.");
  return (
    <section
      className="inner-cta"
      style={
        image
          ? {
              backgroundImage: `linear-gradient(90deg,rgba(3,25,53,.85),rgba(3,25,53,.4)),url('${image}')`,
            }
          : undefined
      }
    >
      {imageAlt ? (
        <span className="sr-only" role="img" aria-label={imageAlt} />
      ) : null}
      {imageCaption ? <span className="sr-only">{imageCaption}</span> : null}
      <div className="container">
        <p className="eyebrow">
          {eyebrow || (english ? "CONTACT GEDECO" : "LIÊN HỆ VỚI GEDECO")}
        </p>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="hero-actions">
          <a
            className="button button-gold"
            href={english ? "/en/contact" : "/lien-he"}
          >
            {primaryLabel || (english ? "Contact us" : "Liên hệ ngay")}{" "}
            <Icon name="arrow" />
          </a>
          <a
            className="button button-outline light"
            href={secondaryHref}
          >
            {secondaryLabel ||
              (english ? "Send an enquiry" : "Gửi yêu cầu tư vấn")}
          </a>
        </div>
      </div>
    </section>
  );
}

export function NewsCard({
  item,
  href = "/tin-tuc",
  excerpt = "",
  readLabel = "Đọc thêm",
  imageAlt,
  imageCaption = "",
}: {
  item: string[];
  href?: string;
  excerpt?: string;
  readLabel?: string;
  imageAlt?: string;
  imageCaption?: string;
}) {
  const [image = "", category = "", date = "", title = ""] = item || [];
  const imageUrl = image.startsWith("/") ? image : `/assets/${image}`;
  return (
    <article className="inner-news-card">
      <figure>
        <img src={imageUrl} alt={imageAlt || title} />
        {imageCaption ? <figcaption>{imageCaption}</figcaption> : null}
      </figure>
      <small>
        {category} <span>{date}</span>
      </small>
      <h3>{title}</h3>
      {excerpt && <p>{excerpt}</p>}
      <a href={href}>
        {readLabel} <Icon name="arrow" />
      </a>
    </article>
  );
}
