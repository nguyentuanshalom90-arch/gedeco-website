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
  isVisible: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type SiteChromeInput = Omit<SiteChromeItem, "id" | "updatedAt"> & { id?: string };
