import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: 'standalone',
  async redirects() {
    return [
      { source: '/en/gioi-thieu', destination: '/en/about', permanent: false },
      { source: '/en/tin-tuc', destination: '/en/news', permanent: false },
      { source: '/en/tin-tuc/chi-tiet', destination: '/en/news/market-opportunities', permanent: false },
      { source: '/en/tin-tuc/:slug*', destination: '/en/news/:slug*', permanent: false },
      { source: '/en/du-an', destination: '/en/projects', permanent: false },
      { source: '/en/doi-tac', destination: '/en/partners', permanent: false },
      { source: '/en/lien-he', destination: '/en/contact', permanent: false },
      { source: '/en/san-pham', destination: '/en/products', permanent: false },
      { source: '/en/san-pham/:slug*', destination: '/en/products/:slug*', permanent: false },
    ];
  },
};

export default nextConfig;
