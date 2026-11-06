export type CategoryInput = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
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
