export type SiteContentKind = "dynamic" | "static";

export type SiteContentItem = {
  id: string;
  pageKey: string;
  pageName: string;
  route: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  sectionKey: string;
  fieldKey: string;
  label: string;
  value: string;
  contentType: string;
  headingLevel: string;
  imageUrl: string;
  altText: string;
  imageCaption: string;
  isVisible: boolean;
  sortOrder: number;
  englishLabel: string;
  englishValue: string;
  englishAltText: string;
  englishCaption: string;
  englishH1: string;
  englishMetaTitle: string;
  englishMetaDescription: string;
  updatedAt: string;
};

export type SiteContentInput = Omit<
  SiteContentItem,
  "id" | "pageName" | "updatedAt"
> & { id?: string; pageName?: string };
