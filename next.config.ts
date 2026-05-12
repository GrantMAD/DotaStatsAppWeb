import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/opendota/:path*',
        destination: 'https://api.opendota.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
