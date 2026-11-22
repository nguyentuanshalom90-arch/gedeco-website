export type ProductMediaInput = {
  id?: string; url: string; altText: string; caption: string; altTextEn?: string; captionEn?: string; sortOrder: number; isPrimary: boolean;
};
export type ProductInput = {
  id?: string | null; slug: string; title: string; titleHtml: string; titleColor: string; titleFontFamily: string; titleFontSize: number; titleFontWeight: number; categoryId: string;
  description: string; contentHtml: string; summaryHtml: string; priceText: string;
  stockText: string; imageUrl: string; imageAlt: string; imageCaption: string;
  shipperImageUrl: string; shipperImageAlt: string; shipperImageCaption: string;
  ogImageUrl: string; ogImageAlt: string; gallery: ProductMediaInput[];
  metaTitle: string; metaDescription: string; canonicalUrl: string;
  robotsIndex: boolean; robotsFollow: boolean; isPublished: boolean; sortOrder: number;
  translationMode: "AUTO" | "MANUAL"; translationStatus?: string; translationError?: string;
  slugEn: string; titleEn: string; descriptionEn: string; contentHtmlEn: string; summaryHtmlEn: string;
  priceTextEn: string; stockTextEn: string; imageAltEn: string; imageCaptionEn: string;
  shipperImageAltEn: string; shipperImageCaptionEn: string;
  ogImageAltEn: string; metaTitleEn: string; metaDescriptionEn: string; canonicalUrlEn: string;
};
export type ProductListItem = ProductInput & {
  id: string; updatedAt: string; categoryName: string; categorySlug: string; categoryNameEn: string; categorySlugEn: string;
};
