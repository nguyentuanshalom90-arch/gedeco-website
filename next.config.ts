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
    ];
  },
};

export default nextConfig;
