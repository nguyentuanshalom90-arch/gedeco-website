export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";
export type TranslationMode = "AUTO" | "MANUAL";

export type PostInput = {
  id: string | null;
  title: string;
  slug: string;
  shortDesc: string;
  content: string;
  coverImage: string | null;
  coverImageAlt: string;
  coverImageCaption: string;
  ogImage: string | null;
  ogImageAlt: string;
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
  translationMode: TranslationMode;
  translationStatus: string;
  titleEn: string;
  slugEn: string;
  shortDescEn: string;
  contentEn: string;
  coverImageAltEn: string;
  coverImageCaptionEn: string;
  ogImageAltEn: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  canonicalUrlEn: string;
  focusKeywordEn: string;
  tagsEn: string[];
};

export type PostListItem = PostInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
