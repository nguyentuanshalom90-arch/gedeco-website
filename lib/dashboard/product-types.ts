export type ProductMediaInput = {
  id?: string; url: string; altText: string; caption: string; sortOrder: number; isPrimary: boolean;
};
export type ProductInput = {
  id?: string | null; slug: string; title: string; categoryId: string;
  description: string; contentHtml: string; summaryHtml: string; priceText: string;
  stockText: string; imageUrl: string; imageAlt: string; imageCaption: string;
  shipperImageUrl: string; ogImageUrl: string; ogImageAlt: string; gallery: ProductMediaInput[];
  metaTitle: string; metaDescription: string; canonicalUrl: string;
  robotsIndex: boolean; robotsFollow: boolean; isPublished: boolean; sortOrder: number;
};
export type ProductListItem = ProductInput & {
  id: string; updatedAt: string; categoryName: string; categorySlug: string; categoryNameEn: string; categorySlugEn: string;
};
