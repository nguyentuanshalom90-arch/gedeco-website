export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export type PostInput = {
  id: string | null;
  title: string;
  slug: string;
  shortDesc: string;
  content: string;
  coverImage: string | null;
  ogImage: string | null;
  status: PostStatus;
  categoryName: string;
  categoryId: string | null;
  tags: string[];
  scheduledAt: string | null;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  authorName: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  isFeatured: boolean;
};

export type PostListItem = PostInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type MediaAssetItem = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
};
