import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.cloudflare.steamstatic.com',
      },
    ],
  },
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
