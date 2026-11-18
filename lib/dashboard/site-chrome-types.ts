export type SiteChromeArea = "HEADER" | "FOOTER";
export type SiteChromeKind = "DYNAMIC" | "STATIC";

export type SiteChromeItem = {
  id: string;
  area: SiteChromeArea;
  kind: SiteChromeKind;
  sectionKey: string;
  fieldKey: string;
  label: string;
  value: string;
  url: string;
  imageUrl: string;
  altText: string;
  imageCaption: string;
  isVisible: boolean;
  sortOrder: number;
  updatedAt: string;
  translationMode: "AUTO" | "MANUAL";
  translationStatus: string;
  translationError: string;
  labelEn: string;
  valueEn: string;
  altTextEn: string;
  imageCaptionEn: string;
  isSystem: boolean;
};

export type SiteChromeInput = Omit<SiteChromeItem, "id" | "updatedAt" | "isSystem"> & { id?: string; isSystem?: boolean };
