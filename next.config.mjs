/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mengirimkan variabel BACKEND_URL dari .env ke runtime client-side Next.js
  publicRuntimeConfig: {
    backendUrl: process.env.BACKEND_URL,
  },
};

export default nextConfig;