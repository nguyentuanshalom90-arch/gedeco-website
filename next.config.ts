import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: 'standalone',
  async redirects() {
    return [
      { source: '/en/gioi-thieu', destination: '/en/about', permanent: true },
      { source: '/en/tin-tuc', destination: '/en/news', permanent: true },
      { source: '/en/tin-tuc/chi-tiet', destination: '/en/news/market-opportunities', permanent: true },
      { source: '/en/tin-tuc/:slug*', destination: '/en/news/:slug*', permanent: true },
      { source: '/en/lien-he', destination: '/en/contact', permanent: true },
      { source: '/en/san-pham', destination: '/en/products', permanent: true },
      { source: '/en/san-pham/:slug*', destination: '/en/products/:slug*', permanent: true },
      { source: '/tin-tuc/chi-tiet', destination: '/tin-tuc', permanent: true },
      { source: '/tin-tuc/danh-muc/ho-i-cng-ng', destination: '/tin-tuc/danh-muc/chuoi-cung-ung', permanent: true },
      { source: '/tin-tuc/danh-muc/oa-t-o-ng', destination: '/tin-tuc/danh-muc/hoat-dong-gedeco', permanent: true },
      { source: '/tin-tuc/danh-muc/o-p-ta-c', destination: '/tin-tuc/danh-muc/hop-tac', permanent: true },
      { source: '/tin-tuc/danh-muc/ie-n-th-c-chia-se', destination: '/tin-tuc/danh-muc/kien-thuc-chia-se', permanent: true },
      { source: '/tin-tuc/danh-muc/ogistics', destination: '/tin-tuc/danh-muc/logistics', permanent: true },
      { source: '/tin-tuc/danh-muc/hi-tr-o-ng', destination: '/tin-tuc/danh-muc/thi-truong', permanent: true },
    ];
  },
};

export default nextConfig;
