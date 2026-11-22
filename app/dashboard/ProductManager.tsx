/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useLayoutEffect, useRef, useState, type AnimationEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/vimigo-icon";
import { deleteProduct, duplicateProduct, listDashboardProducts, saveProduct } from "@/lib/dashboard/product-actions";
import type { ProductInput, ProductListItem, ProductMediaInput } from "@/lib/dashboard/product-types";
import { listProductCategories } from "@/lib/dashboard/product-category-actions";
import type { ProductCategoryListItem } from "@/lib/dashboard/product-category-types";
import { MediaPicker, type MediaSelection } from "./MediaPicker";
import { normalizeDecorativeUnicode, normalizeLegacyMediaFigures, sanitizeProductHtml } from "@/lib/sanitize-product-html";

const EMPTY: ProductInput = {
  id: null, slug: "", title: "", titleHtml: "", titleColor: "#243f55", titleFontFamily: "Arial", titleFontSize: 28, titleFontWeight: 700, categoryId: "", description: "", contentHtml: "", summaryHtml: "",
  priceText: "Liên hệ", stockText: "Còn hàng", imageUrl: "", imageAlt: "", imageCaption: "",
  shipperImageUrl: "/assets/products/shipper.optimized.webp", shipperImageAlt: "Dịch vụ giao hàng", shipperImageCaption: "", ogImageUrl: "", ogImageAlt: "", gallery: [],
  metaTitle: "", metaDescription: "", canonicalUrl: "", robotsIndex: true, robotsFollow: true,
  isPublished: true, sortOrder: 0,
  translationMode: "AUTO", translationStatus: "PENDING", translationError: "",
  slugEn: "", titleEn: "", descriptionEn: "", contentHtmlEn: "", summaryHtmlEn: "",
  priceTextEn: "Contact us", stockTextEn: "In stock", imageAltEn: "", imageCaptionEn: "", shipperImageAltEn: "Delivery service", shipperImageCaptionEn: "",
  ogImageAltEn: "", metaTitleEn: "", metaDescriptionEn: "", canonicalUrlEn: "",
};

const PRODUCT_UI_STATE_KEY = "gedeco:dashboard-products-ui";

type ProductUiState = {
  editorOpen?: boolean;
  draftId?: string | null;
  draftSnapshot?: ProductInput | null;
  itemsSnapshot?: ProductListItem[];
  categoriesSnapshot?: ProductCategoryListItem[];
  query?: string;
  categoryFilter?: string;
  statusFilter?: "all" | "published" | "draft";
  page?: number;
  scrollY?: number;
};

function readProductUiState(): ProductUiState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRODUCT_UI_STATE_KEY);
    return raw ? JSON.parse(raw) as ProductUiState : null;
  } catch {
    return null;
  }
}

function cloneProductDraft(snapshot?: ProductInput | null): ProductInput {
  if (!snapshot) return { ...EMPTY, gallery: [] };
  return {
    ...EMPTY,
    ...snapshot,
    slug: typeof snapshot.slug === "string" ? snapshot.slug : "",
    title: typeof snapshot.title === "string" ? snapshot.title : "",
    titleHtml: typeof snapshot.titleHtml === "string" ? sanitizeProductHtml(snapshot.titleHtml) : "",
    titleColor: typeof snapshot.titleColor === "string" ? snapshot.titleColor : EMPTY.titleColor,
    titleFontFamily: "Arial",
    titleFontSize: 28,
    titleFontWeight: 700,
    description: typeof snapshot.description === "string" ? sanitizeProductHtml(snapshot.description) : "",
    contentHtml: typeof snapshot.contentHtml === "string" ? sanitizeProductHtml(snapshot.contentHtml) : "",
    summaryHtml: typeof snapshot.summaryHtml === "string" ? sanitizeProductHtml(snapshot.summaryHtml) : "",
    priceText: typeof snapshot.priceText === "string" ? snapshot.priceText : EMPTY.priceText,
    stockText: typeof snapshot.stockText === "string" ? snapshot.stockText : EMPTY.stockText,
    imageUrl: typeof snapshot.imageUrl === "string" ? snapshot.imageUrl : "",
    imageAlt: typeof snapshot.imageAlt === "string" ? snapshot.imageAlt : "",
    shipperImageUrl: typeof snapshot.shipperImageUrl === "string" ? snapshot.shipperImageUrl : "",
    shipperImageAlt: typeof snapshot.shipperImageAlt === "string" ? snapshot.shipperImageAlt : "",
    ogImageUrl: typeof snapshot.ogImageUrl === "string" ? snapshot.ogImageUrl : "",
    ogImageAlt: typeof snapshot.ogImageAlt === "string" ? snapshot.ogImageAlt : "",
    metaTitle: typeof snapshot.metaTitle === "string" ? normalizeDecorativeUnicode(snapshot.metaTitle) : "",
    metaDescription: typeof snapshot.metaDescription === "string" ? normalizeDecorativeUnicode(snapshot.metaDescription) : "",
    canonicalUrl: typeof snapshot.canonicalUrl === "string" ? snapshot.canonicalUrl : "",
    slugEn: typeof snapshot.slugEn === "string" ? snapshot.slugEn : "",
    titleEn: typeof snapshot.titleEn === "string" ? normalizeDecorativeUnicode(snapshot.titleEn) : "",
    descriptionEn: typeof snapshot.descriptionEn === "string" ? sanitizeProductHtml(snapshot.descriptionEn) : "",
    contentHtmlEn: typeof snapshot.contentHtmlEn === "string" ? sanitizeProductHtml(snapshot.contentHtmlEn) : "",
    summaryHtmlEn: typeof snapshot.summaryHtmlEn === "string" ? sanitizeProductHtml(snapshot.summaryHtmlEn) : "",
    priceTextEn: typeof snapshot.priceTextEn === "string" ? snapshot.priceTextEn : EMPTY.priceTextEn,
    stockTextEn: typeof snapshot.stockTextEn === "string" ? snapshot.stockTextEn : EMPTY.stockTextEn,
    imageAltEn: typeof snapshot.imageAltEn === "string" ? snapshot.imageAltEn : "",
    shipperImageAltEn: typeof snapshot.shipperImageAltEn === "string" ? snapshot.shipperImageAltEn : "",
    ogImageAltEn: typeof snapshot.ogImageAltEn === "string" ? snapshot.ogImageAltEn : "",
    metaTitleEn: typeof snapshot.metaTitleEn === "string" ? normalizeDecorativeUnicode(snapshot.metaTitleEn) : "",
    metaDescriptionEn: typeof snapshot.metaDescriptionEn === "string" ? normalizeDecorativeUnicode(snapshot.metaDescriptionEn) : "",
    canonicalUrlEn: typeof snapshot.canonicalUrlEn === "string" ? snapshot.canonicalUrlEn : "",
    gallery: Array.isArray(snapshot.gallery) ? snapshot.gallery.map((media) => ({ ...media, url: typeof media?.url === "string" ? media.url : "", altText: typeof media?.altText === "string" ? media.altText : "", caption: "", altTextEn: typeof media?.altTextEn === "string" ? media.altTextEn : "", captionEn: "" })) : [],
  };
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlToPlainText(value: string) {
  if (!value) return "";
  if (typeof window !== "undefined") {
    const container = document.createElement("div");
    container.innerHTML = value;
    return (container.innerText || container.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  }
  return value.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6])>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function plainTextToHtml(value: string) {
  return value.split(/\n{2,}/).map((block) => {
    const image = block.trim().match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/);
    if (image) return `<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy">${image[3] ? `<figcaption>${escapeHtml(image[3])}</figcaption>` : ""}</figure>`;
    return `<p>${block.split("\n").map((line) => escapeHtml(line)).join("<br>")}</p>`;
  }).filter(Boolean).join("\n");
}

function ContentMediaAppender({ label, onAppend }: { label: string; onAppend: (markdown: string) => void }) {
  return <div className="product-html-media"><MediaPicker label={label} value="" onSelect={(asset) => {
    const alt = (asset.altText || asset.name).replace(/[\[\]]/g, "");
    const caption = asset.caption ? ` "${asset.caption.replace(/"/g, "'")}"` : "";
    onAppend(`![${alt}](${asset.url}${caption})`);
  }} /></div>;
}

const MIXED_VALUE = "__mixed__";
const DEFAULT_TEXT_COLOR = "#243f55";
const DEFAULT_HIGHLIGHT_COLOR = "#fff59d";
const FONT_OPTIONS = ["Arial", "Times New Roman", "Roboto", "Helvetica", "Montserrat", "Open Sans", "Noto Sans", "Be Vietnam Pro", "Tahoma", "Verdana"];
const SIZE_OPTIONS = ["12px", "14px", "15px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "40px", "42px", "48px", "56px", "64px"];
const LINE_HEIGHT_OPTIONS = ["normal", "0.8", "0.9", "1", "1.1", "1.15", "1.2", "1.25", "1.3", "1.4", "1.5", "1.6", "1.75", "2", "2.25", "2.5", "3"];
type ToolbarState = { block: string; fontFamily: string; fontSize: string; lineHeight: string; fontWeight: string; fontStyle: string; textDecoration: string; color: string; backgroundColor: string };
type ImageEditState = {
  alt: string;
  caption: string;
  alignment: "none" | "left" | "center" | "right";
  size: "thumbnail" | "medium" | "large" | "full" | "custom";
  linkTo: "none" | "media" | "custom";
  linkUrl: string;
  title: string;
  imageClass: string;
  openInNewTab: boolean;
  linkRel: string;
  linkClass: string;
};

const DEFAULT_TOOLBAR_STATE: ToolbarState = { block: "p", fontFamily: "Arial", fontSize: "16px", lineHeight: "normal", fontWeight: "400", fontStyle: "normal", textDecoration: "none", color: DEFAULT_TEXT_COLOR, backgroundColor: "transparent" };

function toHexColor(value: string) {
  if (!value.trim()) return "transparent";
  const match = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!match) return value.toLowerCase() === "transparent" ? "transparent" : value.toLowerCase();
  if (match[4] !== undefined && Number(match[4]) === 0) return "transparent";
  return `#${[match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
}

function toBackgroundColor(value: string) {
  if (!value.trim()) return "transparent";
  const token = value.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/i)?.[0] || value;
  return toHexColor(token);
}

function canonicalFontFamily(value: string) {
  const lower = value.toLowerCase();
  return FONT_OPTIONS.find((font) => lower.includes(font.toLowerCase())) || value.split(",")[0].replace(/["']/g, "").trim() || MIXED_VALUE;
}

function youtubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (!["www.youtube.com", "youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return null;
    if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.pathname === "/watch") return url.searchParams.get("v");
    return url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] || null;
  } catch {
    return null;
  }
}

function youtubeEmbedHtml(url: string) {
  const id = youtubeVideoId(url);
  if (!id) return null;
  return `<figure class="product-rich-video"><div class="product-rich-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtmlAttribute(id)}?rel=0" title="Video YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><figcaption><a href="${escapeHtmlAttribute(url.trim())}" target="_blank" rel="noopener noreferrer">Mở video trên YouTube</a></figcaption></figure><p><br></p>`;
}

