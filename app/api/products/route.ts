import { NextRequest, NextResponse } from 'next/server';
import { listProducts } from '@/lib/products';

export async function GET(request: NextRequest) {
  const products = await listProducts();
  const search = (request.nextUrl.searchParams.get('search') || '').trim().toLocaleLowerCase('vi-VN');
  const category = request.nextUrl.searchParams.get('category') || 'all';
  const sort = request.nextUrl.searchParams.get('sort') || 'default';
  const filtered = products.filter((product) => {
    const matchesCategory = category === 'all' || (category === 'domestic' ? product.category === 'Sản phẩm trong nước' : category === 'export' ? product.category === 'Sản phẩm xuất khẩu' : true);
    const matchesSearch = !search || `${product.title} ${product.description}`.toLocaleLowerCase('vi-VN').includes(search);
    return matchesCategory && matchesSearch;
  });
  const sorted = [...filtered].sort((a, b) => sort === 'latest' ? b.title.localeCompare(a.title, 'vi') : sort === 'name' ? a.title.localeCompare(b.title, 'vi') : 0);
  return NextResponse.json({ items: sorted.map(({ slug, title, category: productCategory, image }) => ({ slug, title, category: productCategory, image })), total: sorted.length });
}
