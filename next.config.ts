import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'down-bs-vn.img.susercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.susercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
