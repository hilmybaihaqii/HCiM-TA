import type { NextConfig } from "next";

// Alamat backend hanya dari env (tidak ditulis di repo). Hanya dipakai di server untuk rewrite /api,
// jadi tidak ikut terkirim ke browser. Kalau kosong, build berhenti dengan pesan jelas; di Vercel,
// build yang gagal tidak menggantikan deployment yang sedang jalan.
// BACKEND_ORIGIN diutamakan karena tanpa awalan NEXT_PUBLIC_ nilainya tidak mungkin masuk bundle browser.
const backendOrigin = (process.env.BACKEND_ORIGIN ?? process.env.NEXT_PUBLIC_API_BASE_URL)?.trim();
if (!backendOrigin) {
  throw new Error(
    "BACKEND_ORIGIN is not set. Add it to .env.local (local) or to the Vercel project's Environment Variables.",
  );
}

const isDev = process.env.NODE_ENV === "development";

// Halaman lab dirender statis, jadi CSP memakai 'unsafe-inline' untuk skrip bootstrap Next.js (nonce
// akan memaksa semua halaman dinamis). 'wasm-unsafe-eval' untuk dekoder meshopt model jantung 3D.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self' blob: data:${isDev ? " ws: http://localhost:*" : ""}`,
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Token reset ada di URL halaman ini: jangan dikirim sebagai referrer dan jangan disimpan cache
      {
        source: "/reset-password",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },

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
