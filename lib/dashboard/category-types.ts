export type CategoryInput = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  nameEn: string;
  slugEn: string;
  descriptionEn: string;
  metaTitle: string;
  metaDescription: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  canonicalUrl: string;
  canonicalUrlEn: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  sortOrder: number;
};

export type CategoryListItem = CategoryInput & {
  id: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
};
