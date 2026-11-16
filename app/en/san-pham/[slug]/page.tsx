import { notFound, permanentRedirect } from "next/navigation";
import { getEnglishProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function LegacyEnglishProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getEnglishProductBySlug(slug);
  if (!product) notFound();
  const category = product.view.categorySlugEn || "domestic";
  permanentRedirect(`/en/products/${category}/${product.canonicalSlug}`);
}