function mixedValue(values: string[], fallback: string) {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.length === 1 ? unique[0] : unique.length > 1 ? MIXED_VALUE : fallback;
}

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  mediaLabel,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  mediaLabel?: string;
  compact?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<MediaSelection | null>(null);
  const [pendingAlt, setPendingAlt] = useState("");
  const [pendingCaption, setPendingCaption] = useState("");
  const [pendingAlignment, setPendingAlignment] = useState<"none" | "left" | "center" | "right">("none");
  const [pendingSize, setPendingSize] = useState<"thumbnail" | "medium" | "large" | "full">("full");
  const [pendingLink, setPendingLink] = useState<"none" | "media">("none");
  const [linkUrl, setLinkUrl] = useState("");
  const [toolbarState, setToolbarState] = useState<ToolbarState>(() => compact && label === "Tên sản phẩm"
    ? { ...DEFAULT_TOOLBAR_STATE, fontFamily: "Arial", fontSize: "28px", fontWeight: "700" }
    : DEFAULT_TOOLBAR_STATE);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const preserveImageSelectionRef = useRef<{ src: string; imageIndex: number; wasSettingsOpen: boolean } | null>(null);
  const selectedVideoRef = useRef<HTMLIFrameElement | null>(null);
  const resizeDragRef = useRef<{ startX: number; startWidth: number; startHeight: number; aspectRatio: number } | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageEditState | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ width: number; height: number } | null>(null);
  const [imageSettingsOpen, setImageSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(`gedeco:rich-editor-fullscreen:${label}`) === "1");
  const [skipInitialFullscreenAnimation, setSkipInitialFullscreenAnimation] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(`gedeco:rich-editor-fullscreen:${label}`) === "1");
  const [isFullscreenClosing, setIsFullscreenClosing] = useState(false);
  const [resizeBox, setResizeBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [scrollbarState, setScrollbarState] = useState({ visible: false, top: 0, height: 0 });
  const scrollbarDragRef = useRef<{ startY: number; startScrollTop: number; travel: number; maxScroll: number } | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const lastCommittedHtmlRef = useRef(value || "");
  const pendingTypingStyleRef = useRef<Partial<Record<"fontFamily" | "fontSize" | "lineHeight" | "fontWeight" | "fontStyle" | "textDecoration" | "color" | "backgroundColor", string>>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`gedeco:rich-editor-fullscreen:${label}`, isFullscreen ? "1" : "0");
  }, [isFullscreen, label]);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor || typeof window === "undefined") return;
    const key = `gedeco:rich-editor-scroll:${label}`;
    const saved = Number(window.localStorage.getItem(key));
    if (Number.isFinite(saved) && saved > 0) editor.scrollTop = saved;
    const persistScroll = () => window.localStorage.setItem(key, String(editor.scrollTop));
    editor.addEventListener("scroll", persistScroll, { passive: true });
    return () => editor.removeEventListener("scroll", persistScroll);
  }, [isFullscreen, label]);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const updateScrollbar = () => {
      const maxScroll = editor.scrollHeight - editor.clientHeight;
      if (maxScroll <= 0 || editor.clientHeight <= 0) {
        setScrollbarState({ visible: false, top: 0, height: 0 });
        return;
      }
      const trackHeight = editor.clientHeight;
      const thumbHeight = Math.max(36, Math.round((editor.clientHeight / editor.scrollHeight) * trackHeight));
      const travel = Math.max(0, trackHeight - thumbHeight);
      setScrollbarState({ visible: true, top: Math.round((editor.scrollTop / maxScroll) * travel), height: thumbHeight });
    };
    updateScrollbar();
    editor.addEventListener("scroll", updateScrollbar, { passive: true });
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollbar) : null;
    resizeObserver?.observe(editor);
    return () => {
      editor.removeEventListener("scroll", updateScrollbar);
      resizeObserver?.disconnect();
    };
  }, [isFullscreen, value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const currentSnapshot = editor.cloneNode(true) as HTMLDivElement;
    currentSnapshot.querySelectorAll(".is-editor-selected").forEach((node) => node.classList.remove("is-editor-selected"));
    if (currentSnapshot.innerHTML !== (value || "")) {
      editor.innerHTML = value || "";
      normalizeLegacyMediaNodes(editor);
      const preservedSelection = preserveImageSelectionRef.current;
      if (preservedSelection) {
        const images = Array.from(editor.querySelectorAll("img"));
        const restoredImage = images[preservedSelection.imageIndex]?.getAttribute("src") === preservedSelection.src
          ? images[preservedSelection.imageIndex]
          : images.find((image) => image.getAttribute("src") === preservedSelection.src);
        if (restoredImage) {
          selectedImageRef.current = restoredImage;
          restoredImage.classList.add("is-editor-selected");
          setSelectedImage(readImageSettings(restoredImage));
          setImageSettingsOpen(preservedSelection.wasSettingsOpen);
          requestAnimationFrame(updateResizeBox);
        }
        preserveImageSelectionRef.current = null;
        lastCommittedHtmlRef.current = value || "";
        return;
      }
      undoStackRef.current = [];
      lastCommittedHtmlRef.current = value || "";
      selectedImageRef.current = null;
      selectedVideoRef.current = null;
      setSelectedImage(null);
      setSelectedVideo(null);
      setImageSettingsOpen(false);
    } else {
      lastCommittedHtmlRef.current = value || "";
    }
  }, [value]);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.innerHTML === (value || "")) return;
    editor.innerHTML = value || "";
    normalizeLegacyMediaNodes(editor);
  }, [isFullscreen]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (!editor || !selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) return;
      selectionRef.current = selection.getRangeAt(0).cloneRange();
      updateToolbarState(selectionRef.current);
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const observer = new MutationObserver(() => {
      if (!replacePlainYouTubeUrls(editor)) return;
      rememberSelection();
      commitEditorHtml(cleanEditorHtml());
    });
    observer.observe(editor, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  function openFullscreen() {
    setSkipInitialFullscreenAnimation(false);
    setIsFullscreenClosing(false);
    setIsFullscreen(true);
  }

  function closeFullscreen() {
    if (!isFullscreen || isFullscreenClosing) return;
    setSkipInitialFullscreenAnimation(false);
    setIsFullscreenClosing(true);
  }

  function handleFullscreenAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName !== "product-rich-editor-zoom-out") return;
    setIsFullscreenClosing(false);
    setIsFullscreen(false);
  }

  useEffect(() => {
    if (!isFullscreen && !isFullscreenClosing) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeFullscreen();
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFullscreen, isFullscreenClosing]);

  function updateToolbarState(rangeOverride?: Range) {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = rangeOverride || selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    const nodes: Text[] = [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let current: Node | null;
    while ((current = walker.nextNode())) {
      if (current.textContent?.trim() && range.intersectsNode(current)) nodes.push(current as Text);
    }
    if (!nodes.length && selection.anchorNode) nodes.push(selection.anchorNode.nodeType === Node.TEXT_NODE ? selection.anchorNode as Text : document.createTextNode(""));
    const elements = nodes.map((node) => node.parentElement).filter((element): element is HTMLElement => Boolean(element));
    const blocks = elements.map((element) => {
      const tagName = element.closest("h2,h3,h4,blockquote,p")?.tagName.toLowerCase();
      return tagName === "h2" || tagName === "h3" || tagName === "h4" ? tagName : "p";
    });
    const styles = elements.map((element) => getComputedStyle(element));
    const fontFamilyForElement = (element: HTMLElement) => {
      let current: HTMLElement | null = element;
      while (current && current !== editor) {
        const inlineFamily = current.style.getPropertyValue("font-family");
        if (inlineFamily) return canonicalFontFamily(inlineFamily);
        if (current.tagName.toLowerCase() === "font") {
          const face = current.getAttribute("face");
          if (face) return canonicalFontFamily(face);
        }
        current = current.parentElement;
      }
      return canonicalFontFamily(getComputedStyle(element).fontFamily);
    };
    const backgroundForElement = (element: HTMLElement) => {
      let current: HTMLElement | null = element;
      while (current && current !== editor) {
        const computedStyle = getComputedStyle(current);
        const computedValue = toHexColor(computedStyle.backgroundColor);
        const inlineBackgroundColor = current.style.getPropertyValue("background-color") || current.style.backgroundColor;
        const inlineBackground = current.style.getPropertyValue("background");
        const inlineValue = toBackgroundColor(inlineBackgroundColor || inlineBackground);
        if (inlineValue !== "transparent") return inlineValue;
        if (computedValue !== "transparent") return computedValue;
        current = current.parentElement;
      }
      return "transparent";
    };
    const lineHeightForElement = (element: HTMLElement) => {
      let current: HTMLElement | null = element;
      while (current && current !== editor) {
        const inlineLineHeight = current.style.getPropertyValue("line-height").trim();
        if (inlineLineHeight) return inlineLineHeight;
        current = current.parentElement;
      }
      return getComputedStyle(element).lineHeight || "normal";
    };
    const hasUnderline = (element: HTMLElement) => {
      let current: HTMLElement | null = element;
      while (current && current !== editor) {
        const computed = getComputedStyle(current);
        if (current.tagName.toLowerCase() === "u" || computed.textDecorationLine.includes("underline") || computed.textDecoration.includes("underline")) return true;
        current = current.parentElement;
      }
      return false;
    };
    const pending = pendingTypingStyleRef.current;
    setToolbarState({
      block: mixedValue(blocks, "p"),
      fontFamily: compact && label === "Tên sản phẩm" ? "Arial" : pending.fontFamily ?? mixedValue(elements.map(fontFamilyForElement), "Arial"),
      fontSize: compact && (label === "Tên sản phẩm" || label === "Product name") ? "28px" : pending.fontSize ?? mixedValue(styles.map((style) => style.fontSize), "16px"),
      lineHeight: pending.lineHeight ?? mixedValue(elements.map(lineHeightForElement), "normal"),
      fontWeight: compact && label === "Tên sản phẩm" ? "700" : pending.fontWeight ?? mixedValue(styles.map((style) => style.fontWeight), "400"),
      fontStyle: pending.fontStyle ?? mixedValue(styles.map((style) => style.fontStyle), "normal"),
      textDecoration: pending.textDecoration ?? mixedValue(elements.map((element) => hasUnderline(element) ? "underline" : "none"), "none"),
      color: pending.color ?? mixedValue(styles.map((style) => toHexColor(style.color)), DEFAULT_TEXT_COLOR),
      backgroundColor: pending.backgroundColor ?? mixedValue(elements.map(backgroundForElement), "transparent"),
    });
  }

  function rememberSelection() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
      updateToolbarState(selectionRef.current);
    }
  }

  function restoreSelection() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
    }
    if (selection && selectionRef.current && editorRef.current?.contains(selectionRef.current.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current.cloneRange());
    }
  }

  function preserveToolbarSelection(event: React.MouseEvent<HTMLButtonElement>) {
    const editor = editorRef.current;
    if (editor && replacePlainYouTubeUrls(editor)) commitEditorHtml(cleanEditorHtml());
    rememberSelection();
    event.preventDefault();
  }

  function prepareClearHighlight(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const editor = editorRef.current;
    const selection = window.getSelection();
    const liveRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (editor && liveRange?.collapsed && editor.contains(liveRange.commonAncestorContainer)) {
      selectionRef.current = liveRange.cloneRange();
      setPendingTypingStyle("backgroundColor", "transparent");
      return;
    }
    preserveToolbarSelection(event);
  }

  function clearHighlightAction() {
    if (hasCollapsedSavedSelection()) {
      focusEditorAtSavedSelection();
      setPendingTypingStyle("backgroundColor", "transparent");
      return;
    }
    applyInlineStyle("background-color", "transparent");
  }

  function commitEditorHtml(nextHtml: string) {
    const normalized = nextHtml || "";
    if (normalized === lastCommittedHtmlRef.current) return;
    undoStackRef.current.push(lastCommittedHtmlRef.current);
    lastCommittedHtmlRef.current = normalized;
    onChange(normalized);
  }

  function restoreImageSelectionAfterUndo(previousSrc: string | null, wasSettingsOpen: boolean) {
    const editor = editorRef.current;
    const restoredImage = previousSrc && editor ? [...editor.querySelectorAll("img")].find((image) => image.getAttribute("src") === previousSrc) : null;
    if (!restoredImage) {
      clearSelectedImage();
      return;
    }
    selectedImageRef.current?.classList.remove("is-editor-selected");
    selectedImageRef.current = restoredImage;
    restoredImage.classList.add("is-editor-selected");
    setSelectedImage(readImageSettings(restoredImage));
    setImageSettingsOpen(wasSettingsOpen);
  }

  function undoLastChange() {
    const editor = editorRef.current;
    const previousHtml = undoStackRef.current.pop();
    if (!editor || previousHtml === undefined) return;
    const previousSrc = selectedImageRef.current?.getAttribute("src") || null;
    const wasSettingsOpen = imageSettingsOpen;
    editor.innerHTML = previousHtml;
    lastCommittedHtmlRef.current = previousHtml;
    restoreImageSelectionAfterUndo(previousSrc, wasSettingsOpen);
    onChange(previousHtml);
    requestAnimationFrame(() => editor.focus());
  }

  function hasCollapsedSavedSelection() {
    return Boolean(selectionRef.current?.collapsed && editorRef.current?.contains(selectionRef.current.commonAncestorContainer));
  }

  function focusEditorAtSavedSelection() {
    restoreSelection();
    editorRef.current?.focus();
  }

  function setPendingTypingStyle(property: keyof typeof pendingTypingStyleRef.current, value: string) {
    pendingTypingStyleRef.current[property] = value;
    setToolbarState((current) => {
      if (property === "fontFamily") return { ...current, fontFamily: value };
      if (property === "fontSize") return { ...current, fontSize: value };
      if (property === "lineHeight") return { ...current, lineHeight: value };
      if (property === "fontWeight") return { ...current, fontWeight: value };
      if (property === "fontStyle") return { ...current, fontStyle: value };
      if (property === "textDecoration") return { ...current, textDecoration: value };
      if (property === "color") return { ...current, color: value };
      return { ...current, backgroundColor: value };
    });
  }

  function insertPendingStyledCharacter(character: string) {
    const editor = editorRef.current;
    const pending = pendingTypingStyleRef.current;
    const selection = window.getSelection();
    if (!selection) return false;
    const liveRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const savedRange = liveRange?.collapsed && editor?.contains(liveRange.commonAncestorContainer)
      ? liveRange.cloneRange()
      : selectionRef.current?.cloneRange();
    if (!editor || !savedRange || !savedRange.collapsed || !editor.contains(savedRange.commonAncestorContainer) || !Object.keys(pending).length) return false;
    selection.removeAllRanges();
    selection.addRange(savedRange);
    let range = selection.getRangeAt(0);
    const lastElement = (node: Node): HTMLElement | null => {
      let current = node;
      while (current.lastChild) current = current.lastChild;
      return current.nodeType === Node.ELEMENT_NODE ? current as HTMLElement : current.parentElement;
    };
    const firstElement = (node: Node): HTMLElement | null => {
      let current = node;
      while (current.firstChild) current = current.firstChild;
      return current.nodeType === Node.ELEMENT_NODE ? current as HTMLElement : current.parentElement;
    };
    const caretElement = (() => {
      const container = range.startContainer;
      if (container.nodeType === Node.TEXT_NODE && range.startOffset > 0) return container.parentElement;
      if (container.nodeType === Node.ELEMENT_NODE && range.startOffset > 0) {
        return lastElement(container.childNodes[range.startOffset - 1]);
      }
      if (container.nodeType === Node.ELEMENT_NODE && range.startOffset < container.childNodes.length) {
        return firstElement(container.childNodes[range.startOffset]);
      }
      return container.nodeType === Node.ELEMENT_NODE ? container as HTMLElement : container.parentElement;
    })();
    const caretStyle = caretElement ? getComputedStyle(caretElement) : null;
    let splitBackgroundAncestor: HTMLElement | null = null;
    let trailingBackground: HTMLElement | null = null;
    if (pending.backgroundColor === "transparent") {
      let backgroundAncestor = caretElement;
      while (backgroundAncestor && backgroundAncestor !== editor) {
        // Only split the element that owns the background. A descendant can
        // inherit the parent's background in computed styles; treating that
        // descendant as the background wrapper makes the new text land in
        // the wrong branch and can re-apply the old highlight.
        const inlineBackground = backgroundAncestor.style.backgroundColor || backgroundAncestor.style.background;
        const ownsBackground = Boolean(inlineBackground && inlineBackground !== "transparent" && inlineBackground !== "rgba(0, 0, 0, 0)") || backgroundAncestor.tagName.toLowerCase() === "mark";
        if (ownsBackground) break;
        backgroundAncestor = backgroundAncestor.parentElement;
      }
      if (backgroundAncestor && backgroundAncestor !== editor) {
        const trailingRange = document.createRange();
        trailingRange.selectNodeContents(backgroundAncestor);
        trailingRange.setStart(range.startContainer, range.startOffset);
        if (backgroundAncestor.parentNode) {
          const trailingFragment = trailingRange.extractContents();
          splitBackgroundAncestor = backgroundAncestor;
          trailingBackground = backgroundAncestor.cloneNode(false) as HTMLElement;
          trailingBackground.appendChild(trailingFragment);
          range = document.createRange();
          range.setStartAfter(backgroundAncestor);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    const wrapper = document.createElement("span");
    if (caretStyle) {
      wrapper.style.fontFamily = caretStyle.fontFamily;
      wrapper.style.fontSize = caretStyle.fontSize;
      wrapper.style.lineHeight = caretStyle.lineHeight;
      wrapper.style.fontWeight = caretStyle.fontWeight;
      wrapper.style.fontStyle = caretStyle.fontStyle;
      wrapper.style.textDecoration = caretStyle.textDecoration;
      wrapper.style.color = caretStyle.color;
      if (caretStyle.backgroundColor !== "transparent" && caretStyle.backgroundColor !== "rgba(0, 0, 0, 0)") wrapper.style.backgroundColor = caretStyle.backgroundColor;
    }
    if (pending.fontFamily) wrapper.style.fontFamily = pending.fontFamily;
    if (pending.fontSize) wrapper.style.fontSize = pending.fontSize;
    if (pending.lineHeight) wrapper.style.lineHeight = pending.lineHeight;
    if (pending.fontWeight) wrapper.style.fontWeight = pending.fontWeight;
    if (pending.fontStyle) wrapper.style.fontStyle = pending.fontStyle;
    if (pending.textDecoration) wrapper.style.textDecoration = pending.textDecoration;
    if (pending.color) wrapper.style.color = pending.color;
    if (pending.backgroundColor) wrapper.style.backgroundColor = pending.backgroundColor;
    wrapper.textContent = character;
    if (splitBackgroundAncestor?.parentNode) {
      splitBackgroundAncestor.parentNode.insertBefore(wrapper, splitBackgroundAncestor.nextSibling);
      if (trailingBackground?.hasChildNodes()) splitBackgroundAncestor.parentNode.insertBefore(trailingBackground, wrapper.nextSibling);
    } else {
      range.insertNode(wrapper);
    }
    const nextRange = document.createRange();
    nextRange.setStartAfter(wrapper);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    selectionRef.current = nextRange.cloneRange();
    pendingTypingStyleRef.current = {};
    commitEditorHtml(cleanEditorHtml());
    updateToolbarState(nextRange);
    return true;
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1 && Object.keys(pendingTypingStyleRef.current).length && hasCollapsedSavedSelection()) {
      event.preventDefault();
      insertPendingStyledCharacter(event.key);
      return;
    }
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "z" && !event.shiftKey) {
      event.preventDefault();
      undoLastChange();
    } else if (!event.shiftKey && (key === "b" || key === "i" || key === "u")) {
      event.preventDefault();
      toggleTextFormat(key === "b" ? "font-weight" : key === "i" ? "font-style" : "text-decoration");
    }
  }

  function command(name: string, commandValue?: string) {
    if (name === "fontName" && hasCollapsedSavedSelection()) {
      focusEditorAtSavedSelection();
      setPendingTypingStyle("fontFamily", commandValue || "Arial");
      return;
    }
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    if (editorRef.current) commitEditorHtml(cleanEditorHtml());
    updateToolbarState();
  }

  function applyInlineStyle(property: "font-size" | "line-height" | "color" | "background-color" | "font-weight" | "font-style" | "text-decoration", value: string) {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const liveRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const savedRange = liveRange?.collapsed && editor?.contains(liveRange.commonAncestorContainer)
      ? liveRange.cloneRange()
      : selectionRef.current?.cloneRange();
    if (!editor || !selection || !savedRange) return;
    if (savedRange.collapsed) {
      const pendingProperty = property === "font-size" ? "fontSize" : property === "line-height" ? "lineHeight" : property === "background-color" ? "backgroundColor" : property === "font-weight" ? "fontWeight" : property === "font-style" ? "fontStyle" : property === "text-decoration" ? "textDecoration" : "color";
      focusEditorAtSavedSelection();
      setPendingTypingStyle(pendingProperty, value);
      return;
    }
    if (!editor.contains(savedRange.commonAncestorContainer)) return;
    selection.removeAllRanges();
    selection.addRange(savedRange);
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    if (property === "background-color" && value === "transparent") {
      document.execCommand("backColor", false, "transparent");
      editor.querySelectorAll<HTMLElement>("span[style]").forEach((span) => {
        if (span.style.backgroundColor === "transparent" || span.style.backgroundColor === "rgba(0, 0, 0, 0)") span.style.removeProperty("background-color");
      });
      commitEditorHtml(cleanEditorHtml());
      updateToolbarState();
      return;
    }
    const wrapper = document.createElement("span");
    wrapper.style.setProperty(property, value);
    const fragment = range.extractContents();
    fragment.querySelectorAll?.("span").forEach((span) => span.style.removeProperty(property));
    wrapper.appendChild(fragment);
    range.insertNode(wrapper);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.addRange(nextRange);
    commitEditorHtml(cleanEditorHtml());
    updateToolbarState();
  }

  function toggleTextFormat(property: "font-weight" | "font-style" | "text-decoration") {
    if (hasCollapsedSavedSelection()) {
      const activeValue = property === "font-weight" ? "700" : property === "font-style" ? "italic" : "underline";
      const currentValue = property === "font-weight" ? toolbarState.fontWeight : property === "font-style" ? toolbarState.fontStyle : toolbarState.textDecoration;
      const nextValue = currentValue === activeValue ? (property === "font-weight" ? "400" : property === "font-style" ? "normal" : "none") : activeValue;
      focusEditorAtSavedSelection();
      setPendingTypingStyle(property === "font-weight" ? "fontWeight" : property === "font-style" ? "fontStyle" : "textDecoration", nextValue);
      return;
    }
    if (property === "text-decoration") {
      restoreSelection();
      editorRef.current?.focus();
      document.execCommand("underline", false);
      if (editorRef.current) commitEditorHtml(cleanEditorHtml());
      updateToolbarState();
      return;
    }
    const activeValue = property === "font-weight" ? "700" : property === "font-style" ? "italic" : "underline";
    const currentValue = property === "font-weight" ? toolbarState.fontWeight : property === "font-style" ? toolbarState.fontStyle : toolbarState.textDecoration;
    applyInlineStyle(property, currentValue === activeValue ? (property === "font-weight" ? "400" : property === "font-style" ? "normal" : "none") : activeValue);
  }

  function prepareMedia(asset: MediaSelection) {
    setPendingMedia(asset);
    setPendingAlt((asset.altText || asset.name || label).trim());
    setPendingCaption("");
    setPendingAlignment("none");
    setPendingSize("full");
    setPendingLink("none");
    setMediaOpen(false);
  }

  function insertMedia() {
    const editor = editorRef.current;
    if (!editor || !pendingMedia) return;
    restoreSelection();
    editor.focus();
    const alt = pendingAlt.trim() || pendingMedia.name || label;
    const caption = pendingCaption.trim();
    const width = pendingSize === "thumbnail" ? 150 : pendingSize === "medium" ? 300 : pendingSize === "large" ? 768 : undefined;
    const figureClass = [pendingAlignment !== "none" ? `align${pendingAlignment}` : "", `size-${pendingSize}`].filter(Boolean).join(" ");
    const image = `<img src="${escapeHtmlAttribute(pendingMedia.url)}" alt="${escapeHtmlAttribute(alt)}" loading="lazy"${width ? ` width="${width}"` : ""}>`;
    const linkedImage = pendingLink === "media" ? `<a href="${escapeHtmlAttribute(pendingMedia.url)}" target="_blank" rel="noopener noreferrer">${image}</a>` : image;
    const alignmentAttribute = pendingAlignment !== "none" ? ` data-editor-explicit-alignment="${pendingAlignment}"` : "";
    const html = `<figure${figureClass ? ` class="${figureClass}"` : ""}${alignmentAttribute}>${linkedImage}${caption ? `<figcaption>${escapeHtmlAttribute(caption)}</figcaption>` : ""}</figure><p><br></p>`;
    document.execCommand("insertHTML", false, html);
    commitEditorHtml(cleanEditorHtml());
    setPendingMedia(null);
    setPendingAlt("");
    setPendingCaption("");
    setPendingAlignment("none");
    setPendingSize("full");
    setPendingLink("none");
  }

  function insertYouTubeVideo(url: string) {
    const editor = editorRef.current;
    const html = youtubeEmbedHtml(url);
    if (!editor || !html) return false;
    restoreSelection();
    editor.focus();
    const selection = window.getSelection();
    if (!selection) return false;
    if (selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return false;
    range.deleteContents();
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const fragment = document.createDocumentFragment();
    while (holder.firstChild) fragment.appendChild(holder.firstChild);
    range.insertNode(fragment);
    selection.removeAllRanges();
    const caret = document.createRange();
    caret.selectNodeContents(editor);
    caret.collapse(false);
    selection.addRange(caret);
    commitEditorHtml(cleanEditorHtml());
    return true;
  }

  function replacePlainYouTubeUrls(editor: HTMLDivElement) {
    const block = [...editor.querySelectorAll("p, div")].find((element) => {
      const text = element.textContent?.trim() || "";
      return !element.closest("figure") && youtubeVideoId(text) && !element.querySelector("*");
    });
    if (block) {
      const html = youtubeEmbedHtml(block.textContent?.trim() || "");
      if (html) {
        block.outerHTML = html;
        return true;
      }
    }
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let current: Node | null;
    while ((current = walker.nextNode())) textNodes.push(current as Text);
    let replaced = false;
    for (const textNode of textNodes) {
      const parent = textNode.parentElement;
      const url = textNode.textContent?.trim() || "";
      if (!parent || parent.closest("a, figure") || !youtubeVideoId(url)) continue;
      const html = youtubeEmbedHtml(url);
      if (!html) continue;
      const range = document.createRange();
      range.selectNode(textNode);
      range.deleteContents();
      const holder = document.createElement("div");
      holder.innerHTML = html;
      const fragment = document.createDocumentFragment();
      while (holder.firstChild) fragment.appendChild(holder.firstChild);
      range.insertNode(fragment);
      replaced = true;
    }
    return replaced;
  }

  function handleEditorPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const pastedText = event.clipboardData.getData("text/plain").trim();
    if (!youtubeVideoId(pastedText)) return;
    event.preventDefault();
    insertYouTubeVideo(pastedText);
  }

  function readImageSettings(image: HTMLImageElement): ImageEditState {
    const figure = image.closest("figure");
    const anchor = image.closest("a");
    const classes = figure?.classList;
    const alignment = (["left", "center", "right"] as const).find((value) => classes?.contains(`align${value}`)) || "none";
    const size = (["thumbnail", "medium", "large"] as const).find((value) => classes?.contains(`size-${value}`)) || (image.getAttribute("width") ? "custom" : "full");
    const caption = figure?.querySelector("figcaption")?.textContent || "";
    const linkTo = anchor ? (anchor.getAttribute("href") === image.getAttribute("src") ? "media" : "custom") : "none";
    return {
      alt: image.getAttribute("alt") || "",
      caption,
      alignment,
      size,
      linkTo,
      linkUrl: anchor?.getAttribute("href") || "",
      title: image.getAttribute("title") || "",
      imageClass: [...image.classList].filter((value) => value !== "is-editor-selected").join(" "),
      openInNewTab: anchor?.getAttribute("target") === "_blank",
      linkRel: anchor?.getAttribute("rel") || "",
      linkClass: anchor?.getAttribute("class") || "",
    };
  }

  function updateSelectedImage(patch: Partial<ImageEditState>) {
    const image = selectedImageRef.current;
    const next = { ...selectedImage, ...patch } as ImageEditState;
    if (!image) return;
    const figure = image.closest("figure");
    const currentAnchor = image.closest("a");
    image.setAttribute("alt", next.alt);
    if (next.title.trim()) image.setAttribute("title", next.title.trim()); else image.removeAttribute("title");
    if (next.imageClass.trim()) image.setAttribute("class", next.imageClass.trim()); else image.removeAttribute("class");
    image.classList.add("is-editor-selected");
    if (figure) {
      if (Object.prototype.hasOwnProperty.call(patch, "alignment")) {
        figure.classList.remove("alignleft", "aligncenter", "alignright");
        if (next.alignment !== "none") figure.classList.add(`align${next.alignment}`);
        if (next.alignment === "none") figure.removeAttribute("data-editor-explicit-alignment");
        else figure.setAttribute("data-editor-explicit-alignment", next.alignment);
      }
      if (Object.prototype.hasOwnProperty.call(patch, "size")) {
        figure.classList.remove("size-thumbnail", "size-medium", "size-large", "size-full", "size-custom");
        figure.classList.add(`size-${next.size}`);
        const width = next.size === "thumbnail" ? "150" : next.size === "medium" ? "300" : next.size === "large" ? "768" : next.size === "custom" ? image.getAttribute("width") : "";
        if (width) image.setAttribute("width", width); else image.removeAttribute("width");
      }
      let caption = figure.querySelector("figcaption");
      if (next.caption.trim()) {
        if (!caption) { caption = document.createElement("figcaption"); figure.appendChild(caption); }
        caption.textContent = next.caption;
      } else if (caption) caption.remove();
    }
    if (next.linkTo === "none") {
      if (currentAnchor?.parentElement) currentAnchor.replaceWith(image);
    } else {
      const anchor = currentAnchor || document.createElement("a");
      if (!currentAnchor) image.replaceWith(anchor);
      anchor.setAttribute("href", next.linkTo === "media" ? image.getAttribute("src") || "" : next.linkUrl.trim());
      if (next.openInNewTab) anchor.setAttribute("target", "_blank"); else anchor.removeAttribute("target");
      if (next.linkRel.trim()) anchor.setAttribute("rel", next.linkRel.trim()); else anchor.removeAttribute("rel");
      if (next.linkClass.trim()) anchor.setAttribute("class", next.linkClass.trim()); else anchor.removeAttribute("class");
      if (!anchor.contains(image)) anchor.appendChild(image);
    }
    setSelectedImage(next);
    if (editorRef.current) {
      const imageIndex = Array.from(editorRef.current.querySelectorAll("img")).indexOf(image);
      preserveImageSelectionRef.current = { src: image.getAttribute("src") || "", imageIndex, wasSettingsOpen: imageSettingsOpen };
      const snapshot = editorRef.current.cloneNode(true) as HTMLDivElement;
      snapshot.querySelectorAll(".is-editor-selected").forEach((node) => node.classList.remove("is-editor-selected"));
      commitEditorHtml(snapshot.innerHTML);
    }
  }

  function cleanEditorHtml() {
    const editor = editorRef.current;
    if (!editor) return "";
    normalizeLegacyMediaNodes(editor);
    const snapshot = editor.cloneNode(true) as HTMLDivElement;
    snapshot.querySelectorAll(".is-editor-selected").forEach((node) => node.classList.remove("is-editor-selected"));
    return normalizeLegacyMediaFigures(snapshot.innerHTML);
  }

  function updateResizeBox() {
    const editor = editorRef.current;
    const image = selectedImageRef.current;
    const video = selectedVideoRef.current;
    const target = image || video?.closest(".product-rich-video-frame");
    if (!editor || !target) return;
    // In fullscreen the editor panel is a positioned child of the fixed overlay.
    // The resize frame and image toolbar are rendered inside that panel, so their
    // coordinates must be measured relative to the panel (not the outer overlay).
    // The normal editor uses `display: contents` for the panel and therefore still
    // falls back to the editor itself.
    const panel = editor.closest(".product-rich-editor-panel") as HTMLElement | null;
    const outerEditor = editor.closest(".product-rich-editor") as HTMLElement | null;
    const host = panel && getComputedStyle(panel).display !== "contents" ? panel : outerEditor || editor;
    const hostRect = host.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setResizeBox({ left: targetRect.left - hostRect.left, top: targetRect.top - hostRect.top, width: targetRect.width, height: targetRect.height });
  }

  function startResize(event: PointerEvent<HTMLElement>, edge: "left" | "right" = "right") {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const image = selectedImageRef.current;
    const video = selectedVideoRef.current;
    const target = image || video?.closest(".product-rich-video-frame");
    if (!target) return;
    const targetRect = target.getBoundingClientRect();
    if (targetRect.width <= 0 || targetRect.height <= 0) return;
    resizeDragRef.current = { startX: event.clientX, startWidth: targetRect.width, startHeight: targetRect.height, aspectRatio: targetRect.width / Math.max(1, targetRect.height) };
    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const drag = resizeDragRef.current;
      if (!drag) return;
      const widthDelta = (edge === "left" ? -1 : 1) * (moveEvent.clientX - drag.startX);
      const width = Math.max(80, Math.round(drag.startWidth + widthDelta));
      if (image) {
        image.setAttribute("width", String(width));
        image.style.width = `${width}px`;
        image.style.height = "auto";
        setResizeBox((current) => current ? { ...current, width, height: width / drag.aspectRatio } : current);
      } else if (video) {
        const figure = video.closest("figure");
        if (figure) figure.setAttribute("style", `width:${width}px`);
        setResizeBox((current) => current ? { ...current, width, height: width / drag.aspectRatio } : current);
      }
    };
    const onUp = () => {
      const drag = resizeDragRef.current;
      resizeDragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (image) {
        setSelectedImage((current) => current ? { ...current, size: "custom" } : current);
      } else if (video && drag) {
        const width = Math.max(80, Math.round(resizeBox?.width || targetRect.width));
        setSelectedVideo({ width, height: Math.round(width / drag.aspectRatio) });
      }
      updateResizeBox();
      commitEditorHtml(cleanEditorHtml());
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function startImageEdgeResize(event: React.PointerEvent<HTMLDivElement>) {
    const image = (event.target as HTMLElement).closest("img");
    if (!image || !editorRef.current?.contains(image)) return;
    const rect = image.getBoundingClientRect();
    const edgeThreshold = 18;
    const nearLeft = event.clientX - rect.left <= edgeThreshold;
    const nearRight = rect.right - event.clientX <= edgeThreshold;
    const nearTop = event.clientY - rect.top <= edgeThreshold;
    const nearBottom = rect.bottom - event.clientY <= edgeThreshold;
    if ((!nearLeft && !nearRight) || (!nearTop && !nearBottom)) return;
    event.preventDefault();
    event.stopPropagation();
    selectedImageRef.current?.classList.remove("is-editor-selected");
    selectedVideoRef.current?.classList.remove("is-editor-selected");
    selectedImageRef.current = image as HTMLImageElement;
    selectedVideoRef.current = null;
    image.classList.add("is-editor-selected");
    setSelectedVideo(null);
    setSelectedImage(readImageSettings(image as HTMLImageElement));
    setImageSettingsOpen(false);
    startResize(event as unknown as PointerEvent<HTMLElement>, nearLeft ? "left" : "right");
  }

  function startScrollbarDrag(event: React.PointerEvent<HTMLSpanElement>) {
    const editor = editorRef.current;
    if (!editor || !scrollbarState.visible) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const thumbHeight = scrollbarState.height;
    scrollbarDragRef.current = {
      startY: event.clientY,
      startScrollTop: editor.scrollTop,
      travel: Math.max(1, editor.clientHeight - thumbHeight),
      maxScroll: Math.max(0, editor.scrollHeight - editor.clientHeight),
    };
    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const drag = scrollbarDragRef.current;
      if (!drag || !editorRef.current) return;
      const delta = moveEvent.clientY - drag.startY;
      editorRef.current.scrollTop = Math.max(0, Math.min(drag.maxScroll, drag.startScrollTop + (delta / drag.travel) * drag.maxScroll));
    };
    const onUp = () => {
      scrollbarDragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function clearSelectedImage() {
    selectedImageRef.current?.classList.remove("is-editor-selected");
    selectedVideoRef.current?.classList.remove("is-editor-selected");
    selectedVideoRef.current?.closest("figure")?.classList.remove("is-editor-selected");
    selectedImageRef.current = null;
    selectedVideoRef.current = null;
    setSelectedImage(null);
    setSelectedVideo(null);
    setImageSettingsOpen(false);
    setResizeBox(null);
  }

  function removeSelectedImage() {
    const image = selectedImageRef.current;
    const video = selectedVideoRef.current;
    const target = image || video;
    if (!target) return;
    const figure = target.closest("figure");
    (figure || target).remove();
    clearSelectedImage();
    commitEditorHtml(cleanEditorHtml());
  }

  function normalizeLegacyMediaNodes(editor: HTMLDivElement) {
    const figures = Array.from(editor.querySelectorAll("figure.product-rich-video"));
    figures.forEach((figure) => {
      // A real YouTube embed keeps the video wrapper. Only unwrap legacy
      // image/text figures that accidentally inherited the video class.
      if (figure.querySelector("iframe, .product-rich-video-frame")) return;
      const nestedFigure = Array.from(figure.children).find((child) => child.tagName.toLowerCase() === "figure") as HTMLElement | undefined;
      if (nestedFigure) {
        figure.replaceWith(nestedFigure);
        return;
      }
      const paragraph = document.createElement("p");
      while (figure.firstChild) paragraph.appendChild(figure.firstChild);
      figure.replaceWith(paragraph);
    });
  }

  useEffect(() => {
    const handleOutsidePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || editorRef.current?.contains(target) || target.closest(".product-rich-image-toolbar, .product-rich-image-settings")) return;
      if (selectedImageRef.current || selectedVideoRef.current) clearSelectedImage();
    };
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, []);

  useLayoutEffect(() => {
    if (!selectedImage) { setResizeBox(null); return; }
    const refreshBox = () => updateResizeBox();
    // Fullscreen moves the editor into a portal and changes the positioned
    // ancestor. Re-measure after both layout passes so the resize frame and
    // image toolbar stay on the image instead of keeping normal-mode offsets.
    const firstFrame = requestAnimationFrame(() => {
      refreshBox();
      requestAnimationFrame(refreshBox);
    });
    window.addEventListener("resize", refreshBox);
    window.addEventListener("scroll", refreshBox, true);
    return () => {
      cancelAnimationFrame(firstFrame);
      window.removeEventListener("resize", refreshBox);
      window.removeEventListener("scroll", refreshBox, true);
    };
  }, [selectedImage, isFullscreen, isFullscreenClosing]);

  function selectImage(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const image = target.closest("img");
    const videoFigure = target.closest("figure.product-rich-video");
    const video = videoFigure?.querySelector("iframe");
    if ((!image && !video) || !editorRef.current?.contains((image || video) as Node)) {
      if (selectedImageRef.current) clearSelectedImage();
      return;
    }
    event.preventDefault();
    selectedImageRef.current?.classList.remove("is-editor-selected");
    selectedVideoRef.current?.classList.remove("is-editor-selected");
    if (image) {
      selectedVideoRef.current = null;
      selectedImageRef.current = image as HTMLImageElement;
      image.classList.add("is-editor-selected");
      setSelectedVideo(null);
      setSelectedImage(readImageSettings(image as HTMLImageElement));
    } else if (video) {
      selectedImageRef.current = null;
      selectedVideoRef.current = video as HTMLIFrameElement;
      video.classList.add("is-editor-selected");
      video.closest("figure")?.classList.add("is-editor-selected");
      const frame = video.closest(".product-rich-video-frame")?.getBoundingClientRect();
      setSelectedImage(null);
      setSelectedVideo({ width: Math.round(frame?.width || 760), height: Math.round(frame?.height || 428) });
    }
    setImageSettingsOpen(false);
  }

  const words = (editorRef.current?.innerText || value.replace(/<[^>]+>/g, "")).trim().split(/\s+/).filter(Boolean).length;
  const fullscreenVisible = isFullscreen || isFullscreenClosing;
  const editor = <div className={`${fullscreenVisible ? "lw vimigo " : ""}product-rich-editor${fullscreenVisible ? " is-fullscreen" : ""}${isFullscreenClosing ? " is-closing" : ""}`} style={fullscreenVisible ? { position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", width: "100vw", height: "100vh", maxHeight: "100vh", minHeight: 0, boxSizing: "border-box", padding: 24, overflow: "hidden", background: "rgba(10, 20, 30, .56)", animation: skipInitialFullscreenAnimation ? "none" : undefined } : undefined} onAnimationEnd={isFullscreenClosing ? handleFullscreenAnimationEnd : undefined} onMouseDown={(event) => { if (fullscreenVisible && event.target === event.currentTarget) closeFullscreen(); }}>
    <div className="product-rich-editor-panel" style={fullscreenVisible ? { position: "relative", display: "flex", flexDirection: "column", width: "min(1440px, 100%)", height: "min(920px, calc(100vh - 48px))", minHeight: 0, margin: "auto", padding: 20, paddingBottom: 20, overflow: "hidden", boxSizing: "border-box", borderRadius: 12, background: "#fff", boxShadow: "none" } : undefined}>
    <div className="product-rich-editor-label"><span>{label}</span>{fullscreenVisible ? <button type="button" className="product-rich-editor-close product-rich-editor-close-corner" aria-label="Đóng toàn màn hình" title="Đóng" style={{ position: "static", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 72, height: 34, padding: "0 14px", border: "1px solid #c7dce8", borderRadius: 8, background: "#fff", color: "#496577", fontSize: 13, fontWeight: 700, lineHeight: 1, cursor: "pointer" }} onMouseDown={(event) => event.stopPropagation()} onClick={closeFullscreen}>Đóng</button> : null}</div>
    <div className={`product-rich-toolbar${compact ? " product-rich-toolbar-compact" : ""}`} role="toolbar" aria-label={`Định dạng ${label}`}>
      <span className="product-rich-top-actions">
        {!compact && <select className="product-rich-block" aria-label="Kiểu đoạn" value={toolbarState.block} onChange={(event) => { if (event.target.value !== MIXED_VALUE) command("formatBlock", event.target.value); }}>
        <option value={MIXED_VALUE}>Nhiều giá trị</option><option value="p">Đoạn văn</option><option value="h2">Tiêu đề 2</option><option value="h3">Tiêu đề 3</option><option value="h4">Tiêu đề 4</option>
        </select>}
        <select className="product-rich-font" aria-label="Phông chữ" value={toolbarState.fontFamily} onChange={(event) => { if (event.target.value !== MIXED_VALUE) command("fontName", event.target.value); }}>
        <option value={MIXED_VALUE}>Nhiều giá trị</option>
        <option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Roboto">Roboto</option><option value="Helvetica">Helvetica</option><option value="Montserrat">Montserrat</option><option value="Open Sans">Open Sans</option><option value="Noto Sans">Noto Sans</option><option value="Be Vietnam Pro">Be Vietnam Pro</option><option value="Tahoma">Tahoma</option><option value="Verdana">Verdana</option>
        </select>
        <select className="product-rich-size" aria-label="Cỡ chữ" value={toolbarState.fontSize} onChange={(event) => { if (event.target.value !== MIXED_VALUE) applyInlineStyle("font-size", event.target.value); }}>
        <option value={MIXED_VALUE}>Nhiều giá trị</option>
        <option value="12px">12 px</option><option value="14px">14 px</option><option value="15px">15 px</option><option value="16px">16 px</option><option value="18px">18 px</option><option value="20px">20 px</option><option value="24px">24 px</option><option value="28px">28 px</option><option value="32px">32 px</option><option value="36px">36 px</option><option value="40px">40 px</option><option value="42px">42 px</option><option value="48px">48 px</option><option value="56px">56 px</option><option value="64px">64 px</option>
        </select>
        {compact && <select className="product-rich-weight" aria-label="Độ đậm" title="Độ đậm" value={toolbarState.fontWeight} onChange={(event) => { if (event.target.value !== MIXED_VALUE) applyInlineStyle("font-weight", event.target.value); }}><option value={MIXED_VALUE}>Nhiều giá trị</option><option value="400">Thường</option><option value="500">Trung bình</option><option value="600">Bán đậm</option><option value="700">Đậm</option><option value="800">Rất đậm</option><option value="900">Black</option></select>}
        <label className={`product-rich-color${toolbarState.color === MIXED_VALUE ? " is-mixed" : ""}`} title={toolbarState.color === MIXED_VALUE ? "Màu chữ: nhiều giá trị" : "Màu chữ"}><span>Màu chữ</span><span className="product-rich-color-swatch" style={{ backgroundColor: toolbarState.color === MIXED_VALUE ? DEFAULT_TEXT_COLOR : toolbarState.color }} aria-hidden="true" /><input className="product-rich-color-input-overlay" type="color" aria-label="Màu chữ" value={toolbarState.color === MIXED_VALUE ? DEFAULT_TEXT_COLOR : toolbarState.color} onChange={(event) => applyInlineStyle("color", event.target.value)} /></label>
        {!compact && <label className={`product-rich-color product-rich-background-color${toolbarState.backgroundColor === MIXED_VALUE ? " is-mixed" : toolbarState.backgroundColor === "transparent" ? " is-transparent" : ""}`} title={toolbarState.backgroundColor === MIXED_VALUE ? "Màu nền chữ: nhiều giá trị" : toolbarState.backgroundColor === "transparent" ? "Màu nền chữ: không có" : "Màu nền chữ"}><span>Màu nền chữ</span><span className="product-rich-color-swatch" style={toolbarState.backgroundColor !== MIXED_VALUE && toolbarState.backgroundColor !== "transparent" ? { backgroundColor: toolbarState.backgroundColor } : undefined} aria-hidden="true" /><input className="product-rich-color-input-overlay" type="color" aria-label="Màu nền chữ" value={toolbarState.backgroundColor === MIXED_VALUE || toolbarState.backgroundColor === "transparent" ? DEFAULT_HIGHLIGHT_COLOR : toolbarState.backgroundColor} onChange={(event) => applyInlineStyle("background-color", event.target.value)} /></label>}
        {!compact && <button className="product-rich-clear-highlight" type="button" title="Xóa màu nền chữ" aria-label="Xóa màu nền chữ" onMouseDown={prepareClearHighlight} onClick={clearHighlightAction}><span>Xóa màu nền chữ</span><span className="product-rich-color-swatch product-rich-clear-highlight-icon" aria-hidden="true" /></button>}
      </span>
      <span className="product-rich-text-actions" aria-label="Định dạng chữ">
        <button className={toolbarState.fontWeight === MIXED_VALUE ? "is-mixed" : toolbarState.fontWeight === "700" ? "is-active" : ""} type="button" title="In đậm (Ctrl+B)" aria-label="In đậm" aria-keyshortcuts="Control+B" aria-pressed={toolbarState.fontWeight === MIXED_VALUE ? "mixed" : toolbarState.fontWeight === "700"} onMouseDown={preserveToolbarSelection} onClick={() => toggleTextFormat("font-weight")}><strong>B</strong></button>
        {!compact && <button className={toolbarState.fontStyle === MIXED_VALUE ? "is-mixed" : toolbarState.fontStyle === "italic" ? "is-active" : ""} type="button" title="In nghiêng (Ctrl+I)" aria-label="In nghiêng" aria-keyshortcuts="Control+I" aria-pressed={toolbarState.fontStyle === MIXED_VALUE ? "mixed" : toolbarState.fontStyle === "italic"} onMouseDown={preserveToolbarSelection} onClick={() => toggleTextFormat("font-style")}><em>I</em></button>}
        {!compact && <button className={toolbarState.textDecoration === MIXED_VALUE ? "is-mixed" : toolbarState.textDecoration === "underline" ? "is-active" : ""} type="button" title="Gạch chân (Ctrl+U)" aria-label="Gạch chân" aria-keyshortcuts="Control+U" aria-pressed={toolbarState.textDecoration === MIXED_VALUE ? "mixed" : toolbarState.textDecoration === "underline"} onMouseDown={preserveToolbarSelection} onClick={() => toggleTextFormat("text-decoration")}><u>U</u></button>}
      </span>
      {!compact && <>
      <button type="button" title="Danh sách không thứ tự" aria-label="Danh sách không thứ tự" onMouseDown={preserveToolbarSelection} onClick={() => command("insertUnorderedList")}>•≡</button>
      <button type="button" title="Danh sách có thứ tự" aria-label="Danh sách có thứ tự" onMouseDown={preserveToolbarSelection} onClick={() => command("insertOrderedList")}>1≡</button>
      <button type="button" title="Trích dẫn" aria-label="Trích dẫn" onMouseDown={preserveToolbarSelection} onClick={() => command("formatBlock", "blockquote")}>❝</button>
      <button type="button" title="Căn trái" aria-label="Căn trái" onMouseDown={preserveToolbarSelection} onClick={() => command("justifyLeft")}><span className="product-rich-text-align-icon product-rich-text-align-left" aria-hidden="true"><i /><i /><i /></span></button>
      <button type="button" title="Căn giữa" aria-label="Căn giữa" onMouseDown={preserveToolbarSelection} onClick={() => command("justifyCenter")}><span className="product-rich-text-align-icon product-rich-text-align-center" aria-hidden="true"><i /><i /><i /></span></button>
      <button type="button" title="Căn phải" aria-label="Căn phải" onMouseDown={preserveToolbarSelection} onClick={() => command("justifyRight")}><span className="product-rich-text-align-icon product-rich-text-align-right" aria-hidden="true"><i /><i /><i /></span></button>
      <select className="product-rich-line-height-control" title="Khoảng cách dòng" aria-label="Khoảng cách dòng" value="__line-height-label" onChange={(event) => { if (event.target.value !== "__line-height-label") applyInlineStyle("line-height", event.target.value); }}>
        <option value="__line-height-label">Khoảng cách dòng</option>
        {LINE_HEIGHT_OPTIONS.map((value) => <option key={value} value={value}>{value === "normal" ? "Mặc định" : value}</option>)}
      </select>
      <button type="button" title="Liên kết" aria-label="Liên kết" onMouseDown={preserveToolbarSelection} onClick={() => { const url = linkUrl || window.prompt("Nhập URL liên kết", "https://"); if (url) { setLinkUrl(url); if (!insertYouTubeVideo(url)) command("createLink", url); } }}><Icon name="link" size={16} /></button>
      {mediaLabel ? <button type="button" className="product-rich-insert-file" title="Thêm ảnh" aria-label="Thêm ảnh" onMouseDown={preserveToolbarSelection} onClick={() => setMediaOpen(true)}><Icon name="upload" size={16} /><span>Thêm ảnh</span></button> : null}
      <button type="button" title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"} aria-label={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"} onMouseDown={preserveToolbarSelection} onClick={() => isFullscreen ? closeFullscreen() : openFullscreen()}><Icon name={isFullscreen ? "minimize" : "maximize"} size={17} /></button>
      </>}
    </div>
    {mediaOpen && mediaLabel ? <MediaPicker label={mediaLabel} value="" triggerOnly autoOpen onClose={() => setMediaOpen(false)} onSelect={prepareMedia} /> : null}
    {pendingMedia ? <div className="product-rich-media-fields"><div className="product-rich-media-selected"><img src={pendingMedia.url} alt={pendingAlt || pendingMedia.name} /><strong>Thiết lập media cho vị trí chèn</strong></div><label>Alt text vị trí chèn<input value={pendingAlt} onChange={(event) => setPendingAlt(event.target.value)} /></label><label>Caption vị trí chèn<input value={pendingCaption} onChange={(event) => setPendingCaption(event.target.value)} placeholder="Tùy chọn, chỉ dùng tại vị trí này" /></label><label>Căn chỉnh<select value={pendingAlignment} onChange={(event) => setPendingAlignment(event.target.value as typeof pendingAlignment)}><option value="none">Mặc định</option><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></label><label>Kích thước<select value={pendingSize} onChange={(event) => setPendingSize(event.target.value as typeof pendingSize)}><option value="thumbnail">Ảnh thu nhỏ</option><option value="medium">Trung bình</option><option value="large">Lớn</option><option value="full">Kích thước đầy đủ</option></select></label><label>Liên kết ảnh<select value={pendingLink} onChange={(event) => setPendingLink(event.target.value as typeof pendingLink)}><option value="none">Không có</option><option value="media">Tệp media</option></select></label><div className="product-rich-media-actions"><button type="button" className="btn btn-primary" onClick={insertMedia}>Chèn vào nội dung</button><button type="button" className="btn" onClick={() => setPendingMedia(null)}>Hủy</button></div></div> : null}
    {resizeBox ? <div className="product-rich-image-toolbar" style={{ left: resizeBox.left, top: Math.max(4, resizeBox.top - 48) }} role="toolbar" aria-label={selectedVideo ? "Thao tác video" : "Thao tác ảnh"}>{selectedImage ? <><button type="button" aria-label="Căn trái" title="Căn trái" onMouseDown={(event) => event.preventDefault()} onClick={() => updateSelectedImage({ alignment: "left" })}><span className="product-rich-align-icon product-rich-align-left" aria-hidden="true"><i /><i /><i /></span></button><button type="button" aria-label="Căn giữa" title="Căn giữa" onMouseDown={(event) => event.preventDefault()} onClick={() => updateSelectedImage({ alignment: "center" })}><span className="product-rich-align-icon product-rich-align-center" aria-hidden="true"><i /><i /><i /></span></button><button type="button" aria-label="Căn phải" title="Căn phải" onMouseDown={(event) => event.preventDefault()} onClick={() => updateSelectedImage({ alignment: "right" })}><span className="product-rich-align-icon product-rich-align-right" aria-hidden="true"><i /><i /><i /></span></button><button type="button" aria-label="Không căn" title="Không căn" onMouseDown={(event) => event.preventDefault()} onClick={() => updateSelectedImage({ alignment: "none" })}><span className="product-rich-align-icon product-rich-align-none" aria-hidden="true"><i /><i /><i /></span></button><button type="button" aria-label="Chỉnh sửa ảnh" title="Chỉnh sửa ảnh" onMouseDown={(event) => event.preventDefault()} onClick={() => setImageSettingsOpen(true)}>✎</button></> : <span className="product-rich-video-size-label">Kích thước video</span>}<button type="button" aria-label={selectedVideo ? "Xóa video khỏi nội dung" : "Xóa ảnh khỏi nội dung"} title={selectedVideo ? "Xóa video khỏi nội dung" : "Xóa ảnh khỏi nội dung"} onMouseDown={(event) => event.preventDefault()} onClick={removeSelectedImage}>×</button></div> : null}
    {resizeBox ? <div className="product-rich-image-resize-box" style={{ left: resizeBox.left, top: resizeBox.top, width: resizeBox.width, height: resizeBox.height }}><button type="button" aria-label="Thu phóng ảnh" className="resize-handle resize-handle-nw" onPointerDown={startResize} /><button type="button" aria-label="Thu phóng ảnh" className="resize-handle resize-handle-ne" onPointerDown={startResize} /><button type="button" aria-label="Thu phóng ảnh" className="resize-handle resize-handle-sw" onPointerDown={startResize} /><button type="button" aria-label="Thu phóng ảnh" className="resize-handle resize-handle-se" onPointerDown={startResize} /><span className="resize-dimensions">{Math.round(resizeBox.width)} × {Math.round(resizeBox.height)}</span></div> : null}
    {selectedImage && imageSettingsOpen ? <div className="product-rich-image-settings" role="dialog" aria-label="Chỉnh sửa ảnh đã chèn"><div className="product-rich-image-settings-head"><strong>Chỉnh sửa ảnh đã chèn</strong><button type="button" className="btn btn-ghost" onClick={clearSelectedImage}>Đóng</button></div><div className="product-rich-image-settings-grid"><label>Alt text<input value={selectedImage.alt} onChange={(event) => updateSelectedImage({ alt: event.target.value })} /></label><label>Caption<input value={selectedImage.caption} onChange={(event) => updateSelectedImage({ caption: event.target.value })} /></label><label>Căn chỉnh<select value={selectedImage.alignment} onChange={(event) => updateSelectedImage({ alignment: event.target.value as ImageEditState["alignment"] })}><option value="none">Mặc định</option><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></label><label>Kích thước<select value={selectedImage.size} onChange={(event) => updateSelectedImage({ size: event.target.value as ImageEditState["size"] })}><option value="thumbnail">Ảnh thu nhỏ</option><option value="medium">Trung bình</option><option value="large">Lớn</option><option value="full">Kích thước đầy đủ</option><option value="custom">Tùy chỉnh theo kéo thả</option></select></label><label>Liên kết tới<select value={selectedImage.linkTo} onChange={(event) => updateSelectedImage({ linkTo: event.target.value as ImageEditState["linkTo"] })}><option value="none">Không có</option><option value="media">Tệp tin media</option><option value="custom">URL tùy chỉnh</option></select></label>{selectedImage.linkTo === "custom" ? <label>URL tùy chỉnh<input value={selectedImage.linkUrl} onChange={(event) => updateSelectedImage({ linkUrl: event.target.value })} /></label> : null}<label>Thuộc tính title<input value={selectedImage.title} onChange={(event) => updateSelectedImage({ title: event.target.value })} /></label><label>Lớp CSS ảnh<input value={selectedImage.imageClass} onChange={(event) => updateSelectedImage({ imageClass: event.target.value })} /></label><label>Đường dẫn rel<input value={selectedImage.linkRel} onChange={(event) => updateSelectedImage({ linkRel: event.target.value })} /></label><label>Lớp CSS liên kết<input value={selectedImage.linkClass} onChange={(event) => updateSelectedImage({ linkClass: event.target.value })} /></label><label className="product-rich-image-checkbox"><input type="checkbox" checked={selectedImage.openInNewTab} onChange={(event) => updateSelectedImage({ openInNewTab: event.target.checked })} /> Mở liên kết trong tab mới</label></div></div> : null}
    <div className="product-rich-word-count" aria-live="polite">{words} từ</div>
    <div className="product-rich-editor-content-region" style={fullscreenVisible ? { display: "flex", flex: "1 1 0", minHeight: 0, flexDirection: "row", overflow: "hidden", paddingBottom: 0, boxSizing: "border-box" } : undefined}>
    <div ref={editorRef} className="product-rich-content" style={fullscreenVisible ? { flex: "1 1 auto", minHeight: 0, height: "auto", marginBottom: 0, overflow: "hidden", borderRight: "18px solid #d9e0e4", boxSizing: "border-box" } : undefined} contentEditable suppressContentEditableWarning role="textbox" aria-label={label} data-placeholder={placeholder} onPointerDown={startImageEdgeResize} onClick={selectImage} onWheel={(event) => { if (!fullscreenVisible) return; event.preventDefault(); editorRef.current?.scrollBy({ top: event.deltaY, left: event.deltaX, behavior: "auto" }); }} onPaste={handleEditorPaste} onInput={(event) => { replacePlainYouTubeUrls(event.currentTarget); rememberSelection(); commitEditorHtml(cleanEditorHtml()); }} onKeyDown={handleEditorKeyDown} onSelect={rememberSelection} onMouseUp={rememberSelection} onKeyUp={(event) => { replacePlainYouTubeUrls(event.currentTarget); rememberSelection(); commitEditorHtml(cleanEditorHtml()); }} onBlur={(event) => { replacePlainYouTubeUrls(event.currentTarget); commitEditorHtml(cleanEditorHtml()); }} onFocus={rememberSelection} />
      {fullscreenVisible ? <div className="product-rich-scrollbar" aria-label="Thanh cuộn nội dung" role="scrollbar" aria-valuemin={0} aria-valuemax={scrollbarState.visible ? 100 : 0} aria-valuenow={scrollbarState.visible ? Math.round((scrollbarState.top / Math.max(1, (editorRef.current?.clientHeight || 0) - scrollbarState.height)) * 100) : 0} style={{ position: "relative", flex: "0 0 18px", width: 18, height: "100%", background: "#d9e0e4", borderLeft: "1px solid #aeb9bf", boxSizing: "border-box", display: "block", visibility: "visible", opacity: 1, pointerEvents: "auto" }}><span onPointerDown={startScrollbarDrag} style={{ top: scrollbarState.visible ? scrollbarState.top : 0, height: scrollbarState.visible ? scrollbarState.height : 48, position: "absolute", right: 2, left: 2, minHeight: 44, borderRadius: 7, background: "#65737b", display: "block", visibility: "visible", opacity: 1, cursor: "grab", touchAction: "none" }} /></div> : null}
    </div>
    </div>
  </div>;
  return fullscreenVisible && typeof document !== "undefined" ? createPortal(editor, document.body) : editor;
}

export function ProductManager() {
  const [initialUiState] = useState<ProductUiState | null>(() => readProductUiState());
  const [items, setItems] = useState<ProductListItem[]>(() => initialUiState?.itemsSnapshot || []);
  const [categories, setCategories] = useState<ProductCategoryListItem[]>(() => initialUiState?.categoriesSnapshot || []);
  const [draft, setDraft] = useState<ProductInput>(() => cloneProductDraft(initialUiState?.draftSnapshot));
  const [editorOpen, setEditorOpen] = useState(() => Boolean(initialUiState?.editorOpen && initialUiState?.draftSnapshot));
  const [query, setQuery] = useState(() => initialUiState?.query || "");
  const [categoryFilter, setCategoryFilter] = useState(() => initialUiState?.categoryFilter || "all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(() => initialUiState?.statusFilter || "all");
  const [selected, setSelected] = useState<string[]>([]);
  const [draggingGalleryIndex, setDraggingGalleryIndex] = useState<number | null>(null);
  const [page, setPage] = useState(() => initialUiState?.page && Number.isFinite(initialUiState.page) ? Math.max(1, Math.floor(initialUiState.page)) : 1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => !(initialUiState?.itemsSnapshot?.length));
  const restoredUiRef = useRef(false);
  const pageSize = 12;

  async function refresh() {
    try {
      const [products, categoryItems] = await Promise.all([listDashboardProducts(), listProductCategories()]);
      setItems(products); setCategories(categoryItems);
      setDraft((current) => current.categoryId ? current : { ...current, categoryId: categoryItems[0]?.id || "" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không tải được sản phẩm."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    if (typeof initialUiState?.scrollY === "number" && Number.isFinite(initialUiState.scrollY)) {
      window.scrollTo({ top: initialUiState.scrollY, left: 0, behavior: "auto" });
    }
  }, [initialUiState]);

  useEffect(() => {
    if (typeof window === "undefined" || !restoredUiRef.current) return;
    const persistUiState = () => {
      try {
        window.localStorage.setItem(PRODUCT_UI_STATE_KEY, JSON.stringify({
          editorOpen,
          draftId: draft.id,
          draftSnapshot: editorOpen ? draft : null,
          itemsSnapshot: items,
          categoriesSnapshot: categories,
          query,
          categoryFilter,
          statusFilter,
          page,
          scrollY: window.scrollY,
        }));
      } catch {
        // State persistence must never block editing when browser storage is unavailable/full.
      }
    };
    persistUiState();
    window.addEventListener("scroll", persistUiState, { passive: true });
    return () => window.removeEventListener("scroll", persistUiState);
  }, [editorOpen, draft, items, categories, query, categoryFilter, statusFilter, page]);

  useEffect(() => {
    if (restoredUiRef.current || typeof window === "undefined") return;
    restoredUiRef.current = true;
    try {
      const saved = initialUiState;
      if (!saved) return;
      if (typeof saved.query === "string") setQuery(saved.query);
      if (typeof saved.categoryFilter === "string") setCategoryFilter(saved.categoryFilter);
      if (saved.statusFilter === "all" || saved.statusFilter === "published" || saved.statusFilter === "draft") setStatusFilter(saved.statusFilter);
      if (typeof saved.page === "number" && Number.isFinite(saved.page)) setPage(Math.max(1, Math.floor(saved.page)));
      if (saved.editorOpen && saved.draftSnapshot && typeof saved.draftSnapshot === "object") {
        const restoredDraft = cloneProductDraft(saved.draftSnapshot);
        const freshItem = saved.draftId ? items.find((product) => product.id === saved.draftId) : undefined;
        const staleIncompleteManualTranslation = Boolean(freshItem?.translationMode === "AUTO" && restoredDraft.translationMode === "MANUAL" && !restoredDraft.summaryHtmlEn.trim());
        setDraft(staleIncompleteManualTranslation ? cloneProductDraft(freshItem) : restoredDraft);
        setEditorOpen(true);
        setMessage(""); setError("");
      } else if (saved.editorOpen && saved.draftId && items.length) {
        const item = items.find((product) => product.id === saved.draftId);
        if (item) edit(item);
      }
    } catch {
      window.localStorage.removeItem(PRODUCT_UI_STATE_KEY);
    }
  }, [initialUiState, items]);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  function setEnglishField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setDraft((current) => ({ ...current, [key]: value, translationMode: "MANUAL" }));
  }
  function edit(item?: ProductListItem) {
    setEditorOpen(true);
    setDraft(item ? cloneProductDraft(item) : { ...EMPTY, categoryId: categories[0]?.id || "", gallery: [] });
    setMessage(""); setError("");
  }
  function selectMain(asset: MediaSelection) {
    setDraft((current) => ({ ...current, imageUrl: asset.url, imageAlt: asset.altText || current.imageAlt || current.title, imageCaption: "" }));
  }
  function addGallery(asset: MediaSelection) {
    setDraft((current) => ({ ...current, gallery: [...current.gallery, { id: asset.id, url: asset.url, altText: asset.altText || current.title, caption: "", sortOrder: current.gallery.length, isPrimary: current.gallery.length === 0 }] }));
  }
  function updateGallery(index: number, patch: Partial<ProductMediaInput>) {
    setDraft((current) => ({ ...current, gallery: current.gallery.map((item, position) => position === index ? { ...item, ...patch } : item) }));
  }
  function moveGallery(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const next = [...current.gallery]; const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, gallery: next.map((item, position) => ({ ...item, sortOrder: position, isPrimary: position === 0 })) };
    });
  }
  function reorderGallery(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setDraft((current) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= current.gallery.length || toIndex >= current.gallery.length) return current;
      const next = [...current.gallery];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...current, gallery: next.map((item, position) => ({ ...item, sortOrder: position, isPrimary: position === 0 })) };
    });
  }
  async function persist(mode: "all" | "vietnamese" | "english" = "all") {
    setSaving(true); setError(""); setMessage("");
    try {
      const payload = mode === "english" ? { ...draft, translationMode: "MANUAL" as const } : mode === "vietnamese" ? { ...draft, translationMode: "AUTO" as const } : draft;
      const result = await saveProduct(payload, { preserveEnglish: mode === "vietnamese" });
      setItems((current) => [result.product, ...current.filter((item) => item.id !== result.product.id)]);
      setDraft(cloneProductDraft(result.product));
      setMessage(mode === "vietnamese" ? "Đã lưu sản phẩm tiếng Việt; bản English hiện tại được giữ nguyên." : mode === "english" ? "Đã lưu sản phẩm English." : `Đã lưu sản phẩm · English: ${result.translation.status === "TRANSLATED" ? "đã sinh" : result.translation.status === "FAILED" ? "dịch lỗi — bản cũ được giữ nguyên" : "cần rà soát"}.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể lưu sản phẩm."); }
    finally { setSaving(false); }
  }
  async function restoreAutomaticEnglish() {
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await saveProduct({ ...draft, translationMode: "AUTO" });
      setItems((current) => [result.product, ...current.filter((item) => item.id !== result.product.id)]);
      setDraft(cloneProductDraft(result.product));
      setMessage("Đã khôi phục bản dịch English tự động.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể khôi phục bản dịch tự động."); }
    finally { setSaving(false); }
  }
  async function remove(item: ProductListItem) {
    if (!window.confirm(`Xóa sản phẩm “${item.title}”?`)) return;
    setDeleting(item.id);
    try { await deleteProduct(item.id); setItems((current) => current.filter((row) => row.id !== item.id)); setEditorOpen(false); setMessage("Đã xóa sản phẩm."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể xóa sản phẩm."); }
    finally { setDeleting(null); }
  }

  async function duplicate(item: ProductListItem) {
    setSaving(true); setError(""); setMessage("");
    try {
      await duplicateProduct(item.id);
      await refresh();
      setMessage(`Đã nhân bản “${item.title}” thành bản nháp để rà soát.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể nhân bản sản phẩm."); }
    finally { setSaving(false); }
  }

  async function bulkDelete() {
    if (!selected.length || !window.confirm(`Xóa ${selected.length} sản phẩm đã chọn?`)) return;
    setSaving(true); setError("");
    try {
      for (const id of selected) await deleteProduct(id);
      setSelected([]); await refresh(); setMessage("Đã xóa các sản phẩm đã chọn.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể xóa sản phẩm đã chọn."); }
    finally { setSaving(false); }
  }

  function toggleSelected(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  useEffect(() => { setPage(1); }, [query, categoryFilter, statusFilter]);

  const filtered = items.filter((item) => {
    const matchesQuery = `${item.title} ${item.slug} ${item.categoryName}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"));
    const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "published" ? item.isPublished : !item.isPublished);
    return matchesQuery && matchesCategory && matchesStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allVisibleSelected = visible.length > 0 && visible.every((item) => selected.includes(item.id));
  const defaultMetaDescription = draft.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) || draft.title;
  const defaultCanonical = `/san-pham/${categories.find((category) => category.id === draft.categoryId)?.slug || "danh-muc"}/${draft.slug || "slug"}`;
  return <section className="cms-categories product-manager" data-state-ready={!loading || items.length > 0 ? "true" : "false"}>
    {(message || error) ? <div className={`cms-notice ${error ? "error" : "success"}`}>{error || message}</div> : null}
    <div className={`product-workspace${editorOpen ? " has-editor" : ""}`}>
      <section className="panel cms-list-panel product-list-panel"><div className="product-list-head"><div className="product-list-tools"><div className="cms-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoặc slug sản phẩm" /></div><BulkToolbar selected={selected.length} onDelete={() => void bulkDelete()} disabled={saving} /><select aria-label="Danh mục" className="product-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">{loading ? "Đang tải danh mục…" : `Tất cả danh mục (${categories.length})`}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button className="btn btn-add-data" type="button" onClick={() => edit()}><Icon name="plus" size={15} />Thêm sản phẩm</button></div></div><div className="product-bulk-bar"><label><input type="checkbox" checked={allVisibleSelected} onChange={() => setSelected((current) => allVisibleSelected ? current.filter((id) => !visible.some((item) => item.id === id)) : [...new Set([...current, ...visible.map((item) => item.id)])])} /> Chọn page này</label><span>{loading ? "Đang tải sản phẩm…" : `${filtered.length} sản phẩm`}</span><select className="product-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">Mọi trạng thái</option><option value="published">Còn hiển thị</option><option value="draft">Bản nháp</option></select></div>{loading ? <p className="cms-empty">Đang tải sản phẩm…</p> : visible.length === 0 ? <p className="cms-empty">Không có sản phẩm phù hợp.</p> : visible.map((item) => <article key={item.id} className={`product-row${draft.id === item.id ? " active" : ""}`}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelected(item.id)} aria-label={`Chọn ${item.title}`} /><div className="product-row-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Icon name="box" size={18} />}</div><div className="product-row-info"><strong>{item.title}</strong><span>{item.categoryName} · {item.priceText || "Liên hệ"}</span></div><span className={`product-status ${item.isPublished ? "live" : "off"}`}>{item.isPublished ? "Đang hiển thị" : "Bản nháp"}</span><div className="product-row-actions"><button className="btn btn-ghost" type="button" onClick={() => edit(item)} disabled={Boolean(deleting) || saving} title="Sửa sản phẩm" aria-label={`Sửa ${item.title}`}><Icon name="pencil" size={15} /></button><button className="btn btn-ghost" type="button" onClick={() => void duplicate(item)} disabled={Boolean(deleting) || saving} title="Nhân bản sản phẩm" aria-label={`Nhân bản ${item.title}`}><Icon name="layers" size={15} /></button><a className="btn btn-ghost" href={`/san-pham/${item.categorySlug}/${item.slug}`} target="_blank" rel="noreferrer" title="Xem sản phẩm" aria-label={`Xem ${item.title}`}><Icon name="external" size={15} /></a><button className="btn btn-ghost cms-danger" type="button" onClick={() => void remove(item)} disabled={deleting === item.id || saving} title="Xóa sản phẩm" aria-label={`Xóa ${item.title}`}><Icon name="trash" size={15} /></button></div></article>)}<div className="product-pagination"><button className="btn" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Trước</button><span>Trang {page}/{pageCount}</span><button className="btn" type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Sau</button></div></section>
      {editorOpen && <section className="panel cms-card cms-category-form product-editor">
        <div className="cms-section-head product-editor-sticky-head"><div><p className="eyebrow">{draft.id ? "CHỈNH SỬA" : "TẠO MỚI"}</p><h2>{draft.title || "Sản phẩm mới"}</h2></div><div className="product-editor-head-actions"><span className={`chip ${draft.isPublished ? "success" : ""}`}>{draft.isPublished ? "Đang hiển thị" : "Bản nháp"}</span>{draft.id && draft.slug && categories.find((category) => category.id === draft.categoryId)?.slug ? <a className="btn btn-ghost" href={`/san-pham/${categories.find((category) => category.id === draft.categoryId)?.slug}/${draft.slug}`} target="_blank" rel="noreferrer"><Icon name="external" size={15} />Xem</a> : <button className="btn btn-ghost" type="button" disabled title="Lưu sản phẩm trước khi xem live"><Icon name="external" size={15} />Xem</button>}<button className="btn btn-ghost product-editor-close-button" type="button" aria-label="Đóng" title="Đóng" onClick={() => setEditorOpen(false)}><Icon name="close" size={17} /></button></div></div>
        <div className="product-editor-columns">
        <div className="product-editor-primary site-content-form-grid">
          <div className="site-content-full product-title-settings"><RichTextEditor label="Tên sản phẩm" value={draft.titleHtml || `<p><strong>${escapeHtml(draft.title)}</strong></p>`} onChange={(value) => setDraft((current) => ({ ...current, titleHtml: value, title: htmlToPlainText(value), titleFontFamily: "Arial", titleFontSize: 28, titleFontWeight: 700 }))} placeholder="Nhập tên sản phẩm…" compact /></div>
          <label>Slug<input value={draft.slug} onChange={(event) => set("slug", event.target.value)} placeholder="tự động tạo theo tên" /></label>
          <label>Danh mục<select value={draft.categoryId} onChange={(event) => set("categoryId", event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isPublished ? "" : " (đang ẩn)"}</option>)}</select></label>
          <label>Giá hiển thị<input value={draft.priceText} onChange={(event) => set("priceText", event.target.value)} /></label>
          <label>Tình trạng<select value={draft.stockText} onChange={(event) => set("stockText", event.target.value)}><option value="Còn hàng">Còn hàng</option><option value="Hết hàng">Hết hàng</option>{draft.stockText && !["Còn hàng", "Hết hàng"].includes(draft.stockText) ? <option value={draft.stockText}>{draft.stockText}</option> : null}</select></label>
          <div className="site-content-full"><RichTextEditor label="Mô tả ngắn" value={draft.description} onChange={(value) => set("description", value)} placeholder="Nhập mô tả ngắn sản phẩm…" /></div>
          <div className="site-content-full"><RichTextEditor label="Nội dung tóm tắt" value={draft.summaryHtml} onChange={(value) => set("summaryHtml", value)} placeholder="Nhập phần tóm tắt sản phẩm…" /></div>
          <div className="site-content-full"><RichTextEditor label="Nội dung chi tiết" value={draft.contentHtml} onChange={(value) => set("contentHtml", value)} placeholder="Soạn nội dung chi tiết sản phẩm…" mediaLabel="Chèn ảnh vào nội dung chi tiết" /></div>
        </div>

        <aside className="product-editor-media">
          <div className="product-editor-media-head"><strong>Album ảnh sản phẩm</strong><span>Ảnh đầu tiên là ảnh đại diện</span></div>
          <div className="product-editor-media-main"><MediaPicker label="Chọn nguồn ảnh" value={draft.imageUrl} altText={draft.imageAlt} onSelect={selectMain} onClear={() => setDraft((current) => ({ ...current, imageUrl: "", imageAlt: "", imageCaption: "" }))} /></div>
          <div className="product-editor-media-fields"><label>Alt text<input value={draft.imageAlt} onChange={(event) => set("imageAlt", event.target.value)} /></label></div>
          <div className="product-editor-gallery"><div className="product-editor-media-head"><strong>{draft.gallery.length} ảnh trong album</strong></div>{draft.gallery.map((media, index) => <article className={`product-gallery-editor${draggingGalleryIndex === index ? " is-dragging" : ""}`} key={`${media.id || media.url}-${index}`} draggable onDragStart={(event) => { setDraggingGalleryIndex(index); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(index)); }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); const fromIndex = Number(event.dataTransfer.getData("text/plain")); reorderGallery(fromIndex, index); setDraggingGalleryIndex(null); }} onDragEnd={() => setDraggingGalleryIndex(null)}><img src={media.url} alt={media.altText || draft.title} /><div><label>Alt text VI<input value={media.altText} onChange={(event) => updateGallery(index, { altText: event.target.value })} /></label><label>Alt text EN<input value={media.altTextEn || ""} onChange={(event) => { updateGallery(index, { altTextEn: event.target.value }); set("translationMode", "MANUAL"); }} /></label></div><div className="product-gallery-controls"><span className="product-gallery-drag-hint">Kéo thả hoặc sử dụng mũi tên để sắp xếp thứ tự ảnh.</span><div className="cms-row-actions"><button type="button" className="btn product-gallery-drag-button" aria-label="Kéo thả để sắp xếp" title="Kéo thả để sắp xếp"><Icon name="move" size={15} /></button><button type="button" className="btn" disabled={index === 0} onClick={() => moveGallery(index, -1)} aria-label="Đưa ảnh lên" title="Đưa ảnh lên"><Icon name="chevron" size={15} style={{ transform: "rotate(-90deg)" }} /></button><button type="button" className="btn" disabled={index === draft.gallery.length - 1} onClick={() => moveGallery(index, 1)} aria-label="Đưa ảnh xuống" title="Đưa ảnh xuống"><Icon name="chevron" size={15} style={{ transform: "rotate(90deg)" }} /></button><button type="button" className="btn cms-danger" onClick={() => set("gallery", draft.gallery.filter((_, position) => position !== index))} aria-label="Bỏ ảnh khỏi album" title="Bỏ ảnh khỏi album"><Icon name="trash" size={14} /></button></div></div></article>)}<p className="product-gallery-add-hint">Thêm ảnh vào album</p><MediaPicker label="Ảnh album mới" value="" altText={draft.title} onSelect={addGallery} /></div>
        </aside>
        </div>


        <div className="site-content-seo"><div><p className="eyebrow">MEDIA BỔ SUNG</p><h3>Ảnh giao hàng và ảnh mạng xã hội</h3></div><div className="product-media-columns"><div><h4>Ảnh giao hàng</h4><MediaPicker label="Ảnh giao hàng" value={draft.shipperImageUrl} altText={draft.shipperImageAlt} onSelect={(asset) => setDraft((current) => ({ ...current, shipperImageUrl: asset.url, shipperImageAlt: asset.altText || current.shipperImageAlt || current.title, shipperImageCaption: "" }))} onClear={() => setDraft((current) => ({ ...current, shipperImageUrl: "", shipperImageAlt: "", shipperImageCaption: "" }))} /><label>Alt ảnh giao hàng<input value={draft.shipperImageAlt} onChange={(event) => set("shipperImageAlt", event.target.value)} /></label></div><div><h4>Ảnh Open Graph</h4><MediaPicker label="Ảnh Open Graph" value={draft.ogImageUrl} altText={draft.ogImageAlt} onSelect={(asset) => setDraft((current) => ({ ...current, ogImageUrl: asset.url, ogImageAlt: asset.altText || current.title }))} onClear={() => setDraft((current) => ({ ...current, ogImageUrl: "", ogImageAlt: "" }))} /><label>Alt ảnh Open Graph<input value={draft.ogImageAlt} onChange={(event) => set("ogImageAlt", event.target.value)} /></label></div></div></div>

        <div className="site-content-seo"><div><p className="eyebrow">SEO SẢN PHẨM</p><h3>Metadata và chỉ mục</h3></div><div className="site-content-seo-grid"><label>SEO title <small>{(draft.metaTitle || draft.title).length}/65</small><input maxLength={65} value={draft.metaTitle || draft.title} onChange={(event) => set("metaTitle", event.target.value)} /><small className="product-field-help">Mặc định lấy theo tên sản phẩm; admin có thể tùy chỉnh.</small></label><label className="site-content-full">Meta description <small>{(draft.metaDescription || defaultMetaDescription).length}/160</small><textarea rows={3} maxLength={160} value={draft.metaDescription || defaultMetaDescription} onChange={(event) => set("metaDescription", event.target.value)} /><small className="product-field-help">Mặc định lấy theo mô tả sản phẩm; admin có thể tùy chỉnh.</small></label><label>Canonical URL<input value={draft.canonicalUrl || defaultCanonical} onChange={(event) => set("canonicalUrl", event.target.value)} /><small className="product-field-help">Tự tạo theo danh mục và slug; admin có thể tùy chỉnh.</small></label><label>Thứ tự<input type="number" value={draft.sortOrder} onChange={(event) => set("sortOrder", Number(event.target.value))} /></label><div className="site-content-checks"><label><input type="checkbox" checked={draft.robotsIndex} onChange={(event) => set("robotsIndex", event.target.checked)} /> Index</label><label><input type="checkbox" checked={draft.robotsFollow} onChange={(event) => set("robotsFollow", event.target.checked)} /> Follow</label><label><input type="checkbox" checked={draft.isPublished} onChange={(event) => set("isPublished", event.target.checked)} /> Hiển thị frontend</label></div></div></div>
        <div className="site-content-seo"><div><p className="eyebrow">ENGLISH</p><h3>Bản tiếng Anh</h3><p>Tự động dịch mặc định và điền sẵn; admin có thể chỉnh sửa trực tiếp từng trường.</p></div><p>Trạng thái: <strong>{draft.translationStatus || "PENDING"}</strong>{draft.translationError ? ` · ${draft.translationError}` : ""}</p><div className="site-content-form-grid"><label className="site-content-full">Product name<input value={draft.titleEn} onChange={(event) => setEnglishField("titleEn", event.target.value)} /></label><label>English slug<input value={draft.slugEn} onChange={(event) => setEnglishField("slugEn", event.target.value)} placeholder="generated-from-name" /></label><label>Price text<input value={draft.priceTextEn} onChange={(event) => setEnglishField("priceTextEn", event.target.value)} /></label><label>Stock text<input value={draft.stockTextEn} onChange={(event) => setEnglishField("stockTextEn", event.target.value)} /></label><div className="site-content-full"><RichTextEditor label="Short description" value={draft.descriptionEn} onChange={(value) => setEnglishField("descriptionEn", value)} placeholder="Write a short product description…" /></div><div className="site-content-full"><RichTextEditor label="Summary" value={draft.summaryHtmlEn} onChange={(value) => setEnglishField("summaryHtmlEn", value)} placeholder="Write the English summary…" /></div><div className="site-content-full"><RichTextEditor label="Detail content" value={draft.contentHtmlEn} onChange={(value) => setEnglishField("contentHtmlEn", value)} placeholder="Write the English detail content…" mediaLabel="Insert image into English detail" /></div><label>Main image alt<input value={draft.imageAltEn} onChange={(event) => setEnglishField("imageAltEn", event.target.value)} /></label><label>Delivery image alt<input value={draft.shipperImageAltEn} onChange={(event) => setEnglishField("shipperImageAltEn", event.target.value)} /></label><label>Open Graph alt<input value={draft.ogImageAltEn} onChange={(event) => setEnglishField("ogImageAltEn", event.target.value)} /></label><div className="site-content-seo"><div><p className="eyebrow">ENGLISH SEO</p><h3>Metadata and indexing</h3></div><div className="site-content-seo-grid"><label>SEO title <small>{draft.metaTitleEn.length}/65</small><input maxLength={65} value={draft.metaTitleEn} onChange={(event) => setEnglishField("metaTitleEn", event.target.value)} /><small className="product-field-help">Defaults to the English product name; admin can customize.</small></label><label className="site-content-full">Meta description <small>{draft.metaDescriptionEn.length}/160</small><textarea rows={3} maxLength={160} value={draft.metaDescriptionEn} onChange={(event) => setEnglishField("metaDescriptionEn", event.target.value)} /><small className="product-field-help">Defaults to the English product description; admin can customize.</small></label><label>Canonical URL<input value={draft.canonicalUrlEn} onChange={(event) => setEnglishField("canonicalUrlEn", event.target.value)} placeholder="/en/products/category/product-slug" /><small className="product-field-help">Generated from the English category and slug; admin can customize.</small></label><label>Order<input type="number" value={draft.sortOrder} onChange={(event) => set("sortOrder", Number(event.target.value))} /></label><div className="site-content-checks"><label><input type="checkbox" checked={draft.robotsIndex} onChange={(event) => set("robotsIndex", event.target.checked)} /> Index</label><label><input type="checkbox" checked={draft.robotsFollow} onChange={(event) => set("robotsFollow", event.target.checked)} /> Follow</label><label><input type="checkbox" checked={draft.isPublished} onChange={(event) => set("isPublished", event.target.checked)} /> Show on frontend</label></div></div></div></div></div>
        <div className="product-editor-save-actions"><button className="btn btn-primary" type="button" disabled={saving} onClick={() => void persist("vietnamese")}>{saving ? "Đang lưu…" : "Lưu sản phẩm"}</button><button className="btn btn-primary" type="button" disabled={saving} onClick={() => void persist("english")}>{saving ? "Đang lưu…" : "Lưu sản phẩm English"}</button><button className="btn btn-ghost" type="button" disabled={saving} onClick={() => void restoreAutomaticEnglish()}>Khôi phục bản dịch tự động</button></div>
      </section>}
    </div>
  </section>;
}

function BulkToolbar({ selected, onDelete, disabled }: { selected: number; onDelete: () => void; disabled: boolean }) {
  return <div className="product-bulk-toolbar"><button className="btn btn-ghost" type="button" disabled={!selected || disabled}><Icon name="layers" size={14} />Thao tác hàng loạt{selected ? ` (${selected})` : ""}</button>{selected ? <button className="btn btn-ghost cms-danger" type="button" disabled={disabled} onClick={onDelete}><Icon name="trash" size={14} />Xóa</button> : null}</div>;
}
