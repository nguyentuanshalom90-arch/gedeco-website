export type ProductCategoryValue = "DOMESTIC" | "EXPORT";
export type ProductInput = {
  id?: string | null; slug: string; title: string; category: ProductCategoryValue;
  description: string; contentHtml: string; summaryHtml: string; priceText: string;
  stockText: string; imageUrl: string; shipperImageUrl: string; galleryUrls: string;
  isPublished: boolean; sortOrder: number;
};
export type ProductListItem = Omit<ProductInput, "galleryUrls"> & { id: string; galleryUrls: string; updatedAt: string };
