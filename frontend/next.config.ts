import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/crawl',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/crawl`,
      },
    ];
  },
};

export default nextConfig;
