import type { Metadata } from 'next';
import ProductsPage from '../san-pham/page';

export const metadata: Metadata = {
  title: 'Products | GEDECO',
  description: 'Explore GEDECO domestic and export products.',
  alternates: {
    canonical: '/en/products',
    languages: { vi: '/san-pham', en: '/en/products' },
  },
};

export default ProductsPage;
