export type ProductCategoryInput = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  nameEn: string;
  slugEn: string;
  descriptionEn: string;
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  imageAltEn: string;
  imageCaptionEn: string;
  metaTitle: string;
  metaDescription: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  canonicalUrl: string;
  canonicalUrlEn: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  isPublished: boolean;
  sortOrder: number;
};

export type ProductCategoryListItem = ProductCategoryInput & {
  id: string;
  productCount: number;
  updatedAt: string;
};
