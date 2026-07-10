import type { NextConfig } from "next";

const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cardiotox-backend.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
