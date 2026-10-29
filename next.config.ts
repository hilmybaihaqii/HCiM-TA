import type { NextConfig } from "next";

// Alamat backend hanya dari env (tidak ditulis di repo). Hanya dipakai di server untuk rewrite /api,
// jadi tidak ikut terkirim ke browser. Kalau kosong, build berhenti dengan pesan jelas; di Vercel,
// build yang gagal tidak menggantikan deployment yang sedang jalan.
const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
if (!backendOrigin) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local (local) or to the Vercel project's Environment Variables.",
  );
}

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

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
